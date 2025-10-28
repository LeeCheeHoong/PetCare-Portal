import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { OrderDetails } from "../order/hooks/useOrders";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersTableProps {
	orders: OrderDetails[];
	onViewDetails: (order: OrderDetails) => void;
	isUpdating?: boolean;
}

export function OrdersTable({ orders, onViewDetails }: OrdersTableProps) {
	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	const formatDate = (date: string) => {
		return formatDistanceToNow(new Date(date), { addSuffix: true });
	};

	if (orders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">No orders found</p>
				<p className="text-sm text-muted-foreground mt-1">
					Try adjusting your filters
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Order Number</TableHead>
						<TableHead>Customer</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Items</TableHead>
						<TableHead>Total</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{orders.map((order) => (
						<TableRow key={order.id}>
							<TableCell className="font-medium">
								#{order.orderNumber}
							</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">
										{order.shippingAddress.firstName}{" "}
										{order.shippingAddress.lastName}
									</span>
									<span className="text-sm text-muted-foreground">
										{order.shippingAddress.email}
									</span>
								</div>
							</TableCell>
							<TableCell>
								<OrderStatusBadge status={order.status} />
							</TableCell>
							<TableCell>
								<span className="text-sm text-muted-foreground">
									{order.items.length} item{order.items.length !== 1 ? "s" : ""}
								</span>
							</TableCell>
							<TableCell className="font-medium">
								{formatCurrency(order.totalAmount, order.currency)}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{formatDate(order.orderDate)}
							</TableCell>
							<TableCell>
								<Button
									className="w-full"
									variant="outline"
									onClick={() => onViewDetails(order)}
								>
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

interface OrderPaginationProps {
	currentPage: number;
	totalPages: number;
	total: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
}

export function OrderPagination({
	currentPage,
	totalPages,
	total,
	pageSize,
	onPageChange,
	onPageSizeChange,
}: OrderPaginationProps) {
	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, total);

	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex items-center gap-6">
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground">Rows per page</p>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className="w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
							<SelectItem value="100">100</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<p className="text-sm text-muted-foreground">
					Showing {startItem} to {endItem} of {total} orders
				</p>
			</div>

			<div className="flex items-center gap-2">
				<p className="text-sm text-muted-foreground">
					Page {currentPage} of {totalPages}
				</p>
				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						<ChevronLeft className="h-4 w-4" />
						<span className="sr-only">Previous page</span>
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						<ChevronRight className="h-4 w-4" />
						<span className="sr-only">Next page</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
