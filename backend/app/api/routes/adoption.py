from fastapi import APIRouter, Path, Query, Body, status, Depends
from typing import Optional

from app.models.adoption import (
    AdoptablePet, AdoptablePetsResponse, AdoptionApplicationInput, AdoptionStatus
)
from app.services.adoption_service import AdoptionService

router = APIRouter(prefix="/adoption")


async def get_current_user_id() -> str:
    return "default"


@router.get(
    "/pets",
    response_model=AdoptablePetsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Adoptable Pets",
    description="Get paginated list of pets available for adoption"
)
async def get_adoptable_pets(
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=100),
    species: Optional[str] = Query(None, description="Filter by species"),
    status: str = Query("available", description="Filter by adoption status")
):
    """Get list of adoptable pets"""
    status_enum = AdoptionStatus(status)
    return await AdoptionService.get_adoptable_pets(page, limit, species, status_enum)


@router.get(
    "/pets/{pet_id}",
    response_model=AdoptablePet,
    status_code=status.HTTP_200_OK,
    summary="Get Adoptable Pet Details",
    description="Get detailed information about a specific adoptable pet"
)
async def get_adoptable_pet(
    pet_id: str = Path(..., description="Adoptable pet ID")
):
    """Get adoptable pet details"""
    return await AdoptionService.get_adoptable_pet_by_id_or_404(pet_id)


@router.post(
    "/pets/{pet_id}/adopt",
    response_model=AdoptablePet,
    status_code=status.HTTP_200_OK,
    summary="Submit Adoption Application",
    description="Submit an adoption application for a pet"
)
async def adopt_pet(
    pet_id: str = Path(..., description="Pet ID to adopt"),
    application_input: AdoptionApplicationInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Submit adoption application.
    
    Updates pet status to 'pending' and creates adoption application for review.
    """
    return await AdoptionService.submit_adoption_application(pet_id, application_input, user_id)