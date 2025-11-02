import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit,
	Loader2,
	PawPrint,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	useAppointments,
	useCancelAppointment,
	useRescheduleAppointment,
} from "./hooks/useAppointments";

const AppointmentList = () => {
	const [page, setPage] = useState(1);
	const limit = 10;

	const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<string | null>(
		null,
	);
	const [newDate, setNewDate] = useState("");
	const [newTime, setNewTime] = useState("");

	const { mutate: cancelAppointment, isPending: isCancelling } =
		useCancelAppointment();
	const { mutate: rescheduleAppointment, isPending: isRescheduling } =
		useRescheduleAppointment(selectedAppointment || "");
	const { data, isLoading, isError, error } = useAppointments({
		page,
		limit,
	});

	// Check if appointment can be cancelled/rescheduled
	const canModifyAppointment = (status: string) => {
		return ["scheduled", "confirmed"].includes(status);
	};

	// Handle cancel appointment
	const handleCancelAppointment = (
		e: React.MouseEvent,
		appointmentId: string,
	) => {
		e.stopPropagation(); // Prevent card click navigation

		if (confirm("Are you sure you want to cancel this appointment?")) {
			cancelAppointment(appointmentId, {
				onSuccess: () => {
					toast.success("Appointment cancelled successfully");
				},
				onError: (error) => {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to cancel appointment",
					);
				},
			});
		}
	};

	// Handle reschedule appointment
	const handleRescheduleAppointment = (
		e: React.MouseEvent,
		appointmentId: string,
		currentDateTime: string,
	) => {
		e.stopPropagation();

		// Pre-fill with current date/time
		const current = new Date(currentDateTime);
		const dateStr = current.toISOString().split("T")[0];
		const timeStr = current.toTimeString().slice(0, 5);

		setSelectedAppointment(appointmentId);
		setNewDate(dateStr);
		setNewTime(timeStr);
		setRescheduleDialogOpen(true);
	};

	// Handle reschedule submit
	const handleRescheduleSubmit = () => {
		if (!newDate || !newTime) {
			toast.error("Please select both date and time");
			return;
		}

		const appointmentDateTime = new Date(`${newDate}T${newTime}`).toISOString();

		rescheduleAppointment(
			{ appointmentDateTime },
			{
				onSuccess: () => {
					toast.success("Appointment rescheduled successfully");
					setRescheduleDialogOpen(false);
					setSelectedAppointment(null);
				},
				onError: (error) => {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to reschedule appointment",
					);
				},
			},
		);
	};

	// Get minimum date (today)
	const today = new Date().toISOString().split("T")[0];

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				{[1, 2, 3].map((n) => (
					<Card key={n}>
						<CardHeader>
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-1/2 mt-2" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-20 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					{error instanceof Error
						? error.message
						: "Failed to load appointments"}
				</AlertDescription>
			</Alert>
		);
	}

	// Empty state
	if (!data?.appointments || data.appointments.length === 0) {
		return (
			<Card className="w-full">
				<CardContent className="flex flex-col items-center justify-center py-10">
					<Calendar className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground text-center">
						You don't have any appointments scheduled yet.
					</p>
				</CardContent>
			</Card>
		);
	}

	const { pagination } = data;

	// Helper function for status badge styling
	const getStatusVariant = (status: string) => {
		switch (status) {
			case "scheduled":
			case "confirmed":
				return "default";
			case "in-progress":
				return "secondary";
			case "completed":
				return "outline";
			case "cancelled":
			case "no-show":
				return "destructive";
			default:
				return "default";
		}
	};

	// Helper function for appointment type color
	const getTypeColor = (type: string) => {
		switch (type) {
			case "emergency":
				return "text-red-600 bg-red-50";
			case "surgery":
				return "text-orange-600 bg-orange-50";
			case "vaccination":
				return "text-blue-600 bg-blue-50";
			case "checkup":
				return "text-green-600 bg-green-50";
			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex justify-between items-center">
				<p className="ml-auto text-sm text-muted-foreground">
					Page {pagination.page} of {pagination.totalPages}
				</p>
			</div>

			{/* Appointments List */}
			<div className={`space-y-4`}>
				{data.appointments.map((appointment) => {
					const appointmentDate = new Date(appointment.appointmentDateTime);
					const isPast = appointmentDate < new Date();

					return (
						<Card
							key={appointment.id}
							className="hover:shadow-lg transition-shadow cursor-pointer"
						>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<CardTitle className="text-xl">
												{appointment.pet.name}
											</CardTitle>
											<Badge
												variant="secondary"
												className={`${getTypeColor(appointment.appointmentType)} border-0`}
											>
												{appointment.appointmentType}
											</Badge>
										</div>
										<CardDescription className="flex items-center gap-4">
											<span className="flex items-center gap-1">
												<PawPrint className="h-3 w-3" />
												{appointment.pet.species} • {appointment.pet.breed}
											</span>
										</CardDescription>
									</div>
									<Badge variant={getStatusVariant(appointment.status)}>
										{appointment.status}
									</Badge>
								</div>
							</CardHeader>

							<CardContent>
								<div className="space-y-3">
									{/* Date & Time */}
									<div className="flex items-center gap-6">
										<div className="flex items-center gap-2 text-sm">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span
												className={
													isPast ? "text-muted-foreground" : "font-medium"
												}
											>
												{format(appointmentDate, "EEEE, MMMM d, yyyy")}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span
												className={
													isPast ? "text-muted-foreground" : "font-medium"
												}
											>
												{format(appointmentDate, "h:mm a")}
											</span>
											<span className="text-muted-foreground">
												({appointment.duration} min)
											</span>
										</div>
									</div>

									{/* Reason */}
									<div>
										<p className="text-sm font-medium mb-1">
											Reason for Visit:
										</p>
										<p className="text-sm text-muted-foreground">
											{appointment.reason}
										</p>
									</div>

									{/* Notes (if exists) */}
									{appointment.notes && (
										<div>
											<p className="text-sm font-medium mb-1">
												Additional Notes:
											</p>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{appointment.notes}
											</p>
										</div>
									)}

									{/* Diagnosis/Treatment (if completed) */}
									{appointment.status === "completed" &&
										(appointment.diagnosis || appointment.treatment) && (
											<div className="pt-3 border-t">
												{appointment.diagnosis && (
													<div className="mb-2">
														<p className="text-sm font-medium">Diagnosis:</p>
														<p className="text-sm text-muted-foreground">
															{appointment.diagnosis}
														</p>
													</div>
												)}
												{appointment.treatment && (
													<div>
														<p className="text-sm font-medium">Treatment:</p>
														<p className="text-sm text-muted-foreground">
															{appointment.treatment}
														</p>
													</div>
												)}
											</div>
										)}

									{/* Action Buttons - ADD THIS NEW SECTION */}
									{canModifyAppointment(appointment.status) && (
										<div className="flex gap-2 pt-3 border-t">
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
												onClick={(e) =>
													handleRescheduleAppointment(
														e,
														appointment.id,
														appointment.appointmentDateTime,
													)
												}
												disabled={isCancelling}
											>
												<Edit className="h-4 w-4 mr-2" />
												Reschedule
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1 text-destructive hover:text-destructive"
												onClick={(e) =>
													handleCancelAppointment(e, appointment.id)
												}
												disabled={isCancelling}
											>
												<X className="h-4 w-4 mr-2" />
												Cancel
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Pagination Controls */}
			{pagination.totalPages > 1 && (
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
						{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
							(pageNum) => (
								<Button
									key={pageNum}
									variant={pageNum === page ? "default" : "outline"}
									size="sm"
									onClick={() => setPage(pageNum)}
									className="w-10"
								>
									{pageNum}
								</Button>
							),
						)}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((old) => Math.min(old + 1, pagination.totalPages))
						}
						disabled={page === pagination.totalPages}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			)}

			{/* Reschedule Dialog */}
			<Dialog
				open={rescheduleDialogOpen}
				onOpenChange={setRescheduleDialogOpen}
			>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Reschedule Appointment</DialogTitle>
						<DialogDescription>
							Choose a new date and time for your appointment
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Date Picker */}
						<div className="space-y-2">
							<Label>New Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!newDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{newDate ? format(new Date(newDate), "PPP") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<CalendarComponent
										mode="single"
										selected={newDate ? new Date(newDate) : undefined}
										onSelect={(date) => {
											if (date) {
												setNewDate(format(date, "yyyy-MM-dd"));
											}
										}}
										disabled={(date) => date < new Date(today)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Time Picker */}
						<div className="space-y-2">
							<Label>New Time</Label>
							<div className="flex gap-2">
								{/* Hour Select */}
								<Select
									value={newTime.split(":")[0] || ""}
									onValueChange={(hour) => {
										const minute = newTime.split(":")[1] || "00";
										setNewTime(`${hour}:${minute}`);
									}}
								>
									<SelectTrigger className="flex-1">
										<SelectValue placeholder="Hour" />
									</SelectTrigger>
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
									value={newTime.split(":")[1] || ""}
									onValueChange={(minute) => {
										const hour = newTime.split(":")[0] || "00";
										setNewTime(`${hour}:${minute}`);
									}}
								>
									<SelectTrigger className="flex-1">
										<SelectValue placeholder="Minute" />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 12 }, (_, i) => {
											const minute = (i * 5).toString().padStart(2, "0");
											return (
												<SelectItem key={minute} value={minute}>
													{minute}
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRescheduleDialogOpen(false)}
							disabled={isRescheduling}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRescheduleSubmit}
							disabled={isRescheduling || !newDate || !newTime}
						>
							{isRescheduling && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isRescheduling ? "Rescheduling..." : "Reschedule"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AppointmentList;
