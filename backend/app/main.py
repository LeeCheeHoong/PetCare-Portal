from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import products, categories, cart, order, checkout, pets, appointments, vet_appointments, adoption, admin_adoption
from app.services.category_service import CategoryService
from app.services.product_service import ProductService
from app.services.checkout_service import CheckoutService
from app.services.adoption_service import AdoptionService
from app.services.pet_service import PetService

# Initialize FastAPI app
app = FastAPI(
    title="FastAPI Backend",
    description="Production-ready FastAPI backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CategoryService.initialize_mock_data()
CheckoutService.initialize_mock_data()
ProductService.initialize_mock_data()
AdoptionService.initialize_mock_data()
PetService.initialize_mock_data()

app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(categories.router, prefix="/api", tags=["Categories"])  
app.include_router(cart.router, prefix="/api", tags=["Cart"])  
app.include_router(order.router, prefix="/api", tags=["Orders"])  
app.include_router(checkout.router, prefix="/api", tags=["Checkout"]) 
app.include_router(pets.router, prefix="/api", tags=["Pets"]) 
app.include_router(appointments.router, prefix="/api", tags=["Appointments"]) 
app.include_router(vet_appointments.router, prefix="/api", tags=["Vet Appointments"]) 
app.include_router(adoption.router, prefix="/api", tags=["Adoption"]) 
app.include_router(admin_adoption.router, prefix="/api", tags=["Admin Adoption"]) 

@app.get("/")
async def root():
    """Root endpoint returning basic API info"""
    return {
        "message": "FastAPI Backend is running",
        "version": "1.0.0",
        "docs": "/docs"
    }