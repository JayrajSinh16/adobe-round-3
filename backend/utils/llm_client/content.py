"""
Content generation tasks (podcast script)
"""
from typing import Dict, Any, List

from ..task_modules import content_generator


def generate_podcast_script(selected_text: str, insights: List[Dict], format: str = "podcast", max_duration_minutes: float = 4.5, language: str = "en") -> List[Dict]:
    """Generate podcast script or audio overview using insights with time constraints and language"""
    return content_generator.generate_podcast_script(selected_text, insights, format, max_duration_minutes, language)
