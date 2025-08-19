"""
Fallback generator module for creating intelligent fallback connections.
"""

from typing import List, Dict
from models import DocumentConnection
from services.document_service import document_service


class FallbackGenerator:
    """Handles generation of fallback connections when primary methods fail."""
    
    def create_dynamic_fallback_connections(self, selected_text: str, source_pdf_name: str) -> List[DocumentConnection]:
        """Create dynamic fallback connections based on intelligent outline analysis"""
        connections = []
        all_documents = document_service.get_all_documents()
        other_docs = [doc for doc in all_documents if doc.filename != source_pdf_name]
        
        if not other_docs:
            return connections
        
        # Use the intelligent template generation
        from .connection_analyzer import ConnectionAnalyzer
        analyzer = ConnectionAnalyzer()
        connection_templates = analyzer.generate_connection_templates(selected_text)
        
        # Filter templates to exclude source document
        valid_templates = [
            template for template in connection_templates 
            if template.get('document', '') != source_pdf_name
        ]
        
        # Convert templates to DocumentConnection objects
        for template in valid_templates[:3]:  # Limit to top 3
            try:
                connection = DocumentConnection(
                    title=template['title'],
                    type=template['type'],
                    document=template['document'],
                    pages=template.get('pages', [1]),
                    snippet=template['snippet'],
                    strength=template.get('strength', 'medium')
                )
                connections.append(connection)
            except Exception as e:
                print(f"Error creating connection from template: {e}")
                continue
        
        return connections
    
    def create_intelligent_fallbacks(self, selected_text: str, source_pdf_name: str, existing_count: int) -> List[DocumentConnection]:
        """Create intelligent fallback connections when needed"""
        connections = []
        needed = max(0, 2 - existing_count)  # Ensure at least 2 total connections
        
        if needed <= 0:
            return connections
        
        all_documents = document_service.get_all_documents()
        other_docs = [doc for doc in all_documents if doc.filename != source_pdf_name]
        
        # Create minimal fallback connections
        for i in range(min(needed, len(other_docs))):
            doc = other_docs[i]
            
            connection = DocumentConnection(
                title="Related Content",
                type="reference",
                document=doc.filename,
                pages=[1],
                snippet="Related document content available for cross-reference.",
                strength="low"
            )
            connections.append(connection)
        
        return connections
