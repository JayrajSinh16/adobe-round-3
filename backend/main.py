from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uvicorn

from api import documents, connections, insights, podcast, search
from config import settings

# Create necessary directories
os.makedirs('storage/pdfs', exist_ok=True)
os.makedirs('storage/outlines', exist_ok=True)
os.makedirs('storage/audio', exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="Document Insight & Engagement System",
    description="Adobe Hackathon 2025 - Grand Finale",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving PDFs
app.mount("/static/pdfs", StaticFiles(directory="storage/pdfs"), name="pdfs")
app.mount("/static/audio", StaticFiles(directory="storage/audio"), name="audio")

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(podcast.router, prefix="/api/podcast", tags=["podcast"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Document Insight & Engagement System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True if os.getenv("ENVIRONMENT", "development") == "development" else False
    )