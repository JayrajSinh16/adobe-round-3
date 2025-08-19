"""
Data processor module for processing insights and converting data formats.
"""

from typing import List, Dict, Any
from models import PodcastScript


class DataProcessor:
    """Handles data processing and format conversion for podcast generation."""
    
    def __init__(self):
        pass
    
    def process_insights_to_dict(self, insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert Pydantic objects to dictionaries for task_modules"""
        insights_dict = []
        for insight in insights:
            if hasattr(insight, 'dict'):
                insights_dict.append(insight.dict())
            else:
                insights_dict.append(insight)
        return insights_dict
    
    def convert_script_data_to_objects(self, script_data: List[Dict[str, Any]]) -> List[PodcastScript]:
        """Convert to PodcastScript objects (without timestamp)"""
        script = []
        for entry in script_data:
            script.append(PodcastScript(
                speaker=entry["speaker"],
                text=entry["text"]
            ))
        return script
    
    def validate_script_data(self, script_data: List[Dict[str, Any]]) -> bool:
        """Validate script data format"""
        if not script_data:
            return False
        
        for entry in script_data:
            if not isinstance(entry, dict):
                return False
            if "speaker" not in entry or "text" not in entry:
                return False
        
        return True
