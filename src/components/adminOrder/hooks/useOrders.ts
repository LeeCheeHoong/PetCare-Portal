import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderDetails } from "@/components/order/hooks/useOrders";

export interface OrderFilters {
	search?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
	minAmount?: number;
	maxAmount?: number;
	page?: number;
	limit?: number;
}

interface OrdersResponse {
	success: boolean;
	orders: OrderDetails[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

const fetchOrders = async (
	filters: OrderFilters = {},
): Promise<OrdersResponse> => {
	const params = new URLSearchParams();

	if (filters.search) params.append("search", filters.search);
	if (filters.status) params.append("status", filters.status);
	if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
	if (filters.dateTo) params.append("dateTo", filters.dateTo);
	if (filters.minAmount)
		params.append("minAmount", filters.minAmount.toString());
	if (filters.maxAmount)
		params.append("maxAmount", filters.maxAmount.toString());

	params.append("page", (filters.page || 1).toString());
	params.append("limit", (filters.limit || 10).toString());

	const response = await fetch(`/api/orders?${params.toString()}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch orders: ${response.statusText}`);
	}

	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		success: true,
	// 		orders: [
	// 			{
	// 				id: "order_abc123def456",
	// 				orderNumber: "ORD-2024-001234",
	// 				status: "processing",
	// 				statusHistory: [
	// 					{
	// 						status: "confirmed",
	// 						timestamp: "2024-01-22T11:30:00Z",
	// 						note: "Order confirmed and payment processed",
	// 					},
	// 					{
	// 						status: "processing",
	// 						timestamp: "2024-01-22T14:15:00Z",
	// 						note: "Order is being prepared for shipment",
	// 					},
	// 					{
	// 						status: "shipped",
	// 						timestamp: "2024-01-23T09:45:00Z",
	// 						note: "Order has been shipped",
	// 					},
	// 				],
	// 				totalAmount: 663.96,
	// 				currency: "USD",
	// 				items: [
	// 					{
	// 						id: "order_item_1",
	// 						productId: "pf001",
	// 						productName: "Premium Dog Food",
	// 						productImage:
	// 							"https://images-na.ssl-images-amazon.com/images/I/81P2kN9x-BL._AC_SL1500_.jpg",
	// 						quantity: 2,
	// 						unitPrice: 45.99,
	// 						totalPrice: 91.98,
	// 					},
	// 					{
	// 						id: "order_item_2",
	// 						productId: "pf002",
	// 						productName: "Organic Catnip Toy",
	// 						productImage:
	// 							"https://www.multipet.com/media/CatnipGarden_Natural_.5-ounce-website.png",
	// 						quantity: 3,
	// 						unitPrice: 9.99,
	// 						totalPrice: 29.97,
	// 					},
	// 				],
	// 				shippingAddress: {
	// 					firstName: "John",
	// 					lastName: "Doe",
	// 					email: "john@example.com",
	// 					phone: "+1-555-123-4567",
	// 					address: "123 Main Street",
	// 					city: "New York",
	// 					state: "NY",
	// 					zipCode: "10001",
	// 					country: "US",
	// 				},
	// 				billingAddress: {
	// 					firstName: "John",
	// 					lastName: "Doe",
	// 					address: "123 Main Street",
	// 					city: "New York",
	// 					state: "NY",
	// 					zipCode: "10001",
	// 					country: "US",
	// 				},
	// 				paymentMethod: {
	// 					type: "card",
	// 					last4: "4242",
	// 					brand: "visa",
	// 				},
	// 				pricing: {
	// 					subtotal: 599.98,
	// 					shipping: 15.99,
	// 					tax: 47.99,
	// 					discount: 0,
	// 					total: 663.96,
	// 				},
	// 				shipping: {
	// 					method: "standard",
	// 					carrier: "UPS",
	// 					trackingNumber: "TRK987654321",
	// 					trackingUrl: "https://ups.com/track?number=TRK987654321",
	// 					estimatedDelivery: "2024-01-25T17:00:00Z",
	// 				},
	// 				orderDate: "2024-01-22T11:30:00Z",
	// 				updatedAt: "2024-01-23T09:45:00Z",
	// 			},
	// 		],
	// 		pagination: {
	// 			page: 1,
	// 			limit: 10,
	// 			total: 0,
	// 			totalPages: 0,
	// 		},
	// 	}),
	// );
};

export function useOrders(filters: OrderFilters = {}) {
	const queryClient = useQueryClient();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["orders", filters],
		queryFn: () => fetchOrders(filters),
	});

	// Update order status mutation
	const updateOrderStatus = useMutation({
		mutationFn: async ({
			orderId,
			status,
			note,
		}: {
			orderId: string;
			status: OrderDetails["status"];
			note?: string;
		}) => {
			const response = await fetch(`/api/orders/${orderId}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status, note }),
			});
			if (!response.ok) throw new Error("Failed to update order status");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
	});

	const shipOrder = useMutation({
		mutationFn: async ({
			orderId,
			shippingData,
		}: {
			orderId: string;
			shippingData: {
				carrier: string;
				trackingNumber: string;
				trackingUrl: string;
				estimatedDelivery: string;
			};
		}) => {
			const response = await fetch(`/api/orders/${orderId}/ship`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(shippingData),
			});
			if (!response.ok) throw new Error("Failed to ship order");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
	});

	return {
		orders: data?.orders,
		pagination: data?.pagination,
		isLoading,
		error,
		refetch,
		updateOrderStatus: updateOrderStatus.mutate,
		isUpdatingStatus: updateOrderStatus.isPending,
		shipOrder: shipOrder.mutate,
		isShipping: shipOrder.isPending,
	};
}
