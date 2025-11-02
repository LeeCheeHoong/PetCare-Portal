from fastapi import APIRouter, Body, Query, status, Depends
from typing import List

from app.models.order import (
    ShippingAddressInput,
    PaymentMethodInput,
    PaymentMethodResponse,
    ShippingValidationResponse,
    ShippingCalculationResponse,
    CheckoutDataInput,
    OrderDetails
)
from app.services.checkout_service import CheckoutService
from app.services.order_service import OrderService

router = APIRouter(prefix="")


# Dependency for user identification
async def get_current_user_id() -> str:
    """Get current user ID from authentication"""
    return "default"


@router.post(
    "/shipping/validate",
    response_model=ShippingValidationResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate Shipping Address",
    description="Validate shipping address format and data",
    responses={
        200: {
            "description": "Validation result",
            "model": ShippingValidationResponse
        }
    }
)
async def validate_shipping(
    address: ShippingAddressInput = Body(...)
):
    """
    Validate a shipping address.
    
    Checks:
    - Valid US state code
    - Proper ZIP code format
    - Valid phone number format
    - Valid email format
    
    Args:
        address: Shipping address to validate
        
    Returns:
        ShippingValidationResponse with validation result and any error messages
    """
    return await CheckoutService.validate_shipping_address(address)


@router.post(
    "/shipping/calculate",
    response_model=ShippingCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Shipping Costs",
    description="Calculate shipping costs for all available methods",
    responses={
        200: {
            "description": "Shipping costs calculated",
            "model": ShippingCalculationResponse
        },
        400: {
            "description": "Invalid address",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid shipping address: Invalid state code: XX"}
                }
            }
        }
    }
)
async def calculate_shipping(
    address: ShippingAddressInput = Body(...),
    subtotal: float = Query(0.0, ge=0, description="Cart subtotal for free shipping calculation")
):
    """
    Calculate shipping costs for all available shipping methods.
    
    Returns costs for:
    - Standard shipping (free over threshold)
    - Express shipping (2-day)
    - Overnight shipping (1-day)
    
    Also includes estimated delivery days for each method.
    
    Args:
        address: Shipping address
        subtotal: Cart subtotal (optional, for free shipping calculation)
        
    Returns:
        ShippingCalculationResponse with costs and estimated days
        
    Raises:
        400: Invalid shipping address
    """
    return await CheckoutService.calculate_shipping(address, subtotal)


@router.get(
    "/payment-methods",
    response_model=List[PaymentMethodResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Payment Methods",
    description="Retrieve user's saved payment methods",
    responses={
        200: {
            "description": "Payment methods retrieved successfully",
            "model": List[PaymentMethodResponse]
        }
    }
)
async def get_payment_methods(
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all saved payment methods for the current user.
    
    Returns:
        List of saved payment methods with masked card numbers
    """
    return await CheckoutService.get_payment_methods(user_id)


@router.post(
    "/payment-methods",
    response_model=PaymentMethodResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Payment Method",
    description="Add a new payment method",
    responses={
        201: {
            "description": "Payment method added successfully",
            "model": PaymentMethodResponse
        },
        400: {
            "description": "Invalid card data",
            "content": {
                "application/json": {
                    "examples": {
                        "missing_fields": {
                            "value": {"detail": "Card number, expiry date, CVV, and cardholder name are required"}
                        },
                        "invalid_card": {
                            "value": {"detail": "Invalid card number"}
                        }
                    }
                }
            }
        }
    }
)
async def add_payment_method(
    payment_method: PaymentMethodInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Add a new payment method.
    
    For new cards, provide:
    - Card number (will be validated using Luhn algorithm)
    - Expiry month and year
    - CVV
    - Cardholder name
    
    The card number will be tokenized and only the last 4 digits stored.
    
    Args:
        payment_method: Payment method to add
        
    Returns:
        PaymentMethodResponse with saved payment method (card number masked)
        
    Raises:
        400: Invalid card data or missing required fields
    """
    return await CheckoutService.add_payment_method(payment_method, user_id)


@router.post(
    "/orders",
    response_model=OrderDetails,
    status_code=status.HTTP_201_CREATED,
    summary="Create Order (Checkout)",
    description="Create an order from checkout data",
    responses={
        201: {
            "description": "Order created successfully",
            "model": OrderDetails
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "examples": {
                        "empty_cart": {
                            "value": {"detail": "Cannot create order from empty cart"}
                        },
                        "invalid_address": {
                            "value": {"detail": "Invalid shipping address: Invalid state code"}
                        },
                        "price_mismatch": {
                            "value": {"detail": "Subtotal mismatch. Expected 100.00, got 90.00"}
                        }
                    }
                }
            }
        }
    }
)
async def create_order_checkout(
    checkout_data: CheckoutDataInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create an order from checkout data.
    
    This endpoint:
    1. Validates the shipping address
    2. Verifies order summary matches server calculations
    3. Creates order from user's cart
    4. Processes payment (mock)
    5. Clears the cart
    
    Args:
        checkout_data: Complete checkout data including address and payment
        
    Returns:
        OrderDetails: Created order with order number and tracking
        
    Raises:
        400: Invalid data or cart is empty
    """
    return await OrderService.create_order_from_checkout(checkout_data, user_id)