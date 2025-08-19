"""
Insight generator module for generating insights using LLM.
"""

from typing import List, Dict, Any, Optional
from utils import generate_insights
from models import Insight


class InsightGenerator:
    """Handles the main insight generation logic using LLM."""
    
    def __init__(self):
        pass
    
    def generate_raw_insights(self, selected_text: str, prioritized_sections: List[Dict[str, Any]], 
                             insight_types: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Generate insights using new multi-call approach for better quality and specificity"""
        raw_insights = generate_insights(selected_text, prioritized_sections, insight_types)
        return raw_insights or []
    
    def process_raw_insights(self, raw_insights: List[Dict[str, Any]], primary_pdf_name: str, 
                           page_number: int, source_documents_builder) -> List[Insight]:
        """Process raw insights into Insight objects"""
        insights: List[Insight] = []
        
        for ri in raw_insights:
            insight_type = ri.get("type", "unknown")
            content = ri.get("content", "No content generated.")
            relevance = float(ri.get("relevance_score", 0.8) or 0.8)
            
            # Extract document and page info from new format
            relevant_document = ri.get("relevant_document", primary_pdf_name)
            insight_page = ri.get("page_number", page_number)

            # Build source documents for this insight
            source_documents = source_documents_builder.build_source_documents(
                primary_pdf_name, page_number, relevant_document, insight_page
            )

            insight = Insight(
                type=insight_type,
                title=self._get_insight_title(insight_type),
                content=content,
                source_documents=source_documents,
                confidence=relevance,
            )
            insights.append(insight)
        
        return insights
    
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
