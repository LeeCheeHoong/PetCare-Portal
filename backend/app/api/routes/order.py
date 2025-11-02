from fastapi import APIRouter, Path, Query, Body, status, Depends
from typing import Optional
from app.models.order import (
    OrderDetails,
    OrdersResponse,
    CheckoutRequest,
    ReturnRequest,
    OrderActionResponse,
    UpdateOrderStatusRequest,
    ShipOrderRequest
)
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders")

# Dependency for user identification (simplified - expand with actual auth)
async def get_current_user_id() -> str:
    """Get current user ID from authentication"""
    return "default"


@router.post(
    "/checkout",
    response_model=OrderDetails,
    status_code=status.HTTP_201_CREATED,
    summary="Checkout and Create Order",
    description="Create an order from the current cart",
    responses={
        201: {
            "description": "Order created successfully",
            "model": OrderDetails
        },
        400: {
            "description": "Bad request - cart empty or items out of stock",
            "content": {
                "application/json": {
                    "examples": {
                        "empty_cart": {
                            "value": {"detail": "Cannot create order from empty cart"}
                        },
                        "out_of_stock": {
                            "value": {"detail": "Product 'Sample Product' is no longer in stock"}
                        }
                    }
                }
            }
        }
    }
)
async def checkout(
    checkout_request: CheckoutRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create an order from the current user's cart.
    
    Process:
    1. Validates cart is not empty
    2. Refreshes cart with latest prices and stock
    3. Validates all items are in stock
    4. Creates order with provided shipping/billing info
    5. Clears the cart after successful order creation
    
    Args:
        checkout_request: Checkout information including addresses and payment
        
    Returns:
        OrderDetails: Created order with order number and tracking info
        
    Raises:
        400: Cart is empty or items out of stock
    """
    return await OrderService.create_order_from_cart(checkout_request, user_id)


@router.get(
    "",
    response_model=OrdersResponse,
    status_code=status.HTTP_200_OK,
    summary="List Orders",
    description="Get filtered and paginated list of orders"
)
async def list_orders(
    search: Optional[str] = Query(None, description="Search by order number, name, or email"),
    status: Optional[str] = Query(None, description="Filter by status"),
    date_from: Optional[str] = Query(None, alias="dateFrom", description="Filter from date (ISO format)"),
    date_to: Optional[str] = Query(None, alias="dateTo", description="Filter to date (ISO format)"),
    min_amount: Optional[float] = Query(None, alias="minAmount", ge=0, description="Minimum order amount"),
    max_amount: Optional[float] = Query(None, alias="maxAmount", ge=0, description="Maximum order amount"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    user_id: str = Depends(get_current_user_id)
):
    """List orders with filtering"""
    from app.models.order import OrderFilters
    
    filters = OrderFilters(
        search=search,
        status=status,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        page=page,
        limit=limit
    )
    
    return await OrderService.list_orders(filters, user_id)

@router.get(
    "/{order_id}",
    response_model=OrderDetails,
    status_code=status.HTTP_200_OK,
    summary="Get Order Details",
    description="Retrieve complete details for a specific order",
    responses={
        200: {
            "description": "Order found and returned successfully",
            "model": OrderDetails
        },
        404: {
            "description": "Order not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Order with id 'order_999' not found"}
                }
            }
        }
    }
)
async def get_order_details(
    order_id: str = Path(..., description="Order ID"),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get detailed information about a specific order.
    
    Includes:
    - Order items with product details
    - Shipping and billing addresses
    - Payment information
    - Status history and tracking
    - Pricing breakdown
    
    Args:
        order_id: The unique identifier of the order
        
    Returns:
        OrderDetails: Complete order information
        
    Raises:
        404: Order not found
    """
    return await OrderService.get_order_by_id_or_404(order_id)


@router.post(
    "/{order_id}/cancel",
    response_model=OrderActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel Order",
    description="Cancel a pending or confirmed order",
    responses={
        200: {
            "description": "Order cancelled successfully",
            "model": OrderActionResponse
        },
        400: {
            "description": "Cannot cancel order",
            "content": {
                "application/json": {
                    "example": {"detail": "Cannot cancel order with status 'shipped'"}
                }
            }
        },
        404: {
            "description": "Order not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Order with id 'order_999' not found"}
                }
            }
        }
    }
)
async def cancel_order(
    order_id: str = Path(..., description="Order ID to cancel"),
    user_id: str = Depends(get_current_user_id)
):
    """
    Cancel an order.
    
    Restrictions:
    - Only orders with status 'pending', 'confirmed', or 'processing' can be cancelled
    - Orders that are 'shipped', 'delivered', or already 'cancelled' cannot be cancelled
    
    Args:
        order_id: The unique identifier of the order
        
    Returns:
        OrderActionResponse: Confirmation with updated order details
        
    Raises:
        404: Order not found
        400: Order cannot be cancelled (invalid status)
    """
    return await OrderService.cancel_order(order_id)


@router.post(
    "/{order_id}/return",
    response_model=OrderActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Request Return",
    description="Request a return for delivered order items",
    responses={
        200: {
            "description": "Return request submitted successfully",
            "model": OrderActionResponse
        },
        400: {
            "description": "Cannot request return",
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_status": {
                            "value": {"detail": "Cannot request return for order with status 'pending'. Order must be delivered."}
                        },
                        "invalid_items": {
                            "value": {"detail": "Invalid item IDs: item_999"}
                        }
                    }
                }
            }
        },
        404: {
            "description": "Order not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Order with id 'order_999' not found"}
                }
            }
        }
    }
)
async def request_return(
    order_id: str = Path(..., description="Order ID"),
    return_request: ReturnRequest = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Request a return for specific items in a delivered order.
    
    Requirements:
    - Order must have status 'delivered'
    - Must specify at least one valid item ID
    - Must provide a reason for the return
    
    Process:
    1. Validates order is delivered
    2. Validates item IDs are valid
    3. Creates return request in order history
    4. Customer support will be notified
    
    Args:
        order_id: The unique identifier of the order
        return_request: Return request with item IDs and reason
        
    Returns:
        OrderActionResponse: Confirmation with updated order details
        
    Raises:
        404: Order not found
        400: Order not delivered or invalid item IDs
    """
    return await OrderService.request_return(order_id, return_request)

@router.patch(
    "/{order_id}/status",
    response_model=OrderDetails,
    status_code=status.HTTP_200_OK,
    summary="Update Order Status",
    description="Update the status of an order"
)
async def update_order_status(
    order_id: str = Path(..., description="Order ID"),
    request: UpdateOrderStatusRequest = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """Update order status with optional note"""
    return await OrderService.update_order_status(
        order_id,
        request.status,
        request.note or f"Status updated to {request.status}"
    )


@router.patch(
    "/{order_id}/ship",
    response_model=OrderDetails,
    status_code=status.HTTP_200_OK,
    summary="Ship Order",
    description="Mark order as shipped with tracking information"
)
async def ship_order(
    order_id: str = Path(..., description="Order ID"),
    request: ShipOrderRequest = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """Ship an order with tracking info"""
    shipping_data = {
        "carrier": request.carrier,
        "tracking_number": request.tracking_number,
        "tracking_url": request.tracking_url,
        "estimated_delivery": request.estimated_delivery
    }
    return await OrderService.ship_order(order_id, shipping_data)