# level_classifier.py (copied)
import re
from typing import Dict, Optional

class LevelClassifier:
    def __init__(self, heading_patterns):
        self.heading_patterns = heading_patterns

    def determine_heading_level_generic(self, text: str, font_size: float, is_bold: bool, font_hierarchy: Dict, page_num: int = 1) -> Optional[str]:
        if not self._is_potential_heading(text, page_num):
            return None
        for pattern_name, pattern in self.heading_patterns.items():
            if pattern.search(text):
                if 'numbered_h1' in pattern_name or 'chapter' in pattern_name:
                    return 'H1'
                elif 'numbered_h2' in pattern_name or 'keyword_h2' in pattern_name:
                    return 'H2'
                elif 'numbered_h3' in pattern_name or 'keyword_h3' in pattern_name:
                    return 'H3'
                elif 'keyword_h1' in pattern_name:
                    return 'H1'
                elif 'question_h3' in pattern_name:
                    return 'H3'
                elif 'colon_ended' in pattern_name and len(text) < 50:
                    return 'H3'
        return self._classify_by_font_hierarchy(text, font_size, is_bold, font_hierarchy)

    def _is_potential_heading(self, text: str, page_num: int) -> bool:
        if len(text) > 150 or len(text) < 3:
            return False
        non_heading_patterns = [
            r'^[A-Z][a-z]+.*[a-z]+\s+(will|are|is|have|has|can|should|must|would|could)\s+.+\.$',
            r'^(Please|Click|Visit|Fill|Complete|Submit|Download|Upload|Print|Sign)\s+',
            r'^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,?\s+\d{4}',
            r'^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
            r'^(Version|Copyright|©|$c$)\s+',
            r'.*\d+.*\b(Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Lane|Ln|Boulevard|Blvd)\b.*',
            r'.*@.*\.(com|org|net|edu|gov).*',
            r'.*(http|www\.|\.com|\.org).*',
            r'^\d{5,}.*',
            r'^(.{3,})\s+\1'
        ]
        for pattern in non_heading_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return False
        return True

    def _classify_by_font_hierarchy(self, text: str, font_size: float, is_bold: bool, font_hierarchy: Dict) -> Optional[str]:
        title_threshold = font_hierarchy.get('title', 16.0)
        h1_threshold = font_hierarchy.get('h1', 14.0)
        h2_threshold = font_hierarchy.get('h2', 12.0)
        h3_threshold = font_hierarchy.get('h3', 11.0)
        body_size = font_hierarchy.get('body', 10.0)
        tolerance = 0.8
        if font_size >= 20.0:
            if len(text) < 100:
                return 'H1'
        elif font_size >= 16.0:
            if len(text) < 100:
                return 'H1'
        elif font_size >= 13.0:
            if len(text) < 60:
                h1_indicators = [
                    re.match(r'^(Chapter|Section|Part|Appendix)', text, re.IGNORECASE),
                    text.endswith('Library') or text.endswith('Strategy'),
                    'Digital Library' in text or 'Road Map' in text,
                    len(text) > 40 and not text.endswith(':')
                ]
                if any(h1_indicators):
                    return 'H1'
                else:
                    return 'H2'
        elif font_size >= 12.0 or abs(font_size - h2_threshold) <= tolerance:
            if len(text) < 60:
                return 'H2'
            if len(text) < 60:
                if (re.match(r'^\d+\.\s+[A-Z]', text) or text.endswith(':') or is_bold):
                    return 'H2'
                else:
                    return 'H3'
        elif font_size >= h3_threshold or abs(font_size - h3_threshold) <= tolerance:
            if len(text) < 50:
                return 'H3'
        elif is_bold and font_size > body_size * 1.05:
            if len(text) < 40:
                return 'H3'
        if re.match(r'^\d+\.\d+\.\d+', text):
            return 'H3'
        elif re.match(r'^\d+\.\d+', text):
            return 'H2'
        elif re.match(r'^\d+\.', text):
            return 'H1'
        if re.match(r'^(Appendix|Chapter|Section|Part)\s+[A-Z0-9]', text, re.IGNORECASE):
            return 'H1'
        return None
