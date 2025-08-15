# text_normalization.py (copied)
import re
from typing import Dict

class TextNormalizationUtils:
    @staticmethod
    def normalize_extracted_text(text: str) -> str:
        normalization_patterns = [
            (r'([a-z])([A-Z])', r'\1 \2'),
            (r'([A-Z])([A-Z][a-z])', r'\1 \2'),
            (r'\s+', ' '),
            (r'^\s+|\s+$', ''),
            (r'([.!?])\s*([A-Z])', r'\1 \2'),
            (r'\s*([!?:;])\s*', r'\1 '),
        ]
        result = text
        for pattern, replacement in normalization_patterns:
            result = re.sub(pattern, replacement, result)
        return result.strip()

    @staticmethod
    def extract_text_from_line(line: Dict) -> str:
        text_parts = []
        for span in line.get("spans", []):
            span_text = span.get("text", "")
            if span_text:
                text_parts.append(span_text)
        result = "".join(text_parts)
        result = TextNormalizationUtils.normalize_extracted_text(result)
        return result
