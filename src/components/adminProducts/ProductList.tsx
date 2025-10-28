import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ProductFilters } from "../products/hooks/useProducts";
import type { ProductDetail } from "../products/hooks/useSingleProduct";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { useAdminProducts } from "./hooks/useProducts";

interface ProductListProps {
	onEdit: (product: ProductDetail) => void;
	onCreateNew: () => void;
}

export function ProductList({ onEdit, onCreateNew }: ProductListProps) {
	const [filters, setFilters] = useState<ProductFilters>({
		page: 1,
		limit: 10,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState<ProductDetail | null>(
		null,
	);

	const {
		data,
		products,
		pagination,
		isLoading,
		error,
		deleteProduct,
		isDeletingProduct,
	} = useAdminProducts(filters);

	// Update filters helper
	const updateFilters = (newFilters: Partial<ProductFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
	};

	// Search handler
	const handleSearchChange = (value: string) => {
		updateFilters({ search: value || undefined });
	};

	// Sort handler
	const handleSortChange = (value: string) => {
		const [sortBy, sortOrder] = value.split("-") as [string, "asc" | "desc"];
		updateFilters({ sortBy: sortBy as any, sortOrder });
	};

	// Price filter handler
	const handlePriceFilter = (minPrice?: number, maxPrice?: number) => {
		updateFilters({ minPrice, maxPrice });
	};

	// Category filter handler
	const handleCategoryFilter = (categoryIds: string[]) => {
		updateFilters({
			categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
		});
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({
			page: 1,
			limit: 10,
		});
	};

	// Check if there are active filters
	const hasActiveFilters = useMemo(() => {
		return !!(
			filters.search ||
			filters.categoryIds?.length ||
			filters.minPrice ||
			filters.maxPrice ||
			filters.inStock
		);
	}, [filters]);

	// Count active filters
	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.search) count++;
		if (filters.categoryIds?.length) count++;
		if (filters.minPrice || filters.maxPrice) count++;
		if (filters.inStock) count++;
		return count;
	};

	// Pagination handlers
	const handleNextPage = () => {
		if (pagination && filters.page! < pagination.totalPages) {
			setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
		}
	};

	const handlePreviousPage = () => {
		if (filters.page! > 1) {
			setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }));
		}
	};

	const handleDeleteClick = (product: ProductDetail) => {
		setProductToDelete(product);
		setDeleteDialogOpen(true);
	};

	// Confirm delete
	const handleConfirmDelete = () => {
		if (productToDelete) {
			deleteProduct(productToDelete.id);
			setDeleteDialogOpen(false);
			setProductToDelete(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p className="text-muted-foreground">Loading products...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-64">
				<p className="text-destructive">Error loading products</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with Add Product Button */}
			<div className="flex justify-end">
				<Button onClick={onCreateNew}>
					<Plus className="mr-2 h-4 w-4" />
					Add Product
				</Button>
			</div>

			{/* Filter Ribbon Bar */}
			<div className="bg-background border rounded-lg p-4 space-y-4">
				{/* Top Row - Search and Filters */}
				<div className="flex flex-wrap gap-4 items-center">
					{/* Search */}
					<Input
						placeholder="Search products..."
						value={filters.search || ""}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="max-w-xs"
					/>

					{/* Sort */}
					<Select
						value={`${filters.sortBy || "created"}-${filters.sortOrder || "desc"}`}
						onValueChange={handleSortChange}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="name-asc">Name: A to Z</SelectItem>
							<SelectItem value="name-desc">Name: Z to A</SelectItem>
							<SelectItem value="price-asc">Price: Low to High</SelectItem>
							<SelectItem value="price-desc">Price: High to Low</SelectItem>
							<SelectItem value="created-desc">Newest First</SelectItem>
						</SelectContent>
					</Select>

					{/* Price Range Filter */}
					<div className="flex gap-2 items-center">
						<Input
							type="number"
							placeholder="Min price"
							value={filters.minPrice || ""}
							onChange={(e) =>
								handlePriceFilter(
									Number(e.target.value) || undefined,
									filters.maxPrice,
								)
							}
							className="w-24"
						/>
						<span className="text-muted-foreground">-</span>
						<Input
							type="number"
							placeholder="Max price"
							value={filters.maxPrice || ""}
							onChange={(e) =>
								handlePriceFilter(
									filters.minPrice,
									Number(e.target.value) || undefined,
								)
							}
							className="w-24"
						/>
					</div>

					{/* Category Filter */}
					<Select
						value={filters.categoryIds?.[0] || "all"}
						onValueChange={(value) =>
							handleCategoryFilter(value === "all" ? [] : [value])
						}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{data?.filters?.availableFilters?.categories?.map(
								(category: { id: string; name: string; count: number }) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name} ({category.count})
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>

					{/* In Stock Filter */}
					<Button
						variant={filters.inStock ? "default" : "outline"}
						size="sm"
						onClick={() =>
							updateFilters({ inStock: filters.inStock ? undefined : true })
						}
					>
						In Stock Only
					</Button>

					{/* Clear Filters */}
					{hasActiveFilters && (
						<Button variant="ghost" size="sm" onClick={clearFilters}>
							<X className="h-4 w-4 mr-1" />
							Clear Filters ({getActiveFiltersCount()})
						</Button>
					)}
				</div>

				{/* Active Filter Badges */}
				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2 pt-2 border-t">
						{filters.search && (
							<Badge variant="secondary" className="gap-1">
								Search: "{filters.search}"
								<X
									className="h-3 w-3 cursor-pointer"
									onClick={() => handleSearchChange("")}
								/>
							</Badge>
						)}
						{filters.categoryIds?.map((categoryId) => {
							const category =
								data?.filters?.availableFilters?.categories?.find(
									(c) => c.id === categoryId,
								);
							return category ? (
								<Badge key={categoryId} variant="secondary" className="gap-1">
									{category.name}
									<X
										className="h-3 w-3 cursor-pointer"
										onClick={() => handleCategoryFilter([])}
									/>
								</Badge>
							) : null;
						})}
						{(filters.minPrice || filters.maxPrice) && (
							<Badge variant="secondary" className="gap-1">
								Price: ${filters.minPrice || 0} - ${filters.maxPrice || "∞"}
								<X
									className="h-3 w-3 cursor-pointer"
									onClick={() => handlePriceFilter(undefined, undefined)}
								/>
							</Badge>
						)}
						{filters.inStock && (
							<Badge variant="secondary" className="gap-1">
								In Stock Only
								<X
									className="h-3 w-3 cursor-pointer"
									onClick={() => updateFilters({ inStock: undefined })}
								/>
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Products Table */}
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Stock</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-muted-foreground"
								>
									No products found. Try adjusting your filters.
								</TableCell>
							</TableRow>
						) : (
							products?.map((product) => (
								<TableRow key={product.id}>
									{/* Product Name with Image */}
									<TableCell>
										<div className="flex items-center gap-3">
											{product.images[0] && (
												<img
													src={product.images[0]}
													alt={product.name}
													className="w-10 h-10 rounded object-cover"
												/>
											)}
											<div>
												<p className="font-medium">{product.name}</p>
												{product.discount && (
													<span className="text-xs text-muted-foreground">
														{product.discount}% OFF
													</span>
												)}
											</div>
										</div>
									</TableCell>

									{/* Category */}
									<TableCell>{product.category.name}</TableCell>

									{/* Price */}
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">
												${product.price.toFixed(2)}
											</span>
											{product.originalPrice &&
												product.originalPrice > product.price && (
													<span className="text-xs text-muted-foreground line-through">
														${product.originalPrice.toFixed(2)}
													</span>
												)}
										</div>
									</TableCell>

									{/* Stock Count */}
									<TableCell>
										<span
											className={`${
												product.stockCount < 10
													? "text-destructive font-medium"
													: "text-muted-foreground"
											}`}
										>
											{product.stockCount}
										</span>
									</TableCell>

									{/* In Stock Status */}
									<TableCell>
										{product.inStock ? (
											<Badge variant="default" className="bg-green-500">
												In Stock
											</Badge>
										) : (
											<Badge variant="destructive">Out of Stock</Badge>
										)}
									</TableCell>

									{/* Actions */}
									<TableCell className="text-right space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(product)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteClick(product)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
						{Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
						{pagination.total} products
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={pagination.page === 1}
						>
							Previous
						</Button>
						<Button variant="outline" size="sm" disabled>
							Page {pagination.page} of {pagination.totalPages}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={pagination.page === pagination.totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			)}

			<DeleteProductDialog
				product={productToDelete}
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleConfirmDelete}
				isDeleting={isDeletingProduct}
			/>
		</div>
	);
}
