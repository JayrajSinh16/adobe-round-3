# heading_extractor.py (copied)
import re
from typing import List, Dict
from ..shared_utils import (
    PDFTextUtils, DocumentAnalysisUtils, TableDetectionUtils,
    TOCDetectionUtils, GeometricUtils
)
from .level_classifier import LevelClassifier

class HeadingExtractor:
    def __init__(self, heading_patterns):
        self.heading_patterns = heading_patterns
        self.level_classifier = LevelClassifier(heading_patterns)

    def extract_headings(self, doc, font_hierarchy: Dict, title: str = None) -> List[Dict]:
        headings = []
        doc_type = DocumentAnalysisUtils.detect_document_type(doc)
        for page_num, page in enumerate(doc):
            page_headings = self._extract_page_headings(page, page_num + 1, font_hierarchy, title, doc_type)
            headings.extend(page_headings)
        headings = DocumentAnalysisUtils.validate_hierarchy(headings)
        return headings

    def _extract_page_headings(self, page, page_num: int, font_hierarchy: Dict, title: str = None, doc_type: str = 'general') -> List[Dict]:
        blocks = page.get_text("dict")["blocks"]
        if TOCDetectionUtils.is_table_of_contents_page(page, blocks):
            return TOCDetectionUtils.extract_toc_heading_only(blocks, page_num)
        return self._extract_generic_headings(blocks, page_num, font_hierarchy, title)

    def _extract_generic_headings(self, blocks: List[Dict], page_num: int, font_hierarchy: Dict, title: str = None) -> List[Dict]:
        headings = []
        table_areas = TableDetectionUtils.detect_tables(None, blocks) if blocks else []
        for block in blocks:
            if block["type"] != 0:
                continue
            text = PDFTextUtils.extract_block_text(block).strip()
            if not text:
                continue
            if GeometricUtils.is_block_in_table(block, table_areas):
                continue
            if TableDetectionUtils.is_table_or_form_content(text):
                continue
            if TOCDetectionUtils.is_toc_entry(text):
                continue
            if title and text.strip().lower() == title.strip().lower():
                continue
            font_size = PDFTextUtils.get_block_font_size(block)
            is_bold = PDFTextUtils.is_block_bold(block)
            level = self.level_classifier.determine_heading_level_generic(text, font_size, is_bold, font_hierarchy, page_num)
            if level:
                headings.append({'level': level,'text': text,'page': page_num})
        return headings

    def _extract_headings_from_long_block(self, text: str, page_num: int) -> List[Dict]:
        headings = []
        sentences = re.split(r'[.!?]\s+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence or len(sentence) < 5:
                continue
            if self._looks_like_heading_fragment(sentence):
                headings.append({'level': 'H3','text': sentence,'page': page_num})
        return headings

    def _looks_like_heading_fragment(self, text: str) -> bool:
        if len(text) > 100:
            return False
        heading_indicators = [
            len(text) < 50 and text.isupper(),
            text.endswith(':') and len(text) < 30,
            re.match(r'^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$', text) and len(text) < 40,
            re.match(r'^\d+\.?\s+[A-Z]', text),
            re.match(r'^[A-Z][a-z]+\s+[IVX]+:', text),
            re.match(r'^(What|How|Why|Where|When|Which)\s+', text),
        ]
        return any(heading_indicators)
