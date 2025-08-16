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
        
        # Batch-generate all requested insight types in one LLM call for efficiency
        raw_insights = generate_insights(selected_text, related_sections, insight_types)

        # Fetch primary document once
        primary_doc = document_service.get_document(document_id)

        insights = []
        for ri in raw_insights:
            insight_type = ri.get("type", "unknown")
            content = ri.get("content", "No content generated.")
            relevance = ri.get("relevance_score", 0.8)

            insight = Insight(
                type=insight_type,
                title=self._get_insight_title(insight_type),
                content=content,
                source_documents=[
                    {
                        'pdf_name': primary_doc.filename,
                        'pdf_id': primary_doc.id,
                        'page': page_number
                    }
                ] + [
                    {
                        'pdf_name': conn.pdf_name,
                        'pdf_id': conn.pdf_id,
                        'page': conn.page_number
                    } for conn in connections.connections[:3]
                ],
                confidence=float(relevance)
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