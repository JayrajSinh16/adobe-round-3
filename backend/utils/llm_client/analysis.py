"""
Specialized analysis tasks: structure analysis, concept extraction, document comparison
"""
from typing import Dict, Any, List

from ..core_llm import get_llm_client
from .context import format_outlines_for_context, get_all_pdf_outlines


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
        max_tokens=1000,  # Increased for complete document analysis
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
        max_tokens=500,  # Increased for complete concept extraction
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
        max_tokens=1000,  # Increased for complete document comparison
        temperature=0.6,
        system_prompt=system_prompt
    )
    
    return {
        "comparison": response,
        "doc1_length": len(doc1_content),
        "doc2_length": len(doc2_content)
    }
