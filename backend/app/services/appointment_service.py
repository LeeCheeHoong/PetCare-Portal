from typing import Dict, List, Optional
from datetime import datetime
from fastapi import HTTPException, status
import uuid

from app.models.appointment import (
    Appointment, BookAppointmentInput, RescheduleAppointmentInput,
    AppointmentsResponse, AppointmentPagination, AppointmentStatus, AppointmentType
)
from app.services.pet_service import PetService


class AppointmentService:
    """Service layer for appointment management"""
    
    _appointments: Dict[str, Appointment] = {}
    
    @classmethod
    async def get_user_appointments(
        cls,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        status: Optional[AppointmentStatus] = None,
        pet_id: Optional[str] = None
    ) -> AppointmentsResponse:
        """Get user's appointments with filtering and pagination"""
        # Filter appointments by owner
        user_appointments = [a for a in cls._appointments.values() if a.owner_id == user_id]
        
        # Apply status filter
        if status:
            user_appointments = [a for a in user_appointments if a.status == status]
        
        # Apply pet filter
        if pet_id:
            user_appointments = [a for a in user_appointments if a.pet_id == pet_id]
        
        # Sort by appointment date (newest first)
        user_appointments.sort(key=lambda a: a.appointment_date_time, reverse=True)
        
        # Pagination
        total = len(user_appointments)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_appointments = user_appointments[start_idx:end_idx]
        
        pagination = AppointmentPagination(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages
        )
        
        return AppointmentsResponse(
            appointments=paginated_appointments,
            pagination=pagination
        )
    
    @classmethod
    async def book_appointment(
        cls,
        appointment_input: BookAppointmentInput,
        user_id: str,
        owner_name: str = "User"  # Get from user profile in production
    ) -> Appointment:
        """Book a new appointment"""
        # Verify pet exists and belongs to user
        pet = await PetService.get_pet_by_id_or_404(appointment_input.pet_id, user_id)
        
        # Parse appointment datetime
        try:
            appointment_dt = datetime.fromisoformat(
                appointment_input.appointment_date_time.replace('Z', '+00:00')
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid datetime format. Use ISO format (e.g., 2024-01-15T14:30:00Z)"
            )
        
        
        # Check for time slot availability (simplified)
        overlapping = cls._check_time_slot_available(appointment_dt, appointment_input.duration)
        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This time slot is already booked. Please choose another time."
            )
        
        appointment_id = f"appt_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        
        appointment = Appointment(
            id=appointment_id,
            pet_id=pet.id,
            pet=pet,
            owner_id=user_id,
            owner_name=owner_name,
            appointment_date_time=appointment_dt,
            duration=appointment_input.duration,
            status=AppointmentStatus.SCHEDULED,
            appointment_type=appointment_input.appointment_type,
            reason=appointment_input.reason,
            notes=appointment_input.notes,
            created_at=now,
            updated_at=now
        )
        
        cls._appointments[appointment_id] = appointment
        return appointment
    
    @classmethod
    def _check_time_slot_available(cls, requested_time: datetime, duration: int) -> bool:
        """Check if time slot is available (simplified version)"""
        from datetime import timedelta
        
        requested_end = requested_time + timedelta(minutes=duration)
        
        for appt in cls._appointments.values():
            if appt.status in [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]:
                continue
            
            appt_end = appt.appointment_date_time + timedelta(minutes=appt.duration)
            
            # Check for overlap
            if (requested_time < appt_end and requested_end > appt.appointment_date_time):
                return True
        
        return False
    
    @classmethod
    async def get_appointment_by_id_or_404(
        cls,
        appointment_id: str,
        user_id: str
    ) -> Appointment:
        """Get appointment by ID or raise 404"""
        appointment = cls._appointments.get(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment with id '{appointment_id}' not found"
            )
        
        # Verify ownership
        if appointment.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this appointment"
            )
        
        return appointment
    
    @classmethod
    async def cancel_appointment(
        cls,
        appointment_id: str,
        user_id: str
    ) -> Appointment:
        """Cancel an appointment"""
        appointment = await cls.get_appointment_by_id_or_404(appointment_id, user_id)
        
        # Check if appointment can be cancelled
        if appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel appointment with status '{appointment.status.value}'"
            )
        
        
        appointment.status = AppointmentStatus.CANCELLED
        appointment.updated_at = datetime.utcnow()
        
        return appointment
    
    @classmethod
    async def reschedule_appointment(
        cls,
        appointment_id: str,
        reschedule_input: RescheduleAppointmentInput,
        user_id: str
    ) -> Appointment:
        """Reschedule an appointment"""
        appointment = await cls.get_appointment_by_id_or_404(appointment_id, user_id)
        
        # Check if appointment can be rescheduled
        if appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reschedule appointment with status '{appointment.status.value}'"
            )
        
        # Parse new datetime
        try:
            new_dt = datetime.fromisoformat(
                reschedule_input.appointment_date_time.replace('Z', '+00:00')
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid datetime format"
            )
        
        
        # Check availability (excluding current appointment)
        temp_status = appointment.status
        appointment.status = AppointmentStatus.CANCELLED  # Temporarily mark as cancelled
        
        overlapping = cls._check_time_slot_available(new_dt, appointment.duration)
        appointment.status = temp_status  # Restore status
        
        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This time slot is already booked"
            )
        
        appointment.appointment_date_time = new_dt
        appointment.updated_at = datetime.utcnow()
        
        return appointment

    @classmethod
    async def get_all_appointments(
        cls,
        page: int = 1,
        limit: int = 50,
        search: Optional[str] = None,
        date_filter: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> AppointmentsResponse:
        """Get all appointments (for vet view)"""
        appointments = list(cls._appointments.values())
        
        # Apply search filter
        if search:
            search_lower = search.lower()
            appointments = [
                a for a in appointments
                if (search_lower in a.owner_name.lower() or
                    search_lower in a.pet.name.lower())
            ]
        
        # Apply single date filter
        if date_filter:
            try:
                filter_date = datetime.fromisoformat(date_filter.replace('Z', '+00:00')).date()
                appointments = [
                    a for a in appointments
                    if a.appointment_date_time.date() == filter_date
                ]
            except ValueError:
                pass
        
        # Apply date range filter (for calendar)
        if start_date and end_date:
            try:
                start_dt = datetime.fromisoformat(start_date).date()
                end_dt = datetime.fromisoformat(end_date).date()
                appointments = [
                    a for a in appointments
                    if start_dt <= a.appointment_date_time.date() <= end_dt
                ]
            except ValueError:
                pass
        
        # Sort by appointment date
        appointments.sort(key=lambda a: a.appointment_date_time)
        
        # Pagination
        total = len(appointments)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated = appointments[start_idx:end_idx]
        
        pagination = AppointmentPagination(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages
        )
        
        return AppointmentsResponse(
            appointments=paginated,
            pagination=pagination
        )

    @classmethod
    async def get_appointment_by_id(cls, appointment_id: str) -> Optional[Appointment]:
        """Get appointment by ID (no ownership check for vet)"""
        return cls._appointments.get(appointment_id)

    @classmethod
    async def update_appointment_status(
        cls,
        appointment_id: str,
        status: AppointmentStatus,
        diagnosis: Optional[str] = None,
        treatment: Optional[str] = None
    ) -> Appointment:
        """Update appointment status and medical info (vet only)"""
        appointment = cls._appointments.get(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment with id '{appointment_id}' not found"
            )
        
        appointment.status = status
        if diagnosis is not None:
            appointment.diagnosis = diagnosis
        if treatment is not None:
            appointment.treatment = treatment
        appointment.updated_at = datetime.utcnow()
        
        return appointment