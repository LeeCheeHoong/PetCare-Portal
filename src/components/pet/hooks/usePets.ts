import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Pet {
	id: string;
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	medicalNotes?: string;
	status: "healthy" | "sick" | "in-treatment" | "recovering";
	ownerId: string;
	createdAt: string;
	updatedAt: string;
}

export interface PetsResponse {
	pets: Pet[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

interface UsePetsParams {
	page?: number;
	limit?: number;
}

// API call function with pagination params
const fetchUserPets = async ({
	page = 1,
	limit = 9,
}: UsePetsParams): Promise<PetsResponse> => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	const response = await fetch(`/api/pets/my-pets?${params}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch pets");
	}

	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		pets: [],
	// 		pagination: {
	// 			limit: 10,
	// 			page: 1,
	// 			total: 20,
	// 			totalPages: 2,
	// 		},
	// 	}),
	// );
};

export const usePets = (params: UsePetsParams = {}) => {
	const { page = 1, limit = 9 } = params;

	return useQuery({
		queryKey: ["user-pets", page, limit],
		queryFn: () => fetchUserPets({ page, limit }),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

interface CreatePetData {
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	medicalNotes?: string;
}

const createPet = async (petData: CreatePetData): Promise<Pet> => {
	const response = await fetch("/api/pets", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(petData),
	});

	if (!response.ok) {
		throw new Error("Failed to create pet");
	}

	return response.json();
};

export const useAddPet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPet,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-pets"] });
		},
	});
};

const fetchPet = async (petId: string): Promise<Pet> => {
	const response = await fetch(`/api/pets/${petId}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch pet");
	}

	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		id: "1",
	// 		age: 2,
	// 		breed: "Pomeranian",
	// 		createdAt: new Date().toString(),
	// 		name: "Buddy",
	// 		ownerId: "1",
	// 		species: "Dog",
	// 		status: "healthy",
	// 		updatedAt: new Date().toDateString(),
	// 		color: "Brown",
	// 		imageUrl:
	// 			"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
	// 		medicalNotes: "a",
	// 		weight: 43,
	// 	}),
	// );
};

export const usePet = (petId?: string) => {
	return useQuery({
		queryKey: ["pet", petId],
		queryFn: () => fetchPet(petId!),
		enabled: !!petId, // Only fetch if petId exists
		staleTime: 5 * 60 * 1000,
	});
};

interface UpdatePetData {
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	medicalNotes?: string;
}

const updatePet = async (
	petId: string,
	petData: UpdatePetData,
): Promise<Pet> => {
	const response = await fetch(`/api/pets/${petId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(petData),
	});

	if (!response.ok) {
		throw new Error("Failed to update pet");
	}

	return response.json();
};

export const useEditPet = (petId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (petData: UpdatePetData) => updatePet(petId, petData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pet", petId] });
			queryClient.invalidateQueries({ queryKey: ["user-pets"] });
		},
	});
};
