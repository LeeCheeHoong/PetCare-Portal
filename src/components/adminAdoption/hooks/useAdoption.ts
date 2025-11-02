import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	AdoptablePet,
	AdoptablePetsResponse,
} from "@/components/adoption/hooks/useAdoption";

interface UseAdminAdoptablePetsParams {
	page?: number;
	limit?: number;
	status?: "available" | "pending" | "adopted" | "all";
}

// Fetch all adoptable pets (admin view - includes all statuses)
const fetchAdminAdoptablePets = async ({
	page = 1,
	limit = 10,
	status = "all",
}: UseAdminAdoptablePetsParams): Promise<AdoptablePetsResponse> => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	if (status !== "all") {
		params.append("status", status);
	}

	const response = await fetch(`/api/admin/adoption/pets?${params}`, {
		headers: {
			"Content-Type": "application/json",
			// Add auth token
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

export const useAdminAdoptablePets = (
	params: UseAdminAdoptablePetsParams = {},
) => {
	const { page = 1, limit = 10, status = "all" } = params;

	return useQuery({
		queryKey: ["admin-adoptable-pets", page, limit, status],
		queryFn: () => fetchAdminAdoptablePets({ page, limit, status }),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

// Create new adoptable pet
interface CreateAdoptablePetData {
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	description?: string;
	adoptionFee?: number;
	adoptionStatus?: "available" | "pending" | "adopted";
}

const createAdoptablePet = async (
	petData: CreateAdoptablePetData,
): Promise<AdoptablePet> => {
	const response = await fetch("/api/admin/adoption/pets", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(petData),
	});

	if (!response.ok) {
		throw new Error("Failed to create adoptable pet");
	}

	return response.json();
};

export const useAddAdoptablePet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAdoptablePet,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pets"] }); // Also invalidate public list
		},
	});
};

// Update adoptable pet
interface UpdateAdoptablePetData {
	name: string;
	species: string;
	breed: string;
	age: number;
	imageUrl?: string;
	weight?: number;
	color?: string;
	description?: string;
	adoptionFee?: number;
	adoptionStatus?: "available" | "pending" | "adopted";
}

const updateAdoptablePet = async (
	petId: string,
	petData: UpdateAdoptablePetData,
): Promise<AdoptablePet> => {
	const response = await fetch(`/api/admin/adoption/pets/${petId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(petData),
	});

	if (!response.ok) {
		throw new Error("Failed to update adoptable pet");
	}

	return response.json();
};

export const useEditAdoptablePet = (petId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (petData: UpdateAdoptablePetData) =>
			updateAdoptablePet(petId, petData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pet", petId] });
		},
	});
};

// Delete adoptable pet
const deleteAdoptablePet = async (petId: string): Promise<void> => {
	const response = await fetch(`/api/admin/adoption/pets/${petId}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to delete adoptable pet");
	}
};

export const useDeleteAdoptablePet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAdoptablePet,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pets"] });
		},
	});
};

// Update adoption status only
interface UpdateAdoptionStatusData {
	adoptionStatus: "available" | "pending" | "adopted";
}

const updateAdoptionStatus = async (
	petId: string,
	statusData: UpdateAdoptionStatusData,
): Promise<AdoptablePet> => {
	const response = await fetch(`/api/admin/adoption/pets/${petId}/status`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(statusData),
	});

	if (!response.ok) {
		throw new Error("Failed to update adoption status");
	}

	return response.json();
};

export const useUpdateAdoptionStatus = (petId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (statusData: UpdateAdoptionStatusData) =>
			updateAdoptionStatus(petId, statusData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pet", petId] });
		},
	});
};

// Adoption Application Interface
export interface AdoptionApplication {
	id: string;
	petId: string;
	pet: AdoptablePet; // Embedded pet details
	userId: string;
	status: "pending" | "approved" | "rejected";

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

	// Admin response
	adminNotes?: string;
	reviewedBy?: string;
	reviewedAt?: string;

	createdAt: string;
	updatedAt: string;
}

