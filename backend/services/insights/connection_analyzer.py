"""
Connection analyzer module for finding connections across documents.
"""

from typing import List, Dict, Any
from services.connection_service import connection_service
from services.document_service import document_service


class ConnectionAnalyzer:
    """Handles finding and analyzing connections across documents."""
    
    def __init__(self):
        pass
    
    def find_connections(self, selected_text: str, document_id: str) -> List[Dict[str, Any]]:
        """Find connections across ALL documents, not just the primary one"""
        connection_items = []
        
        try:
            connections = connection_service.find_connections(selected_text, document_id)
            connection_items = getattr(connections, 'connections', []) or []
        except Exception:
            connection_items = []
        
        return connection_items
    
    def build_related_sections_from_connections(self, connection_items: List) -> List[Dict[str, Any]]:
        """Build related sections data from connection items"""
        related_sections: List[Dict[str, Any]] = []
        
        # Add connections found by connection service
        for conn in connection_items:
            doc_info = document_service.get_document_by_filename(conn.document)
            related_sections.append({
                'pdf_name': conn.document,
                'heading': conn.title,
                'content': conn.snippet,
                'page': conn.pages[0] if getattr(conn, 'pages', None) else 1,
                'strength': getattr(conn, 'strength', 'medium'),
                'document_id': doc_info.id if doc_info else None,
            })
        
        return related_sections
