"""
Summary generation tasks
"""
from typing import Dict, Any, List

from ..task_modules import summary_generator


def generate_snippet_summary(text: str, limit: int = 2) -> str:
    """Generate a concise summary of the given text"""
    return summary_generator.generate_snippet_summary(text, limit)


def generate_executive_summary(content: List[str], max_length: int = 5) -> str:
    """Generate an executive summary from multiple content pieces"""
    return summary_generator.generate_executive_summary(content, max_length)
