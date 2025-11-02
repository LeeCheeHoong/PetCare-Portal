from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class Category(BaseModel):
    """Product category model"""
    id: str
    name: str
    
    class Config:
        from_attributes = True  


class ProductDetail(BaseModel):
    """Complete product detail model matching frontend interface"""
    id: str
    name: str
    description: str
    detailed_description: Optional[str] = Field(None, alias="detailedDescription")
    price: float = Field(..., gt=0, description="Product price must be greater than 0")
    original_price: Optional[float] = Field(None, alias="originalPrice", gt=0)
    discount: Optional[float] = Field(None, ge=0, le=100, description="Discount percentage 0-100")
    images: list[str] = Field(..., min_length=1, description="At least one image required")
    category: Category
    in_stock: bool = Field(..., alias="inStock")
    stock_count: int = Field(..., ge=0, alias="stockCount") 
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    class Config:
        populate_by_name = True
        from_attributes = True  
        arbitrary_types_allowed = True  


class ProductAvailability(BaseModel):
    """Product availability response model"""
    in_stock: bool = Field(..., alias="inStock")
    stock_count: int = Field(..., ge=0, alias="stockCount")

    class Config:
        populate_by_name = True
        from_attributes = True  
        json_schema_extra = {
            "example": {
                "inStock": True,
                "stockCount": 50
            }
        }


class SortBy(str, Enum):
    """Sorting field options"""
    NAME = "name"
    PRICE = "price"
    CREATED = "created"


class SortOrder(str, Enum):
    """Sort order options"""
    ASC = "asc"
    DESC = "desc"


class ProductFilters(BaseModel):
    """Product filtering and search parameters"""
    search: Optional[str] = Field(None, min_length=1, max_length=100, description="Search term for product name/description")
    category_ids: Optional[list[str]] = Field(None, alias="categoryIds", description="Filter by category IDs")
    min_price: Optional[float] = Field(None, alias="minPrice", ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, alias="maxPrice", ge=0, description="Maximum price filter")
    in_stock: Optional[bool] = Field(None, alias="inStock", description="Filter by stock availability")
    sort_by: Optional[SortBy] = Field(SortBy.CREATED, alias="sortBy", description="Field to sort by")
    sort_order: Optional[SortOrder] = Field(SortOrder.DESC, alias="sortOrder", description="Sort order")
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(12, ge=1, le=100, description="Items per page")

    class Config:
        populate_by_name = True
        use_enum_values = True
        from_attributes = True  


class Pagination(BaseModel):
    """Pagination metadata"""
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0, description="Total number of items")
    total_pages: int = Field(..., ge=0, alias="totalPages", description="Total number of pages")
    has_next: bool = Field(..., alias="hasNext", description="Whether there is a next page")
    has_prev: bool = Field(..., alias="hasPrev", description="Whether there is a previous page")

    class Config:
        populate_by_name = True
        from_attributes = True  


class CategoryCount(BaseModel):
    """Category with product count"""
    id: str
    name: str
    count: int = Field(..., ge=0, description="Number of products in this category")
    
    class Config:
        from_attributes = True  


class PriceRange(BaseModel):
    """Available price range"""
    min: float = Field(..., ge=0, alias="min")
    max: float = Field(..., ge=0, alias="max")

    class Config:
        populate_by_name = True
        from_attributes = True  


class AvailableFilters(BaseModel):
    """Available filter options based on current dataset"""
    categories: list[CategoryCount]
    price_range: PriceRange = Field(..., alias="priceRange")

    class Config:
        populate_by_name = True
        from_attributes = True  


class ProductsFilters(BaseModel):
    """Applied and available filters"""
    applied_filters: ProductFilters = Field(..., alias="appliedFilters")
    available_filters: AvailableFilters = Field(..., alias="availableFilters")

    class Config:
        populate_by_name = True
        from_attributes = True  


class ProductsResponse(BaseModel):
    """Complete product listing response with pagination and filters"""
    products: list[ProductDetail]
    pagination: Pagination
    filters: ProductsFilters

    class Config:
        from_attributes = True  
        json_schema_extra = {
            "example": {
                "products": [],
                "pagination": {
                    "page": 1,
                    "limit": 12,
                    "total": 50,
                    "totalPages": 5,
                    "hasNext": True,
                    "hasPrev": False
                },
                "filters": {
                    "appliedFilters": {
                        "search": "headphones",
                        "categoryIds": ["cat_electronics"],
                        "minPrice": 100,
                        "maxPrice": 500,
                        "inStock": True,
                        "sortBy": "price",
                        "sortOrder": "asc",
                        "page": 1,
                        "limit": 12
                    },
                    "availableFilters": {
                        "categories": [
                            {"id": "cat_electronics", "name": "Electronics", "count": 25},
                            {"id": "cat_wearables", "name": "Wearables", "count": 15}
                        ],
                        "priceRange": {
                            "min": 49.99,
                            "max": 999.99
                        }
                    }
                }
            }
        }


class CreateProductInput(BaseModel):
    """Input model for creating/updating products"""
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    description: str = Field(..., min_length=1, max_length=500, description="Short description")
    detailed_description: Optional[str] = Field(
        None, 
        alias="detailedDescription", 
        max_length=5000,
        description="Detailed product description"
    )
    price: float = Field(..., gt=0, description="Product price must be greater than 0")
    original_price: Optional[float] = Field(None, alias="originalPrice", gt=0)
    discount: Optional[float] = Field(None, ge=0, le=100, description="Discount percentage 0-100")
    images: list[str] = Field(..., min_length=1, description="At least one image URL required")
    category_id: str = Field(..., alias="categoryId", description="Category ID")
    in_stock: bool = Field(..., alias="inStock")
    stock_count: int = Field(..., ge=0, alias="stockCount")

    class Config:
        populate_by_name = True
        from_attributes = True  
        json_schema_extra = {
            "example": {
                "name": "Wireless Headphones",
                "description": "Premium noise-cancelling headphones",
                "detailedDescription": "High-quality wireless headphones with active noise cancellation...",
                "price": 299.99,
                "originalPrice": 399.99,
                "discount": 25,
                "images": [
                    "https://example.com/image1.jpg",
                    "https://example.com/image2.jpg"
                ],
                "categoryId": "cat_electronics",
                "inStock": True,
                "stockCount": 50
            }
        }


class ProductCreatedResponse(BaseModel):
    """Response after creating a product"""
    id: str
    message: str
    product: ProductDetail
    
    class Config:
        from_attributes = True  


class ProductUpdatedResponse(BaseModel):
    """Response after updating a product"""
    message: str
    product: ProductDetail
    
    class Config:
        from_attributes = True  


class ProductDeletedResponse(BaseModel):
    """Response after deleting a product"""
    message: str
    deleted_id: str = Field(..., alias="deletedId")

    class Config:
        populate_by_name = True
        from_attributes = True  