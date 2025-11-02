import { format, parseISO } from "date-fns";
import type { Appointment } from "@/components/appointments/hooks/useAppointments";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarDayCellProps {
	date: Date;
	appointments: Appointment[];
	isCurrentMonth: boolean;
	isToday: boolean;
	onClick: () => void;
}

export const CalendarDayCell = ({
	date,
	appointments,
	isCurrentMonth,
	isToday,
	onClick,
}: CalendarDayCellProps) => {
	const dayNumber = date.getDate();

	return (
		<div
			className={cn(
				"min-h-[120px] p-2 border border-border cursor-pointer transition-colors hover:bg-accent/50",
				!isCurrentMonth && "bg-muted/30 text-muted-foreground",
				isToday && "bg-primary/5 border-primary",
			)}
			onClick={onClick}
		>
			{/* Date Number */}
			<div className="flex items-center justify-between mb-2">
				<span
					className={cn(
						"text-sm font-medium",
						isToday &&
							"flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground",
					)}
				>
					{dayNumber}
				</span>
				{appointments.length > 0 && (
					<Badge variant="secondary" className="text-xs">
						{appointments.length}
					</Badge>
				)}
			</div>

			{/* Appointments Preview */}
			<div className="space-y-1">
				{appointments.slice(0, 3).map((apt) => (
					<div
						key={apt.id}
						className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
					>
						{format(parseISO(apt.appointmentDateTime), "HH:mm")} -{" "}
						{apt.pet.name}
					</div>
				))}
				{appointments.length > 3 && (
					<div className="text-xs text-muted-foreground text-center">
						+{appointments.length - 3} more
					</div>
				)}
			</div>
		</div>
	);
};
