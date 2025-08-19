import json
import time
from typing import List, Dict, Any, Optional
from config import settings
from utils import get_llm_client
from services.document_service import document_service
from models import DocumentConnection, ConnectionResponse

# Import modular components
from .connection.context_builder import ContextBuilder
from .connection.llm_parser import LLMParser
from .connection.connection_analyzer import ConnectionAnalyzer
from .connection.fallback_generator import FallbackGenerator
from .connection.utils import ConnectionUtils


class ConnectionService:
    def __init__(self):
        self.llm_client = get_llm_client()
        
        # Initialize modular components
        self.context_builder = ContextBuilder()
        self.llm_parser = LLMParser()
        self.connection_analyzer = ConnectionAnalyzer()
        self.fallback_generator = FallbackGenerator()
        self.utils = ConnectionUtils()
        
    def _get_all_pdf_outlines_with_context(self, selected_text: str, source_pdf: str) -> str:
        """Get formatted PDF outlines for LLM context"""
        return self.context_builder.get_all_pdf_outlines_with_context(selected_text, source_pdf)
    
    def find_connections(self, selected_text: str, current_doc_id: str, 
                        context_before: str = "", context_after: str = "") -> ConnectionResponse:
        """Find cross-document connections using LLM analysis of PDF outlines"""
        start_time = time.time()
        
        # Get source document name
        source_doc = document_service.get_document(current_doc_id)
        source_pdf_name = source_doc.filename if source_doc else "Unknown document"
        
        # Get formatted PDF outlines
        pdf_context = self._get_all_pdf_outlines_with_context(selected_text, source_pdf_name)
        
        # Create system prompt for finding connections
        system_prompt = """You are a multi-document connection expert specializing in cross-PDF analysis. Your PRIMARY task is to find relevant sections across DIFFERENT PDF documents (not the source document).

CRITICAL REQUIREMENTS:
1. MUST find connections in at least 2-3 DIFFERENT PDF documents from the library
2. AVOID repeating the source document - focus on OTHER documents
3. For each relevant section from a DIFFERENT PDF, create a connection object
4. Look for: complementary information, contrasting viewpoints, supporting examples, related concepts
5. Prioritize connections that span multiple documents

CONNECTION OBJECT FORMAT:
- title: Exact heading from the PDF outline
- type: Connection type (concept/comparison/example/support/contrast/theme)
- document: Different PDF filename (NOT the source document)
- pages: Page numbers for this section
- snippet: 2 sentences explaining cross-document relevance (max 25 words total)
- strength: high/medium/low based on relevance

RESPONSE FORMAT: Valid JSON array with 3-5 connection objects from DIFFERENT PDFs:
[{"title":"Nice Architecture Styles","type":"comparison","document":"South of France - Cities.pdf","pages":[2],"snippet":"Architectural details complement historical context. Visual elements enhance understanding.","strength":"high"}]

Focus on finding meaningful connections across the document library, not within the source document."""

        user_prompt = f"""{pdf_context}

CROSS-DOCUMENT CONNECTION TASK: Analyze the selected text and find relevant sections in OTHER PDF documents (not '{source_pdf_name}'). 

REQUIREMENTS:
1. Find connections in at least 3 DIFFERENT PDF documents from the library
2. Focus on documents OTHER than '{source_pdf_name}'  
3. Look for sections that: complement, contrast, support, or expand upon the selected text
4. Use exact headings from the PDF outlines as titles
5. Create meaningful cross-document connections

Return JSON array with 3-5 connection objects from DIFFERENT PDFs:"""

        try:
            print(f"DEBUG: Sending prompt to LLM (length: {len(user_prompt)} chars)")
            response = self.llm_client.generate(
                prompt=user_prompt,
                max_tokens=4000,  # Significantly increased for complete responses
                temperature=0.4,  # Lower temperature for more focused output
                system_prompt=system_prompt
            )
            
            print(f"DEBUG: LLM response received (length: {len(response)} chars): {response[:200]}...")
            
            # Enhanced response parsing with multiple fallback strategies
            connections = self._parse_llm_response(response, source_pdf_name)
            
            if len(connections) < 2:
                print("DEBUG: Insufficient connections from LLM, retrying with simplified prompt")
                # Retry with simplified prompt
                simplified_prompt = self._create_simplified_prompt(selected_text, pdf_context, source_pdf_name)
                retry_response = self.llm_client.generate(
                    prompt=simplified_prompt,
                    max_tokens=3000,  # Increased for complete retry responses
                    temperature=0.3,
                    system_prompt="You are a document analyst. Find connections between documents. Return only valid JSON array."
                )
                
                retry_connections = self._parse_llm_response(retry_response, source_pdf_name)
                if len(retry_connections) > len(connections):
                    connections = retry_connections
            
            print(f"DEBUG: Successfully parsed {len(connections)} connections")
            
            # Ensure we have quality connections, limit to 5 max
            connections = [conn for conn in connections if self._validate_connection(conn, source_pdf_name)][:5]
            
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error parsing LLM response: {e}")
            # Use dynamic fallback based on actual document content
            connections = self._create_dynamic_fallback_connections(selected_text, source_pdf_name)
        
        # Ensure minimum connections with intelligent fallback
        if len(connections) < 2:
            additional_connections = self._create_intelligent_fallbacks(selected_text, source_pdf_name, len(connections))
            connections.extend(additional_connections)
        
        # Generate summary
        summary = self._generate_connection_summary(selected_text, connections)
        
        processing_time = time.time() - start_time
        
        return ConnectionResponse(
            connections=connections,
            summary=summary,
            processing_time=processing_time
        )
    
    def _parse_llm_response(self, response: str, source_pdf_name: str) -> List[DocumentConnection]:
        """Enhanced LLM response parsing with multiple fallback strategies"""
        return self.llm_parser.parse_llm_response(response, source_pdf_name)
    
    def _is_valid_connection_dict(self, data: dict) -> bool:
        """Check if dictionary contains valid connection fields"""
        return self.llm_parser.is_valid_connection_dict(data)
    
    def _dict_to_connection(self, data: dict, source_pdf_name: str) -> Optional[DocumentConnection]:
        """Convert dictionary to DocumentConnection object"""
        return self.llm_parser.dict_to_connection(data, source_pdf_name)
    
    def _validate_connection(self, connection: DocumentConnection, source_pdf_name: str) -> bool:
        """Validate if connection is useful and not referencing source document"""
        return self.utils.validate_connection(connection, source_pdf_name)
    
    def _create_simplified_prompt(self, selected_text: str, pdf_context: str, source_pdf_name: str) -> str:
        """Create a simplified prompt for retry attempts"""
        return self.context_builder.create_simplified_prompt(selected_text, pdf_context, source_pdf_name)
    
    def _create_dynamic_fallback_connections(self, selected_text: str, source_pdf_name: str) -> List[DocumentConnection]:
        """Create dynamic fallback connections based on intelligent outline analysis"""
        return self.fallback_generator.create_dynamic_fallback_connections(selected_text, source_pdf_name)
    
    def _generate_connection_templates(self, selected_text: str) -> List[Dict[str, str]]:
        """Generate intelligent connection templates based on actual PDF outline analysis"""
        return self.connection_analyzer.generate_connection_templates(selected_text)
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts and important words from text"""
        return self.utils.extract_key_concepts(text)
    
    def _find_relevant_outline_sections(self, key_concepts: List[str], outline: List[Dict], doc_filename: str) -> List[Dict]:
        """Find outline sections that match the key concepts"""
        return self.connection_analyzer.find_relevant_outline_sections(key_concepts, outline, doc_filename)
    
    def _determine_connection_type(self, heading: str, selected_text: str) -> str:
        """Intelligently determine connection type based on heading and text content"""
        return self.connection_analyzer.determine_connection_type(heading, selected_text)
    
    def _generate_smart_snippet(self, heading: str, selected_text: str) -> str:
        """Generate an intelligent snippet based on the heading and selected text"""
        return self.connection_analyzer.generate_smart_snippet(heading, selected_text)
    
    def _calculate_relevance_score(self, title: str, selected_text: str) -> float:
        """Calculate numerical relevance score for sorting"""
        return self.connection_analyzer.calculate_relevance_score(title, selected_text)
    
    def _score_to_strength(self, score: float) -> str:
        """Convert numerical score to strength category"""
        return self.connection_analyzer.score_to_strength(score)
    
    def _create_minimal_fallback_templates(self, documents: List) -> List[Dict[str, str]]:
        """Create minimal fallback templates when no outline matches found"""
        return self.connection_analyzer.create_minimal_fallback_templates(documents)
    
    def _create_intelligent_fallbacks(self, selected_text: str, source_pdf_name: str, existing_count: int) -> List[DocumentConnection]:
        """Create intelligent fallback connections when needed"""
        return self.fallback_generator.create_intelligent_fallbacks(selected_text, source_pdf_name, existing_count)

    def _generate_connection_summary(self, selected_text: str, connections: List[DocumentConnection]) -> str:
        """Generate a summary of found connections"""
        system_prompt = """You are a document connection summarizer. Create a concise 2-3 sentence summary of the cross-document connections found for the selected text. Focus on the main themes and relationships identified. Use plain text format only."""
        
        connection_descriptions = []
        for conn in connections:
            connection_descriptions.append(f"{conn.title} ({conn.strength} strength): {conn.snippet}")
        
        user_prompt = f"""Selected text: {selected_text}

Connections found:
{chr(10).join(connection_descriptions)}

Provide a 2-3 sentence summary of these cross-document connections:"""
        
        try:
            summary = self.llm_client.generate(
                prompt=user_prompt,
                max_tokens=800,  # Increased for complete summary
                temperature=0.6,
                system_prompt=system_prompt
            )
            return summary.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return f"Found {len(connections)} cross-document connections related to the selected text."

# Create singleton instance
connection_service = ConnectionService()