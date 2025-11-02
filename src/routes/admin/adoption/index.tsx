import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Label } from "recharts";
import {
	useAdminAdoptablePets,
	useDeleteAdoptablePet,
} from "@/components/adminAdoption/hooks/useAdoption";
import type { AdoptablePet } from "@/components/adoption/hooks/useAdoption";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/adoption/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<
		"available" | "pending" | "adopted" | "all"
	>("all");
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	const limit = 10;

	const { data, isLoading, isError, error } = useAdminAdoptablePets({
		page,
		limit,
		status: statusFilter,
	});

	const deleteMutation = useDeleteAdoptablePet();

	const handleDelete = async (petId: string) => {
		try {
			await deleteMutation.mutateAsync(petId);
			setDeleteConfirm(null);
		} catch (error) {
			// Error handled by mutation
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "available":
				return "default";
			case "pending":
				return "secondary";
			case "adopted":
				return "outline";
			default:
				return "secondary";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-3xl font-bold text-gray-900">
						Manage Adoptable Pets
					</h2>
					<p className="text-gray-600 mt-1">
						Add, edit, and manage pets available for adoption
					</p>
				</div>
				<Button onClick={() => navigate({ to: "/admin/adoption/new" })}>
					<Plus className="h-4 w-4 mr-2" />
					Add New Pet
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">Status:</Label>
					<Select
						value={statusFilter}
						onValueChange={(value: any) => {
							setStatusFilter(value);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="available">Available</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="adopted">Adopted</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{data && (
					<div className="text-sm text-gray-600">
						{data.pagination.total} total pets
					</div>
				)}
			</div>

			{/* Error State */}
			{isError && (
				<Alert variant="destructive">
					<AlertDescription>
						{error instanceof Error ? error.message : "Failed to load pets"}
					</AlertDescription>
				</Alert>
			)}

			{/* Table */}
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[80px]">Image</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Species</TableHead>
							<TableHead>Breed</TableHead>
							<TableHead>Age</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Fee</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							// Loading skeletons
							Array.from({ length: 5 }).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: allow
								<TableRow key={index}>
									<TableCell>
										<Skeleton className="h-12 w-12 rounded" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-12" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-12" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-24 ml-auto" />
									</TableCell>
								</TableRow>
							))
						) : data?.pets.length === 0 ? (
							// Empty state
							<TableRow>
								<TableCell
									colSpan={8}
									className="text-center py-8 text-gray-500"
								>
									No pets found. Click "Add New Pet" to get started.
								</TableCell>
							</TableRow>
						) : (
							// Data rows
							data?.pets.map((pet: AdoptablePet) => (
								<TableRow key={pet.id}>
									<TableCell>
										<div className="h-12 w-12 rounded overflow-hidden bg-gray-100">
											{pet.imageUrl ? (
												<img
													src={pet.imageUrl}
													alt={pet.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="h-full w-full flex items-center justify-center text-xl">
													🐾
												</div>
											)}
										</div>
									</TableCell>
									<TableCell className="font-medium">{pet.name}</TableCell>
									<TableCell className="capitalize">{pet.species}</TableCell>
									<TableCell>{pet.breed}</TableCell>
									<TableCell>{pet.age}y</TableCell>
									<TableCell>
										<Badge variant={getStatusBadgeVariant(pet.adoptionStatus)}>
											{pet.adoptionStatus}
										</Badge>
									</TableCell>
									<TableCell>
										{pet.adoptionFee !== undefined
											? `$${pet.adoptionFee}`
											: "—"}
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													navigate({
														to: `/admin/adoption/$petId/edit`,
														params: { petId: pet.id },
													})
												}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setDeleteConfirm(pet.id)}
												className="text-red-600 hover:text-red-700 hover:bg-red-50"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{data && data.pagination.totalPages > 1 && (
				<div className="flex justify-center items-center gap-4">
					<Button
						variant="outline"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
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
						onClick={() =>
							setPage((p) => Math.min(data.pagination.totalPages, p + 1))
						}
						disabled={page === data.pagination.totalPages}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deleteConfirm}
				onOpenChange={() => setDeleteConfirm(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this pet from the adoption system.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
