import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAddPet, useEditPet, usePet } from "./hooks/usePets";

interface PetFormValues {
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	medicalNotes?: string;
}

interface PetFormProps {
	petId?: string; // If provided, it's edit mode
	onCancelEdit?: () => void;
}

const PetForm = ({ petId, onCancelEdit }: PetFormProps) => {
	const navigate = useNavigate();
	const isEditMode = !!petId;

	// Hooks
	const {
		data: existingPet,
		isLoading: isLoadingPet,
		isError: isErrorPet,
	} = usePet(petId);
	const { mutate: addPet, isPending: isAdding } = useAddPet();
	const { mutate: editPet, isPending: isEditing } = useEditPet(petId || "");

	const isPending = isAdding || isEditing;

	const form = useForm<PetFormValues>({
		defaultValues: {
			name: "",
			species: "",
			breed: "",
			age: 0,
			imageUrl: "",
			weight: undefined,
			color: "",
			medicalNotes: "",
		},
	});

	// Populate form with existing pet data in edit mode
	useEffect(() => {
		if (isEditMode && existingPet) {
			form.reset({
				name: existingPet.name,
				species: existingPet.species,
				breed: existingPet.breed,
				age: existingPet.age,
				imageUrl: existingPet.imageUrl || "",
				weight: existingPet.weight,
				color: existingPet.color || "",
				medicalNotes: existingPet.medicalNotes || "",
			});
		}
	}, [existingPet, isEditMode, form]);

	const onSubmit = (data: PetFormValues) => {
		// Clean up empty optional fields
		const cleanData = {
			...data,
			imageUrl: data.imageUrl || undefined,
			weight: data.weight || undefined,
			color: data.color || undefined,
			medicalNotes: data.medicalNotes || undefined,
		};

		if (isEditMode) {
			editPet(cleanData, {
				onSuccess: () => {
					toast.success("Pet updated successfully!");
					navigate({ to: "/pets" });
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : "Failed to update pet",
					);
				},
			});
		} else {
			addPet(cleanData, {
				onSuccess: () => {
					toast.success("Pet added successfully!");
					navigate({ to: "/pets" });
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : "Failed to add pet",
					);
				},
			});
		}
	};

	// Loading state for edit mode
	if (isEditMode && isLoadingPet) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-2xl">
				<Skeleton className="h-10 w-32 mb-4" />
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64 mt-2" />
					</CardHeader>
					<CardContent className="space-y-4">
						{[1, 2, 3, 4, 5].map((n) => (
							<Skeleton key={n} className="h-10 w-full" />
						))}
					</CardContent>
				</Card>
			</div>
		);
	}

	// Error state for edit mode
	if (isEditMode && isErrorPet) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-2xl">
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
						Failed to load pet data. Please try again.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4 max-w-2xl">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={() => {
					if (isEditMode) {
						onCancelEdit?.();
					} else {
						navigate({ to: "/pets" });
					}
				}}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Pets
			</Button>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle>{isEditMode ? "Edit Pet" : "Add New Pet"}</CardTitle>
					<CardDescription>
						{isEditMode
							? "Update your pet's information"
							: "Register a new pet to your account"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Pet Name */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pet Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="Max, Luna, Charlie..."
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Species & Breed Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="species"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Species *</FormLabel>
											<FormControl>
												<Input
													placeholder="Dog, Cat, Bird..."
													required
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="breed"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Breed *</FormLabel>
											<FormControl>
												<Input
													placeholder="Golden Retriever, Persian..."
													required
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Age & Weight Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="age"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Age (years) *</FormLabel>
											<FormControl>
												<Input type="number" min="0" required {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="weight"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Weight (kg)</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="0.1" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Color */}
							<FormField
								control={form.control}
								name="color"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Color</FormLabel>
										<FormControl>
											<Input placeholder="Brown, White, Black..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Image URL */}
							<FormField
								control={form.control}
								name="imageUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Image URL</FormLabel>
										<FormControl>
											<Input
												type="url"
												placeholder="https://example.com/pet-image.jpg"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Provide a URL to your pet's photo
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Medical Notes */}
							<FormField
								control={form.control}
								name="medicalNotes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Medical Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Any allergies, medications, or health conditions..."
												className="resize-none"
												rows={4}
												maxLength={500}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optional medical information (max 500 characters)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Submit Buttons */}
							<div className="flex gap-4 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (isEditMode) {
											onCancelEdit?.();
										} else {
											navigate({ to: "/pets" });
										}
									}}
									disabled={isPending}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isPending} className="flex-1">
									{isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isPending
										? isEditMode
											? "Updating..."
											: "Adding..."
										: isEditMode
											? "Update Pet"
											: "Add Pet"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default PetForm;
