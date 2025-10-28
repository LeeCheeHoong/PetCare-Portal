import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { OrderFilters } from "./hooks/useOrders";

interface OrderFiltersProps {
	filters: OrderFilters;
	onFilterChange: (filters: OrderFilters) => void;
	onReset: () => void;
}

export function OrderFiltersComponent({
	filters,
	onFilterChange,
	onReset,
}: OrderFiltersProps) {
	const handleSearchChange = (search: string) => {
		onFilterChange({ ...filters, search, page: 1 });
	};

	const handleStatusChange = (status: string) => {
		onFilterChange({
			...filters,
			status: status === "all" ? undefined : status,
			page: 1,
		});
	};

	const hasActiveFilters = filters.search || filters.status;

	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-1 gap-4">
				{/* Search Input */}
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by order number, customer..."
						value={filters.search || ""}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Status Filter */}
				<Select
					value={filters.status || "all"}
					onValueChange={handleStatusChange}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="confirmed">Confirmed</SelectItem>
						<SelectItem value="processing">Processing</SelectItem>
						<SelectItem value="shipped">Shipped</SelectItem>
						<SelectItem value="delivered">Delivered</SelectItem>
						<SelectItem value="cancelled">Cancelled</SelectItem>
					</SelectContent>
				</Select>

				{/* Reset Filters Button */}
				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={onReset}>
						<X className="h-4 w-4 mr-2" />
						Reset
					</Button>
				)}
			</div>
		</div>
	);
}
