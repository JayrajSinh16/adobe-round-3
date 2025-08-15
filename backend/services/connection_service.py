import json
import time
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from config import settings
from utils import generate_snippet_summary, extract_text_around_heading
# Avoid importing document_service at module load to prevent circular imports
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from services.document_service import DocumentService, document_service  # type: ignore
from models import ConnectionSnippet, ConnectionResponse

class ConnectionService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.document_vectors = {}
        
    def _preprocess_outlines(self):
        """Preprocess all document outlines for faster search"""
        from services.document_service import document_service  # local import
        all_headings: List[str] = []
        heading_metadata: List[Dict[str, Any]] = []
        for doc_id, doc_info in document_service.documents.items():
            outline = document_service.get_document_outline(doc_id)
            if not outline:
                continue
            for item in outline.get('outline', []):
                text = item.get('text')
                if not text:
                    continue
                all_headings.append(text)
                heading_metadata.append({
                    'doc_id': doc_id,
                    'doc_name': doc_info.filename,
                    'heading': text,
                    'page': item.get('page'),
                    'level': item.get('level')
                })
        if all_headings:
            self.document_vectors = self.vectorizer.fit_transform(all_headings)
            self.heading_metadata = heading_metadata
    
    def find_connections(self, selected_text: str, current_doc_id: str, 
                        context_before: str = "", context_after: str = "") -> ConnectionResponse:
        """Find connections across all documents for selected text"""
        start_time = time.time()
        
        # Preprocess outlines if not done
        if not hasattr(self, 'heading_metadata'):
            self._preprocess_outlines()
        
        # Combine selected text with context for better matching
        search_text = f"{context_before} {selected_text} {context_after}".strip()
        
        # Vectorize search text
        search_vector = self.vectorizer.transform([search_text])
        
        # Calculate similarities
        similarities = cosine_similarity(search_vector, self.document_vectors)[0]
        
        # Get top N connections
        top_indices = np.argsort(similarities)[-settings.connection_limit-1:-1][::-1]
        
        connections = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Threshold for relevance
                metadata = self.heading_metadata[idx]
                
                # Skip if it's from the same document and same section
                if metadata['doc_id'] == current_doc_id:
                    continue
                
                # Extract snippet
                from services.document_service import document_service  # local import
                doc_info = document_service.get_document(metadata['doc_id'])
                snippet_text = extract_text_around_heading(
                    doc_info.filepath,
                    metadata['page'],
                    metadata['heading'],
                    settings.snippet_length
                )
                
                connections.append(ConnectionSnippet(
                    heading=metadata['heading'],
                    page_number=metadata['page'],
                    pdf_name=metadata['doc_name'],
                    pdf_id=metadata['doc_id'],
                    snippet=snippet_text[:settings.snippet_length],
                    relevance_score=float(similarities[idx])
                ))
        
        # Limit to top connections
        connections = connections[:settings.connection_limit]
        
        # Generate summary using LLM
        summary = ""
        if connections:
            connection_texts = [f"{c.heading}: {c.snippet}" for c in connections]
            combined_text = "\n\n".join(connection_texts)
            summary = generate_snippet_summary(
                f"Selected text: {selected_text}\n\nRelated sections:\n{combined_text}",
                limit=3
            )
        
        processing_time = time.time() - start_time
        
        return ConnectionResponse(
            connections=connections,
            summary=summary,
            processing_time=processing_time
        )

# Create singleton instance
connection_service = ConnectionService()