import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Edit,
	FileText,
	Palette,
	PawPrint,
	Weight,
} from "lucide-react";
import { useState } from "react";
import { usePet } from "@/components/pet/hooks/usePets";
import PetForm from "@/components/pet/PetForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/(customer)/pets/$petId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { petId } = useParams({ from: "/(customer)/pets/$petId" });
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);

	const { data: pet, isLoading, isError } = usePet(petId);

	// If in edit mode, show the form
	if (isEditing) {
		return <PetForm petId={petId} onCancelEdit={() => setIsEditing(false)} />;
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-4xl">
				<Skeleton className="h-10 w-32 mb-4" />
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64 mt-2" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-64 w-full mb-4" />
						<div className="space-y-3">
							{[1, 2, 3, 4].map((n) => (
								<Skeleton key={n} className="h-6 w-full" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Error state
	if (isError || !pet) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-4xl">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/pets" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Pets
				</Button>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Failed to load pet details. Pet may not exist.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Helper function for status badge styling
	const getStatusVariant = (status: string) => {
		switch (status) {
			case "healthy":
				return "default";
			case "sick":
				return "destructive";
			case "in-treatment":
				return "secondary";
			case "recovering":
				return "outline";
			default:
				return "default";
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={() => navigate({ to: "/pets" })}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Pets
			</Button>

			{/* Pet Details Card */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle className="text-3xl">{pet.name}</CardTitle>
							<CardDescription className="text-lg mt-1">
								{pet.breed} • {pet.age} {pet.age === 1 ? "year" : "years"} old
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant={getStatusVariant(pet.status)} className="text-sm">
								{pet.status}
							</Badge>
							<Button onClick={() => setIsEditing(true)} size="sm">
								<Edit className="h-4 w-4 mr-2" />
								Edit
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Pet Image */}
					{pet.imageUrl ? (
						<img
							src={pet.imageUrl}
							alt={pet.name}
							className="w-full h-96 object-cover rounded-lg"
						/>
					) : (
						<div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
							<PawPrint className="h-24 w-24 text-muted-foreground" />
						</div>
					)}

					{/* Basic Information */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Basic Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-start gap-3 p-4 border rounded-lg">
								<PawPrint className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-sm text-muted-foreground">Species</p>
									<p className="font-medium capitalize">{pet.species}</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-4 border rounded-lg">
								<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-sm text-muted-foreground">Age</p>
									<p className="font-medium">
										{pet.age} {pet.age === 1 ? "year" : "years"}
									</p>
								</div>
							</div>

							{pet.weight && (
								<div className="flex items-start gap-3 p-4 border rounded-lg">
									<Weight className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="text-sm text-muted-foreground">Weight</p>
										<p className="font-medium">{pet.weight} kg</p>
									</div>
								</div>
							)}

							{pet.color && (
								<div className="flex items-start gap-3 p-4 border rounded-lg">
									<Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="text-sm text-muted-foreground">Color</p>
										<p className="font-medium">{pet.color}</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Medical Notes */}
					{pet.medicalNotes && (
						<div>
							<h3 className="text-lg font-semibold mb-4">Medical Notes</h3>
							<div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
								<FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
								<p className="text-sm leading-relaxed">{pet.medicalNotes}</p>
							</div>
						</div>
					)}

					{/* Metadata */}
					<div className="pt-4 border-t">
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>
								Added on: {new Date(pet.createdAt).toLocaleDateString()}
							</span>
							<span>
								Last updated: {new Date(pet.updatedAt).toLocaleDateString()}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
