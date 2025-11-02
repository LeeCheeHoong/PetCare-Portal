import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AdoptablePet {
	id: string;
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	description?: string;
	adoptionFee?: number;
	adoptionStatus: "available" | "pending" | "adopted";
	createdAt: string;
	updatedAt: string;
}

export interface AdoptablePetsResponse {
	pets: AdoptablePet[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

interface UseAdoptablePetsParams {
	page?: number;
	limit?: number;
	species?: string;
	status?: "available" | "pending" | "adopted";
}

// Fetch pets available for adoption
const fetchAdoptablePets = async ({
	page = 1,
	limit = 9,
	species,
	status = "available",
}: UseAdoptablePetsParams): Promise<AdoptablePetsResponse> => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		status,
	});

	if (species) {
		params.append("species", species);
	}

	const response = await fetch(`/api/adoption/pets?${params}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch adoptable pets");
	}

	return response.json();
	// return new Promise((resolve) =>
	// 	resolve({
	// 		pets: [
	// 			{
	// 				id: "1",
	// 				name: "Bella",
	// 				species: "Dog",
	// 				breed: "Labrador Retriever",
	// 				age: 3,
	// 				imageUrl:
	// 					"https://upload.wikimedia.org/wikipedia/commons/3/34/Labrador_on_Quantock_%282175262184%29.jpg",
	// 				weight: 28.5,
	// 				color: "Yellow",
	// 				description:
	// 					"Friendly and energetic Labrador who loves to play fetch.",
	// 				adoptionFee: 150,
	// 				adoptionStatus: "available",
	// 				createdAt: "2025-09-12T10:15:30Z",
	// 				updatedAt: "2025-10-01T14:20:00Z",
	// 			},
	// 			{
	// 				id: "2",
	// 				name: "Milo",
	// 				species: "Cat",
	// 				breed: "Siamese",
	// 				age: 2,
	// 				imageUrl:
	// 					"https://www.catster.com/wp-content/uploads/2023/11/Siamese-Cat_Andreas-LischkaPixabay.jpg",
	// 				weight: 5.2,
	// 				color: "Cream",
	// 				description: "Curious and talkative Siamese cat who loves attention.",
	// 				adoptionFee: 100,
	// 				adoptionStatus: "pending",
	// 				createdAt: "2025-08-22T09:10:00Z",
	// 				updatedAt: "2025-10-15T12:00:00Z",
	// 			},
	// 			{
	// 				id: "3",
	// 				name: "Charlie",
	// 				species: "Dog",
	// 				breed: "Beagle",
	// 				age: 4,
	// 				imageUrl:
	// 					"https://patmypets.com/wp-content/uploads/2021/11/Beagle-dog-2.jpg",
	// 				weight: 11.3,
	// 				color: "Tri-color",
	// 				description: "Loves long walks and sniffing around the park.",
	// 				adoptionFee: 120,
	// 				adoptionStatus: "adopted",
	// 				createdAt: "2025-07-10T13:25:00Z",
	// 				updatedAt: "2025-09-01T08:40:00Z",
	// 			},
	// 			{
	// 				id: "4",
	// 				name: "Luna",
	// 				species: "Cat",
	// 				breed: "Maine Coon",
	// 				age: 5,
	// 				imageUrl:
	// 					"https://scampsandchamps.co.uk/wp-content/uploads/2025/02/pexels-jimme-deknatel-1244708-2518134.jpg",
	// 				weight: 6.7,
	// 				color: "Gray",
	// 				description: "Gentle giant who enjoys being brushed.",
	// 				adoptionFee: 130,
	// 				adoptionStatus: "available",
	// 				createdAt: "2025-06-18T16:10:00Z",
	// 				updatedAt: "2025-09-10T11:00:00Z",
	// 			},
	// 			{
	// 				id: "5",
	// 				name: "Rocky",
	// 				species: "Dog",
	// 				breed: "German Shepherd",
	// 				age: 6,
	// 				weight: 32.8,
	// 				color: "Black and Tan",
	// 				description: "Loyal and protective, great with families.",
	// 				imageUrl:
	// 					"https://cdn.britannica.com/79/232779-050-6B0411D7/German-Shepherd-dog-Alsatian.jpg",
	// 				adoptionFee: 180,
	// 				adoptionStatus: "available",
	// 				createdAt: "2025-05-25T10:00:00Z",
	// 				updatedAt: "2025-10-20T09:15:00Z",
	// 			},
	// 			{
	// 				id: "6",
	// 				name: "Coco",
	// 				species: "Bird",
	// 				breed: "Cockatiel",
	// 				age: 1,
	// 				imageUrl:
	// 					"https://www.kaytee.com/-/media/Project/OneWeb/Kaytee/US/learn-care/everything-you-need-to-know-about-pet-cockatiels/everything-you-need-to-know-about-pet-cockatiels.jpg",
	// 				color: "Yellow and Gray",
	// 				description: "Chirpy little bird who loves whistling tunes.",
	// 				adoptionFee: 60,
	// 				adoptionStatus: "available",
	// 				createdAt: "2025-07-30T08:00:00Z",
	// 				updatedAt: "2025-09-05T09:45:00Z",
	// 			},
	// 			{
	// 				id: "7",
	// 				name: "Nala",
	// 				species: "Cat",
	// 				breed: "Bengal",
	// 				age: 2,
	// 				weight: 4.8,
	// 				color: "Golden",
	// 				imageUrl:
	// 					"https://cdn.mos.cms.futurecdn.net/v2/t:0,l:420,cw:1080,ch:1080,q:80,w:1080/Uwu9iN5UXkusxNwr2Dixuh.jpg",
	// 				description: "Playful and loves climbing.",
	// 				adoptionFee: 140,
	// 				adoptionStatus: "pending",
	// 				createdAt: "2025-08-10T10:30:00Z",
	// 				updatedAt: "2025-10-25T16:30:00Z",
	// 			},
	// 		],
	// 		pagination: {
	// 			page: 1,
	// 			limit: 9,
	// 			total: 7,
	// 			totalPages: 1,
	// 		},
	// 	}),
	// );
};

export const useAdoptablePets = (params: UseAdoptablePetsParams = {}) => {
	const { page = 1, limit = 9, species, status = "available" } = params;

	return useQuery({
		queryKey: ["adoptable-pets", page, limit, species, status],
		queryFn: () => fetchAdoptablePets({ page, limit, species, status }),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Fetch single adoptable pet details
const fetchAdoptablePet = async (petId: string): Promise<AdoptablePet> => {
	const response = await fetch(`/api/adoption/pets/${petId}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch pet details");
	}

	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		id: "1",
	// 		name: "Bella",
	// 		species: "Dog",
	// 		breed: "Labrador Retriever",
	// 		age: 3,
	// 		imageUrl:
	// 			"https://upload.wikimedia.org/wikipedia/commons/3/34/Labrador_on_Quantock_%282175262184%29.jpg",
	// 		weight: 28.5,
	// 		color: "Yellow",
	// 		description: "Friendly and energetic Labrador who loves to play fetch.",
	// 		adoptionFee: 150,
	// 		adoptionStatus: "available",
	// 		createdAt: "2025-09-12T10:15:30Z",
	// 		updatedAt: "2025-10-01T14:20:00Z",
	// 	}),
	// );
};

