from fastapi import APIRouter, Path, Query, Body, status
from typing import Optional

from app.models.adoption import *
from app.services.adoption_service import AdoptionService

router = APIRouter(prefix="/admin/adoption")


@router.get("/pets", response_model=AdoptablePetsResponse)
async def get_admin_adoptable_pets(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None)
):
    """Get all adoptable pets (admin - all statuses)"""
    status_enum = AdoptionStatus(status) if status else None
    return await AdoptionService.get_all_adoptable_pets(page, limit, status_enum)


@router.post("/pets", response_model=AdoptablePet, status_code=status.HTTP_201_CREATED)
async def create_adoptable_pet(pet_input: CreateAdoptablePetInput = Body(...)):
    """Create new adoptable pet"""
    return await AdoptionService.create_adoptable_pet_admin(pet_input)


@router.put("/pets/{pet_id}", response_model=AdoptablePet)
async def update_adoptable_pet(
    pet_id: str = Path(...),
    pet_input: UpdateAdoptablePetInput = Body(...)
):
    """Update adoptable pet"""
    return await AdoptionService.update_adoptable_pet_admin(pet_id, pet_input)


@router.delete("/pets/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_adoptable_pet(pet_id: str = Path(...)):
    """Delete adoptable pet"""
    await AdoptionService.delete_adoptable_pet(pet_id)
    return None


@router.patch("/pets/{pet_id}/status", response_model=AdoptablePet)
async def update_adoption_status(
    pet_id: str = Path(...),
    status_input: UpdateAdoptionStatusInput = Body(...)
):
    """Update adoption status only"""
    return await AdoptionService.update_adoption_status(pet_id, status_input.adoption_status)


@router.get("/pets/{pet_id}/history", response_model=AdoptionHistory)
async def get_pet_adoption_history(pet_id: str = Path(...)):
    """Get adoption history for a pet"""
    return await AdoptionService.get_pet_adoption_history(pet_id)


@router.get("/applications", response_model=AdoptionApplicationsResponse)
async def get_adoption_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    pet_id: Optional[str] = Query(None, alias="petId")
):
    """Get all adoption applications"""
    return await AdoptionService.get_all_applications(page, limit, status, pet_id)


@router.get("/applications/{application_id}", response_model=AdoptionApplication)
async def get_adoption_application(application_id: str = Path(...)):
    """Get single adoption application"""
    app = await AdoptionService.get_application_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.post("/applications/{application_id}/review", response_model=AdoptionApplication)
async def review_adoption_application(
    application_id: str = Path(...),
    review_input: ReviewApplicationInput = Body(...)
):
    """Review adoption application (approve/reject)"""
    return await AdoptionService.review_application(
        application_id, review_input.status, review_input.admin_notes
    )


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_adoption_application(application_id: str = Path(...)):
    """Delete adoption application"""
    await AdoptionService.delete_application(application_id)
    return None