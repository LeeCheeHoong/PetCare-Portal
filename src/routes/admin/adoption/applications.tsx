import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
	CheckCircle2,
	Clock,
	Eye,
	Filter,
	Search,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { ApplicationReviewModal } from "@/components/adminAdoption/AdoptionModal";
import {
	type AdoptionApplication,
	useAdminAdoptionApplications,
} from "@/components/adminAdoption/hooks/useAdoption";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/admin/adoption/applications")({
	component: RouteComponent,
});

function RouteComponent() {
	// Filters & Pagination
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "approved" | "rejected"
	>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedApplicationId, setSelectedApplicationId] = useState<
		string | null
	>(null);

	// Fetch applications
	const { data, isLoading, isError, error } = useAdminAdoptionApplications({
		page: currentPage,
		limit: 10,
		status: statusFilter,
	});

	// Filter by search query (client-side for pet name or adopter name)
	const filteredApplications = data?.applications.filter((app) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			app.pet.name.toLowerCase().includes(query) ||
			app.adopterName.toLowerCase().includes(query) ||
			app.adopterEmail.toLowerCase().includes(query)
		);
	});

	// Status badge styling
	const getStatusBadge = (status: AdoptionApplication["status"]) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="outline" className="bg-yellow-50 text-yellow-700">
						<Clock className="w-3 h-3 mr-1" />
						Pending
					</Badge>
				);
			case "approved":
				return (
					<Badge variant="outline" className="bg-green-50 text-green-700">
						<CheckCircle2 className="w-3 h-3 mr-1" />
						Approved
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="outline" className="bg-red-50 text-red-700">
						<XCircle className="w-3 h-3 mr-1" />
						Rejected
					</Badge>
				);
		}
	};

	// Stats Summary
	const stats = {
		total: data?.pagination.total || 0,
		pending:
			data?.applications.filter((app) => app.status === "pending").length || 0,
		approved:
			data?.applications.filter((app) => app.status === "approved").length || 0,
		rejected:
			data?.applications.filter((app) => app.status === "rejected").length || 0,
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Adoption Applications
				</h1>
				<p className="text-gray-600 mt-1">
					Review and manage pet adoption applications
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Total Applications
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Pending Review
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{stats.pending}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Approved
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{stats.approved}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Rejected
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{stats.rejected}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col md:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search by pet name, adopter name, or email..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						{/* Status Filter */}
						<div className="w-full md:w-48">
							<Select
								value={statusFilter}
								onValueChange={(value: typeof statusFilter) => {
									setStatusFilter(value);
									setCurrentPage(1); // Reset to first page
								}}
							>
								<SelectTrigger>
									<Filter className="w-4 h-4 mr-2" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="approved">Approved</SelectItem>
									<SelectItem value="rejected">Rejected</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Applications Table */}
			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						// Loading State
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : isError ? (
						// Error State
						<div className="text-center py-12">
							<XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Failed to Load Applications
							</h3>
							<p className="text-gray-600 mb-4">
								{error instanceof Error
									? error.message
									: "Something went wrong"}
							</p>
							<Button onClick={() => window.location.reload()}>
								Try Again
							</Button>
						</div>
					) : !filteredApplications || filteredApplications.length === 0 ? (
						// Empty State
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Filter className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								No Applications Found
							</h3>
							<p className="text-gray-600">
								{searchQuery
									? "Try adjusting your search query"
									: "No adoption applications match your current filters"}
							</p>
						</div>
					) : (
						// Table Content
						<>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Pet</TableHead>
											<TableHead>Applicant</TableHead>
											<TableHead>Contact</TableHead>
											<TableHead>Experience</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Submitted</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredApplications.map((application) => (
											<TableRow key={application.id}>
												{/* Pet */}
												<TableCell>
													<div className="flex items-center space-x-3">
														{application.pet.imageUrl ? (
															<img
																src={application.pet.imageUrl}
																alt={application.pet.name}
																className="w-10 h-10 rounded-full object-cover"
															/>
														) : (
															<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
																<span className="text-gray-500 text-xs font-medium">
																	{application.pet.name[0]}
																</span>
															</div>
														)}
														<div>
															<div className="font-medium text-gray-900">
																{application.pet.name}
															</div>
															<div className="text-sm text-gray-500">
																{application.pet.species} •{" "}
																{application.pet.breed}
															</div>
														</div>
													</div>
												</TableCell>

												{/* Applicant */}
												<TableCell>
													<div>
														<div className="font-medium text-gray-900">
															{application.adopterName}
														</div>
														<div className="text-sm text-gray-500">
															{application.homeType}
															{application.hasYard && " • Has yard"}
														</div>
													</div>
												</TableCell>

												{/* Contact */}
												<TableCell>
													<div className="text-sm">
														<div className="text-gray-900">
															{application.adopterEmail}
														</div>
														<div className="text-gray-500">
															{application.adopterPhone}
														</div>
													</div>
												</TableCell>

												{/* Experience */}
												<TableCell>
													<Badge variant="secondary">
														{application.petExperience === "none" &&
															"First-timer"}
														{application.petExperience === "some" &&
															"Some experience"}
														{application.petExperience === "extensive" &&
															"Very experienced"}
													</Badge>
												</TableCell>

												{/* Status */}
												<TableCell>
													{getStatusBadge(application.status)}
												</TableCell>

												{/* Submitted */}
												<TableCell className="text-sm text-gray-600">
													{formatDistanceToNow(
														new Date(application.createdAt),
														{
															addSuffix: true,
														},
													)}
												</TableCell>

												{/* Actions */}
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															setSelectedApplicationId(application.id)
														}
													>
														<Eye className="w-4 h-4 mr-2" />
														View Details
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							{data && data.pagination.totalPages > 1 && (
								<div className="flex items-center justify-between mt-6 pt-6 border-t">
									<div className="text-sm text-gray-600">
										Showing {(currentPage - 1) * 10 + 1} to{" "}
										{Math.min(currentPage * 10, data.pagination.total)} of{" "}
										{data.pagination.total} applications
									</div>

									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
										>
											Previous
										</Button>

										{/* Page Numbers */}
										<div className="flex gap-1">
											{[...Array(data.pagination.totalPages)].map((_, idx) => {
												const page = idx + 1;
												// Show first, last, current, and pages around current
												if (
													page === 1 ||
													page === data.pagination.totalPages ||
													(page >= currentPage - 1 && page <= currentPage + 1)
												) {
													return (
														<Button
															key={page}
															variant={
																page === currentPage ? "default" : "outline"
															}
															size="sm"
															onClick={() => setCurrentPage(page)}
														>
															{page}
														</Button>
													);
												} else if (
													page === currentPage - 2 ||
													page === currentPage + 2
												) {
													return (
														<span key={page} className="px-2 py-1">
															...
														</span>
													);
												}
												return null;
											})}
										</div>

										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setCurrentPage((p) =>
													Math.min(data.pagination.totalPages, p + 1),
												)
											}
											disabled={currentPage === data.pagination.totalPages}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<ApplicationReviewModal
				applicationId={selectedApplicationId}
				isOpen={!!selectedApplicationId}
				onClose={() => setSelectedApplicationId(null)}
			/>
		</div>
	);
}
