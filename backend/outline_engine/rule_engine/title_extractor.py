# title_extractor.py (copied)
import re
from typing import Dict
from ..shared_utils import PDFTextUtils, TableDetectionUtils, GeometricUtils

class TitleExtractor:
    def extract_title(self, doc, font_hierarchy: Dict) -> str:
        title_candidates = []
        for page_num in range(min(3, len(doc))):
            page = doc[page_num]
            blocks = page.get_text("dict")["blocks"]
            table_areas = TableDetectionUtils.detect_tables(page, blocks)
            if page_num == 0:
                title_parts = self._extract_multi_block_title(blocks, table_areas, font_hierarchy)
                if title_parts:
                    return title_parts
            for block in blocks:
                if block["type"] == 0:
                    text = PDFTextUtils.extract_block_text(block).strip()
                    if not text or len(text) > 300:
                        continue
                    if GeometricUtils.is_block_in_table(block, table_areas):
                        continue
                    if TableDetectionUtils.is_table_or_form_content(text):
                        continue
                    font_size = PDFTextUtils.get_block_font_size(block)
                    is_bold = PDFTextUtils.is_block_bold(block)
                    score = 0
                    body_size = font_hierarchy.get('body', 10.0)
                    if font_size >= body_size * 1.8:
                        score += 4
                    elif font_size >= body_size * 1.4:
                        score += 2
                    elif font_size >= body_size * 1.2:
                        score += 1
                    if is_bold:
                        score += 1
                    if page_num == 0:
                        score += 3
                    elif page_num == 1:
                        score += 1
                    if len(text) > 150:
                        score -= 2
                    elif len(text) > 100:
                        score -= 1
                    bbox = block['bbox']
                    page_height = page.rect.height
                    if bbox[1] < page_height * 0.4:
                        score += 1
                    if re.match(r'^(RFP|Request|Proposal|Report|Plan|Strategy)', text, re.IGNORECASE):
                        score += 2
                    if score >= 3:
                        title_candidates.append({'text': text,'score': score,'page': page_num,'font_size': font_size})
        if title_candidates:
            title_candidates.sort(key=lambda x: (-x['score'], x['page'], -x['font_size']))
            return title_candidates[0]['text']
        if len(doc) > 0:
            page = doc[0]
            blocks = page.get_text("dict")["blocks"]
            table_areas = TableDetectionUtils.detect_tables(page, blocks)
            for block in blocks:
                if block["type"] == 0:
                    if GeometricUtils.is_block_in_table(block, table_areas):
                        continue
                    text = PDFTextUtils.extract_block_text(block).strip()
                    if (text and 10 <= len(text) <= 200 and not TableDetectionUtils.is_table_or_form_content(text)):
                        return text
        return "Untitled Document"

    def _extract_multi_block_title(self, blocks, table_areas, font_hierarchy: Dict) -> str:
        title_blocks = []
        for i, block in enumerate(blocks):
            if block["type"] == 0:
                text = PDFTextUtils.extract_block_text(block).strip()
                if not text or len(text) < 5:
                    continue
                if GeometricUtils.is_block_in_table(block, table_areas):
                    continue
                if TableDetectionUtils.is_table_or_form_content(text):
                    continue
                font_size = PDFTextUtils.get_block_font_size(block)
                body_size = font_hierarchy.get('body', 10.0)
                if font_size >= body_size * 1.5:
                    bbox = block['bbox']
                    title_blocks.append({'text': text,'font_size': font_size,'bbox': bbox,'y_pos': bbox[1]})
        if not title_blocks:
            return None
        title_blocks.sort(key=lambda x: x['y_pos'])
        if len(title_blocks) >= 2:
            first_text = title_blocks[0]['text'].strip()
            if re.match(r'^(RFP|Request|Proposal):', first_text, re.IGNORECASE):
                combined_parts = [first_text]
                for i in range(1, min(3, len(title_blocks))):
                    next_text = title_blocks[i]['text'].strip()
                    if (len(next_text) > 10 and not re.match(r'^(Summary|Background|Introduction)', next_text, re.IGNORECASE) and not re.match(r'^\d+\.', next_text)):
                        combined_parts.append(next_text)
                        combined_text = ' '.join(combined_parts)
                        if (len(combined_text) > 50 and ('Library' in combined_text or 'Proposal' in combined_text or 'Plan' in combined_text)):
                            return combined_text.strip()
        for block in title_blocks:
            text = block['text']
            if (len(text) > 30 and ('Library' in text or 'Proposal' in text or 'Plan' in text or 'Request' in text)):
                return text.strip()
        return None
