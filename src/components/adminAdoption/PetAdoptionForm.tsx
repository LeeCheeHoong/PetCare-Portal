import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAdoptablePet } from "../adoption/hooks/useAdoption";
import { useAddAdoptablePet, useEditAdoptablePet } from "./hooks/useAdoption";

interface AdoptablePetFormProps {
	petId?: string; // If provided, edit mode; otherwise, create mode
}

interface FormData {
	name: string;
	species: string;
	breed: string;
	age: string;
	imageUrl: string;
	weight: string;
	color: string;
	description: string;
	adoptionFee: string;
	adoptionStatus: "available" | "pending" | "adopted";
}

interface FormErrors {
	name?: string;
	species?: string;
	breed?: string;
	age?: string;
	adoptionFee?: string;
}

const initialFormData: FormData = {
	name: "",
	species: "",
	breed: "",
	age: "",
	imageUrl: "",
	weight: "",
	color: "",
	description: "",
	adoptionFee: "",
	adoptionStatus: "available",
};

export const AdoptablePetForm = ({ petId }: AdoptablePetFormProps) => {
	const navigate = useNavigate();
	const isEditMode = !!petId;

	// Form state
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [errors, setErrors] = useState<FormErrors>({});

	// Fetch existing pet data if in edit mode
	const { data: existingPet, isLoading: isLoadingPet } = useAdoptablePet(petId);

	// Mutations
	const createMutation = useAddAdoptablePet();
	const updateMutation = useEditAdoptablePet(petId || "");

	// Populate form with existing data in edit mode
	useEffect(() => {
		if (existingPet && isEditMode) {
			setFormData({
				name: existingPet.name,
				species: existingPet.species,
				breed: existingPet.breed,
				age: existingPet.age.toString(),
				imageUrl: existingPet.imageUrl || "",
				weight: existingPet.weight?.toString() || "",
				color: existingPet.color || "",
				description: existingPet.description || "",
				adoptionFee: existingPet.adoptionFee?.toString() || "",
				adoptionStatus: existingPet.adoptionStatus,
			});
		}
	}, [existingPet, isEditMode]);

	// Handle input changes
	const handleChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field
		if (errors[field as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	// Validate form
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.species.trim()) {
			newErrors.species = "Species is required";
		}

		if (!formData.breed.trim()) {
			newErrors.breed = "Breed is required";
		}

		const age = parseInt(formData.age);
		if (!formData.age || Number.isNaN(age) || age < 0) {
			newErrors.age = "Valid age is required";
		}

		if (
			formData.adoptionFee &&
			Number.isNaN(parseFloat(formData.adoptionFee))
		) {
			newErrors.adoptionFee = "Adoption fee must be a valid number";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Prepare data for API
		const petData = {
			name: formData.name.trim(),
			species: formData.species.trim(),
			breed: formData.breed.trim(),
			age: parseInt(formData.age),
			imageUrl: formData.imageUrl.trim() || undefined,
			weight: formData.weight ? parseFloat(formData.weight) : undefined,
			color: formData.color.trim() || undefined,
			description: formData.description.trim() || undefined,
			adoptionFee: formData.adoptionFee
				? parseFloat(formData.adoptionFee)
				: undefined,
			adoptionStatus: formData.adoptionStatus,
		};

		try {
			if (isEditMode) {
				await updateMutation.mutateAsync(petData);
			} else {
				await createMutation.mutateAsync(petData);
			}
			// Navigate back to list on success
			navigate({ to: "/admin/adoption" });
		} catch (error) {
			// Error handled by mutation
		}
	};

	const mutation = isEditMode ? updateMutation : createMutation;
	const isSubmitting = mutation.isPending;

	// Loading state for edit mode
	if (isEditMode && isLoadingPet) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						{Array.from({ length: 8 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: allow
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/admin/adoption" })}
					disabled={isSubmitting}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<h2 className="text-3xl font-bold text-gray-900">
					{isEditMode ? "Edit Pet" : "Add New Pet"}
				</h2>
			</div>

			{/* Error Alert */}
			{mutation.isError && (
				<Alert variant="destructive">
					<AlertDescription>
						{mutation.error instanceof Error
							? mutation.error.message
							: `Failed to ${isEditMode ? "update" : "create"} pet`}
					</AlertDescription>
				</Alert>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit}>
				<div className="grid gap-6 md:grid-cols-2">
					{/* Left Column - Basic Info */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Name */}
							<div className="space-y-2">
								<Label htmlFor="name">
									Name <span className="text-red-500">*</span>
								</Label>
								<Input
									value={formData.name}
									onChange={(e) => handleChange("name", e.target.value)}
									placeholder="e.g., Max"
									disabled={isSubmitting}
								/>
								{errors.name && (
									<p className="text-sm text-red-600">{errors.name}</p>
								)}
							</div>

							{/* Species */}
							<div className="space-y-2">
								<Label htmlFor="species">
									Species <span className="text-red-500">*</span>
								</Label>
								<Select
									value={formData.species}
									onValueChange={(value) => handleChange("species", value)}
									disabled={isSubmitting}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select species" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="dog">Dog</SelectItem>
										<SelectItem value="cat">Cat</SelectItem>
										<SelectItem value="bird">Bird</SelectItem>
										<SelectItem value="rabbit">Rabbit</SelectItem>
										<SelectItem value="hamster">Hamster</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
								{errors.species && (
									<p className="text-sm text-red-600">{errors.species}</p>
								)}
							</div>

							{/* Breed */}
							<div className="space-y-2">
								<Label htmlFor="breed">
									Breed <span className="text-red-500">*</span>
								</Label>
								<Input
									value={formData.breed}
									onChange={(e) => handleChange("breed", e.target.value)}
									placeholder="e.g., Labrador Retriever"
									disabled={isSubmitting}
								/>
								{errors.breed && (
									<p className="text-sm text-red-600">{errors.breed}</p>
								)}
							</div>

							{/* Age */}
							<div className="space-y-2">
								<Label htmlFor="age">
									Age (years) <span className="text-red-500">*</span>
								</Label>
								<Input
									type="number"
									min="0"
									step="1"
									value={formData.age}
									onChange={(e) => handleChange("age", e.target.value)}
									placeholder="e.g., 3"
									disabled={isSubmitting}
								/>
								{errors.age && (
									<p className="text-sm text-red-600">{errors.age}</p>
								)}
							</div>

							{/* Weight */}
							<div className="space-y-2">
								<Label htmlFor="weight">Weight (lbs)</Label>
								<Input
									type="number"
									min="0"
									step="0.1"
									value={formData.weight}
									onChange={(e) => handleChange("weight", e.target.value)}
									placeholder="e.g., 45.5"
									disabled={isSubmitting}
								/>
							</div>

							{/* Color */}
							<div className="space-y-2">
								<Label htmlFor="color">Color</Label>
								<Input
									value={formData.color}
									onChange={(e) => handleChange("color", e.target.value)}
									placeholder="e.g., Golden Brown"
									disabled={isSubmitting}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Right Column - Additional Info */}
					<div className="space-y-6">
						{/* Adoption Details Card */}
						<Card>
							<CardHeader>
								<CardTitle>Adoption Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Adoption Status */}
								<div className="space-y-2">
									<Label htmlFor="adoptionStatus">Adoption Status</Label>
									<Select
										value={formData.adoptionStatus}
										onValueChange={(value: any) =>
											handleChange("adoptionStatus", value)
										}
										disabled={isSubmitting}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="available">Available</SelectItem>
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="adopted">Adopted</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Adoption Fee */}
								<div className="space-y-2">
									<Label htmlFor="adoptionFee">Adoption Fee ($)</Label>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={formData.adoptionFee}
										onChange={(e) =>
											handleChange("adoptionFee", e.target.value)
										}
										placeholder="e.g., 150.00"
										disabled={isSubmitting}
									/>
									{errors.adoptionFee && (
										<p className="text-sm text-red-600">{errors.adoptionFee}</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Image Card */}
						<Card>
							<CardHeader>
								<CardTitle>Image</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="imageUrl">Image URL</Label>
									<Input
										type="url"
										value={formData.imageUrl}
										onChange={(e) => handleChange("imageUrl", e.target.value)}
										placeholder="https://example.com/pet-image.jpg"
										disabled={isSubmitting}
									/>
								</div>

								{/* Image Preview */}
								{formData.imageUrl && (
									<div className="space-y-2">
										<Label>Preview</Label>
										<div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100">
											<img
												src={formData.imageUrl}
												alt="Preview"
												className="h-full w-full object-cover"
												onError={(e) => {
													e.currentTarget.src = "";
													e.currentTarget.style.display = "none";
												}}
											/>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Description - Full Width */}
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>Description</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="description">About this pet</Label>
							<Textarea
								value={formData.description}
								onChange={(e) => handleChange("description", e.target.value)}
								placeholder="Tell potential adopters about this pet's personality, history, special needs, etc."
								rows={6}
								disabled={isSubmitting}
							/>
							<p className="text-xs text-gray-500">
								This will be displayed on the public adoption page
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Form Actions */}
				<div className="flex justify-end gap-4 mt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/admin/adoption" })}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{isEditMode ? "Updating..." : "Creating..."}
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								{isEditMode ? "Update Pet" : "Create Pet"}
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
};
