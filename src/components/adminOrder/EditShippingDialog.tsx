import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderDetails } from "../order/hooks/useOrders";

interface EditShippingDialogProps {
	order: OrderDetails;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (shippingData: ShippingData) => void;
	isLoading?: boolean;
}

export interface ShippingData {
	carrier: string;
	trackingNumber: string;
	trackingUrl: string;
	estimatedDelivery: string;
}

export function EditShippingDialog({
	order,
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: EditShippingDialogProps) {
	const [formData, setFormData] = useState<ShippingData>({
		carrier: order.shipping.carrier || "",
		trackingNumber: order.shipping.trackingNumber || "",
		trackingUrl: order.shipping.trackingUrl || "",
		estimatedDelivery: order.shipping.estimatedDelivery
			? new Date(order.shipping.estimatedDelivery).toISOString().split("T")[0]
			: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onConfirm(formData);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Mark Order as Shipped</DialogTitle>
					<DialogDescription>
						Enter shipping details for order #{order.orderNumber}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						{/* Carrier */}
						<div className="space-y-2">
							<Label htmlFor="carrier">Carrier *</Label>
							<Input
								value={formData.carrier}
								onChange={(e) =>
									setFormData({ ...formData, carrier: e.target.value })
								}
								placeholder="Enter carrier"
								required
							/>
						</div>

						{/* Tracking Number */}
						<div className="space-y-2">
							<Label htmlFor="trackingNumber">Tracking Number *</Label>
							<Input
								value={formData.trackingNumber}
								onChange={(e) =>
									setFormData({ ...formData, trackingNumber: e.target.value })
								}
								placeholder="Enter tracking number"
								required
							/>
						</div>

						{/* Tracking URL */}
						<div className="space-y-2">
							<Label htmlFor="trackingUrl">Tracking URL</Label>
							<Input
								type="url"
								value={formData.trackingUrl}
								onChange={(e) =>
									setFormData({ ...formData, trackingUrl: e.target.value })
								}
								placeholder="https://..."
							/>
							<p className="text-xs text-muted-foreground">
								Optional: Full URL to tracking page
							</p>
						</div>

						{/* Estimated Delivery */}
						<div className="space-y-2">
							<Label htmlFor="estimatedDelivery">Estimated Delivery *</Label>
							<Input
								type="date"
								value={formData.estimatedDelivery}
								onChange={(e) =>
									setFormData({
										...formData,
										estimatedDelivery: e.target.value,
									})
								}
								min={new Date().toISOString().split("T")[0]}
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Mark as Shipped
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
