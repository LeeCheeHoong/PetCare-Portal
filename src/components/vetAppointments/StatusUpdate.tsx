// components/vet/AppointmentStatusUpdate.tsx

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment } from "../appointments/hooks/useAppointments";
import { useUpdateAppointmentStatus } from "./hooks/useAppointments";

interface AppointmentStatusUpdateProps {
	appointment: Appointment;
}

export const AppointmentStatusUpdate = ({
	appointment,
}: AppointmentStatusUpdateProps) => {
	const [status, setStatus] = useState<Appointment["status"]>(
		appointment.status,
	);
	const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || "");
	const [treatment, setTreatment] = useState(appointment.treatment || "");

	const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		updateStatus(
			{
				appointmentId: appointment.id,
				status,
				diagnosis: diagnosis.trim() || undefined,
				treatment: treatment.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast("Appointment updated successfully");
				},
				onError: (error) => {
					toast.error(error.message || "Failed to update appointment");
				},
			},
		);
	};

	const statusOptions: Array<{ value: Appointment["status"]; label: string }> =
		[
			{ value: "scheduled", label: "Scheduled" },
			{ value: "confirmed", label: "Confirmed" },
			{ value: "in-progress", label: "In Progress" },
			{ value: "completed", label: "Completed" },
			{ value: "cancelled", label: "Cancelled" },
			{ value: "no-show", label: "No Show" },
		];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Update Appointment</CardTitle>
				<CardDescription>Change status and add medical notes</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Status Select */}
					<div className="space-y-2">
						<Label>Status</Label>
						<Select
							value={status}
							onValueChange={(value) =>
								setStatus(value as Appointment["status"])
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Diagnosis */}
					<div className="space-y-2">
						<Label>Diagnosis</Label>
						<Textarea
							placeholder="Enter diagnosis..."
							value={diagnosis}
							onChange={(e) => setDiagnosis(e.target.value)}
							rows={3}
						/>
					</div>

					{/* Treatment */}
					<div className="space-y-2">
						<Label>Treatment</Label>
						<Textarea
							placeholder="Enter treatment plan..."
							value={treatment}
							onChange={(e) => setTreatment(e.target.value)}
							rows={3}
						/>
					</div>

					{/* Submit Button */}
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Update Appointment
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
