import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

// Extended Product interface for detailed view
export interface ProductDetail {
	id: string;
	name: string;
	description: string;
	detailedDescription?: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	images: string[];
	category: {
		id: string;
		name: string;
	};
	inStock: boolean;
	stockCount: number;
	createdAt: string;
	updatedAt: string;
}

// API function for single product
const fetchProduct = async (productId: string): Promise<ProductDetail> => {
	// const response = await fetch(`/api/products/${productId}`)

	// if (!response.ok) {
	//   if (response.status === 404) {
	//     throw new Error('Product not found')
	//   }
	//   throw new Error(`Failed to fetch product: ${response.statusText}`)
	// }

	return new Promise((resolve) => {
		resolve({
			id: "pf002",
			name: "Organic Catnip Toy",
			description:
				"Natural catnip-filled toy to keep your cat entertained and happy.",
			detailedDescription:
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
		});
	});
};

// Main hook for single product
export const useProduct = (
	productId: string,
	options?: Omit<UseQueryOptions<ProductDetail>, "queryKey" | "queryFn">,
) => {
	return useQuery({
		queryKey: ["product", productId],
		queryFn: () => fetchProduct(productId),
		enabled: !!productId, // Only run if productId exists
		staleTime: 10 * 60 * 1000, // 10 minutes - product details don't change often
		gcTime: 15 * 60 * 1000, // 15 minutes cache time
		retry: (failureCount, error) => {
			// Don't retry if product not found
			if (error.message === "Product not found") {
				return false;
			}
			return failureCount < 2;
		},
		...options,
	});
};

// Related products hook
interface RelatedProductsParams {
	categoryId: string;
	excludeProductId: string;
	limit?: number;
}

const fetchRelatedProducts = async ({
	categoryId,
	excludeProductId,
	limit = 4,
}: RelatedProductsParams) => {
	const params = new URLSearchParams({
		categoryIds: categoryId,
		limit: limit.toString(),
		exclude: excludeProductId,
	});

	// const response = await fetch(`/api/products?${params.toString()}`)

	// if (!response.ok) {
	//   throw new Error(`Failed to fetch related products: ${response.statusText}`)
	// }

	// const data = await response.json()
	return new Promise((resolve) => {
		resolve([
			{
				id: "pf001",
				name: "Premium Dog Food",
				description:
					"Nutritious dry dog food with real chicken and vegetables for a balanced diet.",
				detailedDescription:
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
		]);
	});
};

export const useRelatedProducts = (
	categoryId: string,
	excludeProductId: string,
	limit: number = 4,
) => {
	return useQuery({
		queryKey: ["relatedProducts", categoryId, excludeProductId, limit],
		queryFn: () =>
			fetchRelatedProducts({ categoryId, excludeProductId, limit }),
		enabled: !!categoryId && !!excludeProductId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
	});
};

// Hook for checking product availability (useful for real-time stock updates)
const checkProductAvailability = async (productId: string) => {
	const response = await fetch(`/api/products/${productId}/availability`);

	if (!response.ok) {
		throw new Error("Failed to check availability");
	}

	return response.json() as Promise<{ inStock: boolean; stockCount: number }>;
};

export const useProductAvailability = (
	productId: string,
	options?: Omit<
		UseQueryOptions<{ inStock: boolean; stockCount: number }>,
		"queryKey" | "queryFn"
	>,
) => {
	return useQuery({
		queryKey: ["productAvailability", productId],
		queryFn: () => checkProductAvailability(productId),
		enabled: !!productId,
		staleTime: 30 * 1000, // 30 seconds - stock changes frequently
		refetchInterval: 60 * 1000, // Refetch every minute
		refetchIntervalInBackground: true,
		...options,
	});
};

// Convenience hook for product page that fetches both product and related products
export const useProductPageData = (productId: string) => {
	const productQuery = useProduct(productId);

	const relatedProductsQuery = useRelatedProducts(
		productQuery.data?.category.id || "",
		productId,
		4,
	);

	return {
		product: productQuery,
		relatedProducts: relatedProductsQuery,
		isLoading: productQuery.isLoading,
		error: productQuery.error || relatedProductsQuery.error,
	};
};
