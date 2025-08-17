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
    
    def generate_podcast(self, selected_text: str, insights: List[Dict[str, Any]],
                        format: str = "podcast", duration: str = "medium") -> PodcastResponse:
        """Generate podcast or audio overview using frontend insights"""
        start_time = time.time()
        
        # Determine target duration in seconds
        duration_map = {
            "short": 120,  # 2 minutes
            "medium": 210,  # 3.5 minutes
            "long": 300     # 5 minutes
        }
        target_duration = duration_map.get(duration, 210)
        
        # Generate script using LLM with provided insights
        # Convert Pydantic objects to dictionaries for task_modules
        insights_dict = []
        for insight in insights:
            if hasattr(insight, 'dict'):
                insights_dict.append(insight.dict())
            else:
                insights_dict.append(insight)
        
        script_data = generate_podcast_script(
            selected_text=selected_text,
            insights=insights_dict,
            format=format
        )
        
        # Convert to PodcastScript objects (without timestamp)
        script = []
        for entry in script_data:
            script.append(PodcastScript(
                speaker=entry["speaker"],
                text=entry["text"]
            ))
        
        # Generate audio with different voices
        print(f"🎤 Calling create_podcast_audio with {len(script_data)} segments...")
        audio_filename = create_podcast_audio(script_data)
        print(f"🎤 create_podcast_audio returned: {audio_filename}")
        
        if audio_filename:
            audio_url = f"/static/audio/{audio_filename}"
            print(f"✅ Audio URL set to: {audio_url}")
        else:
            audio_url = ""
            print("❌ No audio filename returned, setting empty audio_url")
        
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
        cache_key = f"{selected_text[:50]}_{format}"
        self.generated_podcasts[cache_key] = response
        
        return response
    
    def get_cached_podcast(self, selected_text: str, format: str) -> Optional[PodcastResponse]:
        """Get cached podcast if available"""
        cache_key = f"{selected_text[:50]}_{format}"
        return self.generated_podcasts.get(cache_key)

# Create singleton instance
podcast_service = PodcastService()