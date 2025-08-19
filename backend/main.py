from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import uvicorn

from api import documents, connections, insights, podcast, search, individual_insights
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

# Mount static files for serving PDFs and audio
app.mount("/static/pdfs", StaticFiles(directory="storage/pdfs"), name="pdfs")
app.mount("/static/audio", StaticFiles(directory="storage/audio"), name="audio")

# Include API routers
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(individual_insights.router, prefix="/api/individual-insights", tags=["individual-insights"])
app.include_router(podcast.router, prefix="/api/podcast", tags=["podcast"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

# Serve frontend static files (for production deployment)
if os.path.exists("../frontend/dist"):
    app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend files or index.html for SPA routing"""
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("static/"):
            # Let API and static routes handle themselves
            return
            
        file_path = f"../frontend/dist/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        else:
            # Return index.html for SPA routing
            return FileResponse("../frontend/dist/index.html")

@app.get("/")
async def root():
    """Serve the frontend index.html or API info"""
    if os.path.exists("../frontend/dist/index.html"):
        return FileResponse("../frontend/dist/index.html")
    else:
        return {"message": "Document Insight & Engagement System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "frontend": os.path.exists("../frontend/dist/index.html")}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",
        port=8080,
        reload=True if os.getenv("ENVIRONMENT", "development") == "development" else False
    )