export interface AdoptionApplicationsResponse {
	applications: AdoptionApplication[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

interface UseAdminAdoptionApplicationsParams {
	page?: number;
	limit?: number;
	status?: "pending" | "approved" | "rejected" | "all";
	petId?: string; // Filter by specific pet
}

// Fetch all adoption applications
const fetchAdoptionApplications = async ({
	page = 1,
	limit = 10,
	status = "all",
	petId,
}: UseAdminAdoptionApplicationsParams): Promise<AdoptionApplicationsResponse> => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	if (status !== "all") {
		params.append("status", status);
	}

	if (petId) {
		params.append("petId", petId);
	}

	const response = await fetch(`/api/admin/adoption/applications?${params}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch adoption applications");
	}

	return response.json();

	// return new Promise((resolve) =>
	// 	resolve({
	// 		applications: [
	// 			{
	// 				id: "app_001",
	// 				petId: "pet_102",
	// 				pet: {
	// 					id: "pet_102",
	// 					name: "Buddy",
	// 					species: "dog",
	// 					breed: "Golden Retriever",
	// 					age: 3,
	// 					adoptionStatus: "available",
	// 					createdAt: "2025-11-01T14:32:00Z",
	// 					updatedAt: "2025-11-01T14:32:00Z",
	// 					imageUrl: "https://example.com/images/buddy.jpg",
	// 				},
	// 				userId: "user_501",
	// 				status: "pending",

	// 				adopterName: "Sarah Johnson",
	// 				adopterEmail: "sarah.johnson@email.com",
	// 				adopterPhone: "+1-555-234-8976",
	// 				adopterAddress: "456 Maple Avenue, Denver, CO 80205",

	// 				homeType: "house",
	// 				hasYard: true,
	// 				hasOtherPets: false,

	// 				petExperience: "some",
	// 				reasonForAdoption: "Looking for a family companion for my kids.",

	// 				notes: "I have weekends free and a fenced yard for playtime.",
	// 				createdAt: "2025-11-01T14:32:00Z",
	// 				updatedAt: "2025-11-01T14:32:00Z",
	// 			},
	// 			{
	// 				id: "app_002",
	// 				petId: "pet_209",
	// 				pet: {
	// 					id: "pet_209",
	// 					name: "Whiskers",
	// 					species: "cat",
	// 					breed: "Maine Coon",
	// 					age: 2,
	// 					adoptionStatus: "available",
	// 					createdAt: "2025-11-01T14:32:00Z",
	// 					updatedAt: "2025-11-01T14:32:00Z",
	// 					imageUrl: "https://example.com/images/whiskers.jpg",
	// 				},
	// 				userId: "user_432",
	// 				status: "approved",

	// 				adopterName: "Daniel Kim",
	// 				adopterEmail: "daniel.kim@email.com",
	// 				adopterPhone: "+1-555-993-2214",
	// 				adopterAddress: "92 Elm Street, Portland, OR 97209",

	// 				homeType: "apartment",
	// 				hasYard: false,
	// 				hasOtherPets: true,
	// 				otherPetsDetails: "One neutered male cat, 4 years old.",

	// 				petExperience: "extensive",
	// 				reasonForAdoption: "Want to give another cat a loving home.",

	// 				adminNotes: "Approved after home visit. Great environment.",
	// 				reviewedBy: "admin_01",
	// 				reviewedAt: "2025-11-03T10:12:00Z",

	// 				createdAt: "2025-10-30T09:47:00Z",
	// 				updatedAt: "2025-11-03T10:12:00Z",
	// 			},
	// 			{
	// 				id: "app_003",
	// 				petId: "pet_315",
	// 				pet: {
	// 					id: "pet_315",
	// 					name: "Luna",
	// 					species: "dog",
	// 					breed: "Border Collie",
	// 					age: 1,
	// 					adoptionStatus: "available",
	// 					createdAt: "2025-11-01T14:32:00Z",
	// 					updatedAt: "2025-11-01T14:32:00Z",
	// 					imageUrl: "https://example.com/images/luna.jpg",
	// 				},
	// 				userId: "user_619",
	// 				status: "rejected",

	// 				adopterName: "Michael Rivera",
	// 				adopterEmail: "michael.rivera@email.com",
	// 				adopterPhone: "+1-555-442-1188",
	// 				adopterAddress: "220 Cedar Lane, Austin, TX 73301",

	// 				homeType: "condo",
	// 				hasYard: false,
	// 				hasOtherPets: true,
	// 				otherPetsDetails: "Small parrot named Kiwi.",

	// 				petExperience: "none",
	// 				reasonForAdoption: "I’ve always wanted a dog companion.",

	// 				notes: "I work from home full-time.",
	// 				adminNotes:
	// 					"Rejected due to unsuitable living space for a high-energy breed.",
	// 				reviewedBy: "admin_02",
	// 				reviewedAt: "2025-11-02T15:25:00Z",

	// 				createdAt: "2025-10-29T16:00:00Z",
	// 				updatedAt: "2025-11-02T15:25:00Z",
	// 			},
	// 		],
	// 		pagination: {
	// 			page: 1,
	// 			limit: 10,
	// 			total: 0,
	// 			totalPages: 0,
	// 		},
	// 	}),
	// );
};

export const useAdminAdoptionApplications = (
	params: UseAdminAdoptionApplicationsParams = {},
) => {
	const { page = 1, limit = 10, status = "all", petId } = params;

	return useQuery({
		queryKey: ["admin-adoption-applications", page, limit, status, petId],
		queryFn: () => fetchAdoptionApplications({ page, limit, status, petId }),
		staleTime: 1 * 60 * 1000, // 1 minute
	});
};

// Fetch single adoption application
const fetchAdoptionApplication = async (
	applicationId: string,
): Promise<AdoptionApplication> => {
	const response = await fetch(
		`/api/admin/adoption/applications/${applicationId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch adoption application");
	}

	return response.json();
	// return new Promise((resolve) =>
	// 	resolve({
	// 		id: "app_001",
	// 		petId: "pet_102",
	// 		pet: {
	// 			id: "pet_102",
	// 			name: "Buddy",
	// 			species: "dog",
	// 			breed: "Golden Retriever",
	// 			age: 3,
	// 			adoptionStatus: "available",
	// 			createdAt: "2025-11-01T14:32:00Z",
	// 			updatedAt: "2025-11-01T14:32:00Z",
	// 			imageUrl: "https://example.com/images/buddy.jpg",
	// 		},
	// 		userId: "user_501",
	// 		status: "pending",

	// 		adopterName: "Sarah Johnson",
	// 		adopterEmail: "sarah.johnson@email.com",
	// 		adopterPhone: "+1-555-234-8976",
	// 		adopterAddress: "456 Maple Avenue, Denver, CO 80205",

	// 		homeType: "house",
	// 		hasYard: true,
	// 		hasOtherPets: false,

	// 		petExperience: "some",
	// 		reasonForAdoption: "Looking for a family companion for my kids.",

	// 		notes: "I have weekends free and a fenced yard for playtime.",
	// 		createdAt: "2025-11-01T14:32:00Z",
	// 		updatedAt: "2025-11-01T14:32:00Z",
	// 	}),
	// );
};

export const useAdminAdoptionApplication = (applicationId?: string) => {
	return useQuery({
		queryKey: ["admin-adoption-application", applicationId],
		queryFn: () => fetchAdoptionApplication(applicationId!),
		enabled: !!applicationId,
		staleTime: 1 * 60 * 1000,
	});
};

// Review adoption application (approve/reject)
interface ReviewApplicationData {
	status: "approved" | "rejected";
	adminNotes?: string;
}

const reviewAdoptionApplication = async (
	applicationId: string,
	reviewData: ReviewApplicationData,
): Promise<AdoptionApplication> => {
	const response = await fetch(
		`/api/admin/adoption/applications/${applicationId}/review`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(reviewData),
		},
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "Failed to review application");
	}

