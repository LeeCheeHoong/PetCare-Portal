import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Pet } from "@/components/pet/hooks/usePets";

export interface Appointment {
	id: string;

	// Pet & Owner Info
	petId: string;
	pet: Partial<Pet>; // Pet object
	ownerId: string;
	ownerName: string; // Denormalized for easy display

	// Appointment Details
	appointmentDateTime: string; // ISO datetime string (e.g., "2024-01-15T14:30:00Z")
	duration: number; // in minutes (30, 60, etc.)

	// Status & Type
	status:
		| "scheduled"
		| "confirmed"
		| "in-progress"
		| "completed"
		| "cancelled"
		| "no-show";
	appointmentType:
		| "checkup"
		| "vaccination"
		| "surgery"
		| "emergency"
		| "grooming"
		| "other";

	// Additional Info
	reason: string; // Brief description of visit reason
	notes?: string; // Owner's notes/concerns
	diagnosis?: string; // Vet's diagnosis (filled after appointment)
	treatment?: string; // Treatment given/prescribed

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

export interface AppointmentsResponse {
	appointments: Appointment[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

interface UseAppointmentsParams {
	page?: number;
	limit?: number;
	status?: string;
	petId?: string;
}

const fetchAppointments = async (
	params: UseAppointmentsParams,
): Promise<AppointmentsResponse> => {
	const { page = 1, limit = 10, status, petId } = params;

	const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	if (status) searchParams.append("status", status);
	if (petId) searchParams.append("petId", petId);

	const response = await fetch(
		`/api/appointments/my-appointments?${searchParams}`,
		{
			headers: {
				"Content-Type": "application/json",
				// Add auth token if needed
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch appointments");
	}

	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		appointments: [
	// 			{
	// 				appointmentDateTime: new Date().toString(),
	// 				appointmentType: "checkup",
	// 				createdAt: new Date().toString(),
	// 				duration: 1,
	// 				id: "1",
	// 				ownerId: "1",
	// 				ownerName: "John",
	// 				pet: {
	// 					age: 1,
	// 					breed: "Buddy",
	// 				},
	// 				petId: "1",
	// 				reason: "Biannually checkup",
	// 				status: "confirmed",
	// 				updatedAt: new Date().toString(),
	// 				diagnosis: "",
	// 				notes: "",
	// 				treatment: "",
	// 			},
	// 		],
	// 		pagination: {
	// 			limit: 5,
	// 			page: 1,
	// 			total: 4,
	// 			totalPages: 4,
	// 		},
	// 	}),
	// );
};

export const useAppointments = (params: UseAppointmentsParams = {}) => {
	const { page = 1, limit = 10, status, petId } = params;

	return useQuery({
		queryKey: ["user-appointments", page, limit, status, petId],
		queryFn: () => fetchAppointments({ page, limit, status, petId }),
		staleTime: 2 * 60 * 1000,
	});
};

interface BookAppointmentData {
	petId: string;
	appointmentDateTime: string; // ISO string
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

const bookAppointment = async (
	appointmentData: BookAppointmentData,
): Promise<Appointment> => {
	const response = await fetch("/api/appointments", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			// Add auth token if needed
		},
		body: JSON.stringify(appointmentData),
	});

	if (!response.ok) {
		throw new Error("Failed to book appointment");
	}

	return response.json();
};

export const useBookAppointment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: bookAppointment,
		onSuccess: () => {
			// Invalidate appointments list to refetch
			queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
		},
	});
};

const cancelAppointment = async (
	appointmentId: string,
): Promise<Appointment> => {
	const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to cancel appointment");
	}

	return response.json();
};

export const useCancelAppointment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: cancelAppointment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
		},
	});
};

interface RescheduleData {
	appointmentDateTime: string; // ISO string
}

const rescheduleAppointment = async (
	appointmentId: string,
	data: RescheduleData,
): Promise<Appointment> => {
	const response = await fetch(
		`/api/appointments/${appointmentId}/reschedule`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to reschedule appointment");
	}

	return response.json();
};

export const useRescheduleAppointment = (appointmentId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: RescheduleData) =>
			rescheduleAppointment(appointmentId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
		},
	});
};
