import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, CreditCard, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	type PaymentMethod,
	useCheckout,
	usePaymentMethods,
} from "./hooks/useChekout";

const paymentSchema = z
	.object({
		type: z.enum(["card", "apple_pay"]),
		// Card fields
		cardNumber: z.string().optional(),
		expiryMonth: z.string().optional(),
		expiryYear: z.string().optional(),
		cvv: z.string().optional(),
		cardholderName: z.string().optional(),
		// Existing payment method
		existingMethodId: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.type === "card" && !data.existingMethodId) {
				return (
					data.cardNumber &&
					data.expiryMonth &&
					data.expiryYear &&
					data.cvv &&
					data.cardholderName
				);
			}
			return true;
		},
		{
			message: "All card fields are required for new cards",
		},
	);

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
	onSubmit: (data: PaymentMethod) => void;
	onBack: () => void;
	initialData?: PaymentMethod;
}

export function PaymentForm({
	onSubmit,
	onBack,
	initialData,
}: PaymentFormProps) {
	const { paymentMethods, isLoadingPaymentMethods, paymentMethodsError } =
		useCheckout();
	const [useNewCard, setUseNewCard] = useState(false);
	const [selectedPaymentType, setSelectedPaymentType] = useState<
		"card" | "apple_pay"
	>("card");

	const form = useForm<PaymentFormData>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			type: initialData?.type || "card",
			cardNumber: "",
			expiryMonth: "",
			expiryYear: "",
			cvv: "",
			cardholderName: "",
			existingMethodId: initialData?.id || "",
		},
	});

	const handleSubmit = (data: PaymentFormData) => {
		let paymentMethod: PaymentMethod;

		if (data.type === "card") {
			if (data.existingMethodId && !useNewCard) {
				// Use existing card
				const existingMethod = paymentMethods?.find(
					(pm: PaymentMethod) => pm.id === data.existingMethodId,
				);
				if (existingMethod) {
					paymentMethod = existingMethod;
				} else {
					return; // Invalid existing method
				}
			} else {
				// New card
				paymentMethod = {
					id: `card_\${Date.now()}`, // Mock ID
					type: "card",
					isDefault: false,
					cardNumber: data.cardNumber!,
					expiryMonth: data.expiryMonth!,
					expiryYear: data.expiryYear!,
					cvv: data.cvv!,
					cardholderName: data.cardholderName!,
					// For display purposes
					last4: data.cardNumber!.slice(-4),
					brand: getCardBrand(data.cardNumber!),
				};
			}
		} else {
			// PayPal or Apple Pay
			paymentMethod = {
				id: `\${data.type}_\${Date.now()}`,
				type: data.type,
				isDefault: false,
			};
		}

		onSubmit(paymentMethod);
	};

	const getCardBrand = (cardNumber: string): string => {
		const number = cardNumber.replace(/\s/g, "");
		if (number.startsWith("4")) return "visa";
		if (number.startsWith("5") || number.startsWith("2")) return "mastercard";
		if (number.startsWith("3")) return "amex";
		return "unknown";
	};

	const formatCardNumber = (value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		const matches = v.match(/\d{4,16}/g);
		const match = matches?.[0] || "";
		const parts = [];
		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}
		if (parts.length) {
			return parts.join(" ");
		} else {
			return v;
		}
	};

	const handleCardNumberChange = (
		value: string,
		onChange: (value: string) => void,
	) => {
		const formatted = formatCardNumber(value);
		onChange(formatted);
	};

	if (paymentMethodsError) {
		return (
			<Card>
				<CardContent className="pt-6">
					<Alert variant="destructive">
						<AlertDescription>
							Failed to load payment methods. Please try again.
						</AlertDescription>
					</Alert>
					<div className="flex justify-between pt-4">
						<Button variant="outline" onClick={onBack}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Shipping
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment Information</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						{/* Payment Method Type Selection */}
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Payment Method</FormLabel>
									<FormControl>
										<RadioGroup
											value={field.value}
											onValueChange={(value) => {
												field.onChange(value);
												setSelectedPaymentType(
													value as "card" | "paypal" | "apple_pay",
												);
											}}
											className="grid grid-cols-1 gap-4"
										>
											<div className="flex items-center space-x-2 border rounded-lg p-4">
												<RadioGroupItem value="card" id="card" />
												<Label
													htmlFor="card"
													className="flex items-center gap-2 cursor-pointer flex-1"
												>
													<CreditCard className="h-5 w-5" />
													<span>Credit/Debit Card</span>
												</Label>
											</div>
											<div className="flex items-center space-x-2 border rounded-lg p-4">
												<RadioGroupItem value="apple_pay" id="apple_pay" />
												<Label
													htmlFor="apple_pay"
													className="flex items-center gap-2 cursor-pointer flex-1"
												>
													<div className="w-5 h-5 bg-black rounded text-white text-xs flex items-center justify-center">
														A
													</div>
													<span>Apple Pay</span>
												</Label>
											</div>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Card Payment Details */}
						{selectedPaymentType === "card" && (
							<div className="space-y-4">
								{!isLoadingPaymentMethods &&
									paymentMethods &&
									paymentMethods.length > 0 &&
									!useNewCard && (
										<div className="space-y-3">
											<Label>Saved Cards</Label>
											<FormField
												control={form.control}
												name="existingMethodId"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<RadioGroup
																value={field.value}
																onValueChange={field.onChange}
																className="space-y-2"
															>
																{paymentMethods
																	.filter(
																		(pm: PaymentMethod) => pm.type === "card",
																	)
																	.map((method: PaymentMethod) => (
																		<div
																			key={method.id}
																			className="flex items-center space-x-2 border rounded-lg p-3"
																		>
																			<RadioGroupItem
																				value={method.id}
																				id={method.id}
																			/>
																			<Label
																				htmlFor={method.id}
																				className="flex items-center gap-3 cursor-pointer flex-1"
																			>
																				<CreditCard className="h-4 w-4" />
																				<span className="capitalize">
																					{method.brand}
																				</span>
																				<span>•••• {method.last4}</span>
																				{method.isDefault && (
																					<Badge
																						variant="secondary"
																						className="text-xs"
																					>
																						Default
																					</Badge>
																				)}
																			</Label>
																		</div>
																	))}
															</RadioGroup>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<Button
												type="button"
												variant="outline"
												onClick={() => setUseNewCard(true)}
												className="w-full"
											>
												<Plus className="mr-2 h-4 w-4" />
												Use New Card
											</Button>
										</div>
									)}

								{/* New Card Form */}
								{(useNewCard ||
									!paymentMethods ||
									paymentMethods.filter(
										(pm: PaymentMethod) => pm.type === "card",
									).length === 0) && (
									<div className="space-y-4">
										{useNewCard && (
											<div className="flex items-center justify-between">
												<Label>New Card Details</Label>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => setUseNewCard(false)}
												>
													Cancel
												</Button>
											</div>
										)}

										<FormField
											control={form.control}
											name="cardholderName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Cardholder Name</FormLabel>
													<FormControl>
														<Input placeholder="John Doe" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="cardNumber"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Card Number</FormLabel>
													<FormControl>
														<Input
															placeholder="1234 5678 9012 3456"
															maxLength={19}
															value={field.value}
															onChange={(e) =>
																handleCardNumberChange(
																	e.target.value,
																	field.onChange,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-3 gap-4">
											<FormField
												control={form.control}
												name="expiryMonth"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Month</FormLabel>
														<Select
															onValueChange={field.onChange}
															value={field.value}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="MM" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{Array.from({ length: 12 }, (_, i) => (
																	<SelectItem
																		key={i + 1}
																		value={String(i + 1).padStart(2, "0")}
																	>
																		{String(i + 1).padStart(2, "0")}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="expiryYear"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Year</FormLabel>
														<Select
															onValueChange={field.onChange}
															value={field.value}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="YYYY" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{Array.from({ length: 10 }, (_, i) => {
																	const year = new Date().getFullYear() + i;
																	return (
																		<SelectItem key={year} value={String(year)}>
																			{year}
																		</SelectItem>
																	);
																})}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="cvv"
												render={({ field }) => (
													<FormItem>
														<FormLabel>CVV</FormLabel>
														<FormControl>
															<Input
																placeholder="123"
																maxLength={4}
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>
								)}
							</div>
						)}

						{/* PayPal */}
						{selectedPaymentType === "paypal" && (
							<div className="text-center py-8 border rounded-lg bg-gray-50">
								<div className="space-y-4">
									<div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
										<span className="text-white text-xl font-bold">PayPal</span>
									</div>
									<p className="text-gray-600">
										You'll be redirected to PayPal to complete your payment
										securely.
									</p>
								</div>
							</div>
						)}

						{/* Apple Pay */}
						{selectedPaymentType === "apple_pay" && (
							<div className="text-center py-8 border rounded-lg bg-gray-50">
								<div className="space-y-4">
									<div className="w-16 h-16 bg-black rounded-full mx-auto flex items-center justify-center">
										<span className="text-white text-xl font-bold">Pay</span>
									</div>
									<p className="text-gray-600">
										Use Touch ID or Face ID to pay with Apple Pay.
									</p>
								</div>
							</div>
						)}

						<Separator />

						{/* Navigation Buttons */}
						<div className="flex justify-between pt-4">
							<Button type="button" variant="outline" onClick={onBack}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Shipping
							</Button>
							<Button type="submit" disabled={isLoadingPaymentMethods}>
								Continue to Review
								{!isLoadingPaymentMethods && <Check className="ml-2 h-4 w-4" />}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
