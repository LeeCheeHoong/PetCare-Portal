import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export interface OrderStatus {
	status:
		| "pending"
		| "confirmed"
		| "processing"
		| "shipped"
		| "delivered"
		| "cancelled";
	timestamp: string;
	note: string;
	location?: string;
}

export interface OrderDetails {
	id: string;
	orderNumber: string;
	status:
		| "pending"
		| "confirmed"
		| "processing"
		| "shipped"
		| "delivered"
		| "cancelled";
	statusHistory: OrderStatus[];
	totalAmount: number;
	currency: string;
	items: {
		id: string;
		productId: string;
		productName: string;
		productImage: string;
		quantity: number;
		unitPrice: number;
		totalPrice: number;
	}[];
	shippingAddress: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	billingAddress: {
		firstName: string;
		lastName: string;
		address: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	paymentMethod: {
		type: "card" | "paypal" | "apple_pay";
		last4?: string;
		brand?: string;
	};
	pricing: {
		subtotal: number;
		shipping: number;
		tax: number;
		discount: number;
		total: number;
	};
	shipping: {
		method: string;
		carrier: string;
		trackingNumber: string;
		trackingUrl: string;
		estimatedDelivery: string;
	};
	orderDate: string;
	updatedAt: string;
}

// API functions
const fetchOrders = async ({
	page = 1,
	limit = 10,
}: {
	page?: number;
	limit?: number;
}): Promise<OrdersResponse> => {
	// const response = await fetch(`/api/orders?page=${page}&limit=${limit}`)
	// if (!response.ok) throw new Error('Failed to fetch orders')
	return new Promise((resolve) =>
		resolve({
			success: true,
			orders: [
				{
					id: "order_abc123def456",
					orderNumber: "ORD-2024-001234",
					status: "shipped",
					statusHistory: [
						{
							status: "confirmed",
							timestamp: "2024-01-22T11:30:00Z",
							note: "Order confirmed and payment processed",
						},
						{
							status: "processing",
							timestamp: "2024-01-22T14:15:00Z",
							note: "Order is being prepared for shipment",
						},
						{
							status: "shipped",
							timestamp: "2024-01-23T09:45:00Z",
							note: "Order has been shipped",
						},
					],
					totalAmount: 663.96,
					currency: "USD",
					items: [
						{
							id: "order_item_1",
							productId: "pf001",
							productName: "Premium Dog Food",
							productImage:
								"https://images-na.ssl-images-amazon.com/images/I/81P2kN9x-BL._AC_SL1500_.jpg",
							quantity: 2,
							unitPrice: 45.99,
							totalPrice: 91.98,
						},
						{
							id: "order_item_2",
							productId: "pf002",
							productName: "Organic Catnip Toy",
							productImage:
								"https://www.multipet.com/media/CatnipGarden_Natural_.5-ounce-website.png",
							quantity: 3,
							unitPrice: 9.99,
							totalPrice: 29.97,
						},
					],
					shippingAddress: {
						firstName: "John",
						lastName: "Doe",
						email: "john@example.com",
						phone: "+1-555-123-4567",
						address: "123 Main Street",
						city: "New York",
						state: "NY",
						zipCode: "10001",
						country: "US",
					},
					billingAddress: {
						firstName: "John",
						lastName: "Doe",
						address: "123 Main Street",
						city: "New York",
						state: "NY",
						zipCode: "10001",
						country: "US",
					},
					paymentMethod: {
						type: "card",
						last4: "4242",
						brand: "visa",
					},
					pricing: {
						subtotal: 599.98,
						shipping: 15.99,
						tax: 47.99,
						discount: 0,
						total: 663.96,
					},
					shipping: {
						method: "standard",
						carrier: "UPS",
						trackingNumber: "TRK987654321",
						trackingUrl: "https://ups.com/track?number=TRK987654321",
						estimatedDelivery: "2024-01-25T17:00:00Z",
					},
					orderDate: "2024-01-22T11:30:00Z",
					updatedAt: "2024-01-23T09:45:00Z",
				},
			],
			pagination: {
				page: 1,
				limit: 10,
				total: 0,
				totalPages: 0,
			},
		}),
	);
};

const fetchOrderDetails = async (orderId: string): Promise<OrderDetails> => {
	// const response = await fetch(`/api/orders/${orderId}`)
	// if (!response.ok) {
	//   if (response.status === 404) {
	//     throw new Error('Order not found')
	//   }
	//   throw new Error('Failed to fetch order details')
	// }
	return new Promise((resolve) =>
		resolve({
			id: "order_abc123def456",
			orderNumber: "ORD-2024-001234",
			status: "shipped",
			statusHistory: [
				{
					status: "confirmed",
					timestamp: "2024-01-22T11:30:00Z",
					note: "Order confirmed and payment processed",
				},
				{
					status: "processing",
					timestamp: "2024-01-22T14:15:00Z",
					note: "Order is being prepared for shipment",
				},
				{
					status: "shipped",
					timestamp: "2024-01-23T09:45:00Z",
					note: "Order has been shipped",
				},
			],
			totalAmount: 663.96,
			currency: "USD",
			items: [
				{
					id: "order_item_1",
					productId: "pf001",
					productName: "Premium Dog Food",
					productImage:
						"https://images-na.ssl-images-amazon.com/images/I/81P2kN9x-BL._AC_SL1500_.jpg",
					quantity: 2,
					unitPrice: 45.99,
					totalPrice: 91.98,
				},
				{
					id: "order_item_2",
					productId: "pf002",
					productName: "Organic Catnip Toy",
					productImage:
						"https://www.multipet.com/media/CatnipGarden_Natural_.5-ounce-website.png",
					quantity: 3,
					unitPrice: 9.99,
					totalPrice: 29.97,
				},
			],
			shippingAddress: {
				firstName: "Some",
				lastName: "Guy",
				email: "example@example.com",
				phone: "6012345678",
				address: "Address",
				city: "Georgetown",
				state: "Penang",
				zipCode: "11900",
				country: "Malaysia",
			},
			billingAddress: {
				firstName: "Some",
				lastName: "Guy",
				address: "Address",
				city: "Georgetown",
				state: "Penang",
				zipCode: "11900",
				country: "Malaysia",
			},
			paymentMethod: {
				type: "card",
				last4: "4242",
				brand: "visa",
			},
			pricing: {
				subtotal: 599.98,
				shipping: 15.99,
				tax: 47.99,
				discount: 0,
				total: 663.96,
			},
			shipping: {
				method: "standard",
				carrier: "PosLaju",
				trackingNumber: "TRK987654321",
				trackingUrl: "https://ups.com/track?number=TRK987654321",
				estimatedDelivery: "2024-01-25T17:00:00Z",
			},
			orderDate: "2024-01-22T11:30:00Z",
			updatedAt: "2024-01-23T09:45:00Z",
		}),
	);
};

const cancelOrder = async (orderId: string) => {
	const response = await fetch(`/api/orders/${orderId}/cancel`, {
		method: "POST",
	});
	if (!response.ok) throw new Error("Failed to cancel order");
	return response.json();
};

const requestReturn = async ({
	orderId,
	items,
	reason,
}: {
	orderId: string;
	items: string[];
	reason: string;
}) => {
	const response = await fetch(`/api/orders/${orderId}/return`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ items, reason }),
	});
	if (!response.ok) throw new Error("Failed to request return");
	return response.json();
};

export function useOrders({
	page = 1,
	limit = 10,
}: {
	page?: number;
	limit?: number;
} = {}) {
	return useQuery({
		queryKey: ["orders", { page, limit }],
		queryFn: () => fetchOrders({ page, limit }),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useOrderDetails(orderId: string) {
	return useQuery({
		queryKey: ["order", orderId],
		queryFn: () => fetchOrderDetails(orderId),
		enabled: !!orderId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useCancelOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: cancelOrder,
		onSuccess: (data, orderId) => {
			// Update the order in cache
			queryClient.invalidateQueries({ queryKey: ["order", orderId] });
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}

export function useRequestReturn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: requestReturn,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}
