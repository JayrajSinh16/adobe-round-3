from fastapi import APIRouter, HTTPException
from models import PodcastRequest, PodcastResponse
from services import podcast_service

router = APIRouter()

@router.post("/generate", response_model=PodcastResponse)
async def generate_podcast(request: PodcastRequest):
    """Generate podcast or audio overview using frontend insights"""
    try:
        # Check for cached version first
        cached = podcast_service.get_cached_podcast(
            request.selected_text,
            request.format
        )
        if cached:
            return cached
        
        # Generate new podcast using insights from frontend
        response = podcast_service.generate_podcast(
            selected_text=request.selected_text,
            insights=request.insights,
            format=request.format,
            duration=request.duration
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))