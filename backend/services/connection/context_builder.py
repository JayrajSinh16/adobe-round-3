"""
Context builder module for formatting PDF outlines and document context.
"""

from typing import List, Dict, Any
from services.document_service import document_service


class ContextBuilder:
    """Handles building context from PDF outlines for LLM processing."""
    
    def get_all_pdf_outlines_with_context(self, selected_text: str, source_pdf: str) -> str:
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
    
    def create_simplified_prompt(self, selected_text: str, pdf_context: str, source_pdf_name: str) -> str:
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
