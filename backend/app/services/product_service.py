from typing import Optional, List, Dict
from datetime import datetime
from fastapi import HTTPException, status
from uuid import uuid4
from app.services.category_service import CategoryService

from app.models.product import (
    ProductDetail,
    ProductAvailability,
    ProductFilters,
    ProductsResponse,
    ProductsFilters,
    AvailableFilters,
    CreateProductInput,
    ProductCreatedResponse,
    ProductUpdatedResponse,
    ProductDeletedResponse,
    Category,
    CategoryCount,
    PriceRange,
    Pagination,
    SortBy,
    SortOrder
)


class ProductService:
    """Service layer for product business logic"""
    
    # Mock data storage (replace with database in production)
    _products: Dict[str, ProductDetail] = {}
    _categories: Dict[str, Category] = {}
    
    @classmethod
    def initialize_mock_data(cls):
        """Initialize with mock data - call this on startup"""
        cls._products = {
            "prod_123": ProductDetail(
                id="prod_123",
                name="Premium Dog Food - Chicken & Rice",
                description="Nutritious dry dog food for adult dogs",
                detailed_description="High-quality protein-rich formula with real chicken, brown rice, and essential vitamins. Perfect for adult dogs of all breeds.",
                price=49.99,
                original_price=64.99,
                discount=25,
                images=["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500"],
                category={"id": "cat_food", "name": "Pet Food"},
                in_stock=True,
                stock_count=50,
                created_at=datetime(2024, 1, 15, 10, 0, 0),
                updated_at=datetime(2024, 1, 15, 10, 0, 0)
            ),
            "prod_456": ProductDetail(
                id="prod_456",
                name="GPS Pet Tracker Collar",
                description="Real-time location tracking for your pet",
                detailed_description="Advanced GPS tracker with activity monitoring, safe zone alerts, and long battery life.",
                price=89.99,
                images=["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500"],
                category={"id": "cat_accessories", "name": "Pet Accessories"},
                in_stock=True,
                stock_count=25,
                created_at=datetime(2024, 1, 10, 8, 30, 0),
                updated_at=datetime(2024, 1, 14, 15, 45, 0)
            ),
            "prod_789": ProductDetail(
                id="prod_789",
                name="Elevated Dog Feeder Stand",
                description="Ergonomic raised feeding station for pets",
                price=34.99,
                images=["https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=500"],
                category={"id": "cat_supplies", "name": "Supplies & Equipment"},
                in_stock=False,
                stock_count=0,
                created_at=datetime(2024, 1, 5, 12, 0, 0),
                updated_at=datetime(2024, 1, 15, 9, 0, 0)
            ),
            "prod_101": ProductDetail(
                id="prod_101",
                name="Interactive Squeaky Toy Set",
                description="Durable chew toys with squeakers - 5 pack",
                price=24.99,
                original_price=34.99,
                discount=20,
                images=["https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500"],
                category={"id": "cat_toys", "name": "Toys & Playtime"},
                in_stock=True,
                stock_count=100,
                created_at=datetime(2024, 1, 12, 14, 30, 0),
                updated_at=datetime(2024, 1, 12, 14, 30, 0)
            ),
            "prod_102": ProductDetail(
                id="prod_102",
                name="Reflective Pet Harness",
                description="Adjustable no-pull harness with reflective strips",
                price=29.99,
                images=["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500"],
                category={"id": "cat_apparel", "name": "Pet Apparel"},
                in_stock=True,
                stock_count=75,
                created_at=datetime(2024, 1, 8, 9, 15, 0),
                updated_at=datetime(2024, 1, 8, 9, 15, 0)
            ),
            "prod_103": ProductDetail(
                id="prod_103",
                name="Cat Scratching Post Tower",
                description="Multi-level scratching post with platforms",
                price=69.99,
                images=["https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500"],
                category={"id": "cat_habitats", "name": "Habitats & Bedding"},
                in_stock=True,
                stock_count=150,
                created_at=datetime(2024, 1, 6, 11, 0, 0),
                updated_at=datetime(2024, 1, 6, 11, 0, 0)
            ),
            "prod_104": ProductDetail(
                id="prod_104",
                name="Automatic Pet Water Fountain",
                description="Filtered water fountain with circulating pump",
                price=39.99,
                images=["https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=500"],
                category={"id": "cat_supplies", "name": "Supplies & Equipment"},
                in_stock=True,
                stock_count=200,
                created_at=datetime(2024, 1, 14, 16, 20, 0),
                updated_at=datetime(2024, 1, 14, 16, 20, 0)
            ),
            "prod_105": ProductDetail(
                id="prod_105",
                name="Professional Grooming Kit",
                description="Complete grooming set with clippers and brushes",
                price=79.99,
                original_price=99.99,
                discount=25,
                images=["https://images.unsplash.com/photo-1616398154971-e104e7e45b23?w=500"],
                category={"id": "cat_grooming", "name": "Grooming & Care"},
                in_stock=False,
                stock_count=0,
                created_at=datetime(2024, 1, 3, 10, 45, 0),
                updated_at=datetime(2024, 1, 13, 8, 30, 0)
            ),
            "prod_106": ProductDetail(
                id="prod_106",
                name="Calming Pet Supplement",
                description="Natural anxiety relief treats for dogs and cats",
                price=32.99,
                images=["https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=500"],
                category={"id": "cat_health", "name": "Health & Wellness"},
                in_stock=True,
                stock_count=30,
                created_at=datetime(2024, 1, 1, 12, 0, 0),
                updated_at=datetime(2024, 1, 1, 12, 0, 0)
            ),
            "prod_107": ProductDetail(
                id="prod_107",
                name="Orthopedic Pet Bed - Large",
                description="Memory foam bed for joint support",
                price=89.99,
                images=["https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500"],
                category={"id": "cat_habitats", "name": "Habitats & Bedding"},
                in_stock=True,
                stock_count=45,
                created_at=datetime(2024, 1, 9, 13, 15, 0),
                updated_at=datetime(2024, 1, 9, 13, 15, 0)
            ),
            "prod_108": ProductDetail(
                id="prod_108",
                name="Luxury Cat Bed - Plush Donut",
                description="Ultra-soft round cat bed for maximum comfort",
                detailed_description="Premium plush donut-shaped bed with raised edges for security. Machine washable and perfect for cats who love to curl up.",
                price=44.99,
                original_price=59.99,
                discount=25,
                images=["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"],
                category={"id": "cat_habitats", "name": "Habitats & Bedding"},
                in_stock=True,
                stock_count=60,
                created_at=datetime(2024, 1, 16, 9, 0, 0),
                updated_at=datetime(2024, 1, 16, 9, 0, 0)
            ),
            "prod_109": ProductDetail(
                id="prod_109",
                name="Retractable Dog Leash",
                description="16ft retractable leash with one-button brake",
                price=19.99,
                images=["https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=500"],
                category={"id": "cat_accessories", "name": "Pet Accessories"},
                in_stock=True,
                stock_count=120,
                created_at=datetime(2024, 1, 11, 14, 15, 0),
                updated_at=datetime(2024, 1, 11, 14, 15, 0)
            ),
            "prod_110": ProductDetail(
                id="prod_110",
                name="Catnip Toy Bundle",
                description="Organic catnip-filled toys - 6 piece set",
                price=16.99,
                images=["https://images.unsplash.com/photo-1591871937573-74dbba515c4c?w=500"],
                category={"id": "cat_toys", "name": "Toys & Playtime"},
                in_stock=True,
                stock_count=85,
                created_at=datetime(2024, 1, 13, 10, 30, 0),
                updated_at=datetime(2024, 1, 13, 10, 30, 0)
            ),
            "prod_111": ProductDetail(
                id="prod_111",
                name="Automatic Pet Feeder",
                description="Programmable feeder with portion control",
                detailed_description="Smart automatic feeder with timer, voice recording, and 4-meal capacity. Perfect for busy pet owners.",
                price=79.99,
                original_price=99.99,
                discount=20,
                images=["https://images.unsplash.com/photo-1524511751214-b0a384dd9afe?w=500"],
                category={"id": "cat_supplies", "name": "Supplies & Equipment"},
                in_stock=True,
                stock_count=40,
                created_at=datetime(2024, 1, 7, 11, 45, 0),
                updated_at=datetime(2024, 1, 7, 11, 45, 0)
            ),
            "prod_112": ProductDetail(
                id="prod_112",
                name="Pet Dental Care Kit",
                description="Complete dental hygiene set with toothbrush and paste",
                price=22.99,
                images=["https://images.unsplash.com/photo-1581888227599-779811939961?w=500"],
                category={"id": "cat_health", "name": "Health & Wellness"},
                in_stock=True,
                stock_count=95,
                created_at=datetime(2024, 1, 4, 15, 20, 0),
                updated_at=datetime(2024, 1, 4, 15, 20, 0)
            ),
            "prod_113": ProductDetail(
                id="prod_113",
                name="Outdoor Dog House",
                description="Weather-resistant wooden dog house",
                detailed_description="Durable cedar wood construction with raised floor and slanted roof for rain protection. Perfect for outdoor living.",
                price=189.99,
                images=["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=500"],
                category={"id": "cat_habitats", "name": "Habitats & Bedding"},
                in_stock=False,
                stock_count=0,
                created_at=datetime(2024, 1, 2, 8, 0, 0),
                updated_at=datetime(2024, 1, 15, 16, 30, 0)
            ),
            "prod_114": ProductDetail(
                id="prod_114",
                name="Pet Grooming Glove",
                description="Massage and deshedding glove for pets",
                price=14.99,
                images=["https://images.unsplash.com/photo-1560807707-8cc77767d783?w=500"],
                category={"id": "cat_grooming", "name": "Grooming & Care"},
                in_stock=True,
                stock_count=150,
                created_at=datetime(2024, 1, 14, 13, 10, 0),
                updated_at=datetime(2024, 1, 14, 13, 10, 0)
            ),
            "prod_115": ProductDetail(
                id="prod_115",
                name="Puppy Training Pads - 100 Pack",
                description="Super absorbent training pads with leak-proof backing",
                price=34.99,
                original_price=44.99,
                discount=22,
                images=["https://images.unsplash.com/photo-1587764379873-97837921fd44?w=500"],
                category={"id": "cat_supplies", "name": "Supplies & Equipment"},
                in_stock=True,
                stock_count=70,
                created_at=datetime(2024, 1, 10, 9, 40, 0),
                updated_at=datetime(2024, 1, 10, 9, 40, 0)
            ),
            "prod_116": ProductDetail(
                id="prod_116",
                name="Reflective Dog Vest",
                description="High-visibility safety vest for night walks",
                price=24.99,
                images=["https://images.unsplash.com/photo-1558788353-f76d92427f16?w=500"],
                category={"id": "cat_apparel", "name": "Pet Apparel"},
                in_stock=True,
                stock_count=55,
                created_at=datetime(2024, 1, 12, 16, 50, 0),
                updated_at=datetime(2024, 1, 12, 16, 50, 0)
            ),
            "prod_117": ProductDetail(
                id="prod_117",
                name="Interactive Treat Puzzle",
                description="Mental stimulation toy with treat compartments",
                detailed_description="Challenge your pet's mind with this interactive puzzle feeder. Multiple difficulty levels to keep them engaged.",
                price=29.99,
                images=["https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500"],
                category={"id": "cat_toys", "name": "Toys & Playtime"},
                in_stock=True,
                stock_count=110,
                created_at=datetime(2024, 1, 5, 10, 25, 0),
                updated_at=datetime(2024, 1, 5, 10, 25, 0)
            ),
        }
    
    @classmethod
    async def get_product_by_id(cls, product_id: str) -> Optional[ProductDetail]:
        """
        Get a single product by ID
        
        Args:
            product_id: The unique product identifier
            
        Returns:
            ProductDetail if found, None otherwise
        """
        return cls._products.get(product_id)
    
    @classmethod
    async def get_product_by_id_or_404(cls, product_id: str) -> ProductDetail:
        """
        Get a product by ID or raise 404
        
        Args:
            product_id: The unique product identifier
            
        Returns:
            ProductDetail
            
        Raises:
            HTTPException: 404 if product not found
        """
        product = cls._products.get(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id '{product_id}' not found"
            )
        return product
    
    @classmethod
    async def check_product_availability(cls, product_id: str) -> Optional[ProductAvailability]:
        """
        Check product availability and stock
        
        Args:
            product_id: The unique product identifier
            
        Returns:
            ProductAvailability if product found, None otherwise
        """
        product = cls._products.get(product_id)
        if not product:
            return None
        
        return ProductAvailability(
            in_stock=product.in_stock,
            stock_count=product.stock_count
        )
    
    @classmethod
    async def check_product_availability_or_404(cls, product_id: str) -> ProductAvailability:
        """
        Check product availability or raise 404
        
        Args:
            product_id: The unique product identifier
            
        Returns:
            ProductAvailability
            
        Raises:
            HTTPException: 404 if product not found
        """
        availability = await cls.check_product_availability(product_id)
        if not availability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id '{product_id}' not found"
            )
        return availability
    
    @classmethod
    async def validate_stock(
        cls,
        product_id: str,
        required_quantity: int
    ) -> tuple[bool, int, Optional[str]]:
        """
        Validate if product has sufficient stock
        
        Args:
            product_id: The unique product identifier
            required_quantity: Quantity needed
            
        Returns:
            Tuple of (is_available, current_stock, error_message)
            - is_available: True if sufficient stock
            - current_stock: Current stock count
            - error_message: Error message if not available, None otherwise
        """
        product = cls._products.get(product_id)
        
        if not product:
            return False, 0, f"Product with id '{product_id}' not found"
        
        if not product.in_stock:
            return False, 0, f"Product '{product.name}' is currently out of stock"
        
        if product.stock_count < required_quantity:
            return False, product.stock_count, f"Insufficient stock. Only {product.stock_count} item(s) available"
        
        return True, product.stock_count, None
    
    @classmethod
    def _filter_products(
        cls,
        products: List[ProductDetail],
        filters: ProductFilters
    ) -> List[ProductDetail]:
        """
        Apply filters to product list
        
        Args:
            products: List of products to filter
            filters: Filter criteria
            
        Returns:
            Filtered list of products
        """
        filtered = products

        # Search filter (case-insensitive search in name and description)
        if filters.search:
            search_lower = filters.search.lower()
            filtered = [
                p for p in filtered
                if search_lower in p.name.lower() or search_lower in p.description.lower()
            ]

        # Category filter
        if filters.category_ids:
            filtered = [p for p in filtered if p.category.id in filters.category_ids]

        # Price range filter
        if filters.min_price is not None:
            filtered = [p for p in filtered if p.price >= filters.min_price]
        if filters.max_price is not None:
            filtered = [p for p in filtered if p.price <= filters.max_price]

        # Stock filter
        if filters.in_stock is not None:
            filtered = [p for p in filtered if p.in_stock == filters.in_stock]

        return filtered

    @classmethod
    def _sort_products(
        cls,
        products: List[ProductDetail],
        sort_by: SortBy,
        sort_order: SortOrder
    ) -> List[ProductDetail]:
        """
        Sort products based on specified field and order
        
        Args:
            products: List of products to sort
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)
            
        Returns:
            Sorted list of products
        """
        reverse = (sort_order == SortOrder.DESC)

        if sort_by == SortBy.NAME:
            return sorted(products, key=lambda p: p.name.lower(), reverse=reverse)
        elif sort_by == SortBy.PRICE:
            return sorted(products, key=lambda p: p.price, reverse=reverse)
        elif sort_by == SortBy.CREATED:
            return sorted(products, key=lambda p: p.created_at, reverse=reverse)

        return products

    @classmethod
    def _paginate_products(
        cls,
        products: List[ProductDetail],
        page: int,
        limit: int
    ) -> tuple[List[ProductDetail], Pagination]:
        """
        Paginate product list
        
        Args:
            products: List of products to paginate
            page: Current page number (1-indexed)
            limit: Items per page
            
        Returns:
            Tuple of (paginated products, pagination metadata)
        """
        total = len(products)
        total_pages = (total + limit - 1) // limit  # Ceiling division
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated = products[start_idx:end_idx]
        
        pagination = Pagination(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
        return paginated, pagination

    @classmethod
    def _get_available_filters(cls, products: List[ProductDetail]) -> AvailableFilters:
        """
        Calculate available filter options from product set
        
        Args:
            products: All available products
            
        Returns:
            Available filter options
        """
        # Count products per category
        category_counts: Dict[str, CategoryCount] = {}
        for product in products:
            cat_id = product.category.id
            if cat_id not in category_counts:
                category_counts[cat_id] = CategoryCount(
                    id=cat_id,
                    name=product.category.name,
                    count=0
                )
            category_counts[cat_id].count += 1

        # Calculate price range
        prices = [p.price for p in products]
        price_range = PriceRange(
            min=min(prices) if prices else 0,
            max=max(prices) if prices else 0
        )

        return AvailableFilters(
            categories=sorted(category_counts.values(), key=lambda c: c.name),
            price_range=price_range
        )
    
    @classmethod
    async def list_products(cls, filters: ProductFilters) -> ProductsResponse:
        """
        List products with filtering, sorting, and pagination
        
        Args:
            filters: ProductFilters containing all filter/sort/pagination params
            
        Returns:
            ProductsResponse with products and metadata
        """
        # Get all products
        all_products = list(cls._products.values())

        # Apply filters
        filtered_products = cls._filter_products(all_products, filters)

        # Sort products
        sorted_products = cls._sort_products(
            filtered_products,
            filters.sort_by,
            filters.sort_order
        )

        # Paginate results
        paginated_products, pagination = cls._paginate_products(
            sorted_products,
            filters.page,
            filters.limit
        )

        # Get available filters (based on ALL products, not filtered)
        available_filters = cls._get_available_filters(all_products)

        # Build response
        response = ProductsResponse(
            products=paginated_products,
            pagination=pagination,
            filters=ProductsFilters(
                applied_filters=filters,
                available_filters=available_filters
            )
        )

        return response
    
    @classmethod
    async def create_product(cls, product_input: CreateProductInput) -> ProductCreatedResponse:
        """
        Create a new product
        
        Args:
            product_input: Product creation data
            
        Returns:
            ProductCreatedResponse with created product
            
        Raises:
            HTTPException: 400 if category doesn't exist
        """
        # Validate category exists using CategoryService
        category = await CategoryService.get_category_by_id(product_input.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with id '{product_input.category_id}' not found"
            )
        
        # Generate new product ID
        product_id = f"prod_{uuid4().hex[:8]}"
        
        # Create product
        now = datetime.utcnow()
        new_product = ProductDetail(
            id=product_id,
            name=product_input.name,
            description=product_input.description,
            detailed_description=product_input.detailed_description,
            price=product_input.price,
            original_price=product_input.original_price,
            discount=product_input.discount,
            images=product_input.images,
            category=category,
            in_stock=product_input.in_stock,
            stock_count=product_input.stock_count,
            created_at=now,
            updated_at=now
        )
        
        # Store in database
        cls._products[product_id] = new_product
        
        return ProductCreatedResponse(
            id=product_id,
            message="Product created successfully",
            product=new_product
        )
    
    @classmethod
    async def update_product(
        cls,
        product_id: str,
        product_input: CreateProductInput
    ) -> ProductUpdatedResponse:
        """
        Update an existing product
        
        Args:
            product_id: ID of product to update
            product_input: Updated product data
            
        Returns:
            ProductUpdatedResponse with updated product
            
        Raises:
            HTTPException: 404 if product not found, 400 if invalid category
        """
        # Check if product exists
        existing_product = cls._products.get(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id '{product_id}' not found"
            )
        
        # Validate category exists using CategoryService
        category = await CategoryService.get_category_by_id(product_input.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with id '{product_input.category_id}' not found"
            )
        
        # Update product
        updated_product = ProductDetail(
            id=product_id,
            name=product_input.name,
            description=product_input.description,
            detailed_description=product_input.detailed_description,
            price=product_input.price,
            original_price=product_input.original_price,
            discount=product_input.discount,
            images=product_input.images,
            category=category,
            in_stock=product_input.in_stock,
            stock_count=product_input.stock_count,
            created_at=existing_product.created_at,
            updated_at=datetime.utcnow()
        )
        
        # Store in database
        cls._products[product_id] = updated_product
        
        return ProductUpdatedResponse(
            message="Product updated successfully",
            product=updated_product
        )

    @classmethod
    async def delete_product(cls, product_id: str) -> ProductDeletedResponse:
        """
        Delete a product
        
        Args:
            product_id: ID of product to delete
            
        Returns:
            ProductDeletedResponse
            
        Raises:
            HTTPException: 404 if product not found
        """
        # Check if product exists
        if product_id not in cls._products:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id '{product_id}' not found"
            )
        
        # Delete from database
        del cls._products[product_id]
        
        return ProductDeletedResponse(
            message="Product deleted successfully",
            deleted_id=product_id
        )
    
    @classmethod
    async def bulk_check_availability(
        cls,
        product_quantities: Dict[str, int]
    ) -> Dict[str, tuple[bool, int, Optional[str]]]:
        """
        Check availability for multiple products at once
        
        Args:
            product_quantities: Dict of {product_id: required_quantity}
            
        Returns:
            Dict of {product_id: (is_available, current_stock, error_message)}
        """
        results = {}
        for product_id, quantity in product_quantities.items():
            results[product_id] = await cls.validate_stock(product_id, quantity)
        return results
    
    @classmethod
    async def get_products_by_ids(cls, product_ids: List[str]) -> List[ProductDetail]:
        """
        Get multiple products by their IDs
        
        Args:
            product_ids: List of product IDs
            
        Returns:
            List of ProductDetail objects (excludes not found products)
        """
        products = []
        for product_id in product_ids:
            product = cls._products.get(product_id)
            if product:
                products.append(product)
        return products
