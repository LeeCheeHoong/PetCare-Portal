from typing import Optional, List, Dict
from fastapi import HTTPException, status

from app.models.product import Category


class CategoryService:
    """Service layer for category business logic"""
    
    # Mock categories database
    _categories: Dict[str, Category] = {}
    
    @classmethod
    def initialize_mock_data(cls):
        """Initialize with mock category data - call this on startup"""
        cls._categories = {
            "cat_food": Category(id="cat_food", name="Pet Food"),
            "cat_toys": Category(id="cat_toys", name="Toys & Entertainment"),
            "cat_accessories": Category(id="cat_accessories", name="Pet Accessories"),
            "cat_grooming": Category(id="cat_grooming", name="Grooming & Care"),
            "cat_habitats": Category(id="cat_habitats", name="Habitats & Bedding"),
        }
    @classmethod
    async def get_all_categories(cls, sort_by_name: bool = True) -> List[Category]:
        """
        Get all available categories
        
        Args:
            sort_by_name: Whether to sort categories alphabetically by name
            
        Returns:
            List of all categories
        """
        categories = list(cls._categories.values())
        
        if sort_by_name:
            categories = sorted(categories, key=lambda c: c.name)
        
        return categories
    
    @classmethod
    async def get_category_by_id(cls, category_id: str) -> Optional[Category]:
        """
        Get a single category by ID
        
        Args:
            category_id: The unique category identifier
            
        Returns:
            Category if found, None otherwise
        """
        return cls._categories.get(category_id)
    
    @classmethod
    async def get_category_by_id_or_404(cls, category_id: str) -> Category:
        """
        Get a category by ID or raise 404
        
        Args:
            category_id: The unique category identifier
            
        Returns:
            Category
            
        Raises:
            HTTPException: 404 if category not found
        """
        category = cls._categories.get(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id '{category_id}' not found"
            )
        return category
    
    @classmethod
    async def category_exists(cls, category_id: str) -> bool:
        """
        Check if a category exists
        
        Args:
            category_id: The unique category identifier
            
        Returns:
            True if category exists, False otherwise
        """
        return category_id in cls._categories
    
    @classmethod
    async def get_categories_by_ids(cls, category_ids: List[str]) -> List[Category]:
        """
        Get multiple categories by their IDs
        
        Args:
            category_ids: List of category IDs
            
        Returns:
            List of Category objects (excludes not found categories)
        """
        categories = []
        for category_id in category_ids:
            category = cls._categories.get(category_id)
            if category:
                categories.append(category)
        return categories
    
    @classmethod
    async def get_category_names_map(cls) -> Dict[str, str]:
        """
        Get a mapping of category IDs to names
        
        Returns:
            Dict of {category_id: category_name}
        """
        return {cat_id: cat.name for cat_id, cat in cls._categories.items()}
    
    @classmethod
    async def create_category(cls, category_id: str, name: str) -> Category:
        """
        Create a new category
        
        Args:
            category_id: Unique category identifier
            name: Category name
            
        Returns:
            Created Category
            
        Raises:
            HTTPException: 400 if category ID already exists
        """
        if category_id in cls._categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with id '{category_id}' already exists"
            )
        
        category = Category(id=category_id, name=name)
        cls._categories[category_id] = category
        return category
    
    @classmethod
    async def update_category(cls, category_id: str, name: str) -> Category:
        """
        Update an existing category
        
        Args:
            category_id: Category identifier to update
            name: New category name
            
        Returns:
            Updated Category
            
        Raises:
            HTTPException: 404 if category not found
        """
        if category_id not in cls._categories:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id '{category_id}' not found"
            )
        
        category = Category(id=category_id, name=name)
        cls._categories[category_id] = category
        return category
    
    @classmethod
    async def delete_category(cls, category_id: str) -> None:
        """
        Delete a category
        
        Note: In production, should check if category is used by products
        and either prevent deletion or cascade delete/update products
        
        Args:
            category_id: Category identifier to delete
            
        Raises:
            HTTPException: 404 if category not found
        """
        if category_id not in cls._categories:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id '{category_id}' not found"
            )
        
        del cls._categories[category_id]
    
    @classmethod
    async def get_category_count(cls) -> int:
        """
        Get total number of categories
        
        Returns:
            Number of categories
        """
        return len(cls._categories)