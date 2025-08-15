# pattern_matching.py (copied)
import re
from typing import Dict

class PatternMatchingUtils:
    @staticmethod
    def compile_common_patterns() -> Dict:
        return {
            'numbered_h1': re.compile(r'^(\d+\.?)\s+(.+)$'),
            'numbered_h2': re.compile(r'^(\d+\.\d+\.?)\s+(.+)$'),
            'numbered_h3': re.compile(r'^(\d+\.\d+\.\d+\.?)\s+(.+)$'),
            'chapter': re.compile(r'^(Chapter|CHAPTER|Section|SECTION)\s+(\d+|[IVX]+)', re.I),
            'keyword_h1': re.compile(r'^(Introduction|Conclusion|Abstract|References|Appendix)', re.I),
            'keyword_h2': re.compile(r'^(Background|Methodology|Results|Discussion|Related Work|Summary)', re.I),
            'keyword_h3': re.compile(r'^(Timeline|Milestones|Approach)', re.I),
            'question_h3': re.compile(r'^(What|How|Why|Where|When).*\?', re.I),
            'colon_ended': re.compile(r'^.+:$'),
            'ontario_subsection': re.compile(r'^For (each|the) Ontario', re.I)
        }
