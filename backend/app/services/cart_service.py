from datetime import datetime
from fastapi import HTTPException, status
from app.models.cart import Cart, CartItem, AddToCartRequest, UpdateCartItemRequest
from app.services.product_service import ProductService
import uuid


class CartService:
    """Service layer for cart business logic"""
    
    # In-memory storage (replace with database in production)
    _carts = {}
    
    # Configuration
    TAX_RATE = 0.08  # 8% tax
    SHIPPING_THRESHOLD = 50.0  # Free shipping over \$50
    SHIPPING_COST = 5.99
    
    @classmethod
    def _calculate_cart_totals(cls, cart: Cart) -> Cart:
        """Calculate cart totals (subtotal, tax, shipping, total)"""
        # Calculate subtotal
        cart.subtotal = sum(
            item.product.price * item.quantity 
            for item in cart.items
        )
        
        # Calculate total items
        cart.total_items = sum(item.quantity for item in cart.items)
        
        # Calculate tax
        cart.tax = round(cart.subtotal * cls.TAX_RATE, 2)
        
        # Calculate shipping
        cart.shipping = 0.0 if cart.subtotal >= cls.SHIPPING_THRESHOLD else cls.SHIPPING_COST
        
        # Calculate total
        cart.total = round(cart.subtotal + cart.tax + cart.shipping, 2)
        
        # Update timestamp
        cart.updated_at = datetime.utcnow()
        
        return cart
    
    @classmethod
    async def get_or_create_cart(cls, user_id: str = "default") -> Cart:
        """Get existing cart or create new one"""
        if user_id not in cls._carts:
            cart = Cart(
                id=f"cart_{uuid.uuid4().hex[:8]}",
                items=[],
                total_items=0,
                subtotal=0.0,
                tax=0.0,
                shipping=0.0,
                total=0.0
            )
            cls._carts[user_id] = cart
        
        return cls._carts[user_id]
    
    @classmethod
    async def add_item_to_cart(
        cls, 
        request: AddToCartRequest, 
        user_id: str = "default"
    ) -> Cart:
        """
        Add item to cart or update quantity if already exists
        
        Args:
            request: AddToCartRequest with productId and quantity
            user_id: User identifier
            
        Returns:
            Updated Cart
            
        Raises:
            HTTPException: 404 if product not found, 400 if insufficient stock
        """
        cart = await cls.get_or_create_cart(user_id)
        
        # Fetch product details using ProductService
        product = await ProductService.get_product_by_id(request.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id '{request.product_id}' not found"
            )
        
        # Check if item already in cart
        existing_item = next(
            (item for item in cart.items if item.product.id == request.product_id),
            None
        )
        
        # Calculate total quantity needed
        total_quantity_needed = request.quantity
        if existing_item:
            total_quantity_needed += existing_item.quantity
        
        # Validate stock using ProductService
        is_available, current_stock, error_msg = await ProductService.validate_stock(
            request.product_id,
            total_quantity_needed
        )
        
        if not is_available:
            if existing_item:
                available_to_add = current_stock - existing_item.quantity
                if available_to_add > 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Cannot add {request.quantity} more. Only {available_to_add} more item(s) can be added. Current stock: {current_stock}"
                    )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        if existing_item:
            # Update quantity of existing item
            existing_item.quantity = total_quantity_needed
            # Update product details (prices might have changed)
            existing_item.product = product
        else:
            # Create new cart item
            cart_item = CartItem(
                id=f"ci_{uuid.uuid4().hex[:8]}",
                product=product,
                quantity=request.quantity,
                added_at=datetime.utcnow()
            )
            cart.items.append(cart_item)
        
        # Recalculate totals
        cart = cls._calculate_cart_totals(cart)
        return cart
    
    @classmethod
    async def update_cart_item(
        cls,
        item_id: str,
        request: UpdateCartItemRequest,
        user_id: str = "default"
    ) -> Cart:
        """
        Update cart item quantity
        
        Args:
            item_id: Cart item ID to update
            request: UpdateCartItemRequest with new quantity
            user_id: User identifier
            
        Returns:
            Updated Cart
            
        Raises:
            HTTPException: 404 if item not found, 400 if insufficient stock
        """
        cart = await cls.get_or_create_cart(user_id)
        
        # Find the cart item
        cart_item = next(
            (item for item in cart.items if item.id == item_id),
            None
        )
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cart item with id '{item_id}' not found"
            )
        
        # Fetch latest product details using ProductService
        product = await ProductService.get_product_by_id(cart_item.product.id)
        if not product:
            # Product was deleted, remove from cart
            cart.items = [item for item in cart.items if item.id != item_id]
            cart = cls._calculate_cart_totals(cart)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{cart_item.product.name}' is no longer available and has been removed from cart"
            )
        
        # Validate stock using ProductService
        is_available, current_stock, error_msg = await ProductService.validate_stock(
            product.id,
            request.quantity
        )
        
        if not is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Update cart item
        cart_item.quantity = request.quantity
        cart_item.product = product  # Update with latest product details
        
        # Recalculate totals
        cart = cls._calculate_cart_totals(cart)
        return cart
    
    @classmethod
    async def remove_cart_item(
        cls,
        item_id: str,
        user_id: str = "default"
    ) -> Cart:
        """
        Remove item from cart
        
        Args:
            item_id: Cart item ID to remove
            user_id: User identifier
            
        Returns:
            Updated Cart
            
        Raises:
            HTTPException: 404 if item not found
        """
        cart = await cls.get_or_create_cart(user_id)
        
        # Find and remove the cart item
        original_length = len(cart.items)
        cart.items = [item for item in cart.items if item.id != item_id]
        
        if len(cart.items) == original_length:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cart item with id '{item_id}' not found"
            )
        
        # Recalculate totals
        cart = cls._calculate_cart_totals(cart)
        return cart
    
    @classmethod
    async def clear_cart(cls, user_id: str = "default") -> Cart:
        """
        Clear all items from cart
        
        Args:
            user_id: User identifier
            
        Returns:
            Empty Cart
        """
        cart = await cls.get_or_create_cart(user_id)
        cart.items = []
        cart = cls._calculate_cart_totals(cart)
        return cart
    
    @classmethod
    async def refresh_cart_items(cls, user_id: str = "default") -> Cart:
        """
        Refresh all cart items with latest product details and validate stock
        Removes items that are no longer available
        
        Args:
            user_id: User identifier
            
        Returns:
            Refreshed Cart with updated product details
        """
        cart = await cls.get_or_create_cart(user_id)
        
        if not cart.items:
            return cart
        
        updated_items = []
        
        # Get all product IDs
        product_ids = [item.product.id for item in cart.items]
        
        # Fetch all products in one call (more efficient)
        products_dict = {
            p.id: p 
            for p in await ProductService.get_products_by_ids(product_ids)
        }
        
        # Check availability for all products
        product_quantities = {item.product.id: item.quantity for item in cart.items}
        availability_results = await ProductService.bulk_check_availability(product_quantities)
        
        for item in cart.items:
            product = products_dict.get(item.product.id)
            
            if not product:
                # Product deleted - skip this item
                continue
            
            is_available, current_stock, _ = availability_results.get(
                item.product.id,
                (False, 0, "Unknown error")
            )
            
            if not is_available:
                if not product.in_stock:
                    # Out of stock - skip this item
                    continue
                else:
                    # Adjust quantity to available stock
                    item.quantity = min(item.quantity, current_stock)
            
            # Update product details
            item.product = product
            updated_items.append(item)
        
        cart.items = updated_items
        cart = cls._calculate_cart_totals(cart)
        
        return cart