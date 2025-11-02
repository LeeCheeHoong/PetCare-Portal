import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import React from "react";
import type {
	Appointment,
	AppointmentsResponse,
} from "@/components/appointments/hooks/useAppointments";

interface UseVetCalendarAppointmentsParams {
	month: Date; // The month to fetch appointments for
}

export const useVetCalendarAppointments = ({
	month,
}: UseVetCalendarAppointmentsParams) => {
	const startDate = startOfMonth(month);
	const endDate = endOfMonth(month);

	const query = useQuery({
		queryKey: ["vet-calendar-appointments", format(startDate, "yyyy-MM")],
		queryFn: async (): Promise<AppointmentsResponse> => {
			const params = new URLSearchParams({
				startDate: format(startDate, "yyyy-MM-dd"),
				endDate: format(endDate, "yyyy-MM-dd"),
				limit: "1000", // Get all appointments for the month
			});

			const response = await fetch(`/api/vet/appointments?${params}`);

			if (!response.ok) {
				throw new Error("Failed to fetch appointments");
			}

			return response.json();

			// return new Promise((resolve) =>
			// 	resolve({
			// 		appointments: [
			// 			{
			// 				id: "1",
			// 				appointmentDateTime: new Date().toISOString(),
			// 				duration: 30,
			// 				status: "scheduled",
			// 				appointmentType: "checkup",
			// 				reason: "Checkup",
			// 				pet: {
			// 					id: "1",
			// 					name: "Buddy",
			// 					species: "Dog",
			// 					breed: "Golden Retriever",
			// 					imageUrl: "https://via.placeholder.com/150",
			// 				},
			// 				ownerName: "John Doe",
			// 				petId: "1",
			// 				ownerId: "1",
			// 				createdAt: new Date().toISOString(),
			// 				updatedAt: new Date().toISOString(),
			// 			},
			// 			{
			// 				id: "2",
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 3 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				duration: 45,
			// 				status: "scheduled",
			// 				appointmentType: "vaccination",
			// 				reason: "Annual vaccine",
			// 				pet: {
			// 					id: "2",
			// 					name: "Luna",
			// 					species: "Cat",
			// 					breed: "Siamese",
			// 					imageUrl: "https://via.placeholder.com/150",
			// 				},
			// 				ownerName: "Alice Smith",
			// 				petId: "2",
			// 				ownerId: "2",
			// 				createdAt: new Date().toISOString(),
			// 				updatedAt: new Date().toISOString(),
			// 			},
			// 			{
			// 				id: "3",
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 7 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				duration: 30,
			// 				status: "scheduled",
			// 				appointmentType: "grooming",
			// 				reason: "Full grooming",
			// 				pet: {
			// 					id: "3",
			// 					name: "Rocky",
			// 					species: "Dog",
			// 					breed: "Bulldog",
			// 					imageUrl: "https://via.placeholder.com/150",
			// 				},
			// 				ownerName: "Bob Johnson",
			// 				petId: "3",
			// 				ownerId: "3",
			// 				createdAt: new Date().toISOString(),
			// 				updatedAt: new Date().toISOString(),
			// 			},
			// 			{
			// 				id: "4",
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 10 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				duration: 60,
			// 				status: "scheduled",
			// 				appointmentType: "checkup",
			// 				reason: "Health follow-up",
			// 				pet: {
			// 					id: "4",
			// 					name: "Milo",
			// 					species: "Cat",
			// 					breed: "Bengal",
			// 					imageUrl: "https://via.placeholder.com/150",
			// 				},
			// 				ownerName: "Chris Lee",
			// 				petId: "4",
			// 				ownerId: "4",
			// 				createdAt: new Date().toISOString(),
			// 				updatedAt: new Date().toISOString(),
			// 			},
			// 			{
			// 				id: "5",
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 14 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				duration: 30,
			// 				status: "scheduled",
			// 				appointmentType: "dental",
			// 				reason: "Teeth cleaning",
			// 				pet: {
			// 					id: "5",
			// 					name: "Toby",
			// 					species: "Dog",
			// 					breed: "Beagle",
			// 					imageUrl: "https://via.placeholder.com/150",
			// 				},
			// 				ownerName: "Diana Cruz",
			// 				petId: "5",
			// 				ownerId: "5",
			// 				createdAt: new Date().toISOString(),
			// 				updatedAt: new Date().toISOString(),
			// 			},
			// 			{
			// 				id: "6",
			// 				appointmentDateTime: new Date(
			// 					Date.now() + 21 * 24 * 60 * 60 * 1000,
			// 				).toISOString(),
			// 				duration: 30,
			// 				status: "scheduled",
			// 				appointmentType: "checkup",
			// 				reason: "Routine exam",
			// 				pet: {
			// 					id: "6",
			// 					name: "Ginger",
			// 					species: "Cat",
			// 					breed: "Tabby",
			// 					imageUrl: "https://via.placeholder.com/150",
			// 				},
			// 				ownerName: "Ethan Gray",
			// 				petId: "6",
			// 				ownerId: "6",
			// 				createdAt: new Date().toISOString(),
			// 				updatedAt: new Date().toISOString(),
			// 			},
			// 		],
			// 		pagination: {
			// 			total: 1,
			// 			limit: 1,
			// 			page: 1,
			// 			totalPages: 1,
			// 		},
			// 	}),
			// );
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Group appointments by date
	const appointmentsByDate = React.useMemo(() => {
		if (!query.data?.appointments) {
			return {};
		}

		const grouped: Record<string, Appointment[]> = {};

		query.data.appointments.forEach((appointment) => {
			const dateKey = format(
				parseISO(appointment.appointmentDateTime),
				"yyyy-MM-dd",
			);

			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}

			grouped[dateKey].push(appointment);
		});

		// Sort appointments within each day by time
		Object.keys(grouped).forEach((dateKey) => {
			grouped[dateKey].sort((a, b) => {
				return (
					new Date(a.appointmentDateTime).getTime() -
					new Date(b.appointmentDateTime).getTime()
				);
			});
		});

		return grouped;
	}, [query.data?.appointments]);

	return {
		...query,
		appointments: query.data?.appointments ?? [],
		appointmentsByDate, // { "2024-01-15": [apt1, apt2], "2024-01-16": [apt3] }
	};
};
