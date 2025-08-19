"""
Document context manager module for managing document context and sections.
"""

from typing import List, Dict, Any
from services.document_service import document_service


class DocumentContextManager:
    """Handles document context management and section extraction."""
    
    def __init__(self):
        pass
    
    def get_primary_document_info(self, document_id: str) -> tuple:
        """Get primary document information"""
        primary_doc = document_service.get_document(document_id)
        primary_pdf_name = primary_doc.filename if primary_doc else "Unknown"
        return primary_doc, primary_pdf_name
    
    def get_all_documents(self) -> List:
        """Get ALL available documents to enhance cross-document analysis"""
        return document_service.get_all_documents()
    
    def enhance_with_additional_document_content(self, all_documents: List, document_id: str) -> List[Dict[str, Any]]:
        """Enhance with additional document content for better cross-document analysis"""
        additional_sections: List[Dict[str, Any]] = []
        
        for doc in all_documents:
            if doc.id != document_id:  # Don't duplicate the primary document
                outline = document_service.get_document_outline(doc.id)
                if outline:
                    outline_items = outline.get('outline', [])
                    for item in outline_items[:3]:  # Limit to prevent token overflow
                        heading = item.get('text', item.get('heading', 'Unknown'))
                        page = item.get('page', 1)
                        additional_sections.append({
                            'pdf_name': doc.filename,
                            'heading': heading,
                            'content': f"Section from {doc.filename}: {heading}",
                            'page': page,
                            'strength': 'medium',
                            'document_id': doc.id,
                        })
        
        return additional_sections
