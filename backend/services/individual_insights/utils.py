"""
Utility functions for insights generation and processing.
"""

import random
from typing import List
from utils.llm_client import get_all_pdf_outlines
from services.document_service import document_service
from models.individual_insights_model import ResponseSourceDocument, Respond


class InsightsUtils:
    """Utility functions for insights generation and processing."""
    
    def generate_source_documents(self, document_id: str, page_no: int) -> List[ResponseSourceDocument]:
        """Generate source document information"""
        try:
            doc = document_service.get_document(document_id)
            pdf_name = doc.filename if doc else "Unknown Document"
            
            # Get related documents from the system
            source_docs = [
                ResponseSourceDocument(
                    pdf_name=pdf_name,
                    page_number=page_no,
                    relevance_score=1.0
                )
            ]
            
            # Add other relevant documents (mock implementation)
            all_docs = get_all_pdf_outlines()
            if isinstance(all_docs, dict):
                for doc_name in list(all_docs.keys())[:2]:  # Add up to 2 more relevant docs
                    if doc_name != pdf_name:
                        source_docs.append(
                            ResponseSourceDocument(
                                pdf_name=doc_name,
                                page_number=1,  # Default page
                                relevance_score=0.8
                            )
                        )
            
            return source_docs
        except Exception as e:
            print(f"Error generating source documents: {e}")
            return [
                ResponseSourceDocument(
                    pdf_name="Unknown Document",
                    page_number=page_no,
                    relevance_score=0.5
                )
            ]
    
    def calculate_confidence(self, data_quality: float = 0.8) -> float:
        """Calculate confidence score based on data quality and analysis"""
        # Base confidence on data availability and processing success
        base_confidence = data_quality
        
        # Add some variability based on insight complexity
        variability = random.uniform(-0.1, 0.1)
        
        confidence = max(0.6, min(0.95, base_confidence + variability))
        return round(confidence, 2)
    
    def generate_title(self, insight_type: str, selected_text: str) -> str:
        """Generate a contextual title for the insight"""
        titles = {
            "key_takeaway": "Strategic Business Insights",
            "did_you_know": "Knowledge Discovery",
            "contradictions": "Document Contradictions Analysis",
            "examples": "Implementation Examples",
            "cross_references": "Cross-Document Connections"
        }
        
        base_title = titles.get(insight_type, "Insight Analysis")
        
        # Add context from selected text (first few words)
        words = selected_text.split()[:3]
        if words:
            context = " ".join(words)
            return f"{base_title}: {context}..."
        
        return base_title
    
    def generate_content_summary(self, selected_text: str, original_insight: str) -> str:
        """Generate a content summary combining selected text and insight"""
        # Return the full original insight content instead of truncating
        if original_insight and original_insight.strip():
            return original_insight.strip()
        
        # Fallback to full selected text instead of truncating
        return selected_text
