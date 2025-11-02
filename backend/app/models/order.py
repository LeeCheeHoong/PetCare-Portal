from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Literal
from enum import Enum


class OrderStatusEnum(str, Enum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentMethodType(str, Enum):
    """Payment method types"""
    CARD = "card"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"


class OrderStatus(BaseModel):
    """Order status history entry"""
    status: OrderStatusEnum
    timestamp: datetime
    note: str
    location: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrderItem(BaseModel):
    """Individual order item"""
    id: str
    product_id: str = Field(..., alias="productId")
    product_name: str = Field(..., alias="productName")
    product_image: str = Field(..., alias="productImage")
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0, alias="unitPrice")
    total_price: float = Field(..., gt=0, alias="totalPrice")
    
    class Config:
        populate_by_name = True
        from_attributes = True


class ShippingAddress(BaseModel):
    """Shipping address information"""
    first_name: str = Field(..., alias="firstName", min_length=1)
    last_name: str = Field(..., alias="lastName", min_length=1)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    phone: str = Field(..., min_length=10)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zip_code: str = Field(..., alias="zipCode", min_length=1)
    country: str = Field(..., min_length=1)
    
    class Config:
        populate_by_name = True
        from_attributes = True


class BillingAddress(BaseModel):
    """Billing address information"""
    first_name: str = Field(..., alias="firstName", min_length=1)
    last_name: str = Field(..., alias="lastName", min_length=1)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    zip_code: str = Field(..., alias="zipCode", min_length=1)
    country: str = Field(..., min_length=1)
    
    class Config:
        populate_by_name = True
        from_attributes = True


class PaymentMethod(BaseModel):
    """Payment method information"""
    type: PaymentMethodType
    last4: Optional[str] = Field(None, min_length=4, max_length=4)
    brand: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrderPricing(BaseModel):
    """Order pricing breakdown"""
    subtotal: float = Field(..., ge=0)
    shipping: float = Field(..., ge=0)
    tax: float = Field(..., ge=0)
    discount: float = Field(0.0, ge=0)
    total: float = Field(..., ge=0)
    
    class Config:
        from_attributes = True


class ShippingInfo(BaseModel):
    """Shipping information"""
    method: str
    carrier: str
    tracking_number: str = Field(..., alias="trackingNumber")
    tracking_url: str = Field(..., alias="trackingUrl")
    estimated_delivery: str = Field(..., alias="estimatedDelivery")
    
    class Config:
        populate_by_name = True
        from_attributes = True


class OrderDetails(BaseModel):
    """Complete order details"""
    id: str
    order_number: str = Field(..., alias="orderNumber")
    status: OrderStatusEnum
    status_history: List[OrderStatus] = Field(..., alias="statusHistory")
    total_amount: float = Field(..., gt=0, alias="totalAmount")
    currency: str = "USD"
    items: List[OrderItem]
    shipping_address: ShippingAddress = Field(..., alias="shippingAddress")
    billing_address: BillingAddress = Field(..., alias="billingAddress")
    payment_method: PaymentMethod = Field(..., alias="paymentMethod")
    pricing: OrderPricing
    shipping: ShippingInfo
    order_date: datetime = Field(..., alias="orderDate")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "order_123",
                "orderNumber": "ORD-2024-001",
                "status": "confirmed",
                "statusHistory": [
                    {
                        "status": "pending",
                        "timestamp": "2024-01-15T10:30:00Z",
                        "note": "Order placed"
                    }
                ],
                "totalAmount": 299.99,
                "currency": "USD",
                "items": [],
                "shippingAddress": {},
                "billingAddress": {},
                "paymentMethod": {"type": "card"},
                "pricing": {
                    "subtotal": 249.99,
                    "shipping": 10.00,
                    "tax": 40.00,
                    "discount": 0.00,
                    "total": 299.99
                },
                "shipping": {
                    "method": "Standard",
                    "carrier": "USPS",
                    "trackingNumber": "123456789",
                    "trackingUrl": "https://tracking.usps.com/123456789",
                    "estimatedDelivery": "2024-01-20"
                },
                "orderDate": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-01-15T10:30:00Z"
            }
        }


class OrderPagination(BaseModel):
    """Pagination metadata for orders"""
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0, alias="totalPages")
    
    class Config:
        populate_by_name = True

class OrderFilters(BaseModel):
    """Order filtering parameters"""
    search: Optional[str] = Field(None, description="Search order number, customer name, or email")
    status: Optional[OrderStatusEnum] = None
    date_from: Optional[str] = Field(None, alias="dateFrom")
    date_to: Optional[str] = Field(None, alias="dateTo")
    min_amount: Optional[float] = Field(None, alias="minAmount", ge=0)
    max_amount: Optional[float] = Field(None, alias="maxAmount", ge=0)
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class UpdateOrderStatusRequest(BaseModel):
    """Request to update order status"""
    status: OrderStatusEnum
    note: Optional[str] = None
    
    class Config:
        use_enum_values = True


class ShipOrderRequest(BaseModel):
    """Request to ship an order"""
    carrier: str
    tracking_number: str = Field(..., alias="trackingNumber")
    tracking_url: str = Field(..., alias="trackingUrl")
    estimated_delivery: str = Field(..., alias="estimatedDelivery")
    
    class Config:
        populate_by_name = True

class OrdersResponse(BaseModel):
    """Response for order list"""
    success: bool = True
    orders: List[OrderDetails]
    pagination: OrderPagination
    
    class Config:
        from_attributes = True


