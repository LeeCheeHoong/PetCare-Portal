from fastapi import APIRouter, Path, Query, Body, status, Depends

from app.models.pet import Pet, CreatePetInput, UpdatePetInput, PetsResponse
from app.services.pet_service import PetService

router = APIRouter(prefix="/pets")


async def get_current_user_id() -> str:
    """Get current user ID"""
    return "default"


@router.get(
    "/my-pets",
    response_model=PetsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get User's Pets",
    description="Get paginated list of current user's pets"
)
async def get_my_pets(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(9, ge=1, le=100, description="Items per page"),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's pets with pagination"""
    return await PetService.get_user_pets(user_id, page, limit)


@router.post(
    "",
    response_model=Pet,
    status_code=status.HTTP_201_CREATED,
    summary="Create Pet",
    description="Add a new pet for the current user"
)
async def create_pet(
    pet_input: CreatePetInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new pet"""
    return await PetService.create_pet(pet_input, user_id)


@router.get(
    "/{pet_id}",
    response_model=Pet,
    status_code=status.HTTP_200_OK,
    summary="Get Pet Details",
    description="Get detailed information about a specific pet"
)
async def get_pet(
    pet_id: str = Path(..., description="Pet ID"),
    user_id: str = Depends(get_current_user_id)
):
    """Get pet by ID"""
    return await PetService.get_pet_by_id_or_404(pet_id, user_id)


@router.put(
    "/{pet_id}",
    response_model=Pet,
    status_code=status.HTTP_200_OK,
    summary="Update Pet",
    description="Update pet information"
)
async def update_pet(
    pet_id: str = Path(..., description="Pet ID"),
    pet_input: UpdatePetInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """Update a pet"""
    return await PetService.update_pet(pet_id, pet_input, user_id)


@router.delete(
    "/{pet_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Pet",
    description="Delete a pet"
)
async def delete_pet(
    pet_id: str = Path(..., description="Pet ID"),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a pet"""
    await PetService.delete_pet(pet_id, user_id)
    return None