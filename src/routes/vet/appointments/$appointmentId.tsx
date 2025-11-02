import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { format } from "date-fns";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Clock,
	FileText,
	Stethoscope,
	User,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointment } from "@/components/vetAppointments/hooks/useAppointments";
import { AppointmentStatusUpdate } from "@/components/vetAppointments/StatusUpdate";

export const Route = createFileRoute("/vet/appointments/$appointmentId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { appointmentId } = useParams({
		from: "/vet/appointments/$appointmentId",
	});
	const navigate = useNavigate();
	const { data: appointment, isLoading, error } = useAppointment(appointmentId);

	// Loading State
	if (isLoading) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-5xl">
				<Skeleton className="h-10 w-32 mb-6" />
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-48 w-full" />
					</div>
					<Skeleton className="h-96 w-full" />
				</div>
			</div>
		);
	}

	// Error State
	if (error || !appointment) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-5xl">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/vet/appointments" })}
					className="mb-6"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Appointments
				</Button>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load appointment details. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const {
		pet,
		ownerName,
		appointmentDateTime,
		status,
		appointmentType,
		reason,
		notes,
		diagnosis,
		treatment,
		duration,
	} = appointment;

	const appointmentDate = new Date(appointmentDateTime);

	const statusColors = {
		scheduled: "bg-blue-100 text-blue-800 border-blue-200",
		confirmed: "bg-green-100 text-green-800 border-green-200",
		"in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
		completed: "bg-gray-100 text-gray-800 border-gray-200",
		cancelled: "bg-red-100 text-red-800 border-red-200",
		"no-show": "bg-orange-100 text-orange-800 border-orange-200",
	};

	const typeColors = {
		checkup: "bg-blue-50 text-blue-700 border-blue-200",
		vaccination: "bg-purple-50 text-purple-700 border-purple-200",
		surgery: "bg-red-50 text-red-700 border-red-200",
		emergency: "bg-red-100 text-red-900 border-red-300",
		grooming: "bg-pink-50 text-pink-700 border-pink-200",
		other: "bg-gray-50 text-gray-700 border-gray-200",
	};

	return (
		<div className="container mx-auto py-6 px-4 max-w-5xl">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={() => navigate({ to: "/vet/appointments" })}
				className="mb-6"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Appointments
			</Button>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column - Appointment Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Pet & Owner Info Card */}
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<CardTitle>Appointment Details</CardTitle>
								<Badge variant="outline" className={statusColors[status]}>
									{status.replace("-", " ")}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Pet Information */}
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-3">
									Patient Information
								</h3>
								<div className="flex items-start gap-4">
									<Avatar className="h-16 w-16">
										<AvatarImage src={pet.imageUrl} alt={pet.name} />
										<AvatarFallback className="bg-primary/10 text-lg">
											{pet.name?.[0]?.toUpperCase() || "P"}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<h4 className="font-semibold text-lg">{pet.name}</h4>
										<div className="grid grid-cols-2 gap-2 mt-2 text-sm">
											<div>
												<span className="text-muted-foreground">Species:</span>{" "}
												<span className="font-medium">{pet.species}</span>
											</div>
											<div>
												<span className="text-muted-foreground">Breed:</span>{" "}
												<span className="font-medium">{pet.breed}</span>
											</div>
											<div>
												<span className="text-muted-foreground">Age:</span>{" "}
												<span className="font-medium">{pet.age} years</span>
											</div>
											{pet.weight && (
												<div>
													<span className="text-muted-foreground">Weight:</span>{" "}
													<span className="font-medium">{pet.weight} kg</span>
												</div>
											)}
											{pet.color && (
												<div>
													<span className="text-muted-foreground">Color:</span>{" "}
													<span className="font-medium">{pet.color}</span>
												</div>
											)}
											{pet.status && (
												<div>
													<span className="text-muted-foreground">Status:</span>{" "}
													<span className="font-medium capitalize">
														{pet.status}
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{pet.medicalNotes && (
									<div className="mt-4 p-3 bg-muted rounded-md">
										<p className="text-sm">
											<span className="font-medium">Medical Notes:</span>{" "}
											{pet.medicalNotes}
										</p>
									</div>
								)}
							</div>

							<Separator />

							{/* Owner Information */}
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-3">
									Owner Information
								</h3>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<User className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">{ownerName}</span>
									</div>
									{/* Add more owner details if available in your data */}
								</div>
							</div>

							<Separator />

							{/* Appointment Information */}
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-3">
									Appointment Information
								</h3>
								<div className="space-y-3">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">
											{format(appointmentDate, "PPPP")}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">
											{format(appointmentDate, "h:mm a")} ({duration} minutes)
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<Stethoscope className="h-4 w-4 text-muted-foreground" />
										<Badge
											variant="outline"
											className={typeColors[appointmentType]}
										>
											{appointmentType}
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Reason & Notes Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Visit Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h4 className="text-sm font-medium mb-2">Reason for Visit</h4>
								<p className="text-sm text-muted-foreground">{reason}</p>
							</div>

							{notes && (
								<>
									<Separator />
									<div>
										<h4 className="text-sm font-medium mb-2">Owner's Notes</h4>
										<p className="text-sm text-muted-foreground">{notes}</p>
									</div>
								</>
							)}

							{diagnosis && (
								<>
									<Separator />
									<div>
										<h4 className="text-sm font-medium mb-2">Diagnosis</h4>
										<p className="text-sm text-muted-foreground">{diagnosis}</p>
									</div>
								</>
							)}

							{treatment && (
								<>
									<Separator />
									<div>
										<h4 className="text-sm font-medium mb-2">Treatment</h4>
										<p className="text-sm text-muted-foreground">{treatment}</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Status Update */}
				<div className="lg:col-span-1">
					<div className="sticky top-6">
						<AppointmentStatusUpdate appointment={appointment} />
					</div>
				</div>
			</div>
		</div>
	);
}
