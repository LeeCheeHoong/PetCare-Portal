import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProduct } from "@/components/products/hooks/useSingleProduct";

export interface CreateProductInput {
	name: string;
	description: string;
	detailedDescription?: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	images: string[];
	categoryId: string;
	inStock: boolean;
	stockCount: number;
}

export interface Category {
	id: string;
	name: string;
}

export function useProductForm(productId?: string) {
	const queryClient = useQueryClient();

	// Fetch categories for dropdown
	const { data: categories, isLoading: isLoadingCategories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			// const response = await fetch("/api/categories");
			// if (!response.ok) throw new Error("Failed to fetch categories");
			// return response.json() as Promise<Category[]>;

			return new Promise<Category[]>((resolve) =>
				resolve([
					{
						id: "a",
						name: "a",
					},
				]),
			);
		},
	});

	const { data: product, isLoading: isLoadingProduct } = useProduct(productId!);

	// Create product mutation
	const createProduct = useMutation({
		mutationFn: async (data: CreateProductInput) => {
			// const response = await fetch("/api/products", {
			// 	method: "POST",
			// 	headers: {
			// 		"Content-Type": "application/json",
			// 	},
			// 	body: JSON.stringify(data),
			// });

			// if (!response.ok) {
			// 	throw new Error("Failed to create product");
			// }

			// return response.json();
			return new Promise((resolve) => resolve({}));
		},
		onSuccess: () => {
			// Invalidate products list to refresh
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

	// Update product mutation
	const updateProduct = useMutation({
		mutationFn: async (data: CreateProductInput & { id: string }) => {
			const response = await fetch(`/api/products/${data.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to update product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["product", productId] });
		},
	});

	return {
		categories,
		isLoadingCategories,
		createProduct: createProduct.mutate,
		updateProduct: updateProduct.mutate,
		isCreating: createProduct.isPending,
		isUpdating: updateProduct.isPending,
		isSuccess: createProduct.isSuccess,
		error: createProduct.error,
		product,
		isLoadingProduct,
	};
}
