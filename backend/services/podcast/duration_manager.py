"""
Duration manager module for handling podcast duration calculations.
"""

from typing import List
from models import PodcastScript


class DurationManager:
    """Handles duration calculations and constraints for podcasts."""
    
    def __init__(self):
        pass
    
    def get_target_duration(self, duration: str) -> float:
        """Determine target duration in minutes (strict 4.5-minute maximum)"""
        duration_map = {
            "short": 2.0,    # 2 minutes
            "medium": 3.5,   # 3.5 minutes  
            "long": 4.5      # 4.5 minutes (maximum allowed)
        }
        target_duration_minutes = duration_map.get(duration, 3.5)
        
        # Enforce absolute maximum of 4.5 minutes
        target_duration_minutes = min(target_duration_minutes, 4.5)
        
        print(f"🕐 Generating podcast with {target_duration_minutes}-minute limit")
        return target_duration_minutes
    
    def estimate_duration(self, script: List[PodcastScript]) -> float:
        """Calculate actual duration (estimate based on text length)"""
        total_words = sum(len(s.text.split()) for s in script)
        estimated_duration = total_words / 150 * 60  # 150 words per minute
        return estimated_duration
    
    def validate_duration_limit(self, duration: str, target_minutes: float) -> bool:
        """Validate that duration is within limits"""
        return target_minutes <= 4.5
