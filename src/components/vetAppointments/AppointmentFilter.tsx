// components/vet/AppointmentFilters.tsx

import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AppointmentFiltersProps {
	nameFilter: string;
	onNameFilterChange: (value: string) => void;
	dateFilter: Date | undefined;
	onDateFilterChange: (date: Date | undefined) => void;
}

export const AppointmentFilters = ({
	nameFilter,
	onNameFilterChange,
	dateFilter,
	onDateFilterChange,
}: AppointmentFiltersProps) => {
	return (
		<div className="flex flex-col sm:flex-row gap-4 mb-6">
			{/* Name Search */}
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search by pet or owner name..."
					value={nameFilter}
					onChange={(e) => onNameFilterChange(e.target.value)}
					className="pl-10 pr-10"
				/>
				{nameFilter && (
					<Button
						variant="ghost"
						size="sm"
						className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
						onClick={() => onNameFilterChange("")}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Date Picker */}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full sm:w-[240px] justify-start text-left font-normal",
							!dateFilter && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						mode="single"
						selected={dateFilter}
						onSelect={onDateFilterChange}
					/>
					{dateFilter && (
						<div className="p-3 border-t">
							<Button
								variant="outline"
								size="sm"
								className="w-full"
								onClick={() => onDateFilterChange(undefined)}
							>
								Clear Date
							</Button>
						</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
};
