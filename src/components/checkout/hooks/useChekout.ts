import { useMutation, useQuery } from "@tanstack/react-query";
import { useCart } from "@/components/cart/hooks/useCart";

export interface ShippingAddress {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface PaymentMethod {
	id: string;
	type: "card";
	isDefault: boolean;
	// For card
	cardNumber?: string;
	expiryMonth?: string;
	expiryYear?: string;
	cvv?: string;
	cardholderName?: string;
	// For display
	last4?: string;
	brand?: string;
}

export interface OrderSummary {
	subtotal: number;
	shipping: number;
	tax: number;
	discount?: number;
	total: number;
}

export interface CheckoutData {
	shippingAddress: ShippingAddress;
	paymentMethod: PaymentMethod;
	orderSummary: OrderSummary;
}

// API functions
const createOrder = async (checkoutData: CheckoutData) => {
	const response = await fetch("/api/orders", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(checkoutData),
	});
	if (!response.ok) throw new Error("Failed to create order");
	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		id: "order_abc123def456",
	// 		status: "confirmed",
	// 		orderNumber: "ORD-2024-001234",
	// 		totalAmount: 663.96,
	// 		currency: "USD",
	// 		items: [
	// 			{
	// 				id: "order_item_1",
	// 				productId: "pf001",
	// 				productName: "Premium Dog Food",
	// 				productImage:
	// 					"https://images-na.ssl-images-amazon.com/images/I/81P2kN9x-BL._AC_SL1500_.jpg",
	// 				quantity: 3,
	// 				unitPrice: 45.99,
	// 				totalPrice: 137.97,
	// 			},
	// 			{
	// 				id: "order_item_2",
	// 				productId: "pf002",
	// 				productName: "Catnip Toy",
	// 				productImage:
	// 					"https://www.multipet.com/media/CatnipGarden_Natural_.5-ounce-website.png",
	// 				quantity: 1,
	// 				unitPrice: 9.99,
	// 				totalPrice: 9.99,
	// 			},
	// 		],
	// 		shippingAddress: {
	// 			firstName: "John",
	// 			lastName: "Doe",
	// 			email: "john@example.com",
	// 			phone: "+1-555-123-4567",
	// 			address: "123 Main Street",
	// 			city: "New York",
	// 			state: "NY",
	// 			zipCode: "10001",
	// 			country: "US",
	// 		},
	// 		paymentMethod: {
	// 			type: "card",
	// 			last4: "4242",
	// 			brand: "visa",
	// 		},
	// 		pricing: {
	// 			subtotal: 599.98,
	// 			shipping: 15.99,
	// 			tax: 47.99,
	// 			total: 663.96,
	// 		},
	// 		estimatedDelivery: "2024-01-25T17:00:00Z",
	// 		trackingNumber: "TRK987654321",
	// 		createdAt: "2024-01-22T11:30:00Z",
	// 		updatedAt: "2024-01-22T11:30:00Z",
	// 	}),
	// );
};

const validateShippingAddress = async (address: ShippingAddress) => {
	const response = await fetch("/api/shipping/validate", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(address),
	});
	if (!response.ok) throw new Error("Failed to validate address");
	return response.json();
	// return new Promise((resolve) =>
	// 	resolve({
	// 		success: true,
	// 		valid: true,
	// 		message: "Address validated successfully",
	// 		normalizedAddress: {
	// 			firstName: "John",
	// 			lastName: "Doe",
	// 			email: "john@example.com",
	// 			phone: "+1-555-123-4567",
	// 			address: "123 Main St", // Normalized
	// 			city: "New York",
	// 			state: "NY",
	// 			zipCode: "10001-1234", // Extended ZIP
	// 			country: "US",
	// 		},
	// 		suggestions: [], // Empty if valid, contains suggestions if invalid
	// 	}),
	// );
};

