import { createFileRoute } from "@tanstack/react-router";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import {
	AlertCircle,
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DayAppointmentsModal } from "@/components/vetCalendar/AppointmentModal";
import { CalendarDayCell } from "@/components/vetCalendar/CalendarCell";
import { useVetCalendarAppointments } from "@/components/vetCalendar/hooks/useVetCalendar";

export const Route = createFileRoute("/vet/schedule")({
	component: RouteComponent,
});

function RouteComponent() {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const { appointmentsByDate, isLoading, error } = useVetCalendarAppointments({
		month: currentMonth,
	});

	// Generate calendar days (including days from prev/next month to fill grid)
	const calendarDays = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);
		const calendarStart = startOfWeek(monthStart);
		const calendarEnd = endOfWeek(monthEnd);

		return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
	}, [currentMonth]);

	// Handlers
	const handlePreviousMonth = () => {
		setCurrentMonth(subMonths(currentMonth, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	const handleToday = () => {
		setCurrentMonth(new Date());
	};

	const handleDayClick = (date: Date) => {
		setSelectedDate(date);
		setModalOpen(true);
	};

	const selectedDayAppointments = useMemo(() => {
		if (!selectedDate) return [];
		const dateKey = format(selectedDate, "yyyy-MM-dd");
		return appointmentsByDate[dateKey] || [];
	}, [selectedDate, appointmentsByDate]);

	// Loading State
	if (isLoading) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-7xl">
				<div className="mb-8">
					<Skeleton className="h-10 w-64 mb-2" />
					<Skeleton className="h-5 w-96" />
				</div>
				<div className="mb-6 flex items-center justify-between">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid grid-cols-7 gap-2">
					{Array.from({ length: 35 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: allow
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			</div>
		);
	}

	// Error State
	if (error) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-7xl">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load calendar appointments. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<div className="container mx-auto py-6 px-4 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
					<CalendarIcon className="h-8 w-8" />
					Appointment Calendar
				</h1>
				<p className="text-muted-foreground">
					View and manage your appointment schedule
				</p>
			</div>

			{/* Calendar Controls */}
			<div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
				<Button variant="outline" onClick={handlePreviousMonth}>
					<ChevronLeft className="h-4 w-4 mr-2" />
					Previous
				</Button>

				<div className="flex items-center gap-4">
					<h2 className="text-2xl font-semibold">
						{format(currentMonth, "MMMM yyyy")}
					</h2>
					<Button variant="outline" size="sm" onClick={handleToday}>
						Today
					</Button>
				</div>

				<Button variant="outline" onClick={handleNextMonth}>
					Next
					<ChevronRight className="h-4 w-4 ml-2" />
				</Button>
			</div>

			{/* Calendar Grid */}
			<div className="bg-card rounded-lg border shadow-sm overflow-hidden">
				{/* Week Day Headers */}
				<div className="grid grid-cols-7 bg-muted/50">
					{weekDays.map((day) => (
						<div
							key={day}
							className="p-3 text-center text-sm font-semibold border-r last:border-r-0"
						>
							{day}
						</div>
					))}
				</div>

				{/* Calendar Days */}
				<div className="grid grid-cols-7">
					{calendarDays.map((day, index) => {
						const dateKey = format(day, "yyyy-MM-dd");
						const dayAppointments = appointmentsByDate[dateKey] || [];

						return (
							<CalendarDayCell
								// biome-ignore lint/suspicious/noArrayIndexKey: allow
								key={index}
								date={day}
								appointments={dayAppointments}
								isCurrentMonth={isSameMonth(day, currentMonth)}
								isToday={isToday(day)}
								onClick={() => handleDayClick(day)}
							/>
						);
					})}
				</div>
			</div>

			{/* Day Appointments Modal */}
			<DayAppointmentsModal
				date={selectedDate}
				appointments={selectedDayAppointments}
				open={modalOpen}
				onOpenChange={setModalOpen}
			/>
		</div>
	);
}
