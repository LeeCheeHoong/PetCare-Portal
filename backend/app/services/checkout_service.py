from typing import Dict, List
from fastapi import HTTPException, status
import re

from app.models.order import (
    ShippingAddressInput,
    PaymentMethodInput,
    PaymentMethodResponse,
    ShippingValidationResponse,
    ShippingCalculationResponse,
    OrderSummary,
    ShippingMethod
)


class CheckoutService:
    """Service layer for checkout operations"""
    
    # Mock payment methods database (per user)
    _payment_methods: Dict[str, List[PaymentMethodResponse]] = {}
    
    # Shipping rates
    SHIPPING_RATES = {
        "standard": {
            "name": "Standard Shipping",
            "base_cost": 0.0,
            "days": 5
        },
        "express": {
            "name": "Express Shipping",
            "base_cost": 15.99,
            "days": 2
        },
        "overnight": {
            "name": "Overnight Shipping",
            "base_cost": 29.99,
            "days": 1
        }
    }
    
    @classmethod
    def initialize_mock_data(cls, user_id: str = "default"):
        """Initialize mock payment methods"""
        if user_id not in cls._payment_methods:
            cls._payment_methods[user_id] = [
                PaymentMethodResponse(
                    id="pm_default",
                    type="card",
                    is_default=True,
                    last4="4242",
                    brand="Visa",
                    expiry_month="12",
                    expiry_year="2025",
                    cardholder_name="John Doe"
                )
            ]
    
    @classmethod
    async def validate_shipping_address(
        cls,
        address: ShippingAddressInput
    ) -> ShippingValidationResponse:
        """
        Validate shipping address
        
        Args:
            address: Shipping address to validate
            
        Returns:
            ShippingValidationResponse with validation result
        """
        errors = []

        
        # Validate phone number (basic validation)
        phone_digits = re.sub(r'\D', '', address.phone)
        if len(phone_digits) < 10:
            errors.append("Phone number must have at least 10 digits")
        
        
        if errors:
            return ShippingValidationResponse(
                valid=False,
                message="; ".join(errors),
                suggested_address=None
            )
        
        # Address is valid
        return ShippingValidationResponse(
            valid=True,
            message="Address is valid",
            suggested_address=None
        )
    
    @classmethod
    async def calculate_shipping(
        cls,
        address: ShippingAddressInput,
        subtotal: float = 0.0
    ) -> ShippingCalculationResponse:
        """Calculate shipping costs based on address and cart subtotal"""
        # Validate address first
        validation = await cls.validate_shipping_address(address)
        if not validation.valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid shipping address: {validation.message}"
            )
        
        from app.services.cart_service import CartService
        
        # Build shipping methods list
        shipping_methods = []
        
        for method_id, config in cls.SHIPPING_RATES.items():
            cost = config["base_cost"]
            
            # Apply free shipping for standard if over threshold
            if method_id == "standard" and subtotal >= CartService.SHIPPING_THRESHOLD:
                cost = 0.0
            
            shipping_method = ShippingMethod(
                id=method_id,
                name=config["name"],
                cost=cost,
                estimated_days=config["days"]
            )
            shipping_methods.append(shipping_method)
        
        # Default to first method (standard)
        default_method = shipping_methods[0]
        
        return ShippingCalculationResponse(
            success=True,
            cost=default_method.cost,
            currency="USD",
            estimated_days=default_method.estimated_days,
            shipping_methods=shipping_methods
        )

    @classmethod
    async def get_payment_methods(
        cls,
        user_id: str = "default"
    ) -> List[PaymentMethodResponse]:
        """
        Get user's saved payment methods
        
        Args:
            user_id: User identifier
            
        Returns:
            List of saved payment methods
        """
        cls.initialize_mock_data(user_id)
        return cls._payment_methods.get(user_id, [])
    
    @classmethod
    async def add_payment_method(
        cls,
        payment_method: PaymentMethodInput,
        user_id: str = "default"
    ) -> PaymentMethodResponse:
        """
        Add new payment method
        
        Args:
            payment_method: Payment method to add
            user_id: User identifier
            
        Returns:
            Saved payment method
        """
        # Validate required fields for new card
        if not payment_method.id:
            if not all([
                payment_method.card_number,
                payment_method.expiry_month,
                payment_method.expiry_year,
                payment_method.cvv,
                payment_method.cardholder_name
            ]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Card number, expiry date, CVV, and cardholder name are required for new cards"
                )
            
            # Validate card number using Luhn algorithm
            if not cls._validate_card_number(payment_method.card_number):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid card number"
                )
            
            # Extract last 4 digits
            last4 = payment_method.card_number[-4:]
            
            # Detect card brand
            brand = cls._detect_card_brand(payment_method.card_number)
            
            # Generate payment method ID
            import uuid
            pm_id = f"pm_{uuid.uuid4().hex[:8]}"
            
            # Create payment method response
            new_method = PaymentMethodResponse(
                id=pm_id,
                type="card",
                is_default=payment_method.is_default,
                last4=last4,
                brand=brand,
                expiry_month=payment_method.expiry_month,
                expiry_year=payment_method.expiry_year,
                cardholder_name=payment_method.cardholder_name
            )
            
            # Initialize if needed
            cls.initialize_mock_data(user_id)
            
            # If this is set as default, unset others
            if payment_method.is_default:
                for method in cls._payment_methods[user_id]:
                    method.is_default = False
            
            # Add to user's payment methods
            cls._payment_methods[user_id].append(new_method)
            
            return new_method
        
        # Return existing payment method
        for method in cls._payment_methods.get(user_id, []):
            if method.id == payment_method.id:
                return method
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment method with id '{payment_method.id}' not found"
        )
    
    @classmethod
    def _validate_card_number(cls, card_number: str) -> bool:
        """
        Validate card number using Luhn algorithm
        
        Args:
            card_number: Card number to validate
            
        Returns:
            True if valid, False otherwise
        """
        # Remove spaces and dashes
        card_number = re.sub(r'[\s-]', '', card_number)
        
        # Check if all digits
        if not card_number.isdigit():
            return False
        
        # Luhn algorithm
        def luhn_checksum(card_num):
            def digits_of(n):
                return [int(d) for d in str(n)]
            digits = digits_of(card_num)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d * 2))
            return checksum % 10
        
        return luhn_checksum(card_number) == 0
    
    @classmethod
    def _detect_card_brand(cls, card_number: str) -> str:
        """
        Detect card brand from card number
        
        Args:
            card_number: Card number
            
        Returns:
            Card brand name
        """
        # Remove spaces and dashes
        card_number = re.sub(r'[\s-]', '', card_number)
        
        # Card brand patterns
        if re.match(r'^4', card_number):
            return "Visa"
        elif re.match(r'^5[1-5]', card_number):
            return "Mastercard"
        elif re.match(r'^3[47]', card_number):
            return "American Express"
        elif re.match(r'^6(?:011|5)', card_number):
            return "Discover"
        else:
            return "Unknown"
    
    @classmethod
    async def validate_order_summary(
        cls,
        order_summary: OrderSummary,
        actual_subtotal: float,
        actual_tax: float,
        actual_shipping: float
    ) -> bool:
        """
        Validate that order summary matches server calculations
        
        Args:
            order_summary: Order summary from frontend
            actual_subtotal: Server-calculated subtotal
            actual_tax: Server-calculated tax
            actual_shipping: Server-calculated shipping
            
        Returns:
            True if valid
            
        Raises:
            HTTPException: If order summary doesn't match
        """
        tolerance = 0.01  # Allow 1 cent difference for rounding
        
        if abs(order_summary.subtotal - actual_subtotal) > tolerance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subtotal mismatch. Expected {actual_subtotal}, got {order_summary.subtotal}"
            )
        
        if abs(order_summary.tax - actual_tax) > tolerance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tax mismatch. Expected {actual_tax}, got {order_summary.tax}"
            )
        
        if abs(order_summary.shipping - actual_shipping) > tolerance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Shipping mismatch. Expected {actual_shipping}, got {order_summary.shipping}"
            )
        
        return True