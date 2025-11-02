from typing import Optional, Dict
from datetime import datetime, timedelta
from fastapi import HTTPException, status
import uuid

from app.models.order import (
    OrderDetails,
    OrderFilters,
    OrdersResponse,
    OrderPagination,
    CheckoutRequest,
    ReturnRequest,
    OrderStatusEnum,
    OrderStatus,
    OrderItem,
    OrderPricing,
    ShippingInfo,
    OrderActionResponse,
    CheckoutDataInput
)
from app.services.cart_service import CartService
from app.services.checkout_service import CheckoutService


class OrderService:
    """Service layer for order business logic"""
    
    # Mock orders database
    _orders: Dict[str, OrderDetails] = {}
    _order_counter = 1
    
    # Shipping configuration
    SHIPPING_METHODS = {
        "standard": {
            "name": "Standard Shipping",
            "carrier": "USPS",
            "days": 5,
            "cost": 0.0  # Free shipping
        },
        "express": {
            "name": "Express Shipping",
            "carrier": "FedEx",
            "days": 2,
            "cost": 15.99
        },
        "overnight": {
            "name": "Overnight Shipping",
            "carrier": "FedEx",
            "days": 1,
            "cost": 29.99
        }
    }
    
    @classmethod
    def _generate_order_number(cls) -> str:
        """Generate unique order number"""
        order_num = f"ORD-{datetime.utcnow().year}-{cls._order_counter:06d}"
        cls._order_counter += 1
        return order_num
    
    @classmethod
    def _generate_tracking_number(cls) -> str:
        """Generate mock tracking number"""
        return f"TRK{uuid.uuid4().hex[:12].upper()}"
    
    @classmethod
    def _calculate_shipping_cost(cls, subtotal: float, method: str) -> float:
        """Calculate shipping cost based on method and subtotal"""
        shipping_config = cls.SHIPPING_METHODS.get(method, cls.SHIPPING_METHODS["standard"])
        
        # Free shipping on orders over threshold (from CartService)
        if subtotal >= CartService.SHIPPING_THRESHOLD:
            return 0.0
        
        return shipping_config["cost"]
    
    @classmethod
    async def create_order_from_cart(
        cls,
        checkout_request: CheckoutRequest,
        user_id: str = "default"
    ) -> OrderDetails:
        """
        Create an order from user's cart
        
        Args:
            checkout_request: Checkout information
            user_id: User identifier
            
        Returns:
            Created OrderDetails
            
        Raises:
            HTTPException: 400 if cart is empty or invalid data
        """
        # Get user's cart
        cart = await CartService.get_or_create_cart(user_id)
        
        # Validate cart is not empty
        if not cart.items or cart.total_items == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create order from empty cart"
            )
        
        # Refresh cart to ensure latest prices and stock
        cart = await CartService.refresh_cart_items(user_id)
        
        # Validate all items still in stock
        for item in cart.items:
            if not item.product.in_stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{item.product.name}' is no longer in stock"
                )
        
        # Generate order ID and number
        order_id = f"order_{uuid.uuid4().hex[:8]}"
        order_number = cls._generate_order_number()
        
        # Convert cart items to order items
        order_items = []
        for cart_item in cart.items:
            order_item = OrderItem(
                id=f"oi_{uuid.uuid4().hex[:8]}",
                product_id=cart_item.product.id,
                product_name=cart_item.product.name,
                product_image=cart_item.product.images[0] if cart_item.product.images else "",
                quantity=cart_item.quantity,
                unit_price=cart_item.product.price,
                total_price=cart_item.product.price * cart_item.quantity
            )
            order_items.append(order_item)
        
        # Calculate shipping
        shipping_method = checkout_request.shipping_method.lower()
        shipping_cost = cls._calculate_shipping_cost(cart.subtotal, shipping_method)
        shipping_config = cls.SHIPPING_METHODS.get(shipping_method, cls.SHIPPING_METHODS["standard"])
        
        # Calculate pricing with actual shipping
        pricing = OrderPricing(
            subtotal=cart.subtotal,
            shipping=shipping_cost,
            tax=cart.tax,
            discount=0.0,
            total=cart.subtotal + shipping_cost + cart.tax
        )
        
        # Generate shipping info
        tracking_number = cls._generate_tracking_number()
        estimated_delivery = (datetime.utcnow() + timedelta(days=shipping_config["days"])).strftime("%Y-%m-%d")
        
        shipping_info = ShippingInfo(
            method=shipping_config["name"],
            carrier=shipping_config["carrier"],
            tracking_number=tracking_number,
            tracking_url=f"https://tracking.{shipping_config['carrier'].lower()}.com/{tracking_number}",
            estimated_delivery=estimated_delivery
        )
        
        # Create initial status history
        now = datetime.utcnow()
        status_history = [
            OrderStatus(
                status=OrderStatusEnum.PENDING,
                timestamp=now,
                note="Order placed successfully"
            )
        ]
        
        # Create order
        order = OrderDetails(
            id=order_id,
            order_number=order_number,
            status=OrderStatusEnum.PENDING,
            status_history=status_history,
            total_amount=pricing.total,
            currency="USD",
            items=order_items,
            shipping_address=checkout_request.shipping_address,
            billing_address=checkout_request.billing_address,
            payment_method=checkout_request.payment_method,
            pricing=pricing,
            shipping=shipping_info,
            order_date=now,
            updated_at=now
        )
        
        # Store order
        cls._orders[order_id] = order
        
        # Clear the cart after successful order
        await CartService.clear_cart(user_id)
        
        return order
    
    @classmethod
    async def get_order_by_id(cls, order_id: str) -> Optional[OrderDetails]:
        """
        Get order by ID
        
        Args:
            order_id: Order identifier
            
        Returns:
            OrderDetails if found, None otherwise
        """
        return cls._orders.get(order_id)
    
    @classmethod
    async def get_order_by_id_or_404(cls, order_id: str) -> OrderDetails:
        """
        Get order by ID or raise 404
        
        Args:
            order_id: Order identifier
            
        Returns:
            OrderDetails
            
        Raises:
            HTTPException: 404 if order not found
        """
        order = cls._orders.get(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id '{order_id}' not found"
            )
        return order
    
    @classmethod
    async def list_orders(
        cls,
        filters: OrderFilters,
        user_id: str = "default"
    ) -> OrdersResponse:
        """List orders with filtering and pagination"""
        from datetime import datetime
        
        # Get all orders
        all_orders = list(cls._orders.values())
        
        # Apply filters
        filtered_orders = all_orders
        
        # Search filter
        if filters.search:
            search_lower = filters.search.lower()
            filtered_orders = [
                o for o in filtered_orders
                if (search_lower in o.order_number.lower() or
                    search_lower in o.shipping_address.email.lower() or
                    search_lower in f"{o.shipping_address.first_name} {o.shipping_address.last_name}".lower())
            ]
        
        # Status filter
        if filters.status:
            filtered_orders = [o for o in filtered_orders if o.status == filters.status]
        
        # Date range filter
        if filters.date_from:
            date_from = datetime.fromisoformat(filters.date_from.replace('Z', '+00:00'))
            filtered_orders = [o for o in filtered_orders if o.order_date >= date_from]
        
        if filters.date_to:
            date_to = datetime.fromisoformat(filters.date_to.replace('Z', '+00:00'))
            filtered_orders = [o for o in filtered_orders if o.order_date <= date_to]
        
        # Amount range filter
        if filters.min_amount is not None:
            filtered_orders = [o for o in filtered_orders if o.total_amount >= filters.min_amount]
        
        if filters.max_amount is not None:
            filtered_orders = [o for o in filtered_orders if o.total_amount <= filters.max_amount]
        
        # Sort by order date (newest first)
        filtered_orders.sort(key=lambda o: o.order_date, reverse=True)
        
        # Pagination
        total = len(filtered_orders)
        total_pages = (total + filters.limit - 1) // filters.limit
        start_idx = (filters.page - 1) * filters.limit
        end_idx = start_idx + filters.limit
        
        paginated_orders = filtered_orders[start_idx:end_idx]
        
        pagination = OrderPagination(
            page=filters.page,
            limit=filters.limit,
            total=total,
            total_pages=total_pages
        )
        
        return OrdersResponse(
            success=True,
            orders=paginated_orders,
            pagination=pagination
        )
    
    @classmethod
    async def update_order_status(
        cls,
        order_id: str,
        new_status: OrderStatusEnum,
        note: str,
        location: Optional[str] = None
    ) -> OrderDetails:
        """
        Update order status
        
        Args:
            order_id: Order identifier
            new_status: New status
            note: Status update note
            location: Optional location info
            
        Returns:
            Updated OrderDetails
            
        Raises:
            HTTPException: 404 if order not found
        """
        order = await cls.get_order_by_id_or_404(order_id)
        
        # Add status to history
        status_entry = OrderStatus(
            status=new_status,
            timestamp=datetime.utcnow(),
            note=note,
            location=location
        )
        order.status_history.append(status_entry)
        
        # Update current status
        order.status = new_status
        order.updated_at = datetime.utcnow()
        
        return order
    
    @classmethod
    async def cancel_order(cls, order_id: str) -> OrderActionResponse:
        """
        Cancel an order
        
        Args:
            order_id: Order identifier
            
        Returns:
            OrderActionResponse
            
        Raises:
            HTTPException: 404 if order not found, 400 if cannot cancel
        """
        order = await cls.get_order_by_id_or_404(order_id)
        
        # Check if order can be cancelled
        if order.status in [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel order with status '{order.status.value}'"
            )
        
        # Update status to cancelled
        updated_order = await cls.update_order_status(
            order_id,
            OrderStatusEnum.CANCELLED,
            "Order cancelled by customer"
        )
        
        return OrderActionResponse(
            success=True,
            message="Order cancelled successfully",
            order=updated_order
        )
    
    @classmethod
    async def request_return(
        cls,
        order_id: str,
        return_request: ReturnRequest
    ) -> OrderActionResponse:
        """
        Request return for order items
        
        Args:
            order_id: Order identifier
            return_request: Return request details
            
        Returns:
            OrderActionResponse
            
        Raises:
            HTTPException: 404 if order not found, 400 if cannot return
        """
        order = await cls.get_order_by_id_or_404(order_id)
        
        # Check if order can be returned
        if order.status not in [OrderStatusEnum.DELIVERED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot request return for order with status '{order.status.value}'. Order must be delivered."
            )
        
        # Validate item IDs
        order_item_ids = {item.id for item in order.items}
        invalid_items = set(return_request.items) - order_item_ids
        if invalid_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid item IDs: {', '.join(invalid_items)}"
            )
        
        # Add return request to status history
        items_str = ", ".join([
            item.product_name 
            for item in order.items 
            if item.id in return_request.items
        ])
        
        status_entry = OrderStatus(
            status=order.status,  # Keep current status
            timestamp=datetime.utcnow(),
            note=f"Return requested for items: {items_str}. Reason: {return_request.reason}"
        )
        order.status_history.append(status_entry)
        order.updated_at = datetime.utcnow()
        
        return OrderActionResponse(
            success=True,
            message="Return request submitted successfully. Our team will contact you shortly.",
            order=order
        )
    
    @classmethod
    async def get_order_by_number(cls, order_number: str) -> Optional[OrderDetails]:
        """
        Get order by order number
        
        Args:
            order_number: Order number
            
        Returns:
            OrderDetails if found, None otherwise
        """
        for order in cls._orders.values():
            if order.order_number == order_number:
                return order
        return None

    @classmethod
    async def create_order_from_checkout(
        cls,
        checkout_data: CheckoutDataInput,
        user_id: str = "default"
    ) -> OrderDetails:
        """
        Create order from checkout data (alternative to cart-based checkout)
        
        Args:
            checkout_data: Complete checkout data
            user_id: User identifier
            
        Returns:
            Created OrderDetails
            
        Raises:
            HTTPException: If validation fails or cart is empty
        """
        # Get user's cart
        cart = await CartService.get_or_create_cart(user_id)
        
        # Validate cart is not empty
        if not cart.items or cart.total_items == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create order from empty cart"
            )
        
        # Validate shipping address
        validation = await CheckoutService.validate_shipping_address(
            checkout_data.shipping_address
        )
        if not validation.valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid shipping address: {validation.message}"
            )
        
        # Validate order summary matches server calculations
        await CheckoutService.validate_order_summary(
            checkout_data.order_summary,
            cart.subtotal,
            cart.tax,
            cart.shipping
        )
        
        # Convert input models to order models
        from app.models.order import ShippingAddress, BillingAddress, PaymentMethod
        
        shipping_address = ShippingAddress(
            first_name=checkout_data.shipping_address.first_name,
            last_name=checkout_data.shipping_address.last_name,
            email=checkout_data.shipping_address.email,
            phone=checkout_data.shipping_address.phone,
            address=checkout_data.shipping_address.address,
            city=checkout_data.shipping_address.city,
            state=checkout_data.shipping_address.state,
            zip_code=checkout_data.shipping_address.zip_code,
            country=checkout_data.shipping_address.country
        )
        
        # Use shipping address as billing if not provided separately
        billing_address = BillingAddress(
            first_name=checkout_data.shipping_address.first_name,
            last_name=checkout_data.shipping_address.last_name,
            address=checkout_data.shipping_address.address,
            city=checkout_data.shipping_address.city,
            state=checkout_data.shipping_address.state,
            zip_code=checkout_data.shipping_address.zip_code,
            country=checkout_data.shipping_address.country
        )
        
        payment_method = PaymentMethod(
            type=checkout_data.payment_method.type,
            last4=checkout_data.payment_method.last4,
            brand=checkout_data.payment_method.brand
        )
        
        # Create checkout request
        checkout_request = CheckoutRequest(
            shipping_address=shipping_address,
            billing_address=billing_address,
            payment_method=payment_method,
            shipping_method="standard"
        )
        
        # Create order using existing method
        return await cls.create_order_from_cart(checkout_request, user_id)

    @classmethod
    async def ship_order(
        cls,
        order_id: str,
        shipping_data: Dict
    ) -> OrderDetails:
        """Ship an order with tracking info"""
        order = await cls.get_order_by_id_or_404(order_id)
        
        # Validate order can be shipped
        if order.status not in [OrderStatusEnum.CONFIRMED, OrderStatusEnum.PROCESSING]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot ship order with status '{order.status.value}'"
            )
        
        # Update shipping info
        order.shipping.carrier = shipping_data["carrier"]
        order.shipping.tracking_number = shipping_data["tracking_number"]
        order.shipping.tracking_url = shipping_data["tracking_url"]
        order.shipping.estimated_delivery = shipping_data["estimated_delivery"]
        
        # Update status to shipped
        await cls.update_order_status(
            order_id,
            OrderStatusEnum.SHIPPED,
            f"Order shipped via {shipping_data['carrier']}. Tracking: {shipping_data['tracking_number']}"
        )
        
        return order