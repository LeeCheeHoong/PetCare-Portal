import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Clock, ExternalLink, User } from "lucide-react";
import type { Appointment } from "@/components/appointments/hooks/useAppointments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DayAppointmentsModalProps {
	date: Date | null;
	appointments: Appointment[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const DayAppointmentsModal = ({
	date,
	appointments,
	open,
	onOpenChange,
}: DayAppointmentsModalProps) => {
	const navigate = useNavigate();

	if (!date) return null;

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

	const handleViewDetails = (appointmentId: string) => {
		navigate({ to: `/vet/appointments/${appointmentId}` });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh]">
				<DialogHeader>
					<DialogTitle>Appointments for {format(date, "PPPP")}</DialogTitle>
					<DialogDescription>
						{appointments.length} appointment
						{appointments.length !== 1 ? "s" : ""} scheduled
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh] pr-4">
					{appointments.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No appointments scheduled for this day
						</div>
					) : (
						<div className="space-y-4">
							{appointments.map((appointment, index) => {
								const appointmentTime = parseISO(
									appointment.appointmentDateTime,
								);

								return (
									<div key={appointment.id}>
										{index > 0 && <Separator className="my-4" />}

										<div className="space-y-3">
											{/* Header - Time, Status, Type */}
											<div className="flex items-start justify-between gap-2">
												<div className="flex items-center gap-2">
													<Clock className="h-4 w-4 text-muted-foreground" />
													<span className="font-semibold text-lg">
														{format(appointmentTime, "h:mm a")}
													</span>
													<span className="text-muted-foreground">
														({appointment.duration} mins)
													</span>
												</div>
												<Badge
													variant="outline"
													className={statusColors[appointment.status]}
												>
													{appointment.status.replace("-", " ")}
												</Badge>
											</div>

											{/* Pet & Owner Info */}
											<div className="flex items-start gap-3">
												<Avatar className="h-12 w-12">
													<AvatarImage
														src={appointment.pet.imageUrl}
														alt={appointment.pet.name}
													/>
													<AvatarFallback className="bg-primary/10">
														{appointment.pet.name?.[0]?.toUpperCase() || "P"}
													</AvatarFallback>
												</Avatar>

												<div className="flex-1 min-w-0">
													<h4 className="font-semibold truncate">
														{appointment.pet.name}
													</h4>
													<p className="text-sm text-muted-foreground">
														{appointment.pet.species} • {appointment.pet.breed}
													</p>
													<div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
														<User className="h-3 w-3" />
														<span>{appointment.ownerName}</span>
													</div>
												</div>

												<Badge
													variant="outline"
													className={typeColors[appointment.appointmentType]}
												>
													{appointment.appointmentType}
												</Badge>
											</div>

											{/* Reason */}
											{appointment.reason && (
												<div className="text-sm">
													<span className="font-medium">Reason:</span>{" "}
													<span className="text-muted-foreground">
														{appointment.reason}
													</span>
												</div>
											)}

											{/* View Details Button */}
											<Button
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() => handleViewDetails(appointment.id)}
											>
												<ExternalLink className="mr-2 h-4 w-4" />
												View Details
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};
