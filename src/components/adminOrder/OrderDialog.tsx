import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { format } from "date-fns";
import { CheckCircle, MapPin, Package, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { OrderDetails } from "../order/hooks/useOrders";
import { AlertDialogFooter, AlertDialogHeader } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { EditShippingDialog, type ShippingData } from "./EditShippingDialog";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailsDialogProps {
	order: OrderDetails | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdateStatus?: (orderId: string, status: OrderDetails["status"]) => void;
	onShipOrder?: (orderId: string, shippingData: ShippingData) => void;
	isUpdating?: boolean;
}

export function OrderDetailsDialog({
	order,
	open,
	onOpenChange,
	onUpdateStatus,
	onShipOrder,
	isUpdating,
}: OrderDetailsDialogProps) {
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [showShippingDialog, setShowShippingDialog] = useState(false);

	if (!order) return null;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: order.currency,
		}).format(amount);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-[800px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<span>Order #{order.orderNumber}</span>
						<OrderStatusBadge status={order.status} />
					</DialogTitle>
					<DialogDescription>
						Placed on {format(new Date(order.orderDate), "PPP 'at' p")}
					</DialogDescription>
					<div className="flex gap-2 mt-4">
						{order.status === "pending" && (
							<Button
								size="sm"
								onClick={() => onUpdateStatus?.(order.id, "confirmed")}
							>
								<CheckCircle className="mr-2 h-4 w-4" />
								Confirm Order
							</Button>
						)}

						{order.status === "confirmed" && (
							<Button
								size="sm"
								onClick={() => onUpdateStatus?.(order.id, "processing")}
							>
								<Package className="mr-2 h-4 w-4" />
								Start Processing
							</Button>
						)}

						{order.status === "processing" && (
							<Button
								size="sm"
								onClick={() => setShowShippingDialog(true)}
								disabled={isUpdating}
							>
								<Truck className="mr-2 h-4 w-4" />
								Mark as Shipped
							</Button>
						)}

						{order.status === "shipped" && (
							<Button
								size="sm"
								onClick={() => onUpdateStatus?.(order.id, "delivered")}
							>
								<CheckCircle className="mr-2 h-4 w-4" />
								Mark as Delivered
							</Button>
						)}

						{!["delivered", "cancelled"].includes(order.status) && (
							<Button
								size="sm"
								variant="destructive"
								onClick={() => setShowCancelDialog(true)}
							>
								<XCircle className="mr-2 h-4 w-4" />
								Cancel Order
							</Button>
						)}
					</div>
				</DialogHeader>

				<ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
					<div className="space-y-6">
						{/* Order Items */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<Package className="h-5 w-5 text-muted-foreground" />
								<h3 className="font-semibold">Order Items</h3>
							</div>
							<div className="space-y-3">
								{order.items.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-4 p-3 rounded-lg border"
									>
										<img
											src={item.productImage}
											alt={item.productName}
											className="w-16 h-16 object-cover rounded"
										/>
										<div className="flex-1">
											<p className="font-medium">{item.productName}</p>
											<p className="text-sm text-muted-foreground">
												Quantity: {item.quantity} ×{" "}
												{formatCurrency(item.unitPrice)}
											</p>
										</div>
										<p className="font-semibold">
											{formatCurrency(item.totalPrice)}
										</p>
									</div>
								))}
							</div>
						</div>

						<Separator />

						{/* Pricing Breakdown */}
						<div>
							<h3 className="font-semibold mb-4">Pricing</h3>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal</span>
									<span>{formatCurrency(order.pricing.subtotal)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Shipping</span>
									<span>{formatCurrency(order.pricing.shipping)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tax</span>
									<span>{formatCurrency(order.pricing.tax)}</span>
								</div>
								{order.pricing.discount > 0 && (
									<div className="flex justify-between text-sm text-green-600">
										<span>Discount</span>
										<span>-{formatCurrency(order.pricing.discount)}</span>
									</div>
								)}
								<Separator />
								<div className="flex justify-between font-semibold">
									<span>Total</span>
									<span>{formatCurrency(order.pricing.total)}</span>
								</div>
							</div>
						</div>

						<Separator />

						{/* Shipping Information */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<Truck className="h-5 w-5 text-muted-foreground" />
								<h3 className="font-semibold">Shipping Information</h3>
							</div>
							<div className="space-y-2 text-sm">
								<div>
									<span className="text-muted-foreground">Method: </span>
									<span>{order.shipping.method}</span>
								</div>
								<div>
									<span className="text-muted-foreground">Carrier: </span>
									<span>{order.shipping.carrier}</span>
								</div>
								{order.shipping.trackingNumber && (
									<div>
										<span className="text-muted-foreground">Tracking: </span>
										<a
											href={order.shipping.trackingUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{order.shipping.trackingNumber}
										</a>
									</div>
								)}
								<div>
									<span className="text-muted-foreground">Est. Delivery: </span>
									<span>
										{format(new Date(order.shipping.estimatedDelivery), "PPP")}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						{/* Addresses */}
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<div className="flex items-center gap-2 mb-4">
									<MapPin className="h-5 w-5 text-muted-foreground" />
									<h3 className="font-semibold">Shipping Address</h3>
								</div>
								<div className="text-sm space-y-1">
									<p>
										{order.shippingAddress.firstName}{" "}
										{order.shippingAddress.lastName}
									</p>
									<p>{order.shippingAddress.address}</p>
									<p>
										{order.shippingAddress.city}, {order.shippingAddress.state}{" "}
										{order.shippingAddress.zipCode}
									</p>
									<p>{order.shippingAddress.country}</p>
									<p className="text-muted-foreground pt-2">
										{order.shippingAddress.email}
									</p>
									<p className="text-muted-foreground">
										{order.shippingAddress.phone}
									</p>
								</div>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-4">
									<MapPin className="h-5 w-5 text-muted-foreground" />
									<h3 className="font-semibold">Billing Address</h3>
								</div>
								<div className="text-sm space-y-1">
									<p>
										{order.billingAddress.firstName}{" "}
										{order.billingAddress.lastName}
									</p>
									<p>{order.billingAddress.address}</p>
									<p>
										{order.billingAddress.city}, {order.billingAddress.state}{" "}
										{order.billingAddress.zipCode}
									</p>
									<p>{order.billingAddress.country}</p>
								</div>
							</div>
						</div>

						<Separator />

						{/* Status History */}
						{order.statusHistory.length > 0 && (
							<div>
								<h3 className="font-semibold mb-4">Status History</h3>
								<div className="space-y-3">
									{order.statusHistory.map((status, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										<div key={index} className="flex gap-4">
											<div className="flex flex-col items-center">
												<div className="w-2 h-2 rounded-full bg-primary" />
												{index !== order.statusHistory.length - 1 && (
													<div className="w-0.5 h-full bg-border mt-1" />
												)}
											</div>
											<div className="flex-1 pb-4">
												<div className="flex items-center gap-2">
													<OrderStatusBadge status={status.status} />
													<span className="text-sm text-muted-foreground">
														{format(new Date(status.timestamp), "PPP 'at' p")}
													</span>
												</div>
												{status.note && (
													<p className="text-sm text-muted-foreground mt-1">
														{status.note}
													</p>
												)}
												{status.location && (
													<p className="text-sm text-muted-foreground mt-1">
														📍 {status.location}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
			{/* Cancellation Confirmation Dialog */}
			<AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Order?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel order #{order.orderNumber}? This
							action cannot be undone. The customer will be notified of the
							cancellation.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>No, Keep Order</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								onUpdateStatus?.(order.id, "cancelled");
								setShowCancelDialog(false);
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Yes, Cancel Order
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Shipping Edit Dialog */}
			{order && (
				<EditShippingDialog
					order={order}
					open={showShippingDialog}
					onOpenChange={setShowShippingDialog}
					onConfirm={(shippingData) => {
						onShipOrder?.(order.id, shippingData);
						setShowShippingDialog(false);
					}}
					isLoading={isUpdating}
				/>
			)}
		</Dialog>
	);
}
