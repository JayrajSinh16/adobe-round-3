import os
import time
import json
import hashlib
from typing import List, Dict, Any, Optional
from config import settings
from utils import generate_podcast_script, create_podcast_audio
from services.document_service import document_service
from models import PodcastResponse, PodcastScript
from .podcast import (
    CacheManager, DurationManager, ScriptGenerator,
    AudioGenerator, DataProcessor, PodcastServiceUtils
)

class PodcastService:
    def __init__(self):
        self.generated_podcasts = {}
        
        # Initialize modular components
        self.cache_manager = CacheManager()
        self.duration_manager = DurationManager()
        self.script_generator = ScriptGenerator()
        self.audio_generator = AudioGenerator()
        self.data_processor = DataProcessor()
        self.utils = PodcastServiceUtils()
        
        # Set the cache manager to use this service's cache
        self.cache_manager.generated_podcasts = self.generated_podcasts
    
    def _generate_cache_key(self, selected_text: str, insights: List[Dict[str, Any]], format: str, duration: str) -> str:
        """Generate a unique cache key based on content"""
        return self.cache_manager.generate_cache_key(selected_text, insights, format, duration)
    
    def generate_podcast(self, selected_text: str, insights: List[Dict[str, Any]],
                        format: str = "podcast", duration: str = "medium") -> PodcastResponse:
        """Generate podcast or audio overview using frontend insights with strict 4.5-minute limit"""
        start_time = time.time()
        
        # Check for cached version first with improved cache key
        cache_key = self._generate_cache_key(selected_text, insights, format, duration)
        cached = self.cache_manager.get_cached_podcast(cache_key)
        if cached:
            return cached
        
        self.utils.log_podcast_generation_start(cache_key)
        
        # Determine target duration using duration manager
        target_duration_minutes = self.duration_manager.get_target_duration(duration)
        
        # Process insights using data processor
        insights_dict = self.data_processor.process_insights_to_dict(insights)
        
        # Generate script using script generator
        script_data = self.script_generator.generate_script(
            selected_text, insights_dict, format, target_duration_minutes
        )
        
        # Convert to PodcastScript objects using data processor
        script = self.data_processor.convert_script_data_to_objects(script_data)
        
        # Generate audio using audio generator
        audio_filename = self.audio_generator.generate_audio(script_data)
        
        # Process audio result and handle fallbacks
        audio_url = self.audio_generator.process_audio_result(audio_filename, script_data)
        
        # Calculate duration using duration manager
        estimated_duration = self.duration_manager.estimate_duration(script)
        
        processing_time = self.utils.measure_processing_time(start_time)
        
        response = PodcastResponse(
            audio_url=audio_url,
            transcript=script,
            duration=estimated_duration,
            format=format
        )
        
        # Cache the response using cache manager
        self.cache_manager.cache_podcast(cache_key, response)
        
        return response
    
    def get_cached_podcast(self, selected_text: str, insights: List[Dict[str, Any]], format: str, duration: str) -> Optional[PodcastResponse]:
        """Get cached podcast if available"""
        cache_key = self._generate_cache_key(selected_text, insights, format, duration)
        return self.cache_manager.get_cached_podcast(cache_key)

# Create singleton instance
podcast_service = PodcastService()