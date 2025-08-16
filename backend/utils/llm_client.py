"""
Modular LLM Client - Task-specific interface for document analysis
"""

import json
import os
from typing import Dict, Any, List, Optional

# Import task-specific modules
from .core_llm import chat_with_llm, get_llm_client
from .task_modules import summary_generator, insight_analyzer, content_generator


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


# SUMMARY GENERATION TASKS

def generate_snippet_summary(text: str, limit: int = 2) -> str:
    """Generate a concise summary of the given text"""
    return summary_generator.generate_snippet_summary(text, limit)


def generate_executive_summary(content: List[str], max_length: int = 5) -> str:
    """Generate an executive summary from multiple content pieces"""
    return summary_generator.generate_executive_summary(content, max_length)



# INSIGHT ANALYSIS TASKS

def generate_insights(selected_text: str, related_sections: List[Dict[str, Any]], insight_types: List[str]) -> List[Dict[str, Any]]:
    """Generate multiple insights efficiently"""
    return insight_analyzer.generate_multiple_insights(selected_text, related_sections, insight_types)


def generate_single_insight(selected_text: str, related_sections: List[Dict[str, Any]], insight_type: str) -> str:
    """Generate a single insight of specific type"""
    return insight_analyzer.generate_insight(selected_text, related_sections, insight_type)


def get_available_insight_types() -> List[str]:
    """Get list of available insight types"""
    return list(insight_analyzer.system_prompts.keys())



# CONTENT GENERATION TASKS

def generate_podcast_script(selected_text: str, connections: List[Dict], insights: List[Dict], format: str = "podcast") -> List[Dict]:
    """Generate podcast script or audio overview"""
    return content_generator.generate_podcast_script(selected_text, connections, insights, format)



# SPECIALIZED ANALYSIS TASKS

def analyze_document_structure(content: str) -> Dict[str, Any]:
    """Analyze document structure and provide insights"""
    pdf_context = get_all_pdf_outlines()
    context_str = format_outlines_for_context(pdf_context)
    
    system_prompt = """You are a document structure analyst with access to a document library. Analyze the given content and provide insights about its organization, key themes, and structural elements while considering how it fits within the broader context of available documents. Focus on how the content is organized and what patterns emerge in relation to the document library. Always respond in plain text format - no markdown, bullets, or special formatting."""
    
    user_prompt = f"""Document Library Context:
{context_str}

Analyze the structure and organization of this document content, considering how it relates to the available documents:

{content[:1000]}..."""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=200,
        temperature=0.6,
        system_prompt=system_prompt
    )
    
    return {
        "analysis": response,
        "content_length": len(content),
        "analysis_type": "structural"
    }


def extract_key_concepts(content: str) -> List[str]:
    """Extract key concepts and terms from content"""
    pdf_context = get_all_pdf_outlines()
    context_str = format_outlines_for_context(pdf_context)
    
    system_prompt = """You are a concept extraction specialist with access to a document library. Identify the most important concepts, terms, and keywords from the given content while considering the broader context of available documents. Focus on technical terms, important ideas, and key concepts that define the content in relation to the document library. Return only the concepts as a comma-separated list in plain text format."""
    
    user_prompt = f"""Document Library Context:
{context_str}

Extract key concepts from this content, considering how they relate to the available documents:

{content[:800]}..."""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=100,
        temperature=0.4,
        system_prompt=system_prompt
    )
    
    # Parse comma-separated concepts
    try:
        concepts = [concept.strip() for concept in response.split(',')]
        return concepts[:10]  # Return top 10 concepts
    except:
        return ["Unable to extract concepts"]


def compare_documents(doc1_content: str, doc2_content: str) -> Dict[str, str]:
    """Compare two documents and find similarities/differences"""
    pdf_context = get_all_pdf_outlines()
    context_str = format_outlines_for_context(pdf_context)
    
    system_prompt = """You are a document comparison specialist with access to a document library. Compare two documents and identify their similarities, differences, and relationships while considering the broader context of available documents. Focus on content themes, approaches, and key insights in relation to the document library. Be concise and objective. Always respond in plain text format - no markdown, bullets, or special formatting."""
    
    user_prompt = f"""Document Library Context:
{context_str}

Compare these two document excerpts, considering how they relate to the available documents:

Document 1:
{doc1_content[:400]}...

Document 2:
{doc2_content[:400]}..."""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=200,
        temperature=0.6,
        system_prompt=system_prompt
    )
    
    return {
        "comparison": response,
        "doc1_length": len(doc1_content),
        "doc2_length": len(doc2_content)
    }



# UTILITY FUNCTIONS

def get_task_modules_info() -> Dict[str, List[str]]:
    """Get information about available task modules and their functions"""
    return {
        "summary_tasks": [
            "generate_snippet_summary",
            "generate_executive_summary"
        ],
        "insight_tasks": [
            "generate_insights", 
            "generate_single_insight",
            "get_available_insight_types"
        ],
        "content_tasks": [
            "generate_podcast_script"
        ],
        "analysis_tasks": [
            "analyze_document_structure",
            "extract_key_concepts", 
            "compare_documents"
        ]
    }


def optimize_for_free_tier(enable: bool = True):
    """Configure settings to optimize for free tier usage"""
    if enable:
        # Reduce default token limits
        summary_generator.client._max_tokens = 150
        insight_analyzer.client._max_tokens = 200
        content_generator.client._max_tokens = 250
        print("✅ Optimized for free tier - reduced token limits")
    else:
        print("✅ Using standard token limits")


# BACKWARD COMPATIBILITY


# Legacy function signatures for backward compatibility
def generate_insights_legacy(selected_text: str, insight_types: List[str]) -> List[Dict[str, Any]]:
    """Legacy function for backward compatibility"""
    return generate_insights(selected_text, [], insight_types)