# Request Models
class CheckoutRequest(BaseModel):
    """Request model for creating an order"""
    shipping_address: ShippingAddress = Field(..., alias="shippingAddress")
    billing_address: BillingAddress = Field(..., alias="billingAddress")
    payment_method: PaymentMethod = Field(..., alias="paymentMethod")
    shipping_method: str = Field("standard", alias="shippingMethod")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "shippingAddress": {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "phone": "1234567890",
                    "address": "123 Main St",
                    "city": "New York",
                    "state": "NY",
                    "zipCode": "10001",
                    "country": "USA"
                },
                "billingAddress": {
                    "firstName": "John",
                    "lastName": "Doe",
                    "address": "123 Main St",
                    "city": "New York",
                    "state": "NY",
                    "zipCode": "10001",
                    "country": "USA"
                },
                "paymentMethod": {
                    "type": "card",
                    "last4": "4242",
                    "brand": "Visa"
                },
                "shippingMethod": "standard"
            }
        }


class ReturnRequest(BaseModel):
    """Request model for return"""
    items: List[str] = Field(..., min_length=1, description="List of order item IDs")
    reason: str = Field(..., min_length=10, max_length=500)
    
    class Config:
        json_schema_extra = {
            "example": {
                "items": ["item_123", "item_456"],
                "reason": "Product not as described"
            }
        }


class OrderActionResponse(BaseModel):
    """Response for order actions (cancel, return)"""
    success: bool
    message: str
    order: OrderDetails
    
    class Config:
        from_attributes = True

class ShippingAddressInput(BaseModel):
    """Shipping address input for checkout"""
    first_name: str = Field(..., alias="firstName", min_length=1)
    last_name: str = Field(..., alias="lastName", min_length=1)
    email: str = Field(..., alias="email")
    phone: str = Field(..., min_length=10)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=2)  # State code
    zip_code: str = Field(..., alias="zipCode", min_length=5)
    country: str = Field("USA", min_length=1)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john@example.com",
                "phone": "1234567890",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001",
                "country": "USA"
            }
        }


class PaymentMethodInput(BaseModel):
    """Payment method input for checkout"""
    id: Optional[str] = None
    type: Literal["card"] = "card"
    is_default: bool = Field(False, alias="isDefault")
    
    # Card details (for new card)
    card_number: Optional[str] = Field(None, alias="cardNumber", min_length=13, max_length=19)
    expiry_month: Optional[str] = Field(None, alias="expiryMonth", pattern=r'^(0[1-9]|1[0-2])$')
    expiry_year: Optional[str] = Field(None, alias="expiryYear", pattern=r'^\d{4}$')
    cvv: Optional[str] = Field(None, min_length=3, max_length=4)
    cardholder_name: Optional[str] = Field(None, alias="cardholderName", min_length=1)
    
    # Display info (for saved card)
    last4: Optional[str] = Field(None, min_length=4, max_length=4)
    brand: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "pm_123",
                "type": "card",
                "isDefault": True,
                "last4": "4242",
                "brand": "Visa"
            }
        }


class OrderSummary(BaseModel):
    """Order pricing summary"""
    subtotal: float = Field(..., ge=0)
    shipping: float = Field(..., ge=0)
    tax: float = Field(..., ge=0)
    discount: Optional[float] = Field(0.0, ge=0)
    total: float = Field(..., ge=0)
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "subtotal": 249.99,
                "shipping": 10.00,
                "tax": 20.00,
                "discount": 0.00,
                "total": 279.99
            }
        }


class CheckoutDataInput(BaseModel):
    """Complete checkout data input"""
    shipping_address: ShippingAddressInput = Field(..., alias="shippingAddress")
    payment_method: PaymentMethodInput = Field(..., alias="paymentMethod")
    order_summary: OrderSummary = Field(..., alias="orderSummary")
    
    class Config:
        populate_by_name = True


class ShippingValidationResponse(BaseModel):
    """Response for shipping address validation"""
    valid: bool
    message: str
    suggested_address: Optional[ShippingAddressInput] = Field(None, alias="suggestedAddress")
    
    class Config:
        populate_by_name = True


class ShippingMethod(BaseModel):
    """Individual shipping method option"""
    id: str
    name: str
    cost: float = Field(..., ge=0)
    estimated_days: int = Field(..., ge=0, alias="estimatedDays")
    
    class Config:
        populate_by_name = True
        from_attributes = True

class ShippingCalculationResponse(BaseModel):
    """Response for shipping cost calculation"""
    success: bool = True
    cost: float = Field(..., ge=0)
    currency: str = "USD"
    estimated_days: int = Field(..., ge=0, alias="estimatedDays")
    shipping_methods: list[ShippingMethod] = Field(..., alias="shippingMethods")
    
    class Config:
        populate_by_name = True
        from_attributes = True


class PaymentMethodResponse(BaseModel):
    """Saved payment method response"""
    id: str
    type: Literal["card"] = "card"
    is_default: bool = Field(..., alias="isDefault")
    last4: str
    brand: str
    expiry_month: str = Field(..., alias="expiryMonth")
    expiry_year: str = Field(..., alias="expiryYear")
    cardholder_name: str = Field(..., alias="cardholderName")
    
    class Config:
        populate_by_name = True
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "pm_123",
                "type": "card",
                "isDefault": True,
                "last4": "4242",
                "brand": "Visa",
                "expiryMonth": "12",
                "expiryYear": "2025",
                "cardholderName": "John Doe"
            }
        }
