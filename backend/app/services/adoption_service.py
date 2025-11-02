from typing import Dict, List, Optional
from datetime import datetime
from fastapi import HTTPException, status
import uuid

from app.models.adoption import (
    AdoptablePet, AdoptionApplicationInput, AdoptionApplication,
    AdoptablePetsResponse, AdoptablePetPagination, AdoptionStatus,
    CreateAdoptablePetInput, UpdateAdoptablePetInput,
    AdoptionApplicationPagination, AdoptionApplicationsResponse,
    AdoptionHistory
)


class AdoptionService:
    """Service layer for pet adoption management"""
    
    _adoptable_pets: Dict[str, AdoptablePet] = {}
    _adoption_applications: Dict[str, AdoptionApplication] = {}
    
    @classmethod
    def initialize_mock_data(cls):
        """Initialize with mock adoptable pets"""
        pet_id_1 = f"adopt_{uuid.uuid4().hex[:8]}"
        pet_id_2 = f"adopt_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        cls._adoptable_pets = {
            pet_id_1: AdoptablePet(
                id=pet_id_1,
                name="Max",
                species="Dog",
                breed="Golden Retriever",
                age=3,
                image_url="https://images.unsplash.com/photo-1633722715463-d30f4f325e24",
                weight=30.0,
                color="Golden",
                description="Friendly and energetic golden retriever",
                adoption_fee=250.0,
                adoption_status=AdoptionStatus.AVAILABLE,
                created_at=now,
                updated_at=now
            ),
            pet_id_2: AdoptablePet(
                id=pet_id_2,
                name="Luna",
                species="Cat",
                breed="Siamese",
                age=2,
                image_url="https://images.unsplash.com/photo-1574158622682-e40e69881006",
                weight=4.5,
                color="Cream",
                description="Sweet and playful Siamese cat",
                adoption_fee=150.0,
                adoption_status=AdoptionStatus.AVAILABLE,
                created_at=now,
                updated_at=now
            )
        }
    
    @classmethod
    async def get_adoptable_pets(
        cls,
        page: int = 1,
        limit: int = 9,
        species: Optional[str] = None,
        status: AdoptionStatus = AdoptionStatus.AVAILABLE
    ) -> AdoptablePetsResponse:
        """Get list of adoptable pets with filtering"""
        pets = list(cls._adoptable_pets.values())
        
        # Filter by status
        pets = [p for p in pets if p.adoption_status == status]
        
        # Filter by species
        if species:
            pets = [p for p in pets if p.species.lower() == species.lower()]
        
        # Sort by created date (newest first)
        pets.sort(key=lambda p: p.created_at, reverse=True)
        
        # Pagination
        total = len(pets)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_pets = pets[start_idx:end_idx]
        
        pagination = AdoptablePetPagination(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages
        )
        
        return AdoptablePetsResponse(
            pets=paginated_pets,
            pagination=pagination
        )
    
    @classmethod
    async def get_adoptable_pet_by_id(cls, pet_id: str) -> Optional[AdoptablePet]:
        """Get adoptable pet by ID"""
        return cls._adoptable_pets.get(pet_id)
    
    @classmethod
    async def get_adoptable_pet_by_id_or_404(cls, pet_id: str) -> AdoptablePet:
        """Get adoptable pet by ID or raise 404"""
        pet = cls._adoptable_pets.get(pet_id)
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Adoptable pet with id '{pet_id}' not found"
            )
        return pet
    
    @classmethod
    async def submit_adoption_application(
        cls,
        pet_id: str,
        application_input: AdoptionApplicationInput,
        user_id: str
    ) -> AdoptablePet:
        """Submit adoption application"""
        # Get pet
        pet = await cls.get_adoptable_pet_by_id_or_404(pet_id)
        
        # Check if pet is available
        if pet.adoption_status != AdoptionStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This pet is not available for adoption. Current status: {pet.adoption_status.value}"
            )
        
        # Check if user already has pending application for this pet
        existing_app = next(
            (app for app in cls._adoption_applications.values()
             if app.pet_id == pet_id and app.user_id == user_id and app.status == "pending"),
            None
        )
        
        if existing_app:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have a pending application for this pet"
            )
        
        # Create application
        app_id = f"app_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        application = AdoptionApplication(
            id=app_id,
            pet_id=pet_id,
            pet=pet,
            user_id=user_id,
            adopter_name=application_input.adopter_name,
            adopter_email=application_input.adopter_email,
            adopter_phone=application_input.adopter_phone,
            adopter_address=application_input.adopter_address,
            home_type=application_input.home_type,
            has_yard=application_input.has_yard,
            has_other_pets=application_input.has_other_pets,
            other_pets_details=application_input.other_pets_details,
            pet_experience=application_input.pet_experience,
            reason_for_adoption=application_input.reason_for_adoption,
            notes=application_input.notes,
            status="pending",
            created_at=now,
            updated_at=now
        )
        
        cls._adoption_applications[app_id] = application
        
        # Update pet status to pending
        pet.adoption_status = AdoptionStatus.PENDING
        pet.updated_at = now
        
        return pet
    
    @classmethod
    async def create_adoptable_pet(
        cls,
        name: str,
        species: str,
        breed: str,
        age: int,
        image_url: Optional[str] = None,
        weight: Optional[float] = None,
        color: Optional[str] = None,
        description: Optional[str] = None,
        adoption_fee: Optional[float] = None
    ) -> AdoptablePet:
        """Create a new adoptable pet (admin only)"""
        pet_id = f"adopt_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        pet = AdoptablePet(
            id=pet_id,
            name=name,
            species=species,
            breed=breed,
            age=age,
            image_url=image_url,
            weight=weight,
            color=color,
            description=description,
            adoption_fee=adoption_fee,
            adoption_status=AdoptionStatus.AVAILABLE,
            created_at=now,
            updated_at=now
        )
        
        cls._adoptable_pets[pet_id] = pet
        return pet

    @classmethod
    async def get_all_adoptable_pets(
        cls,
        page: int = 1,
        limit: int = 10,
        status: Optional[AdoptionStatus] = None
    ) -> AdoptablePetsResponse:
        """Get all adoptable pets including all statuses (admin)"""
        pets = list(cls._adoptable_pets.values())
        
        # Filter by status if provided
        if status:
            pets = [p for p in pets if p.adoption_status == status]
        
        # Sort by created date
        pets.sort(key=lambda p: p.created_at, reverse=True)
        
        # Pagination
        total = len(pets)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated = pets[start_idx:end_idx]
        
        pagination = AdoptablePetPagination(
            page=page, limit=limit, total=total, total_pages=total_pages
        )
        
        return AdoptablePetsResponse(pets=paginated, pagination=pagination)

    @classmethod
    async def create_adoptable_pet_admin(
        cls,
        pet_input: CreateAdoptablePetInput
    ) -> AdoptablePet:
        """Create adoptable pet (admin)"""
        pet_id = f"adopt_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        pet = AdoptablePet(
            id=pet_id,
            name=pet_input.name,
            species=pet_input.species,
            breed=pet_input.breed,
            age=pet_input.age,
            image_url=pet_input.image_url,
            weight=pet_input.weight,
            color=pet_input.color,
            description=pet_input.description,
            adoption_fee=pet_input.adoption_fee,
            adoption_status=pet_input.adoption_status,
            created_at=now,
            updated_at=now
        )
        
        cls._adoptable_pets[pet_id] = pet
        return pet

    @classmethod
    async def update_adoptable_pet_admin(
        cls,
        pet_id: str,
        pet_input: UpdateAdoptablePetInput
    ) -> AdoptablePet:
        """Update adoptable pet (admin)"""
        pet = await cls.get_adoptable_pet_by_id_or_404(pet_id)
        
        pet.name = pet_input.name
        pet.species = pet_input.species
        pet.breed = pet_input.breed
        pet.age = pet_input.age
        pet.image_url = pet_input.image_url
        pet.weight = pet_input.weight
        pet.color = pet_input.color
        pet.description = pet_input.description
        pet.adoption_fee = pet_input.adoption_fee
        pet.adoption_status = pet_input.adoption_status
        pet.updated_at = datetime.utcnow()
        
        return pet

    @classmethod
    async def delete_adoptable_pet(cls, pet_id: str) -> None:
        """Delete adoptable pet (admin)"""
        if pet_id not in cls._adoptable_pets:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Adoptable pet with id '{pet_id}' not found"
            )
        del cls._adoptable_pets[pet_id]

    @classmethod
    async def update_adoption_status(
        cls,
        pet_id: str,
        new_status: AdoptionStatus
    ) -> AdoptablePet:
        """Update adoption status only (admin)"""
        pet = await cls.get_adoptable_pet_by_id_or_404(pet_id)
        pet.adoption_status = new_status
        pet.updated_at = datetime.utcnow()
        return pet

    @classmethod
    async def get_all_applications(
        cls,
        page: int = 1,
        limit: int = 10,
        status: Optional[str] = None,
        pet_id: Optional[str] = None
    ) -> AdoptionApplicationsResponse:
        """Get all adoption applications (admin)"""
        applications = list(cls._adoption_applications.values())
        
        # Filter by status
        if status:
            applications = [a for a in applications if a.status == status]
        
        # Filter by pet
        if pet_id:
            applications = [a for a in applications if a.pet_id == pet_id]
        
        # Sort by created date
        applications.sort(key=lambda a: a.created_at, reverse=True)
        
        # Pagination
        total = len(applications)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated = applications[start_idx:end_idx]
        
        pagination = AdoptionApplicationPagination(
            page=page, limit=limit, total=total, total_pages=total_pages
        )
        
        return AdoptionApplicationsResponse(applications=paginated, pagination=pagination)

    @classmethod
    async def get_application_by_id(cls, app_id: str) -> Optional[AdoptionApplication]:
        """Get application by ID"""
        return cls._adoption_applications.get(app_id)

    @classmethod
    async def review_application(
        cls,
        app_id: str,
        status: str,
        admin_notes: Optional[str] = None,
        reviewed_by: str = "admin"
    ) -> AdoptionApplication:
        """Review adoption application (admin)"""
        app = cls._adoption_applications.get(app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id '{app_id}' not found"
            )
        
        if app.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Application already {app.status}"
            )
        
        app.status = status
        app.admin_notes = admin_notes
        app.reviewed_by = reviewed_by
        app.reviewed_at = datetime.utcnow()
        app.updated_at = datetime.utcnow()
        
        # Update pet status
        pet = cls._adoptable_pets.get(app.pet_id)
        if pet:
            if status == "approved":
                pet.adoption_status = AdoptionStatus.ADOPTED
            elif status == "rejected":
                # Check if there are other pending applications
                other_pending = any(
                    a for a in cls._adoption_applications.values()
                    if a.pet_id == app.pet_id and a.status == "pending" and a.id != app_id
                )
                if not other_pending:
                    pet.adoption_status = AdoptionStatus.AVAILABLE
            pet.updated_at = datetime.utcnow()
        
        return app

    @classmethod
    async def get_pet_adoption_history(cls, pet_id: str) -> AdoptionHistory:
        """Get adoption history for a pet (admin)"""
        pet = await cls.get_adoptable_pet_by_id_or_404(pet_id)
        
        applications = [
            a for a in cls._adoption_applications.values()
            if a.pet_id == pet_id
        ]
        
        applications.sort(key=lambda a: a.created_at, reverse=True)
        
        approved_app = next((a for a in applications if a.status == "approved"), None)
        
        return AdoptionHistory(
            applications=applications,
            current_status=pet.adoption_status,
            total_applications=len(applications),
            approved_application=approved_app
        )

    @classmethod
    async def delete_application(cls, app_id: str) -> None:
        """Delete adoption application (admin)"""
        if app_id not in cls._adoption_applications:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id '{app_id}' not found"
            )
        del cls._adoption_applications[app_id]