	return response.json();
};

export const useReviewAdoptionApplication = (applicationId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (reviewData: ReviewApplicationData) =>
			reviewAdoptionApplication(applicationId, reviewData),
		onSuccess: (data) => {
			// Invalidate applications list
			queryClient.invalidateQueries({
				queryKey: ["admin-adoption-applications"],
			});
			// Invalidate specific application
			queryClient.invalidateQueries({
				queryKey: ["admin-adoption-application", applicationId],
			});
			// Invalidate pets list (status may have changed)
			queryClient.invalidateQueries({ queryKey: ["admin-adoptable-pets"] });
			queryClient.invalidateQueries({ queryKey: ["adoptable-pets"] });
			// Invalidate specific pet
			queryClient.invalidateQueries({
				queryKey: ["adoptable-pet", data.petId],
			});
		},
	});
};

// Get adoption history for a specific pet
interface AdoptionHistory {
	applications: AdoptionApplication[];
	currentStatus: "available" | "pending" | "adopted";
	totalApplications: number;
	approvedApplication?: AdoptionApplication;
}

const fetchPetAdoptionHistory = async (
	petId: string,
): Promise<AdoptionHistory> => {
	const response = await fetch(`/api/admin/adoption/pets/${petId}/history`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch adoption history");
	}

	return response.json();
};

export const usePetAdoptionHistory = (petId?: string) => {
	return useQuery({
		queryKey: ["pet-adoption-history", petId],
		queryFn: () => fetchPetAdoptionHistory(petId!),
		enabled: !!petId,
		staleTime: 2 * 60 * 1000,
	});
};

// Delete/Cancel adoption application
const deleteAdoptionApplication = async (
	applicationId: string,
): Promise<void> => {
	const response = await fetch(
		`/api/admin/adoption/applications/${applicationId}`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to delete adoption application");
	}
};

export const useDeleteAdoptionApplication = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAdoptionApplication,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin-adoption-applications"],
			});
		},
	});
};
