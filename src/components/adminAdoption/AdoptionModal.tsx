"use client";

import { formatDistanceToNow } from "date-fns";
import {
	CheckCircle2,
	Clock,
	Home,
	Loader2,
	Mail,
	MapPin,
	PawPrint,
	Phone,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	type AdoptionApplication,
	useAdminAdoptionApplication,
	useReviewAdoptionApplication,
} from "./hooks/useAdoption";

interface ApplicationReviewModalProps {
	applicationId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

export const ApplicationReviewModal = ({
	applicationId,
	isOpen,
	onClose,
}: ApplicationReviewModalProps) => {
	const [adminNotes, setAdminNotes] = useState("");
	const [reviewAction, setReviewAction] = useState<
		"approved" | "rejected" | null
	>(null);
	const [showSuccess, setShowSuccess] = useState(false);

	// Fetch application details
	const {
		data: application,
		isLoading,
		isError,
	} = useAdminAdoptionApplication(applicationId || undefined);

	// Review mutation
	const { mutateAsync: reviewApplication, isPending } =
		useReviewAdoptionApplication(applicationId || "");

	const handleReview = async (status: "approved" | "rejected") => {
		if (!applicationId) return;

		try {
			setReviewAction(status);
			await reviewApplication({
				status,
				adminNotes: adminNotes.trim() || undefined,
			});

			setShowSuccess(true);

			// Close after showing success
			setTimeout(() => {
				setShowSuccess(false);
				setAdminNotes("");
				setReviewAction(null);
				onClose();
			}, 2000);
		} catch (error) {
			setReviewAction(null);
			// Error is handled by the mutation
		}
	};

	const handleClose = () => {
		if (!isPending) {
			setAdminNotes("");
			setReviewAction(null);
			setShowSuccess(false);
			onClose();
		}
	};

	// Status badge
	const getStatusBadge = (status: AdoptionApplication["status"]) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="outline" className="bg-yellow-50 text-yellow-700">
						<Clock className="w-3 h-3 mr-1" />
						Pending Review
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

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
				{showSuccess ? (
					// Success State
					<div className="flex flex-col items-center justify-center py-12">
						{reviewAction === "approved" ? (
							<>
								<CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									Application Approved! ✓
								</h3>
								<p className="text-gray-600 text-center max-w-md">
									The applicant will be notified about the approval.
								</p>
							</>
						) : (
							<>
								<XCircle className="h-20 w-20 text-red-500 mb-4" />
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									Application Rejected
								</h3>
								<p className="text-gray-600 text-center max-w-md">
									The applicant will be notified about this decision.
								</p>
							</>
						)}
					</div>
				) : isLoading ? (
					// Loading State
					<div className="flex flex-col items-center justify-center py-12">
						<Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
						<p className="text-gray-600">Loading application details...</p>
					</div>
				) : isError || !application ? (
					// Error State
					<div className="flex flex-col items-center justify-center py-12">
						<XCircle className="h-12 w-12 text-red-500 mb-4" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Failed to Load Application
						</h3>
						<p className="text-gray-600 mb-4">
							Unable to retrieve application details
						</p>
						<Button onClick={handleClose}>Close</Button>
					</div>
				) : (
					<>
						<DialogHeader>
							<div className="flex items-start justify-between">
								<div>
									<DialogTitle className="text-2xl">
										Adoption Application
									</DialogTitle>
									<DialogDescription className="mt-1">
										Review application for {application.pet.name}
									</DialogDescription>
								</div>
								{getStatusBadge(application.status)}
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Pet Information */}
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-900 flex items-center">
									<PawPrint className="w-4 h-4 mr-2" />
									Pet Details
								</h3>
								<div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
									{application.pet.imageUrl ? (
										<img
											src={application.pet.imageUrl}
											alt={application.pet.name}
											className="w-16 h-16 rounded-lg object-cover"
										/>
									) : (
										<div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
											<PawPrint className="w-8 h-8 text-gray-400" />
										</div>
									)}
									<div className="flex-1">
										<h4 className="font-semibold text-gray-900">
											{application.pet.name}
										</h4>
										<p className="text-sm text-gray-600">
											{application.pet.species} • {application.pet.breed} •{" "}
											{application.pet.age} years old
										</p>
										{application.pet.adoptionFee && (
											<p className="text-sm font-medium text-gray-900 mt-1">
												Adoption Fee: ${application.pet.adoptionFee}
											</p>
										)}
									</div>
								</div>
							</div>

							<Separator />

							{/* Applicant Information */}
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-900 flex items-center">
									<User className="w-4 h-4 mr-2" />
									Applicant Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-1">
										<Label className="text-xs text-gray-500">Full Name</Label>
										<p className="text-sm font-medium text-gray-900">
											{application.adopterName}
										</p>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-gray-500 flex items-center">
											<Mail className="w-3 h-3 mr-1" />
											Email
										</Label>
										<p className="text-sm font-medium text-gray-900">
											{application.adopterEmail}
										</p>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-gray-500 flex items-center">
											<Phone className="w-3 h-3 mr-1" />
											Phone
										</Label>
										<p className="text-sm font-medium text-gray-900">
											{application.adopterPhone}
										</p>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-gray-500 flex items-center">
											<MapPin className="w-3 h-3 mr-1" />
											Address
										</Label>
										<p className="text-sm font-medium text-gray-900">
											{application.adopterAddress}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Living Situation */}
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-900 flex items-center">
									<Home className="w-4 h-4 mr-2" />
									Living Situation
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="space-y-1">
										<Label className="text-xs text-gray-500">Home Type</Label>
										<p className="text-sm font-medium text-gray-900 capitalize">
											{application.homeType}
										</p>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-gray-500">Has Yard</Label>
										<p className="text-sm font-medium text-gray-900">
											{application.hasYard ? "Yes" : "No"}
										</p>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-gray-500">Other Pets</Label>
										<p className="text-sm font-medium text-gray-900">
											{application.hasOtherPets ? "Yes" : "No"}
										</p>
									</div>
								</div>

								{application.hasOtherPets && application.otherPetsDetails && (
									<div className="bg-blue-50 rounded-lg p-3 mt-2">
										<Label className="text-xs text-blue-700 font-semibold">
											Other Pets Details
										</Label>
										<p className="text-sm text-blue-900 mt-1">
											{application.otherPetsDetails}
										</p>
									</div>
								)}
							</div>

							<Separator />

							{/* Experience & Motivation */}
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-900">
									Experience & Motivation
								</h3>

								<div className="space-y-1">
									<Label className="text-xs text-gray-500">
										Pet Ownership Experience
									</Label>
									<Badge variant="secondary" className="mt-1">
										{application.petExperience === "none" && "First-time owner"}
										{application.petExperience === "some" && "Some experience"}
										{application.petExperience === "extensive" &&
											"Very experienced"}
									</Badge>
								</div>

								<div className="bg-purple-50 rounded-lg p-4 mt-2">
									<Label className="text-xs text-purple-700 font-semibold">
										Why they want to adopt {application.pet.name}
									</Label>
									<p className="text-sm text-purple-900 mt-2 leading-relaxed">
										{application.reasonForAdoption}
									</p>
								</div>

								{application.notes && (
									<div className="bg-gray-50 rounded-lg p-4 mt-2">
										<Label className="text-xs text-gray-700 font-semibold">
											Additional Notes
										</Label>
										<p className="text-sm text-gray-900 mt-2 leading-relaxed">
											{application.notes}
										</p>
									</div>
								)}
							</div>

							{/* Previous Review (if exists) */}
							{application.status !== "pending" && (
								<>
									<Separator />
									<div className="space-y-3">
										<h3 className="text-sm font-semibold text-gray-900">
											Review History
										</h3>
										<div className="bg-gray-50 rounded-lg p-4">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs text-gray-500">
													Reviewed{" "}
													{application.reviewedAt &&
														formatDistanceToNow(
															new Date(application.reviewedAt),
															{
																addSuffix: true,
															},
														)}
												</span>
												{application.reviewedBy && (
													<span className="text-xs text-gray-500">
														by {application.reviewedBy}
													</span>
												)}
											</div>
											{application.adminNotes && (
												<p className="text-sm text-gray-700">
													{application.adminNotes}
												</p>
											)}
										</div>
									</div>
								</>
							)}

							{/* Admin Notes Section (for pending applications) */}
							{application.status === "pending" && (
								<>
									<Separator />
									<div className="space-y-3">
										<Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
										<Textarea
											placeholder="Add any notes about this decision (visible to the applicant)..."
											value={adminNotes}
											onChange={(e) => setAdminNotes(e.target.value)}
											rows={4}
											disabled={isPending}
										/>
									</div>
								</>
							)}

							{/* Submission Info */}
							<div className="flex items-center text-xs text-gray-500">
								<Clock className="w-3 h-3 mr-1" />
								Submitted{" "}
								{formatDistanceToNow(new Date(application.createdAt), {
									addSuffix: true,
								})}
							</div>
						</div>

						{/* Actions */}
						<div className="flex justify-end space-x-3 pt-4 border-t">
							<Button
								variant="outline"
								onClick={handleClose}
								disabled={isPending}
							>
								Close
							</Button>

							{application.status === "pending" && (
								<>
									<Button
										variant="destructive"
										onClick={() => handleReview("rejected")}
										disabled={isPending}
									>
										{isPending && reviewAction === "rejected" ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Rejecting...
											</>
										) : (
											<>
												<XCircle className="mr-2 h-4 w-4" />
												Reject
											</>
										)}
									</Button>

									<Button
										onClick={() => handleReview("approved")}
										disabled={isPending}
										className="bg-green-600 hover:bg-green-700"
									>
										{isPending && reviewAction === "approved" ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Approving...
											</>
										) : (
											<>
												<CheckCircle2 className="mr-2 h-4 w-4" />
												Approve
											</>
										)}
									</Button>
								</>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
