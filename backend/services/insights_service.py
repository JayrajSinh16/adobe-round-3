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
        """Generate insights for selected text with enhanced cross-document analysis"""
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
        
        # Get the primary document information
        primary_doc = document_service.get_document(document_id)
        
        # Find connections across ALL documents, not just the primary one
        connections = connection_service.find_connections(selected_text, document_id)
        
        # Get ALL available documents to enhance cross-document analysis
        all_documents = document_service.get_all_documents()
        
        # Prepare enhanced related sections data from multiple documents
        related_sections = []
        
        # Add connections found by connection service
        for conn in connections.connections:
            doc_info = document_service.get_document_by_filename(conn.document)
            related_sections.append({
                'pdf_name': conn.document,
                'heading': conn.title,
                'content': conn.snippet,
                'page': conn.pages[0] if conn.pages else 1,
                'strength': conn.strength,
                'document_id': doc_info.id if doc_info else None
            })
        
        # Enhance with additional document content for better cross-document analysis
        for doc in all_documents:
            if doc.id != document_id:  # Don't duplicate the primary document
                # Get outline information for context
                outline = document_service.get_document_outline(doc.id)
                if outline:
                    outline_items = outline.get('outline', [])
                    # Add relevant outline items as additional context
                    for item in outline_items[:3]:  # Limit to prevent token overflow
                        heading = item.get('text', item.get('heading', 'Unknown'))
                        page = item.get('page', 1)
                        related_sections.append({
                            'pdf_name': doc.filename,
                            'heading': heading,
                            'content': f"Section from {doc.filename}: {heading}",
                            'page': page,
                            'strength': 'medium',
                            'document_id': doc.id
                        })
        
        # Ensure we have diverse document representation (limit to prevent token overflow)
        # Prioritize high-strength connections and diverse documents
        unique_docs = set()
        prioritized_sections = []
        
        # First, add high-strength connections
        for section in related_sections:
            if section.get('strength') == 'high' and len(prioritized_sections) < 8:
                prioritized_sections.append(section)
                unique_docs.add(section['pdf_name'])
        
        # Then add medium/low strength from different documents
        for section in related_sections:
            if (section['pdf_name'] not in unique_docs and 
                len(prioritized_sections) < 8 and 
                len(unique_docs) < 4):  # Ensure we have at least 4 different documents
                prioritized_sections.append(section)
                unique_docs.add(section['pdf_name'])
        
        print(f"DEBUG: Analyzing across {len(unique_docs)} documents: {list(unique_docs)}")
        
        # Batch-generate all requested insight types with enhanced cross-document focus
        raw_insights = generate_insights(selected_text, prioritized_sections, insight_types)

        insights = []
        for ri in raw_insights:
            insight_type = ri.get("type", "unknown")
            content = ri.get("content", "No content generated.")
            relevance = ri.get("relevance_score", 0.8)

            # Create comprehensive source documents list from multiple PDFs
            source_documents = []
            
            # Add primary document
            source_documents.append({
                'pdf_name': primary_doc.filename,
                'pdf_id': primary_doc.id,
                'page': page_number
            })
            
            # Add diverse documents from related sections
            added_docs = {primary_doc.filename}
            for section in prioritized_sections:
                if (section['pdf_name'] not in added_docs and 
                    len(source_documents) < 5):  # Limit to 5 total sources
                    doc_info = document_service.get_document_by_filename(section['pdf_name'])
                    source_documents.append({
                        'pdf_name': section['pdf_name'],
                        'pdf_id': doc_info.id if doc_info else None,
                        'page': section.get('page', 1)
                    })
                    added_docs.add(section['pdf_name'])

            insight = Insight(
                type=insight_type,
                title=self._get_insight_title(insight_type),
                content=content,
                source_documents=source_documents,
                confidence=float(relevance)
            )
            insights.append(insight)
        
        processing_time = time.time() - start_time
        
        print(f"DEBUG: Generated {len(insights)} insights referencing {len(source_documents)} documents")
        
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