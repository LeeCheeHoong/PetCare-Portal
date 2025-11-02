import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import AppointmentList from "@/components/appointments/appointmentList";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(customer)/appointments/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto py-8 px-4">
			{/* Page Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
					<p className="text-muted-foreground mt-1">
						View and manage your pet appointments
					</p>
				</div>

				<Link to="/appointments/new">
					<Button size="lg">
						<Plus className="h-5 w-5 mr-2" />
						Book Appointment
					</Button>
				</Link>
			</div>

			{/* Appointment List Component */}
			<AppointmentList />
		</div>
	);
}
