from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from config import settings
from services.document_service import document_service

class SearchService:
    def __init__(self):
        # Enhanced TF-IDF with more features and n-grams for better matching
        self.vectorizer = TfidfVectorizer(
            max_features=2000, 
            stop_words='english',
            ngram_range=(1, 2),  # Include bigrams for better phrase matching
            lowercase=True,
            token_pattern=r'\b[a-zA-Z][a-zA-Z0-9]*\b'  # Better tokenization
        )
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
        """Search for headings across all PDFs with enhanced matching"""
        # Build index if not exists
        if self.heading_vectors is None:
            self._build_search_index()
        
        if self.heading_vectors is None or len(self.heading_data) == 0:
            return []
        
        # Preprocess query for better matching
        query_lower = query.lower().strip()
        
        # First, try exact substring matching for immediate results
        exact_matches = []
        for i, heading_data in enumerate(self.heading_data):
            heading_lower = heading_data['heading'].lower()
            if query_lower in heading_lower:
                match_result = heading_data.copy()
                # Calculate relevance based on position and length
                if heading_lower.startswith(query_lower):
                    match_result['relevance_score'] = 0.95  # High score for prefix match
                elif heading_lower == query_lower:
                    match_result['relevance_score'] = 1.0   # Perfect match
                else:
                    # Partial match score based on query coverage
                    coverage = len(query_lower) / len(heading_lower)
                    match_result['relevance_score'] = 0.8 + (coverage * 0.15)
                exact_matches.append(match_result)
        
        # Sort exact matches by relevance
        exact_matches.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # If we have enough exact matches, return them
        if len(exact_matches) >= limit:
            return exact_matches[:limit]
        
        # Otherwise, complement with semantic similarity
        query_vector = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.heading_vectors)[0]
        
        # Get top semantic results
        top_indices = np.argsort(similarities)[-limit*2:][::-1]  # Get more candidates
        
        semantic_results = []
        exact_match_indices = {i for i, _ in enumerate(self.heading_data) 
                              if any(em['heading'] == self.heading_data[i]['heading'] 
                                   for em in exact_matches)}
        
        for idx in top_indices:
            if similarities[idx] > 0.05 and idx not in exact_match_indices:  # Lower threshold for semantic
                result = self.heading_data[idx].copy()
                result['relevance_score'] = float(similarities[idx])
                semantic_results.append(result)
        
        # Combine results: exact matches first, then semantic matches
        combined_results = exact_matches + semantic_results
        
        # Remove duplicates and limit results
        seen_headings = set()
        final_results = []
        for result in combined_results:
            heading_key = (result['heading'], result['pdf_id'], result['page'])
            if heading_key not in seen_headings:
                seen_headings.add(heading_key)
                final_results.append(result)
                if len(final_results) >= limit:
                    break
        
        return final_results
    
    def search_by_level(self, level: str) -> List[Dict[str, Any]]:
        """Get all headings of a specific level"""
        if not self.heading_data:
            self._build_search_index()
        
        return [h for h in self.heading_data if h['level'] == level]

# Create singleton instance
search_service = SearchService()