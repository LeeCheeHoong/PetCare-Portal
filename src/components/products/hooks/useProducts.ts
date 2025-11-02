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

	return response.json();

	// return new Promise((resolve) => {
	// 	resolve({
	// 		products: [
	// 			{
	// 				id: "pf001",
	// 				name: "Premium Dog Food",
	// 				description:
	// 					"Nutritious dry dog food with real chicken and vegetables for a balanced diet.",
	// 				price: 45.99,
	// 				originalPrice: 55.99,
	// 				discount: 10,
	// 				images: [
	// 					"https://images-na.ssl-images-amazon.com/images/I/81P2kN9x-BL._AC_SL1500_.jpg",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 50,
	// 				createdAt: "2024-06-01T10:00:00.000Z",
	// 				updatedAt: "2024-10-01T09:30:00.000Z",
	// 			},
	// 			{
	// 				id: "pf002",
	// 				name: "Organic Catnip Toy",
	// 				description:
	// 					"Natural catnip-filled toy to keep your cat entertained and happy.",
	// 				price: 9.99,
	// 				originalPrice: 12.99,
	// 				discount: 3,
	// 				images: [
	// 					"https://www.multipet.com/media/CatnipGarden_Natural_.5-ounce-website.png",
	// 				],
	// 				category: {
	// 					id: "cat002",
	// 					name: "Pet Toys",
	// 				},
	// 				inStock: true,
	// 				stockCount: 100,
	// 				createdAt: "2024-07-15T08:00:00.000Z",
	// 				updatedAt: "2024-10-01T09:30:00.000Z",
	// 			},
	// 			{
	// 				id: "pf003",
	// 				name: "Puppy Starter Formula",
	// 				description:
	// 					"Specially formulated dry food for puppies with added DHA to support brain development.",
	// 				price: 29.99,
	// 				originalPrice: 36.49,
	// 				discount: 18,
	// 				images: [
	// 					"https://supertails.com/cdn/shop/files/Frame_344685624_600x.png?v=1730097551",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 60,
	// 				createdAt: "2024-06-05T09:50:00.000Z",
	// 				updatedAt: "2024-10-04T12:45:00.000Z",
	// 			},
	// 			{
	// 				id: "pf004",
	// 				name: "Senior Dog Wellness Mix",
	// 				description:
	// 					"Dry dog food tailored for senior dogs with added joint and digestive support.",
	// 				price: 48.99,
	// 				originalPrice: 59.99,
	// 				discount: 18,
	// 				images: [
	// 					"https://m.media-amazon.com/images/I/812fN+wyqdL._AC_UF1000,1000_QL80_.jpg",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: false,
	// 				stockCount: 0,
	// 				createdAt: "2024-06-10T08:40:00.000Z",
	// 				updatedAt: "2024-10-07T10:00:00.000Z",
	// 			},
	// 			{
	// 				id: "pf005",
	// 				name: "Gourmet Wet Cat Meal",
	// 				description:
	// 					"Canned stew-style cat food with tender chicken chunks in gravy.",
	// 				price: 2.49,
	// 				originalPrice: 3.29,
	// 				discount: 24,
	// 				images: ["https://m.media-amazon.com/images/I/617r9k3q3xL.jpg"],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 200,
	// 				createdAt: "2024-06-12T13:25:00.000Z",
	// 				updatedAt: "2024-10-09T16:20:00.000Z",
	// 			},
	// 			{
	// 				id: "pf006",
	// 				name: "Small Breed Dog Kibble",
	// 				description:
	// 					"Dry kibble designed for small breed dogs with smaller bite-size pieces.",
	// 				price: 34.99,
	// 				originalPrice: 42.0,
	// 				discount: 17,
	// 				images: [
	// 					"https://cdn11.bigcommerce.com/s-8brse8hrm/images/stencil/1280x1280/products/55261/166636/2679285-1__35093.1712613875.jpg?c=1",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 45,
	// 				createdAt: "2024-06-15T15:10:00.000Z",
	// 				updatedAt: "2024-10-10T09:50:00.000Z",
	// 			},
	// 			{
	// 				id: "pf007",
	// 				name: "Freeze-Dried Beef Treats",
	// 				description:
	// 					"Premium freeze-dried beef treats for training or rewards.",
	// 				price: 12.99,
	// 				originalPrice: 16.49,
	// 				discount: 21,
	// 				images: [
	// 					"https://www.maxandneo.com/cdn/shop/products/beefliverfrontbag1a.jpg?v=1603309850",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 120,
	// 				createdAt: "2024-06-17T10:40:00.000Z",
	// 				updatedAt: "2024-10-12T13:05:00.000Z",
	// 			},
	// 			{
	// 				id: "pf008",
	// 				name: "Grain-Free Dog Formula",
	// 				description:
	// 					"Complete grain-free dog food with sweet potato and turkey.",
	// 				price: 52.49,
	// 				originalPrice: 65.99,
	// 				discount: 20,
	// 				images: [
	// 					"https://naturesprotection.eu/vendor/laravel-files/files/import/Eshop/__thumbnails__/vc_1_NPSC47592680_680resizebg.jpg",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: false,
	// 				stockCount: 0,
	// 				createdAt: "2024-06-19T08:55:00.000Z",
	// 				updatedAt: "2024-10-14T11:25:00.000Z",
	// 			},
	// 			{
	// 				id: "pf009",
	// 				name: "High-Energy Dog Supplement",
	// 				description:
	// 					"Protein-rich supplement powder for active and working dogs.",
	// 				price: 22.99,
	// 				originalPrice: 29.5,
	// 				discount: 22,
	// 				images: [
	// 					"https://www.vetnpetdirect.com.au/cdn/shop/products/Troy-Nutripet-200g-web_2048x.jpg?v=1597115383",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 28,
	// 				createdAt: "2024-06-21T07:15:00.000Z",
	// 				updatedAt: "2024-10-16T14:35:00.000Z",
	// 			},
	// 			{
	// 				id: "pf010",
	// 				name: "Dental Chew Sticks",
	// 				description:
	// 					"Chew treats that help reduce plaque and tartar for dogs.",
	// 				price: 8.99,
	// 				originalPrice: 11.49,
	// 				discount: 22,
	// 				images: [
	// 					"https://vitapet.com/media/opvp3aq1/vp217-vitapet-chewz-original-dental-bones-20pk-100g-front-1600x1480.png",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 175,
	// 				createdAt: "2024-06-22T16:40:00.000Z",
	// 				updatedAt: "2024-10-17T08:10:00.000Z",
	// 			},
	// 			{
	// 				id: "pf011",
	// 				name: "Wet Dog Stew Pouches",
	// 				description:
	// 					"Convenient single-serving wet dog food pouches made with real beef.",
	// 				price: 1.99,
	// 				originalPrice: 2.59,
	// 				discount: 23,
	// 				images: [
	// 					"https://strongheartpetfood.com/cdn/shop/collections/Pouch_Collection_2.jpg?v=1706652367&width=1080",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 300,
	// 				createdAt: "2024-06-25T09:30:00.000Z",
	// 				updatedAt: "2024-10-19T11:15:00.000Z",
	// 			},
	// 			{
	// 				id: "pf012",
	// 				name: "Feline Hairball Control Formula",
	// 				description:
	// 					"Dry food that helps reduce hairball formation for indoor cats.",
	// 				price: 27.99,
	// 				originalPrice: 34.99,
	// 				discount: 20,
	// 				images: [
	// 					"https://www.hartz.com/wp-content/uploads/2016/12/3270095009_hartz_hairball_remedy_plus_front_1300x1300.png",
	// 				],
	// 				category: {
	// 					id: "cat001",
	// 					name: "Pet Food",
	// 				},
	// 				inStock: true,
	// 				stockCount: 58,
	// 				createdAt: "2024-06-27T12:45:00.000Z",
	// 				updatedAt: "2024-10-21T15:55:00.000Z",
	// 			},
	// 		],
	// 		filters: {
	// 			appliedFilters: {},
	// 			availableFilters: {
	// 				categories: [
	// 					{
	// 						id: "string1",
	// 						name: "string",
	// 						count: 123,
	// 					},
	// 					{
	// 						id: "string2",
	// 						name: "string",
	// 						count: 123,
	// 					},
	// 					{
	// 						id: "string3",
	// 						name: "string",
	// 						count: 123,
	// 					},
	// 				],
	// 				priceRange: {
	// 					min: 0,
	// 					max: 0,
	// 				},
	// 			},
	// 		},
	// 		pagination: {
	// 			page: 1,
	// 			limit: 12,
	// 			total: 400,
	// 			totalPages: 10,
	// 			hasNext: true,
	// 			hasPrev: true,
	// 		},
	// 	});
	// });
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
