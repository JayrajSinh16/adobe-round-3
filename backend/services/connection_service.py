import json
import time
import logging
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
        # Dedicated connections client
        self.llm_client = get_llm_client("connections")

        # Initialize modular components
        self.context_builder = ContextBuilder()
        self.llm_parser = LLMParser()
        self.connection_analyzer = ConnectionAnalyzer()
        self.fallback_generator = FallbackGenerator()
        self.utils = ConnectionUtils()

        # Logger
        self.logger = logging.getLogger(__name__)
        
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
        
        # Create system prompt for finding connections - now requires 4 connections total
        system_prompt = """You are a multi-document connection expert specializing in cross-PDF analysis. Your task is to find 4 relevant connections: 3 from OTHER documents and 1 from the source document.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 4 connections total
2. First 3 connections MUST be from DIFFERENT PDF documents (NOT the source document)
3. Fourth connection MUST be from the source document itself (related section)
4. Analyze the specific selected text content to find thematically relevant connections
5. Each connection should relate to different aspects of the selected text

CONNECTION OBJECT FORMAT:
- title: Exact heading from the PDF outline
- type: Connection type (concept/comparison/example/support/contrast/theme/internal)
- document: PDF filename (3 different + 1 source)
- pages: Page numbers for this section
- snippet: Brief explanation of relevance to selected text (max 25 words)
- strength: high/medium/low based on content relevance

RESPONSE FORMAT: Valid JSON array with EXACTLY 4 connection objects:
[
  {"title":"Heading from Other PDF 1","type":"concept","document":"Other1.pdf","pages":[2],"snippet":"Explains concept mentioned in selected text.","strength":"high"},
  {"title":"Heading from Other PDF 2","type":"comparison","document":"Other2.pdf","pages":[5],"snippet":"Contrasts with approach in selected text.","strength":"medium"},
  {"title":"Heading from Other PDF 3","type":"example","document":"Other3.pdf","pages":[1],"snippet":"Provides example of principle discussed.","strength":"medium"},
  {"title":"Related Section","type":"internal","document":"SOURCE_DOCUMENT","pages":[X],"snippet":"Additional context within same document.","strength":"low"}
]

Analyze the selected text content carefully to ensure diverse, relevant connections."""

        # Extract key themes and concepts from selected text for better targeting
        text_analysis = self._analyze_selected_text(selected_text)
        
        user_prompt = f"""{pdf_context}

SELECTED TEXT ANALYSIS:
Content ID: {text_analysis['content_hash']}
Content: "{selected_text}"
Key themes: {text_analysis['themes']}
Main concepts: {text_analysis['concepts']}
Key phrases: {text_analysis.get('key_phrases', [])}
Document context: From '{source_pdf_name}'

TASK: Find EXACTLY 4 connections based on the selected text content:
1. Find 3 connections from DIFFERENT PDF documents (NOT '{source_pdf_name}')
2. Find 1 connection from '{source_pdf_name}' itself (different section)
3. Each connection should relate to specific themes/concepts in the selected text
4. Use exact headings from the PDF outlines as titles
5. Ensure connections are thematically diverse and specific to this content

Return JSON array with EXACTLY 4 connection objects (3 external + 1 internal):"""

        try:
            self.logger.info(f"Connections: Sending prompt to LLM (len={len(user_prompt)} chars)")
            # Increase temperature slightly to get more diverse results based on text content
            temperature = 0.5 + (len(selected_text.split()) / 1000.0)  # Slight variation based on text length
            temperature = min(0.8, temperature)  # Cap at 0.8
            
            response = self.llm_client.generate(
                prompt=user_prompt,
                max_tokens=4000,  # Significantly increased for complete responses
                temperature=temperature,  # Dynamic temperature for diversity
                system_prompt=system_prompt
            )
            
            self.logger.info(f"Connections: LLM response received (len={len(response)} chars), temp={temperature:.2f}")
            
            # Enhanced response parsing with multiple fallback strategies
            connections = self._parse_llm_response(response, source_pdf_name)
            
            if len(connections) < 4:
                self.logger.warning("Connections: Parsed <4 connections; retrying with simplified prompt")
                # Retry with simplified prompt
                simplified_prompt = self._create_simplified_prompt(selected_text, pdf_context, source_pdf_name)
                retry_response = self.llm_client.generate(
                    prompt=simplified_prompt,
                    max_tokens=3000,  # Increased for complete retry responses
                    temperature=0.3,
                    system_prompt="You are a document analyst. Find exactly 4 connections: 3 from different documents + 1 from source. Return only valid JSON array."
                )
                
                retry_connections = self._parse_llm_response(retry_response, source_pdf_name)
                if len(retry_connections) > len(connections):
                    self.logger.info(
                        f"Connections: Retry improved results {len(connections)} -> {len(retry_connections)}"
                    )
                    connections = retry_connections
            
            self.logger.info(f"Connections: Successfully parsed {len(connections)} connections before validation")
            
            # Ensure we have quality connections, limit to 6 max but aim for 4
            all_connections = connections.copy()
            external_connections = []
            internal_connections = []
            
            for conn in all_connections:
                if conn.document == source_pdf_name and conn.type == "internal":
                    internal_connections.append(conn)
                elif conn.document != source_pdf_name and self._validate_connection(conn, source_pdf_name):
                    external_connections.append(conn)
            
            # Combine external and internal connections (prefer 3 external + 1 internal)
            final_connections = external_connections[:3] + internal_connections[:1]
            
            # If we don't have enough, fill with any remaining valid connections
            if len(final_connections) < 4:
                remaining = [conn for conn in all_connections 
                           if conn not in final_connections and 
                           (self._validate_connection(conn, source_pdf_name) or conn.type == "internal")]
                final_connections.extend(remaining[:4-len(final_connections)])
            
            connections = final_connections[:6]  # Max 6 total
            
        except (json.JSONDecodeError, Exception) as e:
            self.logger.error(f"Connections: Error parsing LLM response: {e}")
            # Use dynamic fallback based on actual document content
            connections = self._create_dynamic_fallback_connections(selected_text, source_pdf_name)
            self.logger.warning(
                f"Connections: Using dynamic fallback connections (count={len(connections)})"
            )
        
        # Ensure minimum connections with intelligent fallback
        if len(connections) < 4:
            additional_connections = self._create_intelligent_fallbacks(selected_text, source_pdf_name, len(connections))
            connections.extend(additional_connections)
            if additional_connections:
                self.logger.warning(
                    f"Connections: Added intelligent fallbacks to reach minimum. Added={len(additional_connections)}"
                )
        
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

    def _analyze_selected_text(self, selected_text: str) -> dict:
        """Analyze selected text to extract key themes and concepts for better connection targeting"""
        import re
        import hashlib
        
        # Create a content hash for uniqueness tracking
        content_hash = hashlib.md5(selected_text.encode()).hexdigest()[:8]
        
        # Extract key concepts (nouns, proper nouns, technical terms)
        words = re.findall(r'\b[A-Z][a-zA-Z]+\b|\b[a-z]{4,}\b', selected_text)
        concepts = list(set([word.lower() for word in words if len(word) > 3]))[:10]
        
        # Extract quoted phrases and key phrases
        quoted_phrases = re.findall(r'"([^"]*)"', selected_text)
        key_phrases = re.findall(r'\b(?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+\b', selected_text)
        
        # Identify potential themes based on common patterns
        themes = []
        text_lower = selected_text.lower()
        
        theme_patterns = {
            'architecture': ['building', 'design', 'structure', 'architectural', 'construction', 'facade', 'interior'],
            'history': ['historical', 'ancient', 'past', 'era', 'period', 'century', 'timeline', 'heritage'],
            'culture': ['cultural', 'tradition', 'heritage', 'social', 'community', 'customs', 'practices'],
            'technology': ['technology', 'digital', 'system', 'technical', 'innovation', 'software', 'digital'],
            'business': ['business', 'economic', 'financial', 'market', 'commercial', 'industry', 'corporate'],
            'education': ['education', 'learning', 'academic', 'study', 'research', 'teaching', 'knowledge'],
            'art': ['art', 'artistic', 'creative', 'aesthetic', 'visual', 'painting', 'sculpture'],
            'science': ['scientific', 'research', 'analysis', 'methodology', 'data', 'experiment', 'theory'],
            'geography': ['location', 'place', 'region', 'area', 'geographical', 'landscape', 'environment'],
            'travel': ['travel', 'tourism', 'visitor', 'destination', 'journey', 'trip', 'vacation']
        }
        
        theme_scores = {}
        for theme, keywords in theme_patterns.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                theme_scores[theme] = score
        
        # Sort themes by relevance score
        themes = sorted(theme_scores.keys(), key=lambda x: theme_scores[x], reverse=True)[:5]
        
        # Extract numerical values and dates for context
        numbers = re.findall(r'\b\d{1,4}\b', selected_text)
        years = [n for n in numbers if len(n) == 4 and n.startswith(('1', '2'))]
        
        return {
            'content_hash': content_hash,
            'themes': themes[:5],  # Top 5 themes
            'concepts': concepts[:8],  # Top 8 concepts
            'quoted_phrases': quoted_phrases[:3],  # Up to 3 quoted phrases
            'key_phrases': key_phrases[:5],  # Up to 5 key phrases
            'years': years[:3],  # Historical context
            'text_length': len(selected_text),
            'word_count': len(selected_text.split()),
            'sentence_count': len(re.split(r'[.!?]+', selected_text.strip()))
        }

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
            self.logger.error(f"Connections: Error generating summary: {e}")
            return f"Found {len(connections)} cross-document connections related to the selected text."

# Create singleton instance
connection_service = ConnectionService()