import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdoptPet } from "./hooks/useAdoption";

interface AdoptionFormValues {
	// Adopter Information
	adopterName: string;
	adopterEmail: string;
	adopterPhone: string;
	adopterAddress: string;

	// Living Situation
	homeType: "house" | "apartment" | "condo" | "other";
	hasYard: boolean;
	hasOtherPets: boolean;
	otherPetsDetails?: string;

	// Experience & Preferences
	petExperience: "none" | "some" | "extensive";
	reasonForAdoption: string;

	// Additional Notes
	notes?: string;
}

interface AdoptionDialogProps {
	petId: string;
	petName: string;
	isOpen: boolean;
	onClose: () => void;
}

export const AdoptionDialog = ({
	petId,
	petName,
	isOpen,
	onClose,
}: AdoptionDialogProps) => {
	const [showSuccess, setShowSuccess] = useState(false);

	const form = useForm<AdoptionFormValues>({
		defaultValues: {
			adopterName: "",
			adopterEmail: "",
			adopterPhone: "",
			adopterAddress: "",
			homeType: undefined,
			hasYard: false,
			hasOtherPets: false,
			otherPetsDetails: "",
			petExperience: undefined,
			reasonForAdoption: "",
			notes: "",
		},
	});

	const {
		mutateAsync: adopt,
		isPending,
		reset: resetMutation,
		error,
		isError,
	} = useAdoptPet(petId);

	const onSubmit = async (data: AdoptionFormValues) => {
		try {
			await adopt(data);
			setShowSuccess(true);

			// Close dialog after 2 seconds
			setTimeout(() => {
				setShowSuccess(false);
				form.reset();
				onClose();
			}, 2500);
		} catch (error) {
			// Error handled by mutation
		}
	};

	const handleClose = () => {
		if (!isPending) {
			form.reset();
			resetMutation();
			setShowSuccess(false);
			onClose();
		}
	};

	// Watch hasOtherPets to show/hide conditional field
	const hasOtherPets = form.watch("hasOtherPets");

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				{showSuccess ? (
					// Success State
					<div className="flex flex-col items-center justify-center py-12">
						<CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
						<h3 className="text-2xl font-bold text-gray-900 mb-2">
							Application Submitted! 🎉
						</h3>
						<p className="text-gray-600 text-center max-w-md">
							Thank you for your interest in adopting {petName}! We'll review
							your application and contact you within 24-48 hours.
						</p>
					</div>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Adoption Application for {petName}</DialogTitle>
							<DialogDescription>
								Please complete this form so we can find the perfect match. All
								fields marked with * are required.
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6 py-4"
							>
								{/* Personal Information Section */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold text-gray-900">
										Your Information
									</h3>

									<FormField
										control={form.control}
										name="adopterName"
										rules={{
											required: "Name is required",
											minLength: {
												value: 2,
												message: "Name must be at least 2 characters",
											},
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Full Name *</FormLabel>
												<FormControl>
													<Input
														placeholder="John Doe"
														{...field}
														disabled={isPending}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="adopterEmail"
											rules={{
												required: "Email is required",
												pattern: {
													value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
													message: "Please enter a valid email",
												},
											}}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email *</FormLabel>
													<FormControl>
														<Input
															type="email"
															placeholder="john@example.com"
															{...field}
															disabled={isPending}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="adopterPhone"
											rules={{
												required: "Phone number is required",
												minLength: {
													value: 10,
													message: "Please enter a valid phone number",
												},
											}}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone Number *</FormLabel>
													<FormControl>
														<Input
															type="tel"
															placeholder="(555) 123-4567"
															{...field}
															disabled={isPending}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="adopterAddress"
										rules={{
											required: "Address is required",
											minLength: {
												value: 10,
												message: "Please enter your complete address",
											},
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Address *</FormLabel>
												<FormControl>
													<Input
														placeholder="123 Main St, City, State, ZIP"
														{...field}
														disabled={isPending}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Living Situation Section */}
								<div className="space-y-4 pt-4 border-t">
									<h3 className="text-sm font-semibold text-gray-900">
										Living Situation
									</h3>

									<FormField
										control={form.control}
										name="homeType"
										rules={{
											required: "Please select your home type",
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Home Type *</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={isPending}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select your home type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="house">House</SelectItem>
														<SelectItem value="apartment">Apartment</SelectItem>
														<SelectItem value="condo">Condo</SelectItem>
														<SelectItem value="other">Other</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="hasYard"
										render={({ field }) => (
											<FormItem className="space-y-3">
												<FormLabel>Do you have a yard? *</FormLabel>
												<FormControl>
													<RadioGroup
														onValueChange={(value) =>
															field.onChange(value === "true")
														}
														value={field.value ? "true" : "false"}
														className="flex space-x-4"
														disabled={isPending}
													>
														<FormItem className="flex items-center space-x-2 space-y-0">
															<FormControl>
																<RadioGroupItem value="true" />
															</FormControl>
															<FormLabel className="font-normal cursor-pointer">
																Yes
															</FormLabel>
														</FormItem>
														<FormItem className="flex items-center space-x-2 space-y-0">
															<FormControl>
																<RadioGroupItem value="false" />
															</FormControl>
															<FormLabel className="font-normal cursor-pointer">
																No
															</FormLabel>
														</FormItem>
													</RadioGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="hasOtherPets"
										render={({ field }) => (
											<FormItem className="space-y-3">
												<FormLabel>Do you have other pets? *</FormLabel>
												<FormControl>
													<RadioGroup
														onValueChange={(value) =>
															field.onChange(value === "true")
														}
														value={field.value ? "true" : "false"}
														className="flex space-x-4"
														disabled={isPending}
													>
														<FormItem className="flex items-center space-x-2 space-y-0">
															<FormControl>
																<RadioGroupItem value="true" />
															</FormControl>
															<FormLabel className="font-normal cursor-pointer">
																Yes
															</FormLabel>
														</FormItem>
														<FormItem className="flex items-center space-x-2 space-y-0">
															<FormControl>
																<RadioGroupItem value="false" />
															</FormControl>
															<FormLabel className="font-normal cursor-pointer">
																No
															</FormLabel>
														</FormItem>
													</RadioGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{hasOtherPets && (
										<FormField
											control={form.control}
											name="otherPetsDetails"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Tell us about your other pets</FormLabel>
													<FormControl>
														<Textarea
															placeholder="E.g., 2 cats (ages 5 and 7), both spayed/neutered..."
															{...field}
															rows={3}
															disabled={isPending}
														/>
													</FormControl>
													<FormDescription>
														Include species, ages, and temperament if possible
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>

								{/* Experience & Motivation Section */}
								<div className="space-y-4 pt-4 border-t">
									<h3 className="text-sm font-semibold text-gray-900">
										Experience & Motivation
									</h3>

									<FormField
										control={form.control}
										name="petExperience"
										rules={{
											required: "Please select your experience level",
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pet Ownership Experience *</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={isPending}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select your experience level" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="none">
															None - First time pet owner
														</SelectItem>
														<SelectItem value="some">
															Some - I've had pets before
														</SelectItem>
														<SelectItem value="extensive">
															Extensive - Very experienced
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="reasonForAdoption"
										rules={{
											required: "Please tell us why you want to adopt",
											minLength: {
												value: 20,
												message:
													"Please provide at least 20 characters explaining why",
											},
										}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Why do you want to adopt {petName}? *
												</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Tell us what draws you to this pet and why you'd be a great match..."
														{...field}
														rows={4}
														disabled={isPending}
													/>
												</FormControl>
												<FormDescription>Minimum 20 characters</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="notes"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Additional Notes (Optional)</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Any other information you'd like to share..."
														{...field}
														rows={3}
														disabled={isPending}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Error Display */}
								{isError && (
									<Alert variant="destructive">
										<AlertDescription>
											{error instanceof Error
												? error.message
												: "Failed to submit adoption application. Please try again."}
										</AlertDescription>
									</Alert>
								)}

								{/* Form Actions */}
								<div className="flex justify-end space-x-3 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={handleClose}
										disabled={isPending}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isPending}>
										{isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Submitting...
											</>
										) : (
											"Submit Application"
										)}
									</Button>
								</div>
							</form>
						</Form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
