"""
Section prioritizer module for prioritizing and filtering related sections.
"""

from typing import List, Dict, Any, Set


class SectionPrioritizer:
    """Handles prioritizing and filtering related sections for insight generation."""
    
    def __init__(self):
        pass
    
    def prioritize_sections(self, related_sections: List[Dict[str, Any]]) -> tuple:
        """Ensure we have diverse document representation (limit to prevent token overflow)"""
        unique_docs: Set[str] = set()
        prioritized_sections: List[Dict[str, Any]] = []

        # First, add high-strength connections
        for section in related_sections:
            if section.get('strength') == 'high' and len(prioritized_sections) < 8:
                prioritized_sections.append(section)
                unique_docs.add(section['pdf_name'])

        # Then add medium/low strength from different documents
        for section in related_sections:
            if (section['pdf_name'] not in unique_docs and
                len(prioritized_sections) < 8 and
                len(unique_docs) < 4):  # Ensure we have at least 4 different documents
                prioritized_sections.append(section)
                unique_docs.add(section['pdf_name'])

        print(f"DEBUG: Analyzing across {len(unique_docs)} documents: {list(unique_docs)}")
        
        return prioritized_sections, unique_docs
