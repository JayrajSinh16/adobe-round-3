import os
import time
import json
import hashlib
from typing import List, Dict, Any, Optional
from config import settings
from utils import generate_podcast_script, create_podcast_audio
from services.document_service import document_service
from models import PodcastResponse, PodcastScript

class PodcastService:
    def __init__(self):
        self.generated_podcasts = {}
    
    def _generate_cache_key(self, selected_text: str, insights: List[Dict[str, Any]], format: str, duration: str) -> str:
        """Generate a unique cache key based on content"""
        # Create a hash of the selected text and insights to ensure uniqueness
        content_hash = hashlib.md5(
            f"{selected_text}_{len(insights)}_{format}_{duration}".encode()
        ).hexdigest()
        return f"podcast_{content_hash}"
    
    def generate_podcast(self, selected_text: str, insights: List[Dict[str, Any]],
                        format: str = "podcast", duration: str = "medium") -> PodcastResponse:
        """Generate podcast or audio overview using frontend insights with strict 4.5-minute limit"""
        start_time = time.time()
        
        # Check for cached version first with improved cache key
        cache_key = self._generate_cache_key(selected_text, insights, format, duration)
        cached = self.generated_podcasts.get(cache_key)
        if cached:
            print(f"🎵 Using cached podcast for key: {cache_key}")
            return cached
        
        print(f"🎵 Generating new podcast for key: {cache_key}")
        
        # Determine target duration in minutes (strict 4.5-minute maximum)
        duration_map = {
            "short": 2.0,    # 2 minutes
            "medium": 3.5,   # 3.5 minutes  
            "long": 4.5      # 4.5 minutes (maximum allowed)
        }
        target_duration_minutes = duration_map.get(duration, 3.5)
        
        # Enforce absolute maximum of 4.5 minutes
        target_duration_minutes = min(target_duration_minutes, 4.5)
        
        print(f"🕐 Generating podcast with {target_duration_minutes}-minute limit")
        
        # Generate script using LLM with provided insights and time constraints
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
            format=format,
            max_duration_minutes=target_duration_minutes
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
        
        if audio_filename and audio_filename.endswith('.wav'):
            # Verify the audio file exists and is not empty
            audio_path = os.path.join(settings.audio_folder, audio_filename)
            if os.path.exists(audio_path) and os.path.getsize(audio_path) > 100:  # At least 100 bytes
                audio_url = f"/static/audio/{audio_filename}"
                print(f"✅ Audio URL set to: {audio_url}")
            else:
                print(f"❌ Audio file is empty or doesn't exist: {audio_path}")
                # Create synthetic audio as fallback
                from utils.tts_client import generate_audio
                combined_text = " ".join([entry["text"] for entry in script_data[:3]])  # First 3 segments
                fallback_audio = generate_audio(combined_text, "Host")
                if fallback_audio and fallback_audio.endswith('.wav'):
                    audio_url = f"/static/audio/{fallback_audio}"
                    print(f"✅ Fallback audio URL set to: {audio_url}")
                else:
                    audio_url = ""
                    print("❌ Fallback audio generation also failed")
        elif audio_filename and audio_filename.endswith('.txt'):
            # Transcript was generated instead of audio
            print(f"⚠️ Only transcript available: {audio_filename}")
            audio_url = f"/static/audio/{audio_filename}"
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
        
        # Cache the response with improved key
        self.generated_podcasts[cache_key] = response
        
        return response
    
    def get_cached_podcast(self, selected_text: str, insights: List[Dict[str, Any]], format: str, duration: str) -> Optional[PodcastResponse]:
        """Get cached podcast if available"""
        cache_key = self._generate_cache_key(selected_text, insights, format, duration)
        return self.generated_podcasts.get(cache_key)

# Create singleton instance
podcast_service = PodcastService()