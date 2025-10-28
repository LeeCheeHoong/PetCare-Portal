import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProductDetail } from "@/components/products/hooks/useSingleProduct";

export interface CartItem {
	id: string;
	product: ProductDetail;
	quantity: number;
	addedAt: string;
}

export interface Cart {
	id: string;
	items: CartItem[];
	totalItems: number;
	subtotal: number;
	tax: number;
	shipping: number;
	total: number;
	updatedAt: string;
}

// API functions
const fetchCart = async (): Promise<Cart> => {
	//   const response = await fetch('/api/cart')
	//   if (!response.ok) throw new Error('Failed to fetch cart')
	return new Promise((resolve) => {
		resolve({
			id: "cart123",
			items: [
				{
					id: "1",
					product: {
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
					quantity: 2,
					addedAt: new Date().toISOString(),
				},
				{
					id: "1",
					product: {
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
					quantity: 3,
					addedAt: new Date().toISOString(),
				},
			],
			totalItems: 2,
			subtotal: 91.98,
			tax: 7.36,
			shipping: 5.0,
			total: 104.34,
			updatedAt: new Date().toISOString(),
		});
	});
};

const updateCartItem = async ({
	itemId,
	quantity,
}: {
	itemId: string;
	quantity: number;
}) => {
	const response = await fetch(`/api/cart/items/${itemId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ quantity }),
	});
	if (!response.ok) throw new Error("Failed to update cart item");
	return response.json();
};

const removeCartItem = async (itemId: string) => {
	const response = await fetch(`/api/cart/items/${itemId}`, {
		method: "DELETE",
	});
	if (!response.ok) throw new Error("Failed to remove cart item");
	return response.json();
};

const addToCart = async ({
	productId,
	quantity = 1,
}: {
	productId: string;
	quantity?: number;
}) => {
	const response = await fetch("/api/cart/items", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ productId, quantity }),
	});
	if (!response.ok) throw new Error("Failed to add item to cart");
	return response.json();
};

const clearCart = async () => {
	//   const response = await fetch('/api/cart', {
	//     method: 'DELETE'
	//   })
	//   if (!response.ok) throw new Error('Failed to clear cart')
	return new Promise((resolve) => {
		resolve({});
	});
};

// Helper function to recalculate cart totals
const recalculateCartTotals = (cart: Cart): Cart => {
	const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = cart.items.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0,
	);
	const total = subtotal + cart.tax + cart.shipping;

	return {
		...cart,
		totalItems,
		subtotal,
		total,
	};
};

export function useCart() {
	const queryClient = useQueryClient();

	// Fetch cart query
	const cartQuery = useQuery({
		queryKey: ["cart"],
		queryFn: fetchCart,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

	// Add to cart mutation
	const addToCartMutation = useMutation({
		mutationFn: addToCart,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast("Added to cart", {
				description: "Item has been added to your cart.",
			});
		},
		onError: () => {
			toast.error("Add to cart failed", {
				description: "Failed to add item to cart. Please try again.",
			});
		},
	});

	// Update quantity mutation
	const updateQuantityMutation = useMutation({
		mutationFn: updateCartItem,
		onMutate: async ({ itemId, quantity }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["cart"] });

			// Snapshot previous value
			const previousCart = queryClient.getQueryData<Cart>(["cart"]);

			// Optimistically update
			if (previousCart) {
				const updatedItems = previousCart.items.map((item) =>
					item.id === itemId ? { ...item, quantity } : item,
				);
				const updatedCart = recalculateCartTotals({
					...previousCart,
					items: updatedItems,
				});

				queryClient.setQueryData(["cart"], updatedCart);
			}

			return { previousCart };
		},
		onError: (error, variables, context) => {
			// Rollback on error
			if (context?.previousCart) {
				queryClient.setQueryData(["cart"], context.previousCart);
			}
			toast.error("Update failed", {
				description: "Failed to update item quantity. Please try again.",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	// Remove item mutation
	const removeItemMutation = useMutation({
		mutationFn: removeCartItem,
		onMutate: async (itemId) => {
			await queryClient.cancelQueries({ queryKey: ["cart"] });

			const previousCart = queryClient.getQueryData<Cart>(["cart"]);

			if (previousCart) {
				const updatedItems = previousCart.items.filter(
					(item) => item.id !== itemId,
				);
				const updatedCart = recalculateCartTotals({
					...previousCart,
					items: updatedItems,
				});

				queryClient.setQueryData(["cart"], updatedCart);
			}

			return { previousCart };
		},
		onSuccess: () => {
			toast("Item removed", {
				description: "Item has been removed from your cart.",
			});
		},
		onError: (error, variables, context) => {
			if (context?.previousCart) {
				queryClient.setQueryData(["cart"], context.previousCart);
			}
			toast.error("Remove failed", {
				description: "Failed to remove item. Please try again.",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	// Clear cart mutation
	const clearCartMutation = useMutation({
		mutationFn: clearCart,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast("Cart cleared", {
				description: "All items have been removed from your cart.",
			});
		},
		onError: () => {
			toast.error("Clear cart failed", {
				description: "Failed to clear cart. Please try again.",
			});
		},
	});

	// Helper functions
	const updateQuantity = (itemId: string, quantity: number) => {
		if (quantity < 1) return;
		updateQuantityMutation.mutate({ itemId, quantity });
	};

	const removeItem = (itemId: string) => {
		removeItemMutation.mutate(itemId);
	};

	const addItem = (productId: string, quantity: number = 1) => {
		addToCartMutation.mutate({ productId, quantity });
	};

	const increaseQuantity = (itemId: string) => {
		const currentItem = cartQuery.data?.items.find(
			(item) => item.id === itemId,
		);
		if (currentItem) {
			updateQuantity(itemId, currentItem.quantity + 1);
		}
	};

	const decreaseQuantity = (itemId: string) => {
		const currentItem = cartQuery.data?.items.find(
			(item) => item.id === itemId,
		);
		if (currentItem && currentItem.quantity > 1) {
			updateQuantity(itemId, currentItem.quantity - 1);
		}
	};

	const isItemInCart = (productId: string): boolean => {
		return (
			cartQuery.data?.items.some((item) => item.product.id === productId) ??
			false
		);
	};

	const getItemQuantity = (productId: string): number => {
		const item = cartQuery.data?.items.find(
			(item) => item.product.id === productId,
		);
		return item?.quantity ?? 0;
	};

	const canIncreaseQuantity = (itemId: string): boolean => {
		const item = cartQuery.data?.items.find((item) => item.id === itemId);
		if (!item) return false;
		return item.product.inStock && item.quantity < item.product.stockCount;
	};

	return {
		// Data
		cart: cartQuery.data,
		isLoading: cartQuery.isLoading,
		error: cartQuery.error,

		// Computed values
		isEmpty: !cartQuery.data || cartQuery.data.items.length === 0,
		itemCount: cartQuery.data?.totalItems ?? 0,
		subtotal: cartQuery.data?.subtotal ?? 0,
		total: cartQuery.data?.total ?? 0,

		// Actions
		addItem,
		removeItem,
		updateQuantity,
		increaseQuantity,
		decreaseQuantity,
		clearCart: () => clearCartMutation.mutate(),

		// Helpers
		isItemInCart,
		getItemQuantity,
		canIncreaseQuantity,

		// Mutation states
		isAdding: addToCartMutation.isPending,
		isUpdating: updateQuantityMutation.isPending,
		isRemoving: removeItemMutation.isPending,
		isClearing: clearCartMutation.isPending,

		// Refetch
		refetch: cartQuery.refetch,
	};
}
