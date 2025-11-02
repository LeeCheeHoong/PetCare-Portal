import { createFileRoute } from "@tanstack/react-router";
import BookAppointmentPage from "@/components/appointments/appointmentForm";

export const Route = createFileRoute("/(customer)/appointments/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <BookAppointmentPage />;
}
