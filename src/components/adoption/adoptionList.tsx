import { Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import type { AdoptablePet } from "./hooks/useAdoption";

interface AdoptablePetCardProps {
	pet: AdoptablePet;
	onViewDetails: (petId: string) => void;
}

export const AdoptablePetCard = ({
	pet,
	onViewDetails,
}: AdoptablePetCardProps) => {
	return (
		<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
			{/* Pet Image */}
			<div className="relative h-48 w-full overflow-hidden bg-gray-200">
				{pet.imageUrl ? (
					<img
						src={pet.imageUrl}
						alt={pet.name}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
						<span className="text-4xl">🐾</span>
					</div>
				)}

				{/* Status Badge */}
				<div className="absolute top-2 right-2">
					<Badge
						variant={
							pet.adoptionStatus === "available" ? "default" : "secondary"
						}
					>
						{pet.adoptionStatus}
					</Badge>
				</div>
			</div>

			<CardContent className="p-4">
				{/* Pet Name & Species */}
				<div className="mb-2">
					<h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
					<p className="text-sm text-gray-600">
						{pet.breed} • {pet.species}
					</p>
				</div>

				{/* Pet Details */}
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<Calendar className="h-4 w-4" />
						<span>
							{pet.age} {pet.age === 1 ? "year" : "years"} old
						</span>
					</div>

					{pet.adoptionFee !== undefined && (
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<DollarSign className="h-4 w-4" />
							<span className="font-semibold text-gray-900">
								${pet.adoptionFee} adoption fee
							</span>
						</div>
					)}
				</div>

				{/* Description Preview */}
				{pet.description && (
					<p className="mt-3 text-sm text-gray-600 line-clamp-2">
						{pet.description}
					</p>
				)}
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button
					className="w-full"
					onClick={() => onViewDetails(pet.id)}
					disabled={pet.adoptionStatus !== "available"}
				>
					{pet.adoptionStatus === "available"
						? "View Details"
						: "Not Available"}
				</Button>
			</CardFooter>
		</Card>
	);
};

export const AdoptablePetCardSkeleton = () => {
	return (
		<Card className="overflow-hidden">
			<Skeleton className="h-48 w-full" />
			<CardContent className="p-4 space-y-3">
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
			</CardContent>
			<CardFooter className="p-4 pt-0">
				<Skeleton className="h-10 w-full" />
			</CardFooter>
		</Card>
	);
};
