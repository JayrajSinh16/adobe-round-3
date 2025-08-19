"""
Context manager module for handling document context and PDF outline management.
"""

from typing import Dict, Any
from utils.llm_client import format_outlines_for_context, get_all_pdf_outlines
from services.document_service import document_service


class ContextManager:
    """Handles document context retrieval and PDF outline management."""
    
    def get_document_context(self, document_id: str, page_no: int) -> Dict[str, Any]:
        """Get document context for the LLM"""
        try:
            doc = document_service.get_document(document_id)
            pdf_context = format_outlines_for_context(get_all_pdf_outlines())
            
            return {
                "primary_document": doc.filename if doc else "Unknown",
                "page_number": page_no,
                "pdf_context": pdf_context
            }
        except Exception as e:
            print(f"Error getting document context: {e}")
            return {
                "primary_document": "Unknown",
                "page_number": page_no,
                "pdf_context": "Document context unavailable"
            }
