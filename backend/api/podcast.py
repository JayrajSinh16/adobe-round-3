from fastapi import APIRouter, HTTPException
from models import PodcastRequest, PodcastResponse
from services import podcast_service

router = APIRouter()

@router.post("/generate", response_model=PodcastResponse)
async def generate_podcast(request: PodcastRequest):
    """Generate podcast or audio overview"""
    try:
        # Check for cached version first
        cached = podcast_service.get_cached_podcast(
            request.document_id,
            request.selected_text
        )
        if cached:
            return cached
        
        # Generate new podcast
        response = podcast_service.generate_podcast(
            selected_text=request.selected_text,
            document_id=request.document_id,
            connections=request.connections,
            insights=request.insights,
            format=request.format,
            duration=request.duration
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))