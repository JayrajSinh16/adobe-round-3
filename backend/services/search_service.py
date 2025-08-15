import time
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from config import settings
from services.document_service import document_service

class SearchService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.heading_vectors = None
        self.heading_data = []
    
    def _build_search_index(self):
        """Build search index from all document outlines"""
        all_headings = []
        self.heading_data = []
        
        for doc_id, doc_info in document_service.documents.items():
            outline = document_service.get_document_outline(doc_id)
            if outline:
                for item in outline.get('outline', []):
                    all_headings.append(item['text'])
                    self.heading_data.append({
                        'heading': item['text'],
                        'page': item['page'],
                        'pdf_name': doc_info.filename,
                        'pdf_id': doc_id,
                        'level': item['level']
                    })
        
        if all_headings:
            self.heading_vectors = self.vectorizer.fit_transform(all_headings)
    
    def search_headings(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for headings across all PDFs"""
        # Build index if not exists
        if self.heading_vectors is None:
            self._build_search_index()
        
        if self.heading_vectors is None or len(self.heading_data) == 0:
            return []
        
        # Vectorize query
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self.heading_vectors)[0]
        
        # Get top results
        top_indices = np.argsort(similarities)[-limit:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Relevance threshold
                result = self.heading_data[idx].copy()
                result['relevance_score'] = float(similarities[idx])
                results.append(result)
        
        return results
    
    def search_by_level(self, level: str) -> List[Dict[str, Any]]:
        """Get all headings of a specific level"""
        if not self.heading_data:
            self._build_search_index()
        
        return [h for h in self.heading_data if h['level'] == level]

# Create singleton instance
search_service = SearchService()