import time
from typing import List, Dict, Any, Optional
from config import settings
from utils import generate_insights
from services.connection_service import connection_service
from services.document_service import document_service
from models import Insight, InsightResponse

class InsightsService:
    """
    Insights Service using Multi-Call LLM Strategy
    
    This service now uses a redesigned approach with multiple focused LLM calls:
    - Batch 1: Key Takeaways & Practical Examples (practical_analysis focus)
    - Batch 2: Cross-References & Did You Know (connections_discovery focus) 
    - Batch 3: Contradictions (conflict_analysis focus)
    
    Each call:
    - Uses specialized system prompts for the specific insight types
    - Requests 2-3 line concise responses
    - Asks for specific document names and page numbers
    - Provides full document library context
    - Focuses on quality over quantity with smaller token limits per call
    """
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
                "did_you_know",
            ]

        # Get the primary document information (guard against missing mapping)
        primary_doc = document_service.get_document(document_id)
        primary_pdf_name = primary_doc.filename if primary_doc else "Unknown"

        # Find connections across ALL documents, not just the primary one
        try:
            connections = connection_service.find_connections(selected_text, document_id)
            connection_items = getattr(connections, 'connections', []) or []
        except Exception:
            connection_items = []

        # Get ALL available documents to enhance cross-document analysis
        all_documents = document_service.get_all_documents()

        # Prepare enhanced related sections data from multiple documents
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

        # Enhance with additional document content for better cross-document analysis
        for doc in all_documents:
            if doc.id != document_id:  # Don't duplicate the primary document
                outline = document_service.get_document_outline(doc.id)
                if outline:
                    outline_items = outline.get('outline', [])
                    for item in outline_items[:3]:  # Limit to prevent token overflow
                        heading = item.get('text', item.get('heading', 'Unknown'))
                        page = item.get('page', 1)
                        related_sections.append({
                            'pdf_name': doc.filename,
                            'heading': heading,
                            'content': f"Section from {doc.filename}: {heading}",
                            'page': page,
                            'strength': 'medium',
                            'document_id': doc.id,
                        })

        # Ensure we have diverse document representation (limit to prevent token overflow)
        unique_docs = set()
        prioritized_sections: List[Dict[str, Any]] = []

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

        # Generate insights using new multi-call approach for better quality and specificity
        raw_insights = generate_insights(selected_text, prioritized_sections, insight_types)

        insights: List[Insight] = []
        for ri in (raw_insights or []):
            insight_type = ri.get("type", "unknown")
            content = ri.get("content", "No content generated.")
            relevance = float(ri.get("relevance_score", 0.8) or 0.8)
            
            # Extract document and page info from new format
            relevant_document = ri.get("relevant_document", primary_pdf_name)
            insight_page = ri.get("page_number", page_number)

            # Create FOCUSED source documents list - only the 3 most relevant
            source_documents = []
            
            # Add the primary document first
            source_documents.append({
                'pdf_name': primary_pdf_name,
                'pdf_id': primary_doc.id if primary_doc else document_id,
                'page': page_number,
            })
            
            # Add the insight-specific document if different from primary
            if relevant_document != primary_pdf_name:
                doc_info = document_service.get_document_by_filename(relevant_document)
                if doc_info:
                    source_documents.append({
                        'pdf_name': relevant_document,
                        'pdf_id': doc_info.id,
                        'page': insight_page,
                    })

            # Add only ONE additional most relevant document (limit to 3 total)
            added_docs = {primary_pdf_name, relevant_document}
            for section in prioritized_sections:
                if (section['pdf_name'] not in added_docs and 
                    len(source_documents) < 3):  # Changed from 5 to 3
                    doc_info = document_service.get_document_by_filename(section['pdf_name'])
                    source_documents.append({
                        'pdf_name': section['pdf_name'],
                        'pdf_id': doc_info.id if doc_info else None,
                        'page': section.get('page', 1),
                    })
                    added_docs.add(section['pdf_name'])
                    break  # Only add one more document

            insight = Insight(
                type=insight_type,
                title=self._get_insight_title(insight_type),
                content=content,
                source_documents=source_documents,
                confidence=relevance,
            )
            insights.append(insight)

        processing_time = time.time() - start_time
        print(f"DEBUG: Generated {len(insights)} insights using multi-call approach with document-specific references")

        return InsightResponse(
            insights=insights,
            selected_text=selected_text,
            processing_time=processing_time,
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