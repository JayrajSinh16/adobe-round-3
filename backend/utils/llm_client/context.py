"""
Context helpers: outlines and formatting for LLM prompts
"""
from typing import Dict, Any, List


def get_all_pdf_outlines() -> List[Dict[str, Any]]:
    """Get outlines from all uploaded PDFs to provide context to LLM"""
    try:
        from services.document_service import document_service
        
        outlines = []
        documents = document_service.get_all_documents()
        
        for doc in documents:
            outline = document_service.get_document_outline(doc.id)
            if outline:
                # Format outline for LLM context
                formatted_outline = {
                    "pdf_name": doc.filename,
                    "document_id": doc.id,
                    "outline": outline.get('outline', []),
                    "summary": outline.get('summary', outline.get('title', 'No summary available'))
                }
                outlines.append(formatted_outline)
        
        return outlines
        
    except Exception as e:
        print(f"Error fetching PDF outlines: {e}")
        return []


def format_outlines_for_context(outlines: List[Dict[str, Any]]) -> str:
    """Format PDF outlines for inclusion in LLM prompts"""
    if not outlines:
        return "No PDF documents have been uploaded yet."
    
    context_parts = []
    context_parts.append("AVAILABLE DOCUMENTS AND THEIR STRUCTURE:")
    
    for outline in outlines:
        context_parts.append(f"\n--- {outline['pdf_name']} ---")
        context_parts.append(f"Summary: {outline['summary']}")
        
        # Add outline structure
        outline_items = outline.get('outline', [])
        if outline_items:
            context_parts.append("Document Structure:")
            for i, item in enumerate(outline_items):
                if i >= 10:  # Limit to first 10 items to conserve tokens
                    break
                level = item.get('level', 'H1')
                heading = item.get('text', item.get('heading', 'Unknown'))  # Try 'text' first, then 'heading'
                try:
                    # Handle both numeric and string levels
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
                context_parts.append(f"{indent}- {heading}")
    
    return "\n".join(context_parts)
