import { useNavigate } from "@tanstack/react-router";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import {
	type ProductFilters,
	useProducts,
} from "@/components/products/hooks/useProducts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";

export const ProductListPage = () => {
	const navigate = useNavigate();
	const [filters, setFilters] = useState<ProductFilters>({
		page: 1,
		limit: 12,
		sortBy: "name",
		sortOrder: "asc",
	});

	const { data, isLoading, error, isFetching } = useProducts(filters);

	// Filter handlers
	const updateFilters = (newFilters: Partial<ProductFilters>) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
			page: 1, // Reset to first page when filters change
		}));
	};

	const handleSearchChange = (search: string) => {
		updateFilters({ search: search || undefined });
	};

	const handleCategoryFilter = (categoryIds: string[]) => {
		updateFilters({
			categoryIds: categoryIds.length ? categoryIds : undefined,
		});
	};

	const handlePriceFilter = (minPrice?: number, maxPrice?: number) => {
		updateFilters({
			minPrice: minPrice || undefined,
			maxPrice: maxPrice || undefined,
		});
	};

	const handleSortChange = (value: string) => {
		const [sortBy, sortOrder] = value.split("-") as [string, "asc" | "desc"];
		updateFilters({ sortBy: sortBy as any, sortOrder });
	};

	const clearFilters = () => {
		setFilters({
			page: 1,
			limit: 12,
			sortBy: "name",
			sortOrder: "asc",
		});
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.search) count++;
		if (filters.categoryIds?.length) count++;
		if (filters.minPrice || filters.maxPrice) count++;
		if (filters.inStock !== undefined) count++;
		return count;
	};

	const hasActiveFilters = getActiveFiltersCount() > 0;

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert variant="destructive">
					<AlertDescription>
						Failed to load products. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Page Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">Products</h1>
				<p className="text-muted-foreground mt-2">
					Discover our collection of quality products
				</p>
			</div>

			{/* Filter Ribbon Bar */}
			<div className="bg-background border rounded-lg p-4 mb-6 space-y-4">
				{/* Top Row - Search and Sort */}
				<div className="flex flex-wrap gap-4 items-center">
					{/* Sort */}
					<Select
						value={`${filters.sortBy}-${filters.sortOrder}`}
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
						value={filters.categoryIds?.[0] || ""}
						onValueChange={(value) =>
							handleCategoryFilter(value ? [value] : [])
						}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{data?.filters.availableFilters.categories.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name} ({category.count})
								</SelectItem>
							))}
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
					<div className="flex flex-wrap gap-2 pt-2">
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
							const category = data?.filters.availableFilters.categories.find(
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
					</div>
				)}
			</div>

			{/* Results Info */}
			<div className="flex justify-between items-center mb-6">
				<div className="text-sm text-muted-foreground">
					{isLoading ? (
						<Skeleton className="h-4 w-32" />
					) : (
						`Showing ${data?.products.length || 0} of ${data?.pagination.total || 0} products`
					)}
				</div>
				{isFetching && !isLoading && (
					<div className="text-sm text-muted-foreground animate-pulse">
						Updating...
					</div>
				)}
			</div>

			{/* Product Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i} className="space-y-3">
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					))}
				</div>
			) : data?.products.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-muted-foreground mb-4">
						<Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<h3 className="text-lg font-medium">No products found</h3>
						<p>Try adjusting your filters or search terms</p>
					</div>
					{hasActiveFilters && (
						<Button onClick={clearFilters} variant="outline">
							Clear all filters
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{data?.products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onViewDetails={() =>
								navigate({
									to: `/products/$productId`,
									params: { productId: product.id },
								})
							}
						/>
					))}
				</div>
			)}

			{/* Pagination */}
			{data && data.pagination.totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 mt-8">
					<Button
						variant="outline"
						disabled={!data.pagination.hasPrev}
						onClick={() => updateFilters({ page: filters.page! - 1 })}
					>
						Previous
					</Button>

					<div className="flex items-center gap-1">
						{Array.from(
							{ length: Math.min(5, data.pagination.totalPages) },
							(_, i) => {
								const pageNum = i + 1;
								return (
									<Button
										key={pageNum}
										variant={pageNum === filters.page ? "default" : "outline"}
										size="sm"
										onClick={() => updateFilters({ page: pageNum })}
									>
										{pageNum}
									</Button>
								);
							},
						)}
						{data.pagination.totalPages > 5 && (
							<>
								<span className="px-2">...</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										updateFilters({ page: data.pagination.totalPages })
									}
								>
									{data.pagination.totalPages}
								</Button>
							</>
						)}
					</div>

					<Button
						variant="outline"
						disabled={!data.pagination.hasNext}
						onClick={() => updateFilters({ page: filters.page! + 1 })}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
};
