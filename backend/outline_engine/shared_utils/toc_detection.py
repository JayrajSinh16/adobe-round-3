# toc_detection.py (copied)
import re
from typing import List, Dict
from .pdf_text import PDFTextUtils

class TOCDetectionUtils:
    @staticmethod
    def is_table_of_contents_page(page, blocks: List[Dict]) -> bool:
        page_text = page.get_text().upper()
        if "TABLE OF CONTENTS" in page_text:
            return True
        toc_indicators = 0
        for block in blocks:
            if block["type"] != 0:
                continue
            text = PDFTextUtils.extract_block_text(block).strip()
            if TOCDetectionUtils.is_toc_entry(text):
                toc_indicators += 1
        return toc_indicators >= 3

    @staticmethod
    def is_toc_entry(text: str) -> bool:
        if re.search(r'^(\d+\.|\d+\.\d+\.?|Chapter\s+\d+:?)\s+.+\s+\d+\s*$', text.strip()):
            return True
        if re.search(r'\d+\.\d+\s+[^0-9]+\s+\d+\s+\d+\.\d+', text):
            return True
        if re.search(r'^.+\s+\d{1,3}\s*$', text.strip()) and len(text.strip()) > 10:
            return True
        return False

    @staticmethod
    def extract_toc_heading_only(blocks: List[Dict], page_num: int) -> List[Dict]:
        headings = []
        for block in blocks:
            if block["type"] != 0:
                continue
            text = PDFTextUtils.extract_block_text(block).strip()
            if re.match(r'^(Table of Contents|Contents|TOC)$', text, re.IGNORECASE):
                headings.append({'level': 'H1', 'text': text, 'page': page_num - 1})
        return headings
