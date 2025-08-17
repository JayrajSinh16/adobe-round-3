from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from models import PodcastRequest, PodcastResponse
from services import podcast_service
import os
from config import settings

router = APIRouter()

# @router.post("/generate", response_model=PodcastResponse)
# async def generate_podcast_json(request: PodcastRequest):
#     """Generate podcast and return JSON response with audio URL (legacy endpoint)"""
#     try:
#         # Check for cached version first
#         cached = podcast_service.get_cached_podcast(
#             request.selected_text,
#             request.format
#         )
#         if cached:
#             return cached
        
#         # Generate new podcast using insights from frontend
#         response = podcast_service.generate_podcast(
#             selected_text=request.selected_text,
#             insights=request.insights,
#             format=request.format,
#             duration=request.duration
#         )
#         return response
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-audio")
async def generate_podcast_audio(request: PodcastRequest):
    """Generate podcast and return audio file directly as binary response"""
    try:
        print(f"🎵 Generating audio for request: {request.format} format, {request.duration} duration")
        
        # Generate podcast
        response = podcast_service.generate_podcast(
            selected_text=request.selected_text,
            insights=request.insights,
            format=request.format,
            duration=request.duration
        )
        
        if not response.audio_url:
            raise HTTPException(status_code=500, detail="Audio generation failed")
        
        # Get the actual file path
        audio_filename = response.audio_url.replace('/static/audio/', '')
        audio_path = os.path.join(settings.audio_folder, audio_filename)
        
        print(f"🎵 Looking for audio file: {audio_path}")
        
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=404, detail=f"Audio file not found: {audio_filename}")
        
        file_size = os.path.getsize(audio_path)
        print(f"✅ Audio file found: {file_size:,} bytes")
        
        # Prepare transcript for header (truncate if too long)
        transcript_text = " | ".join([f"{script.speaker}: {script.text[:50]}..." 
                                    for script in response.transcript[:3]])
        
        # Return the file directly with metadata in headers
        return FileResponse(
            path=audio_path,
            media_type='audio/wav',
            filename=f"podcast_{request.format}_{request.duration}.wav",
            headers={
                "X-Transcript": transcript_text,
                "X-Duration": str(response.duration),
                "X-Format": response.format,
                "X-Audio-Type": "audio/wav",
                "X-File-Size": str(file_size),
                "Content-Disposition": f"attachment; filename=podcast_{request.format}_{request.duration}.wav"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_podcast_audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))