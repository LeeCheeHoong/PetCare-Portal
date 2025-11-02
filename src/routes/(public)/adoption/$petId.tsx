import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	DollarSign,
	Heart,
	Info,
	Palette,
	Scale,
} from "lucide-react";
import { useState } from "react";
import { AdoptionDialog } from "@/components/adoption/adoptionDialog";
import { useAdoptablePet } from "@/components/adoption/hooks/useAdoption";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/(public)/adoption/$petId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { petId } = useParams({ from: "/(public)/adoption/$petId" });
	const navigate = useNavigate();
	const [isAdoptionDialogOpen, setIsAdoptionDialogOpen] = useState(false);

	const { data: pet, isLoading, isError, error } = useAdoptablePet(petId);

	// Loading State
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<Skeleton className="h-8 w-32 mb-8" />
				<div className="grid md:grid-cols-2 gap-8">
					<Skeleton className="h-96 w-full rounded-lg" />
					<div className="space-y-4">
						<Skeleton className="h-12 w-3/4" />
						<Skeleton className="h-6 w-1/2" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				</div>
			</div>
		);
	}

	// Error State
	if (isError || !pet) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/adoption" })}
					className="mb-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Adoption List
				</Button>
				<Alert variant="destructive">
					<AlertDescription>
						{error instanceof Error ? error.message : "Pet not found"}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const isAvailable = pet.adoptionStatus === "available";

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={() => navigate({ to: "/adoption" })}
				className="mb-6"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Adoption List
			</Button>

			{/* Main Content */}
			<div className="grid md:grid-cols-2 gap-8 mb-8">
				{/* Left Column - Image */}
				<div className="relative">
					<div className="relative h-96 md:h-[500px] w-full overflow-hidden rounded-lg bg-gray-200">
						{pet.imageUrl ? (
							<img
								src={pet.imageUrl}
								alt={pet.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
								<span className="text-8xl">🐾</span>
							</div>
						)}

						{/* Status Badge */}
						<div className="absolute top-4 right-4">
							<Badge
								variant={isAvailable ? "default" : "secondary"}
								className="text-base px-4 py-1"
							>
								{pet.adoptionStatus}
							</Badge>
						</div>
					</div>
				</div>

				{/* Right Column - Details */}
				<div className="space-y-6">
					{/* Header */}
					<div>
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							{pet.name}
						</h1>
						<p className="text-xl text-gray-600">
							{pet.breed} • {pet.species}
						</p>
					</div>

					{/* Quick Stats Cards */}
					<div className="grid grid-cols-2 gap-4">
						<Card>
							<CardContent className="p-4 flex items-center gap-3">
								<Calendar className="h-5 w-5 text-blue-500" />
								<div>
									<p className="text-sm text-gray-600">Age</p>
									<p className="font-semibold">
										{pet.age} {pet.age === 1 ? "year" : "years"}
									</p>
								</div>
							</CardContent>
						</Card>

						{pet.weight && (
							<Card>
								<CardContent className="p-4 flex items-center gap-3">
									<Scale className="h-5 w-5 text-green-500" />
									<div>
										<p className="text-sm text-gray-600">Weight</p>
										<p className="font-semibold">{pet.weight} lbs</p>
									</div>
								</CardContent>
							</Card>
						)}

						{pet.color && (
							<Card>
								<CardContent className="p-4 flex items-center gap-3">
									<Palette className="h-5 w-5 text-purple-500" />
									<div>
										<p className="text-sm text-gray-600">Color</p>
										<p className="font-semibold">{pet.color}</p>
									</div>
								</CardContent>
							</Card>
						)}

						{pet.adoptionFee !== undefined && (
							<Card>
								<CardContent className="p-4 flex items-center gap-3">
									<DollarSign className="h-5 w-5 text-yellow-500" />
									<div>
										<p className="text-sm text-gray-600">Adoption Fee</p>
										<p className="font-semibold">${pet.adoptionFee}</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Description */}
					{pet.description && (
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start gap-2 mb-3">
									<Info className="h-5 w-5 text-blue-500 mt-0.5" />
									<h3 className="text-lg font-semibold">About {pet.name}</h3>
								</div>
								<p className="text-gray-700 leading-relaxed whitespace-pre-line">
									{pet.description}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Adoption Button */}
					<Button
						size="lg"
						className="w-full"
						onClick={() => setIsAdoptionDialogOpen(true)}
						disabled={!isAvailable}
					>
						<Heart className="mr-2 h-5 w-5" />
						{isAvailable ? "Adopt Me" : "Not Available"}
					</Button>

					{!isAvailable && (
						<p className="text-sm text-gray-600 text-center">
							This pet is currently {pet.adoptionStatus}. Check back later or
							browse other available pets.
						</p>
					)}
				</div>
			</div>

			{/* Additional Info Section */}
			<Card>
				<CardContent className="p-6">
					<h3 className="text-xl font-semibold mb-4">Adoption Process</h3>
					<ol className="space-y-3 text-gray-700">
						<li className="flex gap-3">
							<span className="font-bold text-blue-600">1.</span>
							<span>
								Submit your adoption application by clicking "Adopt Me" above
							</span>
						</li>
						<li className="flex gap-3">
							<span className="font-bold text-blue-600">2.</span>
							<span>
								Our team will review your application within 24-48 hours
							</span>
						</li>
						<li className="flex gap-3">
							<span className="font-bold text-blue-600">3.</span>
							<span>
								If approved, we'll schedule a meet-and-greet with {pet.name}
							</span>
						</li>
						<li className="flex gap-3">
							<span className="font-bold text-blue-600">4.</span>
							<span>
								Complete final paperwork and welcome your new family member!
							</span>
						</li>
					</ol>
				</CardContent>
			</Card>

			{/* Adoption Dialog */}
			<AdoptionDialog
				petId={pet.id}
				petName={pet.name}
				isOpen={isAdoptionDialogOpen}
				onClose={() => setIsAdoptionDialogOpen(false)}
			/>
		</div>
	);
}
