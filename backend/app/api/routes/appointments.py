from fastapi import APIRouter, Path, Query, Body, status, Depends
from typing import Optional

from app.models.appointment import (
    Appointment, BookAppointmentInput, RescheduleAppointmentInput,
    AppointmentsResponse, AppointmentStatus
)
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointments")


async def get_current_user_id() -> str:
    return "default"


@router.get(
    "/my-appointments",
    response_model=AppointmentsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get User's Appointments",
    description="Get paginated list of user's appointments with optional filtering"
)
async def get_my_appointments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    pet_id: Optional[str] = Query(None, alias="petId"),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's appointments"""
    status_enum = AppointmentStatus(status) if status else None
    return await AppointmentService.get_user_appointments(user_id, page, limit, status_enum, pet_id)


@router.post(
    "",
    response_model=Appointment,
    status_code=status.HTTP_201_CREATED,
    summary="Book Appointment",
    description="Book a new appointment for a pet"
)
async def book_appointment(
    appointment_input: BookAppointmentInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """Book a new appointment"""
    return await AppointmentService.book_appointment(appointment_input, user_id)


@router.patch(
    "/{appointment_id}/cancel",
    response_model=Appointment,
    status_code=status.HTTP_200_OK,
    summary="Cancel Appointment",
    description="Cancel a scheduled appointment"
)
async def cancel_appointment(
    appointment_id: str = Path(...),
    user_id: str = Depends(get_current_user_id)
):
    """Cancel an appointment"""
    return await AppointmentService.cancel_appointment(appointment_id, user_id)


@router.patch(
    "/{appointment_id}/reschedule",
    response_model=Appointment,
    status_code=status.HTTP_200_OK,
    summary="Reschedule Appointment",
    description="Reschedule an existing appointment"
)
async def reschedule_appointment(
    appointment_id: str = Path(...),
    reschedule_input: RescheduleAppointmentInput = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """Reschedule an appointment"""
    return await AppointmentService.reschedule_appointment(appointment_id, reschedule_input, user_id)