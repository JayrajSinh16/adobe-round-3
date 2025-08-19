"""
Podcast service utilities module.
"""

import time


class PodcastServiceUtils:
    """Utility functions for the podcast service."""
    
    def __init__(self):
        pass
    
    def log_podcast_generation_start(self, cache_key: str) -> None:
        """Log podcast generation start"""
        print(f"🎵 Generating new podcast for key: {cache_key}")
    
    def measure_processing_time(self, start_time: float) -> float:
        """Calculate processing time"""
        return time.time() - start_time
    
    def validate_input_parameters(self, selected_text: str, insights: list, format: str, duration: str) -> bool:
        """Validate input parameters for podcast generation"""
        if not selected_text or not selected_text.strip():
            return False
        
        if not insights:
            return False
        
        valid_formats = ["podcast", "audio_overview", "summary"]
        if format not in valid_formats:
            return False
        
        valid_durations = ["short", "medium", "long"]
        if duration not in valid_durations:
            return False
        
        return True
    
    def get_default_parameters(self) -> tuple:
        """Get default format and duration parameters"""
        return "podcast", "medium"