export const useAdoptablePet = (petId?: string) => {
	return useQuery({
		queryKey: ["adoptable-pet", petId],
		queryFn: () => fetchAdoptablePet(petId!),
		enabled: !!petId,
		staleTime: 5 * 60 * 1000,
	});
};

// Adopt a pet mutation
interface AdoptPetData {
	// Adopter Information
	adopterName: string;
	adopterEmail: string;
	adopterPhone: string;
	adopterAddress: string;

	// Living Situation
	homeType: "house" | "apartment" | "condo" | "other";
	hasYard: boolean;
	hasOtherPets: boolean;
	otherPetsDetails?: string;

	// Experience & Preferences
	petExperience: "none" | "some" | "extensive";
	reasonForAdoption: string;

	// Additional Notes
	notes?: string;
}

const adoptPet = async (
	petId: string,
	adoptionData: AdoptPetData,
): Promise<AdoptablePet> => {
	const response = await fetch(`/api/adoption/pets/${petId}/adopt`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(adoptionData),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "Failed to adopt pet");
	}

	return response.json();
};

export const useAdoptPet = (petId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (adoptionData: AdoptPetData) => adoptPet(petId, adoptionData),
		onSuccess: () => {
			// Invalidate adoptable pets list and specific pet
			queryClient.invalidateQueries({ queryKey: ["adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pet", petId] });
		},
	});
};
