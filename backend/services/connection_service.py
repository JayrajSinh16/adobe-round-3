import json
import time
from typing import List, Dict, Any, Optional
from config import settings
from utils import get_llm_client
from services.document_service import document_service
from models import DocumentConnection, ConnectionResponse

class ConnectionService:
    def __init__(self):
        self.llm_client = get_llm_client()
        
    def _get_all_pdf_outlines_with_context(self, selected_text: str, source_pdf: str) -> str:
        """Get formatted PDF outlines for LLM context"""
        try:
            outlines = []
            documents = document_service.get_all_documents()
            
            for doc in documents:
                outline = document_service.get_document_outline(doc.id)
                if outline:
                    formatted_outline = {
                        "pdf_name": doc.filename,
                        "document_id": doc.id,
                        "outline": outline.get('outline', []),
                        "summary": outline.get('summary', outline.get('title', 'No summary available'))
                    }
                    outlines.append(formatted_outline)
            
            if not outlines:
                return "No PDF documents available."
            
            context_parts = []
            context_parts.append("AVAILABLE PDF DOCUMENTS AND THEIR OUTLINES:")
            context_parts.append(f"\nSELECTED TEXT FROM '{source_pdf}':")
            context_parts.append(f'"{selected_text}"')
            context_parts.append("\nDOCUMENT LIBRARY:")
            
            for outline in outlines:
                context_parts.append(f"\n--- {outline['pdf_name']} ---")
                context_parts.append(f"Summary: {outline['summary']}")
                
                outline_items = outline.get('outline', [])
                if outline_items:
                    context_parts.append("Structure:")
                    for i, item in enumerate(outline_items):
                        if i >= 8:  # Limit to conserve tokens
                            break
                        level = item.get('level', 'H1')
                        heading = item.get('text', item.get('heading', 'Unknown'))
                        page = item.get('page', 'N/A')
                        try:
                            if isinstance(level, str):
                                if level.lower().startswith('h'):
                                    level_num = int(level[1:]) if level[1:].isdigit() else 1
                                else:
                                    level_num = 1
                            else:
                                level_num = int(level) if level else 1
                            indent = "  " * max(0, level_num - 1)
                        except (ValueError, TypeError):
                            indent = ""
                        context_parts.append(f"{indent}- {heading} (p.{page})")
            
            return "\n".join(context_parts)
            
        except Exception as e:
            print(f"Error getting PDF outlines: {e}")
            return "Document context unavailable."
    
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
                max_tokens=800,  # Increased for better responses
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
                    max_tokens=600,
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
        connections = []
        response = response.strip()
        
        if not response:
            return connections
        
        # Strategy 1: Try to find JSON array
        json_patterns = [
            (r'\[.*?\]', 'array'),
            (r'\{.*?\}', 'object'),
            (r'```json\s*(\[.*?\])\s*```', 'code_block'),
            (r'```\s*(\[.*?\])\s*```', 'code_block_no_lang')
        ]
        
        import re
        for pattern, pattern_type in json_patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            for match in matches:
                try:
                    if pattern_type == 'object':
                        # Single object, wrap in array
                        data = [json.loads(match)]
                    else:
                        data = json.loads(match)
                    
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and self._is_valid_connection_dict(item):
                                conn = self._dict_to_connection(item, source_pdf_name)
                                if conn:
                                    connections.append(conn)
                    elif isinstance(data, dict) and self._is_valid_connection_dict(data):
                        conn = self._dict_to_connection(data, source_pdf_name)
                        if conn:
                            connections.append(conn)
                    
                    if connections:
                        return connections
                except json.JSONDecodeError:
                    continue
        
        # Strategy 2: Try to parse line-by-line structured text
        lines = response.split('\n')
        current_connection = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for key-value patterns
            if ':' in line:
                parts = line.split(':', 1)
                key = parts[0].strip().lower()
                value = parts[1].strip().strip('"\'')
                
                if key in ['title', 'heading']:
                    current_connection['title'] = value
                elif key in ['type', 'connection_type']:
                    current_connection['type'] = value
                elif key in ['document', 'pdf', 'file']:
                    current_connection['document'] = value
                elif key in ['snippet', 'description', 'summary']:
                    current_connection['snippet'] = value
                elif key in ['strength', 'relevance']:
                    current_connection['strength'] = value
                elif key in ['pages', 'page']:
                    try:
                        # Handle various page formats
                        page_str = value.replace('[', '').replace(']', '').replace('p.', '').replace('page', '')
                        pages = [int(x.strip()) for x in page_str.split(',') if x.strip().isdigit()]
                        current_connection['pages'] = pages if pages else [1]
                    except:
                        current_connection['pages'] = [1]
            
            # Check if we have enough info to create a connection
            if len(current_connection) >= 3 and 'title' in current_connection:
                conn = self._dict_to_connection(current_connection, source_pdf_name)
                if conn:
                    connections.append(conn)
                current_connection = {}
        
        # Handle last connection if any
        if len(current_connection) >= 3 and 'title' in current_connection:
            conn = self._dict_to_connection(current_connection, source_pdf_name)
            if conn:
                connections.append(conn)
        
        return connections
    
    def _is_valid_connection_dict(self, data: dict) -> bool:
        """Check if dictionary contains valid connection fields"""
        required_fields = ['title', 'document']
        optional_fields = ['type', 'snippet', 'pages', 'strength']
        
        # Must have title and document at minimum
        if not all(field in data for field in required_fields):
            return False
        
        # Check if it has some optional fields
        has_optional = any(field in data for field in optional_fields)
        return has_optional
    
    def _dict_to_connection(self, data: dict, source_pdf_name: str) -> Optional[DocumentConnection]:
        """Convert dictionary to DocumentConnection object"""
        try:
            # Skip if it's the source document
            doc_name = data.get('document', '')
            if doc_name == source_pdf_name:
                return None
            
            # Ensure snippet is reasonable length
            snippet = data.get('snippet', 'Related content found.')
            words = snippet.split()
            if len(words) > 25:
                snippet = ' '.join(words[:25]) + '...'
            
            # Handle pages
            pages = data.get('pages', [1])
            if not isinstance(pages, list):
                if isinstance(pages, (int, str)):
                    try:
                        pages = [int(pages)]
                    except:
                        pages = [1]
                else:
                    pages = [1]
            
            # Normalize strength field to match our model's Literal values
            strength = data.get('strength', 'medium').lower()
            if strength in ['strong', 'very strong', 'very high']:
                strength = 'high'
            elif strength in ['moderate', 'average']:
                strength = 'medium'
            elif strength in ['weak', 'minimal']:
                strength = 'low'
            elif strength not in ['low', 'medium', 'high']:
                strength = 'medium'  # Default fallback
            
            return DocumentConnection(
                title=data.get('title', 'Document Section'),
                type=data.get('type', 'concept'),
                document=doc_name,
                pages=pages,
                snippet=snippet,
                strength=strength
            )
        except Exception as e:
            print(f"Error creating connection from dict: {e}")
            return None
    
    def _validate_connection(self, connection: DocumentConnection, source_pdf_name: str) -> bool:
        """Validate if connection is useful and not referencing source document"""
        if not connection or not connection.title or not connection.document:
            return False
        
        # Don't include connections to the source document
        if connection.document == source_pdf_name:
            return False
        
        # Check if document exists in our library
        all_documents = document_service.get_all_documents()
        doc_names = {doc.filename for doc in all_documents}
        
        return connection.document in doc_names
    
    def _create_simplified_prompt(self, selected_text: str, pdf_context: str, source_pdf_name: str) -> str:
        """Create a simplified prompt for retry attempts"""
        return f"""Find 2-3 connections for this text across different PDF documents.

Selected text: "{selected_text}"
Source document: {source_pdf_name}

{pdf_context}

Return ONLY a JSON array like this:
[
  {{
    "title": "Section Title from PDF outline",
    "type": "concept",
    "document": "Different PDF filename",
    "pages": [1],
    "snippet": "Brief description of connection",
    "strength": "medium"
  }}
]

Focus on documents OTHER than {source_pdf_name}."""
    
    def _create_dynamic_fallback_connections(self, selected_text: str, source_pdf_name: str) -> List[DocumentConnection]:
        """Create dynamic fallback connections based on intelligent outline analysis"""
        connections = []
        all_documents = document_service.get_all_documents()
        other_docs = [doc for doc in all_documents if doc.filename != source_pdf_name]
        
        if not other_docs:
            return connections
        
        # Use the intelligent template generation
        connection_templates = self._generate_connection_templates(selected_text)
        
        # Filter templates to exclude source document
        valid_templates = [
            template for template in connection_templates 
            if template.get('document', '') != source_pdf_name
        ]
        
        # Convert templates to DocumentConnection objects
        for template in valid_templates[:3]:  # Limit to top 3
            try:
                connection = DocumentConnection(
                    title=template['title'],
                    type=template['type'],
                    document=template['document'],
                    pages=template.get('pages', [1]),
                    snippet=template['snippet'],
                    strength=template.get('strength', 'medium')
                )
                connections.append(connection)
            except Exception as e:
                print(f"Error creating connection from template: {e}")
                continue
        
        return connections
    
    def _generate_connection_templates(self, selected_text: str) -> List[Dict[str, str]]:
        """Generate intelligent connection templates based on actual PDF outline analysis"""
        templates = []
        
        # Get all available documents and their outlines
        all_documents = document_service.get_all_documents()
        
        # Extract key concepts from selected text
        text_words = self._extract_key_concepts(selected_text)
        
        # Analyze each document's outline for relevant connections
        for doc in all_documents:
            outline = document_service.get_document_outline(doc.id)
            if not outline or not outline.get('outline'):
                continue
            
            # Find matching sections in this document's outline
            relevant_sections = self._find_relevant_outline_sections(
                text_words, outline['outline'], doc.filename
            )
            
            # Convert relevant sections to connection templates
            for section in relevant_sections:
                connection_type = self._determine_connection_type(section['heading'], selected_text)
                snippet = self._generate_smart_snippet(section['heading'], selected_text)
                
                templates.append({
                    'title': section['heading'],
                    'type': connection_type,
                    'document': doc.filename,
                    'pages': [section.get('page', 1)],
                    'snippet': snippet,
                    'strength': section.get('relevance_score', 'medium')
                })
        
        # Sort by relevance and limit to top connections
        templates.sort(key=lambda x: self._calculate_relevance_score(x['title'], selected_text), reverse=True)
        
        # If no outline-based connections found, create minimal fallbacks
        if not templates:
            templates = self._create_minimal_fallback_templates(all_documents)
        
        return templates[:5]  # Limit to top 5 connections
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts and important words from text"""
        import re
        
        # Clean and normalize text
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filter out common stop words and short words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 
            'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 
            'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
        }
        
        # Extract meaningful words (longer than 2 chars, not stop words)
        key_words = [word for word in words if len(word) > 2 and word not in stop_words]
        
        # Also extract noun phrases and important concepts
        # Look for capitalized words (proper nouns)
        original_words = text.split()
        capitalized = [word.strip('.,!?()[]{}"\';:') for word in original_words if word[0].isupper() and len(word) > 2]
        
        return list(set(key_words + [word.lower() for word in capitalized]))
    
    def _find_relevant_outline_sections(self, key_concepts: List[str], outline: List[Dict], doc_filename: str) -> List[Dict]:
        """Find outline sections that match the key concepts"""
        relevant_sections = []
        
        for section in outline:
            heading = section.get('text', section.get('heading', '')).lower()
            
            # Calculate relevance score based on concept matching
            relevance_score = 0
            matched_concepts = []
            
            for concept in key_concepts:
                if concept in heading:
                    relevance_score += 2  # Exact match
                    matched_concepts.append(concept)
                elif any(word in heading for word in concept.split()):
                    relevance_score += 1  # Partial match
                    matched_concepts.append(concept)
            
            # Also check for semantic similarity (basic word overlap)
            heading_words = set(heading.split())
            concept_words = set(' '.join(key_concepts).split())
            overlap = len(heading_words.intersection(concept_words))
            relevance_score += overlap * 0.5
            
            # If section has some relevance, add it
            if relevance_score > 0:
                section_info = {
                    'heading': section.get('text', section.get('heading', 'Section')),
                    'page': section.get('page', 1),
                    'level': section.get('level', 'H1'),
                    'relevance_score': self._score_to_strength(relevance_score),
                    'matched_concepts': matched_concepts,
                    'document': doc_filename
                }
                relevant_sections.append(section_info)
        
        # Sort by relevance
        relevant_sections.sort(key=lambda x: len(x['matched_concepts']), reverse=True)
        
        return relevant_sections[:3]  # Top 3 per document
    
    def _determine_connection_type(self, heading: str, selected_text: str) -> str:
        """Intelligently determine connection type based on heading and text content"""
        heading_lower = heading.lower()
        text_lower = selected_text.lower()
        
        # Analyze heading patterns to determine type
        if any(word in heading_lower for word in ['tip', 'guide', 'how', 'advice', 'practical']):
            return 'support'
        elif any(word in heading_lower for word in ['history', 'background', 'origin', 'past']):
            return 'concept'
        elif any(word in heading_lower for word in ['example', 'case', 'sample', 'instance']):
            return 'example'
        elif any(word in heading_lower for word in ['compare', 'versus', 'difference', 'similar']):
            return 'comparison'
        elif any(word in heading_lower for word in ['culture', 'tradition', 'custom', 'heritage']):
            return 'theme'
        elif any(word in heading_lower for word in ['reference', 'see', 'related', 'link']):
            return 'reference'
        else:
            # Default based on content similarity
            common_words = set(heading_lower.split()).intersection(set(text_lower.split()))
            if len(common_words) > 2:
                return 'concept'
            else:
                return 'reference'
    
    def _generate_smart_snippet(self, heading: str, selected_text: str) -> str:
        """Generate an intelligent snippet based on the heading and selected text"""
        # Extract key theme from heading
        heading_words = heading.lower().split()
        text_words = selected_text.lower().split()
        
        # Find common themes
        common_themes = set(heading_words).intersection(set(text_words))
        
        if common_themes:
            main_theme = list(common_themes)[0]
            return f"Provides additional information about {main_theme} and related topics."
        else:
            # Generic but contextual snippet
            if len(heading) > 30:
                short_heading = heading[:25] + "..."
            else:
                short_heading = heading
            return f"Contains relevant details that complement the selected content about {short_heading.lower()}."
    
    def _calculate_relevance_score(self, title: str, selected_text: str) -> float:
        """Calculate numerical relevance score for sorting"""
        title_words = set(title.lower().split())
        text_words = set(selected_text.lower().split())
        
        # Calculate word overlap
        overlap = len(title_words.intersection(text_words))
        
        # Weight by title length (shorter titles with overlap are more relevant)
        title_length_factor = 1.0 / max(1, len(title_words) - 2)
        
        return overlap + title_length_factor
    
    def _score_to_strength(self, score: float) -> str:
        """Convert numerical score to strength category"""
        if score >= 3:
            return 'high'
        elif score >= 1.5:
            return 'medium'
        else:
            return 'low'
    
    def _create_minimal_fallback_templates(self, documents: List) -> List[Dict[str, str]]:
        """Create minimal fallback templates when no outline matches found"""
        templates = []
        
        for i, doc in enumerate(documents[:3]):
            templates.append({
                'title': f"Related Content",
                'type': 'reference',
                'document': doc.filename,
                'pages': [1],
                'snippet': f"Additional information available in {doc.filename}.",
                'strength': 'low'
            })
        
        return templates
    
    def _create_intelligent_fallbacks(self, selected_text: str, source_pdf_name: str, existing_count: int) -> List[DocumentConnection]:
        """Create intelligent fallback connections when needed"""
        connections = []
        needed = max(0, 2 - existing_count)  # Ensure at least 2 total connections
        
        if needed <= 0:
            return connections
        
        all_documents = document_service.get_all_documents()
        other_docs = [doc for doc in all_documents if doc.filename != source_pdf_name]
        
        # Create minimal fallback connections
        for i in range(min(needed, len(other_docs))):
            doc = other_docs[i]
            
            connection = DocumentConnection(
                title="Related Content",
                type="reference",
                document=doc.filename,
                pages=[1],
                snippet="Related document content available for cross-reference.",
                strength="low"
            )
            connections.append(connection)
        
        return connections

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
                max_tokens=150,
                temperature=0.6,
                system_prompt=system_prompt
            )
            return summary.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return f"Found {len(connections)} cross-document connections related to the selected text."

# Create singleton instance
connection_service = ConnectionService()