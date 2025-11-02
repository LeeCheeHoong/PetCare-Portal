from fastapi import APIRouter, HTTPException, status, Depends
from app.models.cart import (
    Cart, 
    AddToCartRequest,
    UpdateCartItemRequest
)
from app.services.cart_service import CartService


router = APIRouter(prefix="/cart")


# Dependency for user identification (simplified - expand with actual auth)
async def get_current_user_id() -> str:
    """
    Get current user ID from authentication
    In production, extract from JWT token or session
    """
    # For now, return default user
    # Replace with actual authentication logic
    return "default"


@router.get("", response_model=Cart, status_code=status.HTTP_200_OK)
async def get_cart(user_id: str = Depends(get_current_user_id)):
    """
    Fetch the current user's shopping cart
    
    Returns:
        Cart: Complete cart with items and calculated totals
    """
    try:
        print("Fetching cart for user:", user_id)
        cart = await CartService.get_or_create_cart(user_id)
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch cart: {str(e)}"
        )


@router.post("/items", response_model=Cart, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    request: AddToCartRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Add a product to the shopping cart
    
    Args:
        request: AddToCartRequest with productId and quantity
        
    Returns:
        Cart: Updated cart with new item
        
    Raises:
        404: Product not found
        400: Insufficient stock or invalid quantity
    """
    try:
        cart = await CartService.add_item_to_cart(request, user_id)
        return cart
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add item to cart: {str(e)}"
        )


@router.patch("/items/{item_id}", response_model=Cart, status_code=status.HTTP_200_OK)
async def update_cart_item(
    item_id: str,
    request: UpdateCartItemRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update the quantity of a cart item
    
    Args:
        item_id: ID of the cart item to update
        request: UpdateCartItemRequest with new quantity
        
    Returns:
        Cart: Updated cart with modified item
        
    Raises:
        404: Cart item not found
        400: Insufficient stock or invalid quantity
    """
    try:
        cart = await CartService.update_cart_item(item_id, request, user_id)
        return cart
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update cart item: {str(e)}"
        )


@router.delete("/items/{item_id}", response_model=Cart, status_code=status.HTTP_200_OK)
async def remove_cart_item(
    item_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Remove an item from the shopping cart
    
    Args:
        item_id: ID of the cart item to remove
        
    Returns:
        Cart: Updated cart without the removed item
        
    Raises:
        404: Cart item not found
    """
    try:
        cart = await CartService.remove_cart_item(item_id, user_id)
        return cart
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove cart item: {str(e)}"
        )


@router.delete("", response_model=Cart, status_code=status.HTTP_200_OK)
async def clear_cart(user_id: str = Depends(get_current_user_id)):
    """
    Clear all items from the shopping cart
    
    Returns:
        Cart: Empty cart with zero totals
    """
    try:
        cart = await CartService.clear_cart(user_id)
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cart: {str(e)}"
        )