import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ProductFilters,
	useProducts,
} from "@/components/products/hooks/useProducts";

export function useAdminProducts(filters: ProductFilters) {
	const queryClient = useQueryClient();

	// Fetch all products
	const { data, isLoading, error } = useProducts(filters);

	// Delete product mutation
	const deleteProduct = useMutation({
		mutationFn: async (productId: string) => {
			const response = await fetch(`/api/products/${productId}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete product");
			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch products list
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

	return {
		data,
		products: data?.products,
		pagination: data?.pagination,
		isLoading,
		error,
		deleteProduct: deleteProduct.mutate,
		isDeletingProduct: deleteProduct.isPending,
	};
}
