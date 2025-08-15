import time
from typing import List, Dict, Any, Optional
from config import settings
from utils import generate_insights
from services.connection_service import connection_service
from services.document_service import document_service
from models import Insight, InsightResponse

class InsightsService:
    def __init__(self):
        self.cached_insights = {}
    
    def generate_insights(self, selected_text: str, document_id: str, 
                         page_number: int, insight_types: Optional[List[str]] = None) -> InsightResponse:
        """Generate insights for selected text"""
        start_time = time.time()
        
        # Generate all insight types by default if none specified
        if not insight_types:
            insight_types = [
                "key_takeaways",
                "contradictions", 
                "examples",
                "cross_references",
                "did_you_know"
            ]
        
        # Find related sections first
        connections = connection_service.find_connections(selected_text, document_id)
        
        # Prepare related sections data
        related_sections = []
        for conn in connections.connections:
            doc_info = document_service.get_document(conn.pdf_id)
            related_sections.append({
                'pdf_name': conn.pdf_name,
                'heading': conn.heading,
                'content': conn.snippet,
                'page': conn.page_number
            })
        
        insights = []
        
        for insight_type in insight_types:
            # Generate insight using LLM
            insight_content = generate_insights(selected_text, related_sections, insight_type)
            
            # Create insight object
            insight = Insight(
                type=insight_type,
                title=self._get_insight_title(insight_type),
                content=insight_content,
                source_documents=[{
                    'pdf_name': doc_info.filename,
                    'pdf_id': doc_info.id,
                    'page': page_number
                } for doc_info in [document_service.get_document(document_id)]] + \
                [{
                    'pdf_name': conn.pdf_name,
                    'pdf_id': conn.pdf_id,
                    'page': conn.page_number
                } for conn in connections.connections[:3]],  # Include top 3 connections
                confidence=0.85  # Default confidence score
            )
            insights.append(insight)
        
        processing_time = time.time() - start_time
        
        return InsightResponse(
            insights=insights,
            selected_text=selected_text,
            processing_time=processing_time
        )
    
    def _get_insight_title(self, insight_type: str) -> str:
        """Get user-friendly title for insight type"""
        titles = {
            "key_takeaways": "Key Takeaways",
            "contradictions": "Contradictions & Conflicts",
            "examples": "Practical Examples",
            "cross_references": "Cross-Document Connections",
            "did_you_know": "Did You Know?"
        }
        return titles.get(insight_type, "Insights")

# Create singleton instance
insights_service = InsightsService()