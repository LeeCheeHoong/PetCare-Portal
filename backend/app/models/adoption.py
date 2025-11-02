from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from enum import Enum


class AdoptionStatus(str, Enum):
    """Adoption status"""
    AVAILABLE = "available"
    PENDING = "pending"
    ADOPTED = "adopted"


class HomeType(str, Enum):
    """Home type"""
    HOUSE = "house"
    APARTMENT = "apartment"
    CONDO = "condo"
    OTHER = "other"


class PetExperience(str, Enum):
    """Pet ownership experience level"""
    NONE = "none"
    SOME = "some"
    EXTENSIVE = "extensive"


class AdoptablePet(BaseModel):
    """Adoptable pet model"""
    id: str
    name: str
    species: str
    breed: str
    age: int = Field(..., ge=0)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    description: Optional[str] = None
    adoption_fee: Optional[float] = Field(None, ge=0, alias="adoptionFee")
    adoption_status: AdoptionStatus = Field(..., alias="adoptionStatus")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True
        use_enum_values = True


class AdoptionApplicationInput(BaseModel):
    """Input for adoption application"""
    # Adopter Information
    adopter_name: str = Field(..., min_length=1, alias="adopterName")
    adopter_email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$', alias="adopterEmail")
    adopter_phone: str = Field(..., min_length=10, alias="adopterPhone")
    adopter_address: str = Field(..., min_length=1, alias="adopterAddress")
    
    # Living Situation
    home_type: HomeType = Field(..., alias="homeType")
    has_yard: bool = Field(..., alias="hasYard")
    has_other_pets: bool = Field(..., alias="hasOtherPets")
    other_pets_details: Optional[str] = Field(None, alias="otherPetsDetails")
    
    # Experience
    pet_experience: PetExperience = Field(..., alias="petExperience")
    reason_for_adoption: str = Field(..., min_length=10, alias="reasonForAdoption")
    
    # Additional
    notes: Optional[str] = None
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class AdoptionApplication(BaseModel):
    """Adoption application model"""
    id: str
    pet_id: str = Field(..., alias="petId")
    pet: AdoptablePet
    user_id: str = Field(..., alias="userId")
    adopter_name: str = Field(..., alias="adopterName")
    adopter_email: str = Field(..., alias="adopterEmail")
    adopter_phone: str = Field(..., alias="adopterPhone")
    adopter_address: str = Field(..., alias="adopterAddress")
    home_type: HomeType = Field(..., alias="homeType")
    has_yard: bool = Field(..., alias="hasYard")
    has_other_pets: bool = Field(..., alias="hasOtherPets")
    other_pets_details: Optional[str] = Field(None, alias="otherPetsDetails")
    pet_experience: PetExperience = Field(..., alias="petExperience")
    reason_for_adoption: str = Field(..., alias="reasonForAdoption")
    notes: Optional[str] = None
    status: Literal["pending", "approved", "rejected"] = "pending"
    admin_notes: Optional[str] = Field(None, alias="adminNotes")
    reviewed_by: Optional[str] = Field(None, alias="reviewedBy")
    reviewed_at: Optional[datetime] = Field(None, alias="reviewedAt")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True
        use_enum_values = True

class AdoptablePetPagination(BaseModel):
    """Pagination for adoptable pets"""
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0, alias="totalPages")
    
    class Config:
        populate_by_name = True


class AdoptablePetsResponse(BaseModel):
    """Response for adoptable pets list"""
    pets: list[AdoptablePet]
    pagination: AdoptablePetPagination
    
    class Config:
        from_attributes = True

class CreateAdoptablePetInput(BaseModel):
    """Input for creating adoptable pet"""
    name: str = Field(..., min_length=1)
    species: str = Field(..., min_length=1)
    breed: str = Field(..., min_length=1)
    age: int = Field(..., ge=0)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    description: Optional[str] = None
    adoption_fee: Optional[float] = Field(None, ge=0, alias="adoptionFee")
    adoption_status: AdoptionStatus = Field(AdoptionStatus.AVAILABLE, alias="adoptionStatus")
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class UpdateAdoptablePetInput(BaseModel):
    """Input for updating adoptable pet"""
    name: str = Field(..., min_length=1)
    species: str = Field(..., min_length=1)
    breed: str = Field(..., min_length=1)
    age: int = Field(..., ge=0)
    image_url: Optional[str] = Field(None, alias="imageUrl")
    weight: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    description: Optional[str] = None
    adoption_fee: Optional[float] = Field(None, ge=0, alias="adoptionFee")
    adoption_status: AdoptionStatus = Field(..., alias="adoptionStatus")
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class UpdateAdoptionStatusInput(BaseModel):
    """Input for updating adoption status only"""
    adoption_status: AdoptionStatus = Field(..., alias="adoptionStatus")
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class ReviewApplicationInput(BaseModel):
    """Input for reviewing adoption application"""
    status: Literal["approved", "rejected"]
    admin_notes: Optional[str] = Field(None, alias="adminNotes")
    
    class Config:
        populate_by_name = True


class AdoptionApplicationPagination(BaseModel):
    """Pagination for adoption applications"""
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0, alias="totalPages")
    
    class Config:
        populate_by_name = True


class AdoptionApplicationsResponse(BaseModel):
    """Response for adoption applications list"""
    applications: list[AdoptionApplication]
    pagination: AdoptionApplicationPagination
    
    class Config:
        from_attributes = True


class AdoptionHistory(BaseModel):
    """Adoption history for a pet"""
    applications: list[AdoptionApplication]
    current_status: AdoptionStatus = Field(..., alias="currentStatus")
    total_applications: int = Field(..., alias="totalApplications")
    approved_application: Optional[AdoptionApplication] = Field(None, alias="approvedApplication")
    
    class Config:
        populate_by_name = True
        use_enum_values = True