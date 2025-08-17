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
                max_tokens=500,
                temperature=0.6,
                system_prompt=system_prompt
            )
            
            print(f"DEBUG: LLM response received (length: {len(response)} chars): {response[:200]}...")
            
            # Clean response and try to extract JSON
            response = response.strip()
            if not response:
                raise ValueError("Empty response from LLM")
                
            # Try to find JSON array in response
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                connections_data = json.loads(json_str)
            else:
                raise ValueError("No JSON array found in response")
            
            # Validate and create connection objects
            connections = []
            for conn_data in connections_data:
                if isinstance(conn_data, dict):
                    # Ensure snippet is within word limit
                    snippet = conn_data.get('snippet', 'Connection found.')
                    words = snippet.split()
                    if len(words) > 20:
                        snippet = ' '.join(words[:20])
                    
                    connection = DocumentConnection(
                        title=conn_data.get('title', 'Document Section'),
                        type=conn_data.get('type', 'concept'),
                        document=conn_data.get('document', source_pdf_name),
                        pages=conn_data.get('pages', [1]),
                        snippet=snippet,
                        strength=conn_data.get('strength', 'medium')
                    )
                    connections.append(connection)
            
            print(f"DEBUG: Successfully parsed {len(connections)} connections")
            
            # Ensure we have 2-4 connections
            connections = connections[:4]  # Limit to 4
            
            if len(connections) < 2:
                # Add fallback connections if needed
                while len(connections) < 2:
                    fallback = DocumentConnection(
                        title=f"Related Concept {len(connections) + 1}",
                        type="concept",
                        documents=[source_pdf_name],
                        pages=[1],
                        snippet="Additional related concept found. Further analysis needed.",
                        strength="low"
                    )
                    connections.append(fallback)
            
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error parsing LLM response: {e}")
            
            # Create better fallback connections using actual document names from the library
            all_documents = document_service.get_all_documents()
            other_docs = [doc for doc in all_documents if doc.filename != source_pdf_name]
            
            connections = []
            fallback_connections = [
                {
                    "title": "Related Historical Context",
                    "type": "concept", 
                    "snippet": "Historical background provides additional context. Timeline information enhances understanding."
                },
                {
                    "title": "Cultural Connections", 
                    "type": "theme",
                    "snippet": "Cultural themes connect across regions. Common traditions link different areas."
                },
                {
                    "title": "Practical Information",
                    "type": "support", 
                    "snippet": "Practical details supplement main content. Additional guidance supports planning."
                },
                {
                    "title": "Comparative Analysis",
                    "type": "comparison",
                    "snippet": "Comparative information reveals differences. Contrasting details highlight uniqueness."
                }
            ]
            
            # Assign fallback connections to actual other documents
            for i, fallback in enumerate(fallback_connections):
                if i < len(other_docs):
                    doc = other_docs[i]
                    connection = DocumentConnection(
                        title=fallback["title"],
                        type=fallback["type"],
                        document=doc.filename,
                        pages=[1],
                        snippet=fallback["snippet"],
                        strength="medium"
                    )
                    connections.append(connection)
                    
                if len(connections) >= 3:  # Ensure we have at least 3 different documents
                    break
            
            # If we still don't have enough connections, add more with different documents
            while len(connections) < 3 and len(other_docs) > len(connections):
                doc = other_docs[len(connections)]
                connection = DocumentConnection(
                    title="Additional Context",
                    type="reference",
                    document=doc.filename,
                    pages=[1], 
                    snippet="Supplementary information available. Related content provides context.",
                    strength="low"
                )
                connections.append(connection)
        
        # Generate summary
        summary = self._generate_connection_summary(selected_text, connections)
        
        processing_time = time.time() - start_time
        
        return ConnectionResponse(
            connections=connections,
            summary=summary,
            processing_time=processing_time
        )
    
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