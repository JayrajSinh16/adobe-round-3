# table_detection.py (copied)
import re
from typing import List, Dict, Optional
from .pdf_text import PDFTextUtils

class TableDetectionUtils:
    @staticmethod
    def is_table_structure(text: str) -> bool:
        table_patterns = [
            r'S\.?No\.?\s+(Name|Description|Item)',
            r'(Name|Item|Description)\s+(Age|Quantity|Amount)',
            r'\d+\.\s+\d+\.\s+\d+\.',
            r'(Name|Age|Relationship)\s+(Name|Age|Relationship)',
        ]
        for pattern in table_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        if re.search(r'S\.?No\.?\s+Name\s+Age\s+Relationship', text, re.IGNORECASE):
            return True
        if re.match(r'^\d+\.\s*\d+\.\s*\d+\.\s*\d+', text.strip()):
            return True
        return False

    @staticmethod
    def is_table_or_form_content(text: str) -> bool:
        if re.match(r'^\d+\.?\s*$', text.strip()):
            return True
        form_patterns = [
            r'^\d+\.\s*(Name|Designation|PAY|Whether|Home Town|Amount)',
            r'^S\.?No\.?\s+(Name|Age|Relationship)',
            r'^\d+\.\s+\d+\.\s*$',
            r'^\d+\.\s+\d+\.\s+\d+\.\s*$',
            r'^\d+\.\s+\d+\.\s+\d+\.\s+\d+',
            r'^(Date|Signature)',
            r'^Rs\.\s*$',
            r'^\d+\s+\d+\s+\d+\s*$',
            r'^\d+\s*\d+\s*\d+\s*$',
        ]
        for pattern in form_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        if len(text.strip()) <= 2 and text.strip().isdigit():
            return True
        if re.match(r'^\d+\.\s*[A-Z]\.?(\s*)?$', text.strip()):
            return True
        if re.match(r'^[\d\.\s]{2,10}$', text.strip()) and '.' in text:
            return True
        return False

    @staticmethod
    def detect_tables(page, blocks: List[Dict]) -> List[Dict]:
        table_areas = []
        for block in blocks:
            if block["type"] != 0:
                continue
            text = PDFTextUtils.extract_block_text(block).strip()
            if TableDetectionUtils.is_table_structure(text):
                table_areas.append({'bbox': block['bbox'], 'type': 'text_table', 'confidence': 0.8})
        try:
            layout_tables = page.find_tables()
            for table in layout_tables:
                table_areas.append({'bbox': table.bbox, 'type': 'detected_table', 'confidence': 0.9})
        except:
            pass
        form_area = TableDetectionUtils.detect_form_structure(blocks)
        if form_area:
            table_areas.append(form_area)
        return table_areas

    @staticmethod
    def detect_form_structure(blocks: List[Dict]) -> Optional[Dict]:
        numbered_blocks = []
        for block in blocks:
            if block["type"] != 0:
                continue
            text = PDFTextUtils.extract_block_text(block).strip()
            if (re.match(r'^\d+\.\s*(.{0,50})?$', text.strip()) and not TableDetectionUtils.is_table_or_form_content(text)):
                numbered_blocks.append(block)
        if len(numbered_blocks) >= 8:
            min_x = min(block['bbox'][0] for block in numbered_blocks)
            min_y = min(block['bbox'][1] for block in numbered_blocks)
            max_x = max(block['bbox'][2] for block in numbered_blocks)
            max_y = max(block['bbox'][3] for block in numbered_blocks)
            return {'bbox': [min_x, min_y, max_x, max_y], 'type': 'form_structure', 'confidence': 0.7}
        return None
