"""
Script generator module for generating podcast scripts.
"""

from typing import List, Dict, Any
from utils import generate_podcast_script


class ScriptGenerator:
    """Handles podcast script generation using LLM."""
    
    def __init__(self):
        pass
    
    def generate_script(self, selected_text: str, insights_dict: List[Dict[str, Any]], 
                       format: str, target_duration_minutes: float) -> List[Dict[str, Any]]:
        """Generate script using LLM with provided insights and time constraints"""
        script_data = generate_podcast_script(
            selected_text=selected_text,
            insights=insights_dict,
            format=format,
            max_duration_minutes=target_duration_minutes
        )
        return script_data
    
    def validate_script_generation(self, script_data: List[Dict[str, Any]]) -> bool:
        """Validate that script generation was successful"""
        return script_data is not None and len(script_data) > 0
