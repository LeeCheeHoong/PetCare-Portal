from fastapi import APIRouter, Path, Body, status
from typing import List

from app.models.product import Category
from app.services.category_service import CategoryService

router = APIRouter(prefix="")


@router.get(
    "/categories",
    response_model=List[Category],
    status_code=status.HTTP_200_OK,
    summary="Get All Categories",
    description="Retrieve list of all available product categories",
    responses={
        200: {
            "description": "Categories retrieved successfully",
            "model": List[Category]
        }
    }
)
async def get_categories() -> List[Category]:
    """
    Get all available product categories.
    
    Categories are returned sorted alphabetically by name.
    
    Used for:
    - Populating category dropdowns in product forms
    - Filtering products by category
    - Navigation menus
    - Category browsing pages
    
    Returns:
        List of all categories sorted by name
    """
    return await CategoryService.get_all_categories(sort_by_name=True)


@router.get(
    "/categories/{category_id}",
    response_model=Category,
    status_code=status.HTTP_200_OK,
    summary="Get Category by ID",
    description="Retrieve a specific category by its ID",
    responses={
        200: {
            "description": "Category found and returned successfully",
            "model": Category
        },
        404: {
            "description": "Category not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Category with id 'cat_999' not found"}
                }
            }
        }
    }
)
async def get_category(
    category_id: str = Path(
        ...,
        description="Unique category identifier",
        example="cat_electronics"
    )
) -> Category:
    """
    Get a specific category by ID.
    
    Args:
        category_id: The unique identifier of the category
        
    Returns:
        Category: The requested category
        
    Raises:
        HTTPException: 404 if category not found
    """
    return await CategoryService.get_category_by_id_or_404(category_id)


@router.post(
    "/categories",
    response_model=Category,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Category",
    description="Create a new product category",
    responses={
        201: {
            "description": "Category created successfully",
            "model": Category
        },
        400: {
            "description": "Category ID already exists",
            "content": {
                "application/json": {
                    "example": {"detail": "Category with id 'cat_electronics' already exists"}
                }
            }
        }
    }
)
async def create_category(
    category_id: str = Body(..., embed=True, description="Unique category identifier", example="cat_gaming"),
    name: str = Body(..., embed=True, description="Category name", example="Gaming")
) -> Category:
    """
    Create a new category.
    
    Args:
        category_id: Unique identifier for the category
        name: Display name for the category
        
    Returns:
        Category: Created category
        
    Raises:
        HTTPException: 400 if category ID already exists
    """
    return await CategoryService.create_category(category_id, name)


@router.put(
    "/categories/{category_id}",
    response_model=Category,
    status_code=status.HTTP_200_OK,
    summary="Update Category",
    description="Update an existing category's name",
    responses={
        200: {
            "description": "Category updated successfully",
            "model": Category
        },
        404: {
            "description": "Category not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Category with id 'cat_999' not found"}
                }
            }
        }
    }
)
async def update_category(
    category_id: str = Path(..., description="Category ID to update"),
    name: str = Body(..., embed=True, description="New category name")
) -> Category:
    """
    Update an existing category.
    
    Args:
        category_id: ID of category to update
        name: New name for the category
        
    Returns:
        Category: Updated category
        
    Raises:
        HTTPException: 404 if category not found
    """
    return await CategoryService.update_category(category_id, name)


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Category",
    description="Delete a category from the system",
    responses={
        204: {
            "description": "Category deleted successfully"
        },
        404: {
            "description": "Category not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Category with id 'cat_999' not found"}
                }
            }
        }
    }
)
async def delete_category(
    category_id: str = Path(..., description="Category ID to delete")
):
    """
    Delete a category.
    
    Note: In production, this should:
    - Check if category is used by any products
    - Either prevent deletion or handle product updates
    - Log the deletion for audit purposes
    
    Args:
        category_id: ID of category to delete
        
    Raises:
        HTTPException: 404 if category not found
    """
    await CategoryService.delete_category(category_id)
    return None