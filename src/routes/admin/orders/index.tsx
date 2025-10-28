import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ShippingData } from "@/components/adminOrder/EditShippingDialog";
import {
	type OrderFilters,
	useOrders,
} from "@/components/adminOrder/hooks/useOrders";
import { OrderDetailsDialog } from "@/components/adminOrder/OrderDialog";
import { OrderFiltersComponent } from "@/components/adminOrder/OrderFilters";
import {
	OrderPagination,
	OrdersTable,
} from "@/components/adminOrder/OrderTable";
import type { OrderDetails } from "@/components/order/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/orders/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [filters, setFilters] = useState<OrderFilters>({
		page: 1,
		limit: 10,
	});
	const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

	const {
		orders,
		pagination,
		isLoading,
		error,
		updateOrderStatus,
		isUpdatingStatus,
		shipOrder,
		isShipping,
	} = useOrders(filters);

	const handleFilterChange = (newFilters: OrderFilters) => {
		setFilters(newFilters);
	};

	const handleResetFilters = () => {
		setFilters({ page: 1, limit: filters.limit });
	};

	const handlePageChange = (page: number) => {
		setFilters({ ...filters, page });
	};

	const handlePageSizeChange = (limit: number) => {
		setFilters({ ...filters, limit, page: 1 });
	};

	const handleViewDetails = (order: OrderDetails) => {
		setSelectedOrder(order);
		setDetailsDialogOpen(true);
	};

	const handleUpdateStatus = (
		orderId: string,
		status: OrderDetails["status"],
	) => {
		updateOrderStatus(
			{ orderId, status },
			{
				onSuccess: () => {
					toast("Order updated", {
						description: `Order status changed to ${status}`,
					});
				},
				onError: (error) => {
					toast.error("Error updating order status", {
						description:
							error instanceof Error
								? error.message
								: "Failed to update order status",
					});
				},
			},
		);
	};

	const handleShipOrder = (orderId: string, shippingData: ShippingData) => {
		shipOrder(
			{ orderId, shippingData },
			{
				onSuccess: () => {
					toast("Order shipped", {
						description: "Shipping information has been updated",
					});
				},
				onError: (error) => {
					toast.error("Error", {
						description:
							error instanceof Error
								? error.message
								: "Failed to update shipping information",
					});
				},
			},
		);
	};

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-destructive font-medium">Error loading orders</p>
						<p className="text-sm text-muted-foreground mt-1">
							{error instanceof Error ? error.message : "Something went wrong"}
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Orders</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Filters */}
					<OrderFiltersComponent
						filters={filters}
						onFilterChange={handleFilterChange}
						onReset={handleResetFilters}
					/>

					{/* Loading State */}
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<>
							{/* Orders Table */}
							<OrdersTable
								orders={orders || []}
								onViewDetails={handleViewDetails}
								isUpdating={isUpdatingStatus}
							/>

							{/* Pagination */}
							{pagination && pagination.total > 0 && (
								<OrderPagination
									currentPage={pagination.page}
									totalPages={pagination.totalPages}
									total={pagination.total}
									pageSize={pagination.limit}
									onPageChange={handlePageChange}
									onPageSizeChange={handlePageSizeChange}
								/>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Order Details Dialog */}
			<OrderDetailsDialog
				order={selectedOrder}
				open={detailsDialogOpen}
				onOpenChange={setDetailsDialogOpen}
				onUpdateStatus={handleUpdateStatus}
				onShipOrder={handleShipOrder}
				isUpdating={isUpdatingStatus || isShipping}
			/>
		</div>
	);
}
