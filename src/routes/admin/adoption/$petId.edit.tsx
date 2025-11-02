import { createFileRoute, useParams } from "@tanstack/react-router";
import { AdoptablePetForm } from "@/components/adminAdoption/PetAdoptionForm";

export const Route = createFileRoute("/admin/adoption/$petId/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const { petId } = useParams({ from: "/admin/adoption/$petId/edit" });

	return <AdoptablePetForm petId={petId} />;
}
