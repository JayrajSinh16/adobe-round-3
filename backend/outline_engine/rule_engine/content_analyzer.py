# content_analyzer.py (copied)
from ..shared_utils import DocumentAnalysisUtils

class ContentAnalyzer:
    def detect_document_type(self, doc) -> str:
        return DocumentAnalysisUtils.detect_document_type(doc)
