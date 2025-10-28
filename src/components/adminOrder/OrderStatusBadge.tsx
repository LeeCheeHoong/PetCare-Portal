import type { OrderDetails } from "@/components/order/hooks/useOrders";
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
	status: OrderDetails["status"];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	const statusConfig = {
		pending: { variant: "secondary" as const, label: "Pending" },
		confirmed: { variant: "default" as const, label: "Confirmed" },
		processing: { variant: "default" as const, label: "Processing" },
		shipped: { variant: "default" as const, label: "Shipped" },
		delivered: { variant: "outline" as const, label: "Delivered" },
		cancelled: { variant: "destructive" as const, label: "Cancelled" },
	};

	const config = statusConfig[status];

	return <Badge variant={config.variant}>{config.label}</Badge>;
}
