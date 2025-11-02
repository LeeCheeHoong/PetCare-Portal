from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from app.models.product import ProductDetail


class CartItem(BaseModel):
    """Individual cart item model"""
    id: str
    product: ProductDetail  # This now properly references the same ProductDetail
    quantity: int = Field(gt=0, description="Quantity must be at least 1")
    added_at: datetime = Field(default_factory=datetime.utcnow, alias="addedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True  # Allow creating from ORM models
        json_schema_extra = {
            "example": {
                "id": "ci_123",
                "product": {
                    "id": "prod_456",
                    "name": "Sample Product",
                    "price": 29.99,
                    "inStock": True,
                    "stockCount": 100
                },
                "quantity": 2,
                "addedAt": "2024-01-15T10:30:00Z"
            }
        }


class Cart(BaseModel):
    """Complete shopping cart model"""
    id: str
    items: List[CartItem] = Field(default_factory=list)
    total_items: int = Field(0, alias="totalItems")
    subtotal: float = Field(0.0, ge=0)
    tax: float = Field(0.0, ge=0)
    shipping: float = Field(0.0, ge=0)
    total: float = Field(0.0, ge=0)
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True


# Request Models
class AddToCartRequest(BaseModel):
    """Request model for adding items to cart"""
    product_id: str = Field(..., alias="productId", min_length=1)
    quantity: int = Field(1, gt=0, le=100, description="Quantity between 1-100")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "productId": "prod_456",
                "quantity": 2
            }
        }


class UpdateCartItemRequest(BaseModel):
    """Request model for updating cart item quantity"""
    quantity: int = Field(..., gt=0, le=100, description="New quantity between 1-100")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quantity": 3
            }
        }