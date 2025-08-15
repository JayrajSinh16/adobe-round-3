import os
import time
import json
from typing import List, Dict, Any, Optional
from config import settings
from utils import generate_podcast_script, create_podcast_audio
from services.document_service import document_service
from models import PodcastResponse, PodcastScript

class PodcastService:
    def __init__(self):
        self.generated_podcasts = {}
    
    def generate_podcast(self, selected_text: str, document_id: str,
                        connections: List[Dict], insights: List[Dict],
                        format: str = "podcast", duration: str = "medium") -> PodcastResponse:
        """Generate podcast or audio overview"""
        start_time = time.time()
        
        # Determine target duration in seconds
        duration_map = {
            "short": 120,  # 2 minutes
            "medium": 210,  # 3.5 minutes
            "long": 300     # 5 minutes
        }
        target_duration = duration_map.get(duration, 210)
        
        # Generate script using LLM
        script_data = generate_podcast_script(
            selected_text=selected_text,
            connections=connections,
            insights=insights,
            format=format
        )
        
        # Convert to PodcastScript objects
        script = []
        for idx, entry in enumerate(script_data):
            script.append(PodcastScript(
                speaker=entry["speaker"],
                text=entry["text"],
                timestamp=0.0  # Will be calculated during audio generation
            ))
        
        # Generate audio
        audio_filename = create_podcast_audio(script_data)
        
        if audio_filename:
            audio_url = f"/static/audio/{audio_filename}"
        else:
            audio_url = ""
        
        # Calculate actual duration (estimate based on text length)
        total_words = sum(len(s.text.split()) for s in script)
        estimated_duration = total_words / 150 * 60  # 150 words per minute
        
        processing_time = time.time() - start_time
        
        response = PodcastResponse(
            audio_url=audio_url,
            transcript=script,
            duration=estimated_duration,
            format=format
        )
        
        # Cache the response
        cache_key = f"{document_id}_{selected_text[:50]}"
        self.generated_podcasts[cache_key] = response
        
        return response
    
    def get_cached_podcast(self, document_id: str, selected_text: str) -> Optional[PodcastResponse]:
        """Get cached podcast if available"""
        cache_key = f"{document_id}_{selected_text[:50]}"
        return self.generated_podcasts.get(cache_key)

# Create singleton instance
podcast_service = PodcastService()