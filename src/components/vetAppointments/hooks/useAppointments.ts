import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isFuture, isToday, parseISO } from "date-fns";
import { useMemo } from "react";
import type {
	Appointment,
	AppointmentsResponse,
} from "@/components/appointments/hooks/useAppointments";

interface UseVetAppointmentsParams {
	nameFilter?: string;
	dateFilter?: string; // ISO date string
	page?: number;
	limit?: number;
}

export const useVetAppointments = ({
	nameFilter = "",
	dateFilter,
	page = 1,
	limit = 50,
}: UseVetAppointmentsParams = {}) => {
	const query = useQuery({
		queryKey: ["vet-appointments", { nameFilter, dateFilter, page, limit }],
		queryFn: async (): Promise<AppointmentsResponse> => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (nameFilter) params.append("search", nameFilter);
			if (dateFilter) params.append("date", dateFilter);

			const response = await fetch(`/api/vet/appointments?${params}`);

			if (!response.ok) {
				throw new Error("Failed to fetch appointments");
			}

			return response.json();

			// return new Promise((resolve) =>
			// 	resolve({
			// 		appointments: [
			// 			{
			// 				appointmentDateTime: new Date().toISOString(),
			// 				appointmentType: "checkup",
			// 				createdAt: new Date().toISOString(),
			// 				duration: 1,
			// 				id: "1",
			// 				ownerId: "1",
			// 				ownerName: "Alice",
			// 				pet: {
			// 					age: 2,
			// 					breed: "Golden Retriever",
			// 					name: "Buddy",
			// 					species: "dog",
			// 					imageUrl:
			// 						"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 				},
			// 				petId: "1",
			// 				reason: "annual checkup",
			// 				status: "confirmed",
			// 				updatedAt: new Date().toISOString(),
			// 				diagnosis: "",
			// 				notes: "",
			// 				treatment: "",
			// 			},
			// 			{
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 7 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				appointmentType: "grooming",
			// 				createdAt: new Date().toISOString(),
			// 				duration: 1,
			// 				id: "2",
			// 				ownerId: "2",
			// 				ownerName: "Ben",
			// 				pet: {
			// 					age: 4,
			// 					breed: "Persian",
			// 					name: "Luna",
			// 					species: "cat",
			// 					imageUrl:
			// 						"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 				},
			// 				petId: "2",
			// 				reason: "fur trim",
			// 				status: "confirmed",
			// 				updatedAt: new Date().toISOString(),
			// 				diagnosis: "",
			// 				notes: "",
			// 				treatment: "",
			// 			},
			// 			{
			// 				appointmentDateTime: new Date().toISOString(),
			// 				appointmentType: "checkup",
			// 				createdAt: new Date().toISOString(),
			// 				duration: 2,
			// 				id: "3",
			// 				ownerId: "3",
			// 				ownerName: "Cara",
			// 				pet: {
			// 					age: 1,
			// 					breed: "Siamese",
			// 					name: "Milo",
			// 					species: "cat",
			// 					imageUrl:
			// 						"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 				},
			// 				petId: "3",
			// 				reason: "vaccination",
			// 				status: "confirmed",
			// 				updatedAt: new Date().toISOString(),
			// 				diagnosis: "",
			// 				notes: "",
			// 				treatment: "",
			// 			},
			// 			{
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 7 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				appointmentType: "surgery",
			// 				createdAt: new Date().toISOString(),
			// 				duration: 1,
			// 				id: "4",
			// 				ownerId: "4",
			// 				ownerName: "Derek",
			// 				pet: {
			// 					age: 5,
			// 					breed: "Bulldog",
			// 					name: "Rocky",
			// 					species: "dog",
			// 					imageUrl:
			// 						"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 				},
			// 				petId: "4",
			// 				reason: "limping",
			// 				status: "confirmed",
			// 				updatedAt: new Date().toISOString(),
			// 				diagnosis: "",
			// 				notes: "",
			// 				treatment: "",
			// 			},
			// 			{
			// 				appointmentDateTime: new Date().toISOString(),
			// 				appointmentType: "checkup",
			// 				createdAt: new Date().toISOString(),
			// 				duration: 1,
			// 				id: "5",
			// 				ownerId: "5",
			// 				ownerName: "Ella",
			// 				pet: {
			// 					age: 3,
			// 					breed: "Beagle",
			// 					name: "Toby",
			// 					species: "dog",
			// 					imageUrl:
			// 						"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 				},
			// 				petId: "5",
			// 				reason: "routine health review",
			// 				status: "confirmed",
			// 				updatedAt: new Date().toISOString(),
			// 				diagnosis: "",
			// 				notes: "",
			// 				treatment: "",
			// 			},
			// 			{
			// 				appointmentDateTime: new Date().toISOString(),
			// 				appointmentType: "grooming",
			// 				createdAt: new Date().toISOString(),
			// 				duration: 1,
			// 				id: "6",
			// 				ownerId: "6",
			// 				ownerName: "Frank",
			// 				pet: {
			// 					age: 6,
			// 					breed: "Tabby",
			// 					name: "Ginger",
			// 					species: "cat",
			// 					imageUrl:
			// 						"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 				},
			// 				petId: "6",
			// 				reason: "teeth cleaning",
			// 				status: "confirmed",
			// 				updatedAt: new Date().toISOString(),
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
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Separate and sort appointments
	const separatedAppointments = useMemo(() => {
		if (!query.data?.appointments) {
			return { today: [], upcoming: [] };
		}

		const today: Appointment[] = [];
		const upcoming: Appointment[] = [];

		query.data.appointments.forEach((appointment) => {
			const appointmentDate = parseISO(appointment.appointmentDateTime);
			console.log(appointmentDate);
			if (isToday(appointmentDate)) {
				today.push(appointment);
			} else if (isFuture(appointmentDate)) {
				upcoming.push(appointment);
			}
		});

		// Sort both by time (earliest first)
		const sortByDateTime = (a: Appointment, b: Appointment) => {
			return (
				new Date(a.appointmentDateTime).getTime() -
				new Date(b.appointmentDateTime).getTime()
			);
		};

		return {
			today: today.sort(sortByDateTime),
			upcoming: upcoming.sort(sortByDateTime),
		};
	}, [query.data?.appointments]);

	return {
		...query,
		appointments: query.data?.appointments ?? [],
		todayAppointments: separatedAppointments.today,
		upcomingAppointments: separatedAppointments.upcoming,
		pagination: query.data?.pagination,
	};
};

interface UpdateAppointmentStatusParams {
	appointmentId: string;
	status: Appointment["status"];
	diagnosis?: string;
	treatment?: string;
}

export const useAppointment = (appointmentId: string) => {
	return useQuery({
		queryKey: ["appointment", appointmentId],
		queryFn: async (): Promise<Appointment> => {
			const response = await fetch(`/api/vet/appointments/${appointmentId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch appointment");
			}

			return response.json();
			// return new Promise((resolve) =>
			// 	resolve({
			// 		appointmentDateTime: new Date().toISOString(),
			// 		appointmentType: "checkup",
			// 		createdAt: new Date().toISOString(),
			// 		duration: 1,
			// 		id: "1",
			// 		ownerId: "1",
			// 		ownerName: "Alice",
			// 		pet: {
			// 			age: 2,
			// 			breed: "Golden Retriever",
			// 			name: "Buddy",
			// 			species: "dog",
			// 			imageUrl:
			// 				"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
			// 		},
			// 		petId: "1",
			// 		reason: "annual checkup",
			// 		status: "confirmed",
			// 		updatedAt: new Date().toISOString(),
			// 		diagnosis: "",
			// 		notes: "",
			// 		treatment: "",
			// 	}),
			// );
		},
		enabled: !!appointmentId, // Only fetch if ID exists
	});
};

export const useUpdateAppointmentStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UpdateAppointmentStatusParams) => {
			const response = await fetch(
				`/api/vet/appointments/${params.appointmentId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: params.status,
						diagnosis: params.diagnosis,
						treatment: params.treatment,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update appointment");
			}

			return response.json();
		},
		onSuccess: (data, variables) => {
			// Invalidate appointments list to refetch
			queryClient.invalidateQueries({ queryKey: ["vet-appointments"] });
			// Update single appointment cache
			queryClient.invalidateQueries({
				queryKey: ["appointment", variables.appointmentId],
			});
		},
	});
};
