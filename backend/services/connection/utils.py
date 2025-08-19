"""
Utility functions for connection processing and text analysis.
"""

import re
from typing import List
from models import DocumentConnection
from services.document_service import document_service


class ConnectionUtils:
    """Utility functions for connection processing."""
    
    def extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts and important words from text"""
        # Clean and normalize text
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filter out common stop words and short words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 
            'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 
            'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
        }
        
        # Extract meaningful words (longer than 2 chars, not stop words)
        key_words = [word for word in words if len(word) > 2 and word not in stop_words]
        
        # Also extract noun phrases and important concepts
        # Look for capitalized words (proper nouns)
        original_words = text.split()
        capitalized = [word.strip('.,!?()[]{}"\';:') for word in original_words if word[0].isupper() and len(word) > 2]
        
        return list(set(key_words + [word.lower() for word in capitalized]))
    
    def validate_connection(self, connection: DocumentConnection, source_pdf_name: str) -> bool:
        """Validate if connection is useful and not referencing source document"""
        if not connection or not connection.title or not connection.document:
            return False
        
        # Don't include connections to the source document
        if connection.document == source_pdf_name:
            return False
        
        # Check if document exists in our library
        all_documents = document_service.get_all_documents()
        doc_names = {doc.filename for doc in all_documents}
        
        return connection.document in doc_names
