import { createFileRoute } from "@tanstack/react-router";
import PetForm from "@/components/pet/PetForm";

export const Route = createFileRoute("/(customer)/pets/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PetForm />;
}
