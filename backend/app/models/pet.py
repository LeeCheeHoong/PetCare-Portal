from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from enum import Enum


class PetStatus(str, Enum):
    """Pet health status"""
    HEALTHY = "healthy"
    SICK = "sick"
    IN_TREATMENT = "in-treatment"
    RECOVERING = "recovering"


class Pet(BaseModel):
    """Pet model"""
    id: str
    name: str
    species: str
    breed: str
    age: int = Field(..., ge=0)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    medical_notes: Optional[str] = Field(None, alias="medicalNotes")
    status: PetStatus = PetStatus.HEALTHY
    owner_id: str = Field(..., alias="ownerId")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True
        use_enum_values = True


class CreatePetInput(BaseModel):
    """Input for creating a pet"""
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., min_length=1)
    breed: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=50)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    weight: Optional[float] = Field(None, ge=0, alias="weight")
    color: Optional[str] = None
    medical_notes: Optional[str] = Field(None, alias="medicalNotes")
    
    class Config:
        populate_by_name = True


class UpdatePetInput(BaseModel):
    """Input for updating a pet"""
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., min_length=1)
    breed: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=50)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    medical_notes: Optional[str] = Field(None, alias="medicalNotes")
    
    class Config:
        populate_by_name = True


class PetPagination(BaseModel):
    """Pagination for pets"""
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0, alias="totalPages")
    
    class Config:
        populate_by_name = True


class PetsResponse(BaseModel):
    """Response for pet list"""
    pets: list[Pet]
    pagination: PetPagination
    
    class Config:
        from_attributes = True