import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { AlertCircle, Calendar } from "lucide-react";
import { useState } from "react";
import type { Appointment } from "@/components/appointments/hooks/useAppointments";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentCard } from "@/components/vetAppointments/AppointmentCard";
import { AppointmentFilters } from "@/components/vetAppointments/AppointmentFilter";
import { useVetAppointments } from "@/components/vetAppointments/hooks/useAppointments";

export const Route = createFileRoute("/vet/appointments/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [nameFilter, setNameFilter] = useState("");
	const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

	const { todayAppointments, upcomingAppointments, isLoading, error } =
		useVetAppointments({
			nameFilter,
			dateFilter: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
		});

	const handleAppointmentClick = (appointment: Appointment) => {
		navigate({
			to: `/vet/appointments/$appointmentId`,
			params: { appointmentId: appointment.id },
		});
	};

	// Loading State
	if (isLoading) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-6xl">
				<div className="mb-8">
					<Skeleton className="h-10 w-64 mb-2" />
					<Skeleton className="h-5 w-96" />
				</div>
				<div className="flex gap-4 mb-6">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-[240px]" />
				</div>
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-48 w-full" />
					))}
				</div>
			</div>
		);
	}

	// Error State
	if (error) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-6xl">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load appointments. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 px-4 max-w-6xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">
					My Appointments
				</h1>
				<p className="text-muted-foreground">
					View and manage your veterinary appointments
				</p>
			</div>

			{/* Filters */}
			<AppointmentFilters
				nameFilter={nameFilter}
				onNameFilterChange={setNameFilter}
				dateFilter={dateFilter}
				onDateFilterChange={setDateFilter}
			/>

			{/* Today's Appointments Section */}
			<section className="mb-10">
				<div className="flex items-center gap-2 mb-4">
					<Calendar className="h-5 w-5 text-primary" />
					<h2 className="text-2xl font-semibold">Today's Appointments</h2>
					<span className="text-muted-foreground text-sm">
						({todayAppointments.length})
					</span>
				</div>

				{todayAppointments.length === 0 ? (
					<Alert>
						<AlertDescription>
							No appointments scheduled for today.
						</AlertDescription>
					</Alert>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{todayAppointments.map((appointment) => (
							<AppointmentCard
								key={appointment.id}
								appointment={appointment}
								onClick={handleAppointmentClick}
							/>
						))}
					</div>
				)}
			</section>

			{/* Upcoming Appointments Section */}
			<section>
				<div className="flex items-center gap-2 mb-4">
					<Calendar className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-2xl font-semibold">Upcoming Appointments</h2>
					<span className="text-muted-foreground text-sm">
						({upcomingAppointments.length})
					</span>
				</div>

				{upcomingAppointments.length === 0 ? (
					<Alert>
						<AlertDescription>
							No upcoming appointments scheduled.
						</AlertDescription>
					</Alert>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{upcomingAppointments.map((appointment) => (
							<AppointmentCard
								key={appointment.id}
								appointment={appointment}
								onClick={handleAppointmentClick}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
