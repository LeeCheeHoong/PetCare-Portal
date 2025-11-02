from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from enum import Enum
from app.models.pet import Pet


class AppointmentStatus(str, Enum):
    """Appointment status"""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no-show"


class AppointmentType(str, Enum):
    """Appointment type"""
    CHECKUP = "checkup"
    VACCINATION = "vaccination"
    SURGERY = "surgery"
    EMERGENCY = "emergency"
    GROOMING = "grooming"
    OTHER = "other"


class Appointment(BaseModel):
    """Appointment model"""
    id: str
    pet_id: str = Field(..., alias="petId")
    pet: Pet
    owner_id: str = Field(..., alias="ownerId")
    owner_name: str = Field(..., alias="ownerName")
    appointment_date_time: datetime = Field(..., alias="appointmentDateTime")
    duration: int = Field(..., ge=15, le=480)  # 15 min to 8 hours
    status: AppointmentStatus
    appointment_type: AppointmentType = Field(..., alias="appointmentType")
    reason: str
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True
        use_enum_values = True


class BookAppointmentInput(BaseModel):
    """Input for booking an appointment"""
    pet_id: str = Field(..., alias="petId")
    appointment_date_time: str = Field(..., alias="appointmentDateTime")
    duration: int = Field(..., ge=15, le=480)
    appointment_type: AppointmentType = Field(..., alias="appointmentType")
    reason: str = Field(..., min_length=1, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class RescheduleAppointmentInput(BaseModel):
    """Input for rescheduling an appointment"""
    appointment_date_time: str = Field(..., alias="appointmentDateTime")
    
    class Config:
        populate_by_name = True


class AppointmentPagination(BaseModel):
    """Pagination for appointments"""
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0, alias="totalPages")
    
    class Config:
        populate_by_name = True


class AppointmentsResponse(BaseModel):
    """Response for appointment list"""
    appointments: list[Appointment]
    pagination: AppointmentPagination
    
    class Config:
        from_attributes = True

class UpdateAppointmentStatusInput(BaseModel):
    """Input for updating appointment status"""
    status: AppointmentStatus
    diagnosis: Optional[str] = Field(None, max_length=2000)
    treatment: Optional[str] = Field(None, max_length=2000)
    
    class Config:
        use_enum_values = True