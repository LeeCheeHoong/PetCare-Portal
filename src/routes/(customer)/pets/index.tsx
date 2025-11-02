import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import PetList from "@/components/pet/PetList";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(customer)/pets/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto py-8 px-4">
			{/* Page Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">My Pets</h1>
					<p className="text-muted-foreground mt-1">
						Manage and view all your registered pets
					</p>
				</div>

				<Link to="/pets/new">
					<Button size="lg">
						<Plus className="h-5 w-5 mr-2" />
						Add Pet
					</Button>
				</Link>
			</div>

			{/* Pet List Component */}
			<PetList />
		</div>
	)
}
