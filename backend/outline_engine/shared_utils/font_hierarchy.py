# font_hierarchy.py (copied)
from collections import defaultdict
from typing import Dict
from .pdf_text import PDFTextUtils

class FontHierarchyAnalyzer:
    def analyze(self, doc) -> Dict:
        font_stats = defaultdict(lambda: {'count': 0,'total_chars': 0,'pages': set(),'is_bold': False,'sample_texts': []})
        for page_num, page in enumerate(doc):
            self._analyze_page_fonts(page, page_num, font_stats)
        return self._determine_hierarchy(font_stats)

    def _analyze_page_fonts(self, page, page_num: int, font_stats: Dict):
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block["type"] == 0:
                text = PDFTextUtils.extract_block_text(block)
                if len(text.strip()) > 3:
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            font_key = (span.get("size", 10), span.get("font", ""))
                            font_stats[font_key]['count'] += 1
                            font_stats[font_key]['total_chars'] += len(span.get("text", ""))
                            font_stats[font_key]['pages'].add(page_num)
                            if span.get("flags", 0) & 2**4:
                                font_stats[font_key]['is_bold'] = True
                            if len(font_stats[font_key]['sample_texts']) < 3:
                                font_stats[font_key]['sample_texts'].append(text[:50])

    def _determine_hierarchy(self, font_stats: Dict) -> Dict:
        sorted_fonts = sorted(font_stats.items(), key=lambda x: x[0][0], reverse=True)
        if not sorted_fonts:
            return {'title': 16.0,'h1': 14.0,'h2': 12.0,'h3': 11.0,'body': 10.0}
        body_font = max(font_stats.items(), key=lambda x: x[1]['total_chars'])
        body_size = body_font[0][0]
        hierarchy = {'title': None,'h1': None,'h2': None,'h3': None,'body': body_size}
        significant_fonts = [(font, stats) for font, stats in sorted_fonts if stats['count'] >= 1 and font[0] > body_size * 1.1]
        if significant_fonts:
            title_candidates = [f for f in significant_fonts if (0 in f[1]['pages'] or 1 in f[1]['pages']) and f[0][0] >= body_size * 1.5]
            if title_candidates:
                hierarchy['title'] = title_candidates[0][0][0]
            remaining = [f for f in significant_fonts if f[0][0] != hierarchy['title']]
            h1_candidates = [f for f in remaining if f[0][0] >= max(15.0, body_size * 1.4)]
            if h1_candidates:
                hierarchy['h1'] = h1_candidates[0][0][0]
            h2_candidates = [f for f in remaining if f[0][0] != hierarchy['h1'] and f[0][0] >= max(12.0, body_size * 1.2)]
            if h2_candidates:
                hierarchy['h2'] = h2_candidates[0][0][0]
            h3_candidates = [f for f in remaining if (f[0][0] != hierarchy['h1'] and f[0][0] != hierarchy['h2'] and f[0][0] >= max(11.0, body_size * 1.1))]
            if h3_candidates:
                hierarchy['h3'] = h3_candidates[0][0][0]
        if hierarchy['title'] is None:
            hierarchy['title'] = body_size * 1.5
        if hierarchy['h1'] is None:
            hierarchy['h1'] = body_size * 1.3
        if hierarchy['h2'] is None:
            hierarchy['h2'] = body_size * 1.15
        if hierarchy['h3'] is None:
            hierarchy['h3'] = body_size * 1.1
        return hierarchy
