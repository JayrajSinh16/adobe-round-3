"""
Response parser module for handling LLM response parsing and cleaning utilities.
"""

import json
import re
from typing import List


class ResponseParser:
    """Handles LLM response parsing and cleaning utilities."""
    
    def clean_llm_response(self, response: str) -> str:
        """Clean and extract JSON from LLM response"""
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```json'):
            response = response[7:]
        elif response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        
        response = response.strip()
        
        # Try to find JSON object in response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json_match.group()
        
        return response
    
    def extract_list_from_text(self, text: str, expected_count: int = 3) -> List[str]:
        """Extract a list of points from text, handling various formats"""
        # Try to find numbered or bulleted lists
        patterns = [
            r'(?:^|\n)\s*\d+\.\s*([^\n]+)',  # 1. item
            r'(?:^|\n)\s*[-•]\s*([^\n]+)',   # - item or • item
            r'(?:^|\n)\s*\*\s*([^\n]+)',     # * item
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            if len(matches) >= expected_count:
                return [match.strip() for match in matches[:expected_count]]
        
        # Fallback: split by sentences and take first N
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if len(sentences) >= expected_count:
            return sentences[:expected_count]
        
        # Last resort: split by newlines
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if len(lines) >= expected_count:
            return lines[:expected_count]
        
        # Generate fallbacks if needed
        while len(lines) < expected_count:
            lines.append(f"Additional point {len(lines) + 1} requires further analysis.")
        
        return lines[:expected_count]
