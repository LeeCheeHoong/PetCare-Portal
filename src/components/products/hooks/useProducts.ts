import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { ProductDetail } from "./useSingleProduct";

// Types
export interface ProductsResponse {
	products: ProductDetail[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
	filters: {
		appliedFilters: ProductFilters;
		availableFilters: {
			categories: { id: string; name: string; count: number }[];
			priceRange: { min: number; max: number };
		};
	};
}

export interface ProductFilters {
	search?: string;
	categoryIds?: string[];
	minPrice?: number;
	maxPrice?: number;
	inStock?: boolean;
	sortBy?: "name" | "price" | "created";
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
}

// API function
const fetchProducts = async (
	filters: ProductFilters = {},
): Promise<ProductsResponse> => {
	const params = new URLSearchParams();

	// Add filters to query params
	if (filters.search) params.append("search", filters.search);
	if (filters.categoryIds?.length) {
		filters.categoryIds.forEach((id) => {
			params.append("categoryIds", id);
		});
	}
	if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
	if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
	if (filters.inStock !== undefined)
		params.append("inStock", filters.inStock.toString());
	if (filters.sortBy) params.append("sortBy", filters.sortBy);
	if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

	// Pagination
	params.append("page", (filters.page || 1).toString());
	params.append("limit", (filters.limit || 12).toString());

	const response = await fetch(`/api/products?${params.toString()}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch products: ${response.statusText}`);
	}

	return new Promise((resolve) => {
		resolve({
			products: [
				{
					id: "pf001",
					name: "Premium Dog Food",
					description:
						"Nutritious dry dog food with real chicken and vegetables for a balanced diet.",
					price: 45.99,
					originalPrice: 55.99,
					discount: 10,
					images: [
						"https://images-na.ssl-images-amazon.com/images/I/81P2kN9x-BL._AC_SL1500_.jpg",
					],
					category: {
						id: "cat001",
						name: "Pet Food",
					},
					inStock: true,
					stockCount: 50,
					createdAt: "2024-06-01T10:00:00.000Z",
					updatedAt: "2024-10-01T09:30:00.000Z",
				},
				{
					id: "pf002",
					name: "Organic Catnip Toy",
					description:
						"Natural catnip-filled toy to keep your cat entertained and happy.",
					price: 9.99,
					originalPrice: 12.99,
					discount: 3,
					images: [
						"https://www.multipet.com/media/CatnipGarden_Natural_.5-ounce-website.png",
					],
					category: {
						id: "cat002",
						name: "Pet Toys",
					},
					inStock: true,
					stockCount: 100,
					createdAt: "2024-07-15T08:00:00.000Z",
					updatedAt: "2024-10-01T09:30:00.000Z",
				},
			],
			filters: {
				appliedFilters: {},
				availableFilters: {
					categories: [
						{
							id: "string1",
							name: "string",
							count: 123,
						},
						{
							id: "string2",
							name: "string",
							count: 123,
						},
						{
							id: "string3",
							name: "string",
							count: 123,
						},
					],
					priceRange: {
						min: 0,
						max: 0,
					},
				},
			},
			pagination: {
				page: 1,
				limit: 12,
				total: 400,
				totalPages: 10,
				hasNext: true,
				hasPrev: true,
			},
		});
	});
};

// Main hook
export const useProducts = (
	filters: ProductFilters = {},
	options?: Omit<UseQueryOptions<ProductsResponse>, "queryKey" | "queryFn">,
) => {
	return useQuery({
		queryKey: ["products", filters],
		queryFn: () => fetchProducts(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false,
		retry: 2,
		...options,
	});
};

// Convenience hooks for specific use cases
export const useProductSearch = (
	searchTerm: string,
	additionalFilters: Omit<ProductFilters, "search"> = {},
) => {
	return useProducts(
		{
			search: searchTerm,
			...additionalFilters,
		},
		{
			enabled: searchTerm.length >= 2, // Only search with 2+ characters
			staleTime: 30 * 1000, // 30 seconds for search (more frequent updates)
		},
	);
};

export const useProductsByCategory = (
	categoryId: string,
	additionalFilters: Omit<ProductFilters, "categoryIds"> = {},
) => {
	return useProducts({
		categoryIds: [categoryId],
		...additionalFilters,
	});
};

export const useFeaturedProducts = (limit: number = 8) => {
	return useProducts(
		{
			sortBy: "created",
			sortOrder: "desc",
			limit,
		},
		{
			staleTime: 15 * 60 * 1000, // 15 minutes for featured products
		},
	);
};
