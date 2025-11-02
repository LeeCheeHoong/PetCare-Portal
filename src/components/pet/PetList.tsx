import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { useState } from "react";
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
import { usePets } from "./hooks/usePets";

const PetList = () => {
	const [page, setPage] = useState(1);
	const limit = 9; // Pets per page

	const { data, isLoading, isError, error } = usePets({
		page,
		limit,
	});

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

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3].map((n) => (
						<Card key={n}>
							<CardHeader>
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-32 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					{error instanceof Error ? error.message : "Failed to load pets"}
				</AlertDescription>
			</Alert>
		);
	}

	// Empty state
	if (!data?.pets || data.pets.length === 0) {
		return (
			<Card className="w-full">
				<CardContent className="flex flex-col items-center justify-center py-10">
					<PawPrint className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground text-center">
						You don't have any pets registered yet.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with total count */}
			<div className="flex justify-between items-center">
				<p className="ml-auto text-sm text-muted-foreground">
					Page {data?.pagination.page} of {data?.pagination.totalPages}
				</p>
			</div>

			{/* Pet Cards Grid */}
			<div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
				{data?.pets.map((pet) => (
					<Link key={pet.id} to="/pets/$petId" params={{ petId: pet.id }}>
						<Card
							key={pet.id}
							className="overflow-hidden hover:shadow-lg transition-shadow"
						>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>{pet.name}</CardTitle>
										<CardDescription>
											{pet.breed} • {pet.age} {pet.age === 1 ? "year" : "years"}{" "}
											old
										</CardDescription>
									</div>
									<Badge variant={getStatusVariant(pet.status)}>
										{pet.status}
									</Badge>
								</div>
							</CardHeader>

							<CardContent>
								{pet.imageUrl ? (
									<img
										src={pet.imageUrl}
										alt={pet.name}
										className="w-full h-48 object-cover rounded-md mb-4"
									/>
								) : (
									<div className="w-full h-48 bg-muted rounded-md flex items-center justify-center mb-4">
										<PawPrint className="h-12 w-12 text-muted-foreground" />
									</div>
								)}

								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Species:</span>
										<span className="font-medium capitalize">
											{pet.species}
										</span>
									</div>

									{pet.weight && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Weight:</span>
											<span className="font-medium">{pet.weight} kg</span>
										</div>
									)}

									{pet.color && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Color:</span>
											<span className="font-medium">{pet.color}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{/* Pagination Controls */}
			{data?.pagination.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 pt-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((old) => Math.max(old - 1, 1))}
						disabled={page === 1}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>

					<div className="flex items-center gap-1">
						{Array.from(
							{ length: data?.pagination.totalPages },
							(_, i) => i + 1,
						).map((pageNum) => (
							<Button
								key={pageNum}
								variant={pageNum === page ? "default" : "outline"}
								size="sm"
								onClick={() => setPage(pageNum)}
								className="w-10"
							>
								{pageNum}
							</Button>
						))}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((old) => Math.min(old + 1, data?.pagination.totalPages))
						}
						disabled={page === data?.pagination.totalPages}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			)}
		</div>
	);
};

export default PetList;
