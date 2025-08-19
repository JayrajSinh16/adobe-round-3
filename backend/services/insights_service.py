import time
from typing import List, Dict, Any, Optional
from config import settings
from utils import generate_insights
from services.connection_service import connection_service
from services.document_service import document_service
from models import Insight, InsightResponse
from .insights import (
    ConnectionAnalyzer, DocumentContextManager, SectionPrioritizer,
    InsightGenerator, SourceDocumentBuilder, InsightsServiceUtils
)

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
        
        # Initialize modular components
        self.connection_analyzer = ConnectionAnalyzer()
        self.document_context_manager = DocumentContextManager()
        self.section_prioritizer = SectionPrioritizer()
        self.insight_generator = InsightGenerator()
        self.source_document_builder = SourceDocumentBuilder()
        self.utils = InsightsServiceUtils()
    
    def generate_insights(self, selected_text: str, document_id: str,
                          page_number: int, insight_types: Optional[List[str]] = None) -> InsightResponse:
        """Generate insights for selected text with enhanced cross-document analysis"""
        start_time = time.time()

        # Validate insight types using utils
        insight_types = self.utils.validate_insight_types(insight_types)

        # Get the primary document information using document context manager
        primary_doc, primary_pdf_name = self.document_context_manager.get_primary_document_info(document_id)

        # Find connections using connection analyzer
        connection_items = self.connection_analyzer.find_connections(selected_text, document_id)

        # Get ALL available documents using document context manager
        all_documents = self.document_context_manager.get_all_documents()

        # Prepare enhanced related sections data from multiple documents
        related_sections: List[Dict[str, Any]] = []

        # Add connections found by connection service
        related_sections.extend(
            self.connection_analyzer.build_related_sections_from_connections(connection_items)
        )

        # Enhance with additional document content
        additional_sections = self.document_context_manager.enhance_with_additional_document_content(
            all_documents, document_id
        )
        related_sections.extend(additional_sections)

        # Prioritize sections using section prioritizer
        prioritized_sections, unique_docs = self.section_prioritizer.prioritize_sections(related_sections)

        # Set context for source document builder
        self.source_document_builder.set_context(prioritized_sections, primary_doc)

        # Generate insights using insight generator
        raw_insights = self.insight_generator.generate_raw_insights(
            selected_text, prioritized_sections, insight_types
        )

        # Process raw insights into Insight objects
        insights = self.insight_generator.process_raw_insights(
            raw_insights, primary_pdf_name, page_number, self.source_document_builder
        )

        processing_time = time.time() - start_time
        self.utils.log_debug_info(len(insights))

        return InsightResponse(
            insights=insights,
            selected_text=selected_text,
            processing_time=processing_time,
        )
# Create singleton instance
insights_service = InsightsService()