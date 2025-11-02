import { createFileRoute } from "@tanstack/react-router";
import { AdoptablePetForm } from "@/components/adminAdoption/PetAdoptionForm";

export const Route = createFileRoute("/admin/adoption/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AdoptablePetForm />;
}
