"""
Source document builder module for building source document lists.
"""

from typing import List, Dict, Any
from services.document_service import document_service


class SourceDocumentBuilder:
    """Handles building source document lists for insights."""
    
    def __init__(self):
        self.prioritized_sections = []
        self.primary_doc = None
    
    def set_context(self, prioritized_sections: List[Dict[str, Any]], primary_doc):
        """Set the context for building source documents"""
        self.prioritized_sections = prioritized_sections
        self.primary_doc = primary_doc
    
    def build_source_documents(self, primary_pdf_name: str, page_number: int, 
                             relevant_document: str, insight_page: int) -> List[Dict[str, Any]]:
        """Create FOCUSED source documents list - only the 3 most relevant"""
        source_documents = []
        
        # Add the primary document first
        source_documents.append({
            'pdf_name': primary_pdf_name,
            'pdf_id': self.primary_doc.id if self.primary_doc else None,
            'page': page_number,
        })
        
        # Add the insight-specific document if different from primary
        if relevant_document != primary_pdf_name:
            doc_info = document_service.get_document_by_filename(relevant_document)
            if doc_info:
                source_documents.append({
                    'pdf_name': relevant_document,
                    'pdf_id': doc_info.id,
                    'page': insight_page,
                })

        # Add only ONE additional most relevant document (limit to 3 total)
        added_docs = {primary_pdf_name, relevant_document}
        for section in self.prioritized_sections:
            if (section['pdf_name'] not in added_docs and 
                len(source_documents) < 3):  # Changed from 5 to 3
                doc_info = document_service.get_document_by_filename(section['pdf_name'])
                source_documents.append({
                    'pdf_name': section['pdf_name'],
                    'pdf_id': doc_info.id if doc_info else None,
                    'page': section.get('page', 1),
                })
                added_docs.add(section['pdf_name'])
                break  # Only add one more document
        
        return source_documents
