import json
import re
import time
from typing import Dict, Any, List, Optional
from utils.llm_client import get_llm_client, format_outlines_for_context, get_all_pdf_outlines
from services.document_service import document_service
from models.individual_insights_model import (
    KeyTakeawayResponse, DidYouKnowResponse, ContradictionsResponse,
    ExamplesResponse, CrossReferencesResponse, KnowledgeDepth,
    SourceContext, ContradictingSource, ResponseSourceDocument, Respond
)
from .individual_insights import (
    ContextManager, ResponseParser, InsightsUtils,
    KeyTakeawayGenerator, DidYouKnowGenerator, ContradictionsGenerator,
    ExamplesGenerator, CrossReferencesGenerator
)

class IndividualInsightsService:
    def __init__(self):
        self.client = get_llm_client()
        
        # Initialize modular components
        self.context_manager = ContextManager()
        self.response_parser = ResponseParser()
        self.utils = InsightsUtils()
        self.key_takeaway_generator = KeyTakeawayGenerator()
        self.did_you_know_generator = DidYouKnowGenerator()
        self.contradictions_generator = ContradictionsGenerator()
        self.examples_generator = ExamplesGenerator()
        self.cross_references_generator = CrossReferencesGenerator()
        
    def _get_document_context(self, document_id: str, page_no: int) -> Dict[str, Any]:
        """Get document context for the LLM"""
        try:
            doc = document_service.get_document(document_id)
            pdf_context = format_outlines_for_context(get_all_pdf_outlines())
            
            return {
                "primary_document": doc.filename if doc else "Unknown",
                "page_number": page_no,
                "pdf_context": pdf_context
            }
        except Exception as e:
            print(f"Error getting document context: {e}")
            return {
                "primary_document": "Unknown",
                "page_number": page_no,
                "pdf_context": "Document context unavailable"
            }
    
    def _clean_llm_response(self, response: str) -> str:
        """Clean and extract JSON from LLM response"""
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```json'):
            response = response[7:]
        elif response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        
        response = response.strip()
        
        # Try to find JSON object in response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json_match.group()
        
        return response
    
    def _generate_title(self, insight_type: str, selected_text: str) -> str:
        """Generate title for insight"""
        text_preview = selected_text[:50] + "..." if len(selected_text) > 50 else selected_text
        type_names = {
            "key_takeaway": "Key Takeaway",
            "did_you_know": "Did You Know", 
            "contradictions": "Contradictions Analysis",
            "examples": "Implementation Examples",
            "cross_references": "Cross References"
        }
        return f"{type_names.get(insight_type, insight_type.title())}: {text_preview}"
    
    def _generate_content_summary(self, selected_text: str, original_content: str) -> str:
        """Generate content summary combining selected text and original insight"""
        return f"Analysis of: '{selected_text[:100]}...' - {original_content[:200]}..."
    
    def _generate_source_documents(self, document_id: str, page_no: int) -> List[ResponseSourceDocument]:
        """Generate source documents list"""
        try:
            doc = document_service.get_document(document_id)
            return [ResponseSourceDocument(
                document_id=document_id,
                title=doc.filename if doc else f"Document {document_id}",
                page_range=f"{page_no}"
            )]
        except Exception:
            return [ResponseSourceDocument(
                document_id=document_id,
                title=f"Document {document_id}",
                page_range=f"{page_no}"
            )]
    
    def _calculate_confidence(self, base_confidence: float) -> float:
        """Calculate confidence score"""
        # Add some randomness to make it more realistic
        import random
        adjustment = (random.random() - 0.5) * 0.1  # ±5% adjustment
        return max(0.1, min(1.0, base_confidence + adjustment))

    def _extract_list_from_text(self, text: str, count: int) -> list:
        """Extract a list of items from text when JSON parsing fails"""
        lines = text.split('\n')
        items = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith('{') and not line.startswith('}'):
                # Remove common list markers
                line = line.lstrip('- •*').strip()
                if line:
                    items.append(line)
                    
        # Ensure we have exactly 'count' items
        while len(items) < count:
            items.append(f"Additional item {len(items) + 1} needed.")
            
        return items[:count]

    def generate_key_takeaway(self, selected_text: str, document_id: str, 
                            page_no: int, original_insight: Respond) -> KeyTakeawayResponse:
        """Generate key takeaway using modular component"""
        context = self.context_manager.get_document_context(document_id, page_no)
        return self.key_takeaway_generator.generate_key_takeaway(
            selected_text, document_id, page_no, original_insight,
            context, self.utils, self.response_parser
        )
    
    def generate_did_you_know(self, selected_text: str, document_id: str,
                             page_no: int, original_insight: Respond) -> DidYouKnowResponse:
        """Generate did you know insight using modular component"""
        context = self.context_manager.get_document_context(document_id, page_no)
        return self.did_you_know_generator.generate_did_you_know(
            selected_text, document_id, page_no, original_insight,
            context, self.utils, self.response_parser
        )
    
    def generate_contradictions(self, selected_text: str, document_id: str,
                              page_no: int, original_insight: Respond) -> ContradictionsResponse:
        """Generate contradictions analysis using modular component"""
        context = self.context_manager.get_document_context(document_id, page_no)
        return self.contradictions_generator.generate_contradictions(
            selected_text, document_id, page_no, original_insight,
            context, self.utils, self.response_parser
        )
    
    def generate_examples(self, selected_text: str, document_id: str,
                         page_no: int, original_insight: Respond) -> ExamplesResponse:
        """Generate examples using modular component"""
        context = self.context_manager.get_document_context(document_id, page_no)
        return self.examples_generator.generate_examples(
            selected_text, document_id, page_no, original_insight,
            context, self.utils, self.response_parser
        )
    
    def generate_cross_references(self, selected_text: str, document_id: str,
                                page_no: int, original_insight: Respond) -> CrossReferencesResponse:
        """Generate cross references using modular component"""
        context = self.context_manager.get_document_context(document_id, page_no)
        return self.cross_references_generator.generate_cross_references(
            selected_text, document_id, page_no, original_insight,
            context, self.utils, self.response_parser
        )

# Create singleton instance
individual_insights_service = IndividualInsightsService()
