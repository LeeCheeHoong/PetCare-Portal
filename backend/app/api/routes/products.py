
from fastapi import APIRouter, Path, Query, status
from typing import Optional

from app.models.product import (
    ProductDetail,
    ProductAvailability,
    ProductsResponse,
    CreateProductInput,
    ProductCreatedResponse,
    ProductUpdatedResponse,
    ProductDeletedResponse,
    ProductFilters,
    SortBy,
    SortOrder
)
from app.services.product_service import ProductService

router = APIRouter(prefix="")


@router.get(
    "/products/{product_id}",
    response_model=ProductDetail,
    status_code=status.HTTP_200_OK,
    summary="Get Product Details",
    description="Retrieve complete details for a specific product by ID",
    responses={
        200: {
            "description": "Product found and returned successfully",
            "model": ProductDetail
        },
        404: {
            "description": "Product not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Product with id 'prod_999' not found"}
                }
            }
        }
    }
)
async def get_product(
    product_id: str = Path(
        ...,
        description="Unique product identifier",
        example="prod_123"
    )
) -> ProductDetail:
    """
    Fetch detailed information about a specific product.
    
    Args:
        product_id: The unique identifier of the product
        
    Returns:
        ProductDetail: Complete product information including pricing, stock, and images
        
    Raises:
        HTTPException: 404 if product not found
    """
    return await ProductService.get_product_by_id_or_404(product_id)


@router.get(
    "/products/{product_id}/availability",
    response_model=ProductAvailability,
    status_code=status.HTTP_200_OK,
    summary="Check Product Availability",
    description="Check if a product is in stock and get current stock count",
    responses={
        200: {
            "description": "Availability information retrieved successfully",
            "model": ProductAvailability
        },
        404: {
            "description": "Product not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Product with id 'prod_999' not found"}
                }
            }
        }
    }
)
async def check_product_availability(
    product_id: str = Path(
        ...,
        description="Unique product identifier",
        example="prod_123"
    )
) -> ProductAvailability:
    """
    Check the availability and stock count for a specific product.
    
    This endpoint is useful for:
    - Checking stock before adding to cart
    - Displaying real-time availability on product pages
    - Inventory management
    
    Args:
        product_id: The unique identifier of the product
        
    Returns:
        ProductAvailability: Stock status and count
        
    Raises:
        HTTPException: 404 if product not found
    """
    return await ProductService.check_product_availability_or_404(product_id)


@router.get(
    "/products",
    response_model=ProductsResponse,
    status_code=status.HTTP_200_OK,
    summary="List Products with Filtering",
    description="Get paginated product list with search, filtering, and sorting capabilities",
)
async def list_products(
    search: Optional[str] = Query(None, min_length=1, max_length=100, description="Search term"),
    category_ids: Optional[list[str]] = Query(None, alias="categoryIds", description="Filter by category IDs"),
    min_price: Optional[float] = Query(None, alias="minPrice", ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, alias="maxPrice", ge=0, description="Maximum price"),
    in_stock: Optional[bool] = Query(None, alias="inStock", description="Filter by stock availability"),
    sort_by: SortBy = Query(SortBy.CREATED, alias="sortBy", description="Sort by field"),
    sort_order: SortOrder = Query(SortOrder.DESC, alias="sortOrder", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
) -> ProductsResponse:
    """
    List products with comprehensive filtering, search, sorting, and pagination.
    
    Features:
    - Search by product name or description
    - Filter by category, price range, and stock status
    - Sort by name, price, or creation date
    - Paginated results
    - Returns available filter options
    
    Args:
        search: Search term for product name/description
        category_ids: List of category IDs to filter by
        min_price: Minimum price filter
        max_price: Maximum price filter
        in_stock: Filter by stock availability
        sort_by: Field to sort results by
        sort_order: Sort direction (asc/desc)
        page: Page number (1-indexed)
        limit: Number of items per page
        
    Returns:
        ProductsResponse: Paginated products with filter metadata
    """
    # Create filters object
    filters = ProductFilters(
        search=search,
        category_ids=category_ids,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )

    return await ProductService.list_products(filters)


@router.post(
    "/products",
    response_model=ProductCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Product",
    description="Create a new product in the catalog",
    responses={
        201: {"description": "Product created successfully"},
        400: {
            "description": "Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Category with id 'invalid_cat' not found"}
                }
            }
        },
    }
)
async def create_product(product_input: CreateProductInput) -> ProductCreatedResponse:
    """
    Create a new product.
    
    Validates:
    - Category exists
    - Price is positive
    - At least one image is provided
    - Stock count is non-negative
    
    Args:
        product_input: Product data
        
    Returns:
        ProductCreatedResponse: Created product with ID
        
    Raises:
        HTTPException: 400 if category doesn't exist or validation fails
    """
    return await ProductService.create_product(product_input)


@router.put(
    "/products/{product_id}",
    response_model=ProductUpdatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Product",
    description="Update an existing product's information",
    responses={
        200: {"description": "Product updated successfully"},
        404: {
            "description": "Product not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Product with id 'prod_999' not found"}
                }
            }
        },
        400: {
            "description": "Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Category with id 'invalid_cat' not found"}
                }
            }
        },
    }
)
async def update_product(
    product_id: str = Path(..., description="Product ID to update"),
    product_input: CreateProductInput = ...
) -> ProductUpdatedResponse:
    """
    Update an existing product.
    
    Updates all product fields with new values.
    Validates category exists before updating.
    
    Args:
        product_id: ID of product to update
        product_input: New product data
        
    Returns:
        ProductUpdatedResponse: Updated product
        
    Raises:
        HTTPException: 404 if product not found, 400 if invalid category
    """
    return await ProductService.update_product(product_id, product_input)


@router.delete(
    "/products/{product_id}",
    response_model=ProductDeletedResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Product",
    description="Delete a product from the catalog",
    responses={
        200: {"description": "Product deleted successfully"},
        404: {
            "description": "Product not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Product with id 'prod_999' not found"}
                }
            }
        },
    }
)
async def delete_product(
    product_id: str = Path(..., description="Product ID to delete")
) -> ProductDeletedResponse:
    """
    Delete a product from the catalog.
    
    This is a soft delete in production - consider adding:
    - Archive functionality
    - Cascade delete for related data
    - Admin audit logs
    
    Args:
        product_id: ID of product to delete
        
    Returns:
        ProductDeletedResponse: Confirmation of deletion
        
    Raises:
        HTTPException: 404 if product not found
    """
    return await ProductService.delete_product(product_id)