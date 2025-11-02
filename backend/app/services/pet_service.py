from typing import Dict, List, Optional
from datetime import datetime
from fastapi import HTTPException, status
import uuid

from app.models.pet import Pet, CreatePetInput, UpdatePetInput, PetsResponse, PetPagination, PetStatus


class PetService:
    """Service layer for pet management"""
    
    # Mock pets database
    _pets: Dict[str, Pet] = {}

    @classmethod
    def initialize_mock_data(cls):
        cls._pets = {
        "pet_001": Pet(
            id="pet_001",
            name="Max",
            species="Dog",
            breed="Golden Retriever",
            age=3,
            imageUrl="https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=500",
            weight=32.5,
            color="Golden",
            medicalNotes="Up to date on all vaccinations. Allergic to chicken.",
            status=PetStatus.HEALTHY,
            ownerId="owner_123",
            createdAt=datetime(2023, 6, 15, 10, 30, 0),
            updatedAt=datetime(2024, 1, 10, 14, 20, 0)
        ),
        "pet_002": Pet(
            id="pet_002",
            name="Luna",
            species="Cat",
            breed="Siamese",
            age=2,
            imageUrl="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=500",
            weight=4.2,
            color="Seal Point",
            medicalNotes="Recent dental cleaning. Needs annual checkup in March.",
            status=PetStatus.HEALTHY,
            ownerId="owner_456",
            createdAt=datetime(2023, 8, 22, 9, 15, 0),
            updatedAt=datetime(2024, 1, 12, 11, 45, 0)
        ),
        "pet_003": Pet(
            id="pet_003",
            name="Charlie",
            species="Dog",
            breed="Beagle",
            age=5,
            imageUrl="https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=500",
            weight=12.8,
            color="Tri-color",
            medicalNotes="Recovering from minor surgery. Follow-up appointment scheduled.",
            status=PetStatus.RECOVERING,
            ownerId="owner_789",
            createdAt=datetime(2022, 3, 10, 14, 0, 0),
            updatedAt=datetime(2024, 1, 15, 16, 30, 0)
        ),
        "pet_004": Pet(
            id="pet_004",
            name="Whiskers",
            species="Cat",
            breed="Persian",
            age=4,
            imageUrl="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500",
            weight=5.5,
            color="White",
            medicalNotes="Currently on medication for ear infection. Daily drops required.",
            status=PetStatus.IN_TREATMENT,
            ownerId="owner_456",
            createdAt=datetime(2022, 11, 5, 12, 20, 0),
            updatedAt=datetime(2024, 1, 14, 9, 10, 0)
        ),
        "pet_005": Pet(
            id="pet_005",
            name="Rocky",
            species="Dog",
            breed="German Shepherd",
            age=7,
            imageUrl="https://images.unsplash.com/photo-1568572933382-74d440642117?w=500",
            weight=38.0,
            color="Black and Tan",
            medicalNotes="Senior dog. Arthritis in hind legs. Requires glucosamine supplements.",
            status=PetStatus.HEALTHY,
            ownerId="owner_321",
            createdAt=datetime(2020, 4, 18, 8, 45, 0),
            updatedAt=datetime(2024, 1, 8, 15, 55, 0)
        )
        }
    
    @classmethod
    async def get_user_pets(
        cls,
        user_id: str,
        page: int = 1,
        limit: int = 9
    ) -> PetsResponse:
        """Get user's pets with pagination"""
        # Filter pets by owner
        user_pets = [p for p in cls._pets.values() if p.owner_id == user_id]
        
        # Sort by created date (newest first)
        user_pets.sort(key=lambda p: p.created_at, reverse=True)
        
        # Pagination
        total = len(user_pets)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_pets = user_pets[start_idx:end_idx]
        
        pagination = PetPagination(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages
        )
        
        return PetsResponse(
            pets=paginated_pets,
            pagination=pagination
        )
    
    @classmethod
    async def create_pet(
        cls,
        pet_input: CreatePetInput,
        user_id: str
    ) -> Pet:
        """Create a new pet"""
        pet_id = f"pet_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        pet = Pet(
            id=pet_id,
            name=pet_input.name,
            species=pet_input.species,
            breed=pet_input.breed,
            age=pet_input.age,
            image_url=pet_input.image_url,
            weight=pet_input.weight,
            color=pet_input.color,
            medical_notes=pet_input.medical_notes,
            status=PetStatus.HEALTHY,
            owner_id=user_id,
            created_at=now,
            updated_at=now
        )
        
        cls._pets[pet_id] = pet
        return pet
    
    @classmethod
    async def get_pet_by_id(cls, pet_id: str) -> Optional[Pet]:
        """Get pet by ID"""
        return cls._pets.get(pet_id)
    
    @classmethod
    async def get_pet_by_id_or_404(cls, pet_id: str, user_id: str) -> Pet:
        """Get pet by ID or raise 404"""
        pet = cls._pets.get(pet_id)
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pet with id '{pet_id}' not found"
            )
        
        # Verify ownership
        if pet.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this pet"
            )
        
        return pet
    
    @classmethod
    async def update_pet(
        cls,
        pet_id: str,
        pet_input: UpdatePetInput,
        user_id: str
    ) -> Pet:
        """Update a pet"""
        pet = await cls.get_pet_by_id_or_404(pet_id, user_id)
        
        # Update fields
        pet.name = pet_input.name
        pet.species = pet_input.species
        pet.breed = pet_input.breed
        pet.age = pet_input.age
        pet.image_url = pet_input.image_url
        pet.weight = pet_input.weight
        pet.color = pet_input.color
        pet.medical_notes = pet_input.medical_notes
        pet.updated_at = datetime.utcnow()
        
        return pet
    
    @classmethod
    async def delete_pet(cls, pet_id: str, user_id: str) -> None:
        """Delete a pet"""
        pet = await cls.get_pet_by_id_or_404(pet_id, user_id)
        del cls._pets[pet_id]