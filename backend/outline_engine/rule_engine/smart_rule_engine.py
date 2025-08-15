# smart_rule_engine.py (copied & adapted)
import fitz
from typing import Dict
from config import Config
from ..shared_utils import PatternMatchingUtils, FontHierarchyAnalyzer
from .title_extractor import TitleExtractor
from .heading_extractor import HeadingExtractor

class SmartRuleEngine:
    def __init__(self):
        self.heading_patterns = PatternMatchingUtils.compile_common_patterns()
        self.font_analyzer = FontHierarchyAnalyzer()
        self.title_extractor = TitleExtractor()
        self.heading_extractor = HeadingExtractor(self.heading_patterns)

    def extract(self, pdf_path: str) -> Dict:
        doc = fitz.open(pdf_path)
        font_hierarchy = self.font_analyzer.analyze(doc)
        title = self.title_extractor.extract_title(doc, font_hierarchy)
        headings = self.heading_extractor.extract_headings(doc, font_hierarchy, title)
        doc.close()
        return {"title": title, "outline": headings}
