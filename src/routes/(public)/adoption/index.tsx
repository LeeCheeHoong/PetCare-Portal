import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
	AdoptablePetCard,
	AdoptablePetCardSkeleton,
} from "@/components/adoption/adoptionList";
import { useAdoptablePets } from "@/components/adoption/hooks/useAdoption";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/(public)/adoption/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [speciesFilter, setSpeciesFilter] = useState<string | undefined>(
		undefined,
	);
	const limit = 9;

	const { data, isLoading, isError, error } = useAdoptablePets({
		page,
		limit,
		species: speciesFilter,
		status: "available",
	});

	const handleViewDetails = (petId: string) => {
		navigate({ to: `/adoption/${petId}` });
	};

	const handlePreviousPage = () => {
		setPage((prev) => Math.max(1, prev - 1));
	};

	const handleNextPage = () => {
		if (data?.pagination.totalPages) {
			setPage((prev) => Math.min(data.pagination.totalPages, prev + 1));
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					Adoption Corner 🐾
				</h1>
				<p className="text-gray-600">
					Find your perfect companion and give them a loving home
				</p>
			</div>
			{/* Filters */}
			<div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
				<div className="flex items-center gap-2">
					<label htmlFor="species-filter" className="text-sm font-medium">
						Filter by species:
					</label>
					<Select
						value={speciesFilter || "all"}
						onValueChange={(value) => {
							setSpeciesFilter(value === "all" ? undefined : value);
							setPage(1); // Reset to first page on filter change
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="All species" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All species</SelectItem>
							<SelectItem value="dog">Dogs</SelectItem>
							<SelectItem value="cat">Cats</SelectItem>
							<SelectItem value="bird">Birds</SelectItem>
							<SelectItem value="rabbit">Rabbits</SelectItem>
							<SelectItem value="other">Other</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{data && (
					<div className="text-sm text-gray-600">
						Showing {data.pets.length} of {data.pagination.total} pets
					</div>
				)}
			</div>
			{/* Error State */}
			{isError && (
				<Alert variant="destructive" className="mb-6">
					<AlertDescription>
						{error instanceof Error
							? error.message
							: "Failed to load adoptable pets"}
					</AlertDescription>
				</Alert>
			)}
			{/* Pet Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				{isLoading ? (
					// Loading skeletons
					Array.from({ length: limit }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: allow
						<AdoptablePetCardSkeleton key={index} />
					))
				) : data?.pets.length === 0 ? (
					// Empty state
					<div className="col-span-full text-center py-12">
						<p className="text-xl text-gray-600 mb-2">No pets available</p>
						<p className="text-gray-500">
							{speciesFilter
								? "Try adjusting your filters"
								: "Check back soon for new arrivals"}
						</p>
					</div>
				) : (
					// Pet cards
					data?.pets.map((pet) => (
						<AdoptablePetCard
							key={pet.id}
							pet={pet}
							onViewDetails={handleViewDetails}
						/>
					))
				)}
			</div>
			{/* Pagination */}
			{data && data.pagination.totalPages > 1 && (
				<div className="flex justify-center items-center gap-4">
					<Button
						variant="outline"
						onClick={handlePreviousPage}
						disabled={page === 1}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>

					<span className="text-sm text-gray-600">
						Page {page} of {data.pagination.totalPages}
					</span>

					<Button
						variant="outline"
						onClick={handleNextPage}
						disabled={page === data.pagination.totalPages}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			)}
		</div>
	);
}
