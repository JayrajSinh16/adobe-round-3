"""
Insights service utilities module.
"""

from typing import Optional, List


class InsightsServiceUtils:
    """Utility functions for the insights service."""
    
    def __init__(self):
        pass
    
    def get_default_insight_types(self) -> List[str]:
        """Get default insight types if none specified"""
        return [
            "key_takeaways",
            "contradictions",
            "examples",
            "cross_references",
            "did_you_know",
        ]
    
    def validate_insight_types(self, insight_types: Optional[List[str]]) -> List[str]:
        """Validate and return insight types, using defaults if none provided"""
        if not insight_types:
            return self.get_default_insight_types()
        return insight_types
    
    def log_debug_info(self, insights_count: int):
        """Log debug information about insight generation"""
        print(f"DEBUG: Generated {insights_count} insights using multi-call approach with document-specific references")
