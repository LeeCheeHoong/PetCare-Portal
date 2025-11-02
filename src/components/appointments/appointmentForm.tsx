import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePets } from "../pet/hooks/usePets";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useBookAppointment } from "./hooks/useAppointments";

interface AppointmentFormValues {
	petId: string;
	appointmentDate: string;
	appointmentTime: string;
	duration: number;
	appointmentType:
		| "checkup"
		| "vaccination"
		| "surgery"
		| "emergency"
		| "grooming"
		| "other";
	reason: string;
	notes?: string;
}

const BookAppointmentPage = () => {
	const navigate = useNavigate();
	const { mutate: bookAppointment, isPending } = useBookAppointment();

	// Fetch user's pets for selection - get all pets without pagination
	const {
		data: petsData,
		isLoading: isLoadingPets,
		isError: isPetsError,
	} = usePets({
		limit: 100,
	});

	const form = useForm<AppointmentFormValues>({
		defaultValues: {
			petId: "",
			appointmentDate: "",
			appointmentTime: "",
			duration: 30,
			appointmentType: "checkup",
			reason: "",
			notes: "",
		},
	});

	const onSubmit = (data: AppointmentFormValues) => {
		// Combine date and time into ISO string
		const appointmentDateTime = new Date(
			`${data.appointmentDate}T${data.appointmentTime}`,
		).toISOString();

		const bookingData = {
			petId: data.petId,
			appointmentDateTime,
			duration: Number(data.duration),
			appointmentType: data.appointmentType,
			reason: data.reason,
			notes: data.notes || undefined,
		};

		bookAppointment(bookingData, {
			onSuccess: () => {
				toast.success("Appointment booked successfully!");
				navigate({ to: "/appointments" });
			},
			onError: (error) => {
				toast.error(
					error instanceof Error ? error.message : "Failed to book appointment",
				);
			},
		});
	};

	// Get minimum date (today)
	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="container mx-auto py-8 px-4 max-w-2xl">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={() => navigate({ to: "/appointments" })}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Appointments
			</Button>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="h-6 w-6" />
						Book New Appointment
					</CardTitle>
					<CardDescription>
						Schedule a veterinary appointment for your pet
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Error loading pets */}
					{isPetsError && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Failed to load your pets. Please try again.
							</AlertDescription>
						</Alert>
					)}

					{/* No pets warning */}
					{!isLoadingPets && petsData && petsData.pets.length === 0 && (
						<Alert className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								You need to add a pet before booking an appointment.
								<Button
									variant="link"
									className="px-1"
									onClick={() => navigate({ to: "/pets/new" })}
								>
									Add a pet now
								</Button>
							</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Select Pet */}
							<FormField
								control={form.control}
								name="petId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Select Pet *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											disabled={isLoadingPets}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Choose a pet" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{isLoadingPets ? (
													<SelectItem value="loading" disabled>
														Loading pets...
													</SelectItem>
												) : (
													petsData?.pets.map((pet) => (
														<SelectItem key={pet.id} value={pet.id}>
															{pet.name} ({pet.species} - {pet.breed})
														</SelectItem>
													))
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Date & Time Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Date Field */}
								<FormField
									control={form.control}
									name="appointmentDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Date *</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? (
																format(new Date(field.value), "PPP")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={
															field.value ? new Date(field.value) : undefined
														}
														onSelect={(date) => {
															if (date) {
																field.onChange(format(date, "yyyy-MM-dd"));
															}
														}}
														disabled={(date) => date < new Date(today)}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Time Field */}
								<FormField
									control={form.control}
									name="appointmentTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Time *</FormLabel>
											<div className="flex gap-2">
												{/* Hour Select */}
												<Select
													value={field.value?.split(":")[0] || ""}
													onValueChange={(hour) => {
														const minute = field.value?.split(":")[1] || "00";
														field.onChange(`${hour}:${minute}`);
													}}
												>
													<FormControl>
														<SelectTrigger className="flex-1">
															<SelectValue placeholder="Hour" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Array.from({ length: 24 }, (_, i) => {
															const hour = i.toString().padStart(2, "0");
															return (
																<SelectItem key={hour} value={hour}>
																	{hour}
																</SelectItem>
															);
														})}
													</SelectContent>
												</Select>

												<span className="flex items-center text-2xl font-semibold">
													:
												</span>

												{/* Minute Select */}
												<Select
													value={field.value?.split(":")[1] || ""}
													onValueChange={(minute) => {
														const hour = field.value?.split(":")[0] || "00";
														field.onChange(`${hour}:${minute}`);
													}}
												>
													<FormControl>
														<SelectTrigger className="flex-1">
															<SelectValue placeholder="Minute" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Array.from({ length: 12 }, (_, i) => {
															const minute = (i * 5)
																.toString()
																.padStart(2, "0");
															return (
																<SelectItem key={minute} value={minute}>
																	{minute}
																</SelectItem>
															);
														})}
													</SelectContent>
												</Select>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Appointment Type & Duration Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="appointmentType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Appointment Type *</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="checkup">
														Regular Checkup
													</SelectItem>
													<SelectItem value="vaccination">
														Vaccination
													</SelectItem>
													<SelectItem value="surgery">Surgery</SelectItem>
													<SelectItem value="emergency">Emergency</SelectItem>
													<SelectItem value="grooming">Grooming</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (minutes) *</FormLabel>
											<Select
												onValueChange={(value) => field.onChange(Number(value))}
												defaultValue={field.value.toString()}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="15">15 minutes</SelectItem>
													<SelectItem value="30">30 minutes</SelectItem>
													<SelectItem value="45">45 minutes</SelectItem>
													<SelectItem value="60">1 hour</SelectItem>
													<SelectItem value="90">1.5 hours</SelectItem>
													<SelectItem value="120">2 hours</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Reason for Visit */}
							<FormField
								control={form.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason for Visit *</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Annual checkup, limping, skin rash..."
												required
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Brief description of why you're booking this appointment
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Additional Notes */}
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Additional Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Any additional information or concerns..."
												className="resize-none"
												rows={4}
												maxLength={500}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optional details that might help the veterinarian (max 500
											characters)
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
									onClick={() => navigate({ to: "/appointments" })}
									disabled={isPending}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										isPending || isLoadingPets || petsData?.pets.length === 0
									}
									className="flex-1"
								>
									{isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isPending ? "Booking..." : "Book Appointment"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default BookAppointmentPage;
