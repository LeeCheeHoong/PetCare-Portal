from fastapi import APIRouter, Path, Query, Body, status, HTTPException
from typing import Optional

from app.models.appointment import (
    Appointment, AppointmentsResponse, UpdateAppointmentStatusInput
)
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/vet/appointments")

@router.get(
    "",
    response_model=AppointmentsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get All Appointments (Vet)",
    description="Get all appointments with search and date filtering"
)
async def get_vet_appointments(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000),
    search: Optional[str] = Query(None, description="Search by owner or pet name"),
    date: Optional[str] = Query(None, description="Filter by specific date (yyyy-MM-dd)"),
    start_date: Optional[str] = Query(None, alias="startDate", description="Start date for range filter (yyyy-MM-dd)"),
    end_date: Optional[str] = Query(None, alias="endDate", description="End date for range filter (yyyy-MM-dd)")
):
    """
    Get all appointments for vet dashboard or calendar.
    
    Supports:
    - Single date filter (date parameter)
    - Date range filter (startDate and endDate for calendar view)
    - Search by owner or pet name
    """
    return await AppointmentService.get_all_appointments(
        page, limit, search, date, start_date, end_date
    )

@router.get(
    "/{appointment_id}",
    response_model=Appointment,
    status_code=status.HTTP_200_OK,
    summary="Get Appointment Details (Vet)",
    description="Get detailed appointment information"
)
async def get_appointment(
    appointment_id: str = Path(..., description="Appointment ID")
):
    """Get single appointment details"""
    appointment = await AppointmentService.get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with id '{appointment_id}' not found"
        )
    return appointment


@router.patch(
    "/{appointment_id}",
    response_model=Appointment,
    status_code=status.HTTP_200_OK,
    summary="Update Appointment Status (Vet)",
    description="Update appointment status, diagnosis, and treatment"
)
async def update_appointment_status(
    appointment_id: str = Path(..., description="Appointment ID"),
    update_input: UpdateAppointmentStatusInput = Body(...)
):
    """
    Update appointment status and medical information.
    
    Allows updating:
    - status: New appointment status
    - diagnosis: Medical diagnosis (optional)
    - treatment: Treatment plan (optional)
    """
    return await AppointmentService.update_appointment_status(
        appointment_id,
        update_input.status,
        update_input.diagnosis,
        update_input.treatment
    )