const calculateShipping = async (address: ShippingAddress) => {
	const response = await fetch("/api/shipping/calculate", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(address),
	});
	if (!response.ok) throw new Error("Failed to calculate shipping");
	return response.json();
	// return new Promise((resolve) =>
	// 	resolve({
	// 		success: true,
	// 		cost: 15.99,
	// 		currency: "USD",
	// 		estimatedDays: 3,
	// 		shippingMethods: [
	// 			{
	// 				id: "standard",
	// 				name: "Standard Shipping",
	// 				cost: 15.99,
	// 				estimatedDays: 3,
	// 			},
	// 			{
	// 				id: "express",
	// 				name: "Express Shipping",
	// 				cost: 29.99,
	// 				estimatedDays: 1,
	// 			},
	// 			{
	// 				id: "overnight",
	// 				name: "Overnight Shipping",
	// 				cost: 49.99,
	// 				estimatedDays: 1,
	// 			},
	// 		],
	// 	}),
	// );
};

const getPaymentMethods = async () => {
	const response = await fetch("/api/payment-methods");
	if (!response.ok) throw new Error("Failed to fetch payment methods");
	return response.json();
	// return new Promise((resolve) =>
	// 	resolve([
	// 		{
	// 			id: "pm_card123",
	// 			type: "card",
	// 			isDefault: true,
	// 			last4: "4242",
	// 			brand: "visa",
	// 			cardholderName: "John Doe",
	// 			expiryMonth: "12",
	// 			expiryYear: "2027",
	// 			createdAt: "2024-01-15T10:30:00Z",
	// 		},
	// 		{
	// 			id: "pm_card456",
	// 			type: "card",
	// 			isDefault: false,
	// 			last4: "1111",
	// 			brand: "mastercard",
	// 			cardholderName: "John Doe",
	// 			expiryMonth: "08",
	// 			expiryYear: "2026",
	// 			createdAt: "2024-01-10T14:20:00Z",
	// 		},
	// 		{
	// 			id: "pm_paypal789",
	// 			type: "paypal",
	// 			isDefault: false,
	// 			email: "john@example.com",
	// 			createdAt: "2024-01-08T09:45:00Z",
	// 		},
	// 	]),
	// );
};

export function useCreateOrder() {
	const { clearCart } = useCart();

	return useMutation({
		mutationFn: createOrder,
		onSuccess: (order) => {
			// Could invalidate related queries here
			clearCart();
			console.log("Order created successfully:", order.id);
		},
		onError: (error) => {
			console.error("Order creation failed:", error);
		},
	});
}

export function useValidateShipping() {
	return useMutation({
		mutationFn: validateShippingAddress,
		onSuccess: (data) => {
			console.log("Address validated:", data);
		},
		onError: (error) => {
			console.error("Address validation failed:", error);
		},
	});
}

export function useCalculateShipping() {
	return useMutation({
		mutationFn: calculateShipping,
		onSuccess: (data) => {
			console.log("Shipping calculated:", data);
		},
	});
}

export function usePaymentMethods() {
	return useQuery<PaymentMethod[]>({
		queryKey: ["payment-methods"],
		queryFn: getPaymentMethods,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

// Combined checkout hook for easier usage
export function useCheckout() {
	const createOrderMutation = useCreateOrder();
	const validateShippingMutation = useValidateShipping();
	const calculateShippingMutation = useCalculateShipping();
	const paymentMethodsQuery = usePaymentMethods();

	return {
		// Order creation
		createOrder: createOrderMutation.mutate,
		isCreatingOrder: createOrderMutation.isPending,
		orderError: createOrderMutation.error,
		orderData: createOrderMutation.data,

		// Shipping validation
		validateShipping: validateShippingMutation.mutate,
		isValidatingShipping: validateShippingMutation.isPending,
		shippingValidationError: validateShippingMutation.error,

		// Shipping calculation
		calculateShipping: calculateShippingMutation.mutate,
		isCalculatingShipping: calculateShippingMutation.isPending,
		shippingCost: calculateShippingMutation.data,

		// Payment methods
		paymentMethods: paymentMethodsQuery.data,
		isLoadingPaymentMethods: paymentMethodsQuery.isLoading,
		paymentMethodsError: paymentMethodsQuery.error,

		// Reset functions
		resetOrder: createOrderMutation.reset,
		resetShippingValidation: validateShippingMutation.reset,
	};
}
