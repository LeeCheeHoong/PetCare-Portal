import { format } from "date-fns";
import { Clock, Stethoscope, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Appointment } from "../appointments/hooks/useAppointments";

interface AppointmentCardProps {
	appointment: Appointment;
	onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard = ({
	appointment,
	onClick,
}: AppointmentCardProps) => {
	const {
		pet,
		ownerName,
		appointmentDateTime,
		status,
		appointmentType,
		reason,
		duration,
	} = appointment;

	// Status color mapping
	const statusColors = {
		scheduled: "bg-blue-100 text-blue-800 border-blue-200",
		confirmed: "bg-green-100 text-green-800 border-green-200",
		"in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
		completed: "bg-gray-100 text-gray-800 border-gray-200",
		cancelled: "bg-red-100 text-red-800 border-red-200",
		"no-show": "bg-orange-100 text-orange-800 border-orange-200",
	};

	// Type color mapping
	const typeColors = {
		checkup: "bg-blue-50 text-blue-700 border-blue-200",
		vaccination: "bg-purple-50 text-purple-700 border-purple-200",
		surgery: "bg-red-50 text-red-700 border-red-200",
		emergency: "bg-red-100 text-red-900 border-red-300",
		grooming: "bg-pink-50 text-pink-700 border-pink-200",
		other: "bg-gray-50 text-gray-700 border-gray-200",
	};

	const appointmentTime = new Date(appointmentDateTime);

	return (
		<Card
			className="hover:shadow-md transition-shadow cursor-pointer"
			onClick={() => onClick?.(appointment)}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					{/* Pet Info */}
					<div className="flex items-center gap-3 flex-1">
						<Avatar className="h-12 w-12">
							<AvatarImage src={pet.imageUrl} alt={pet.name} />
							<AvatarFallback className="bg-primary/10">
								{pet.name?.[0]?.toUpperCase() || "P"}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-lg truncate">{pet.name}</h3>
							<p className="text-sm text-muted-foreground">
								{pet.species} • {pet.breed}
							</p>
						</div>
					</div>

					{/* Status Badge */}
					<Badge variant="outline" className={statusColors[status]}>
						{status.replace("-", " ")}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Time Info */}
				<div className="flex items-center gap-2 text-sm">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">
						{format(appointmentTime, "h:mm a")}
					</span>
					<span className="text-muted-foreground">• {duration} mins</span>
				</div>

				{/* Owner Info */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<User className="h-4 w-4" />
					<span>{ownerName}</span>
				</div>

				{/* Appointment Type */}
				<div className="flex items-center gap-2">
					<Stethoscope className="h-4 w-4 text-muted-foreground" />
					<Badge variant="outline" className={typeColors[appointmentType]}>
						{appointmentType}
					</Badge>
				</div>

				{/* Reason */}
				{reason && (
					<div className="pt-2 border-t">
						<p className="text-sm text-muted-foreground line-clamp-2">
							<span className="font-medium text-foreground">Reason:</span>{" "}
							{reason}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
