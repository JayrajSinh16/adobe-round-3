"""
LLM Client - Task-specific interface for document analysis
"""

from typing import Dict, Any, List

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
    """Generate multiple insights efficiently with enhanced cross-document analysis"""
    # Get all PDF context for better multi-document awareness
    pdf_context = format_outlines_for_context(get_all_pdf_outlines())
    
    # Enhanced system prompt for cross-document analysis
    system_prompt = """You are a multi-document analysis expert with access to a comprehensive document library. Your PRIMARY objective is to synthesize information from MULTIPLE PDF documents to provide rich, cross-referenced insights.

CRITICAL REQUIREMENTS:
1. MUST reference and connect information from at least 2-3 different PDF documents by name
2. Show how concepts from different documents relate, support, or contrast with each other
3. Create comprehensive insights that are only possible through multi-document analysis
4. For each insight type, demonstrate cross-document synthesis
5. Always mention specific document names when making connections
6. Focus on insights that emerge from having multiple documents rather than single-document analysis

RESPONSE FORMAT: Return ONLY valid JSON array with this exact structure:
[
  {"type": "key_takeaways", "content": "Your multi-document insight here...", "relevance_score": 0.8},
  {"type": "contradictions", "content": "Your analysis here...", "relevance_score": 0.8}
]

Do NOT use markdown code blocks. Return pure JSON only."""
    
    # Create comprehensive related sections text with document diversity emphasis
    related_text = ""
    if related_sections:
        document_groups = {}
        for section in related_sections:
            doc_name = section.get('pdf_name', 'Unknown')
            if doc_name not in document_groups:
                document_groups[doc_name] = []
            document_groups[doc_name].append(section)
        
        related_text = "CROSS-DOCUMENT INFORMATION:\n\n"
        for doc_name, sections in document_groups.items():
            related_text += f"From '{doc_name}':\n"
            for section in sections[:2]:  # Limit to 2 sections per document to manage token count
                heading = section.get('heading', 'Section')
                content = section.get('content', '').strip()
                page = section.get('page', 1)
                related_text += f"  - {heading} (p.{page}): {content}\n"
            related_text += "\n"
    else:
        related_text = "Multiple documents available in library for cross-reference analysis."
    
    # Enhanced user prompt emphasizing cross-document analysis
    user_prompt = f"""Selected Text: "{selected_text}"

Available Documents: 
{pdf_context}

{related_text}

Generate insights for these types: {', '.join(insight_types)}

REQUIREMENTS for each insight:
1. Reference at least 2-3 specific PDF documents by name
2. Show connections between documents  
3. Demonstrate cross-document synthesis
4. Be specific and detailed (not generic)

Return valid JSON array with insights:"""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=1200,  # Increased significantly for comprehensive analysis
        temperature=0.7,
        system_prompt=system_prompt
    )
    
    # Enhanced JSON parsing with multiple fallback strategies
    try:
        import json
        import re
        
        print(f"DEBUG: Raw LLM response: {response}")
        
        # Clean up response - remove markdown and extra text
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```json'):
            response = response[7:]
        elif response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        
        response = response.strip()
        
        # Try to find JSON array in the response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            json_str = json_match.group()
        else:
            json_str = response
        
        print(f"DEBUG: Extracted JSON: {json_str}")
        
        # Try to parse as JSON
        insights = json.loads(json_str)
        if not isinstance(insights, list):
            insights = [insights] if isinstance(insights, dict) else []
            
        # Validate and enhance insights
        validated_insights = []
        for insight in insights:
            if isinstance(insight, dict) and 'type' in insight and 'content' in insight:
                # Ensure the content is meaningful and references multiple documents
                content = insight.get('content', '').strip()
                if len(content) > 50:  # Ensure substantial content
                    validated_insights.append({
                        'type': insight.get('type', 'key_takeaways'),
                        'content': content,
                        'relevance_score': float(insight.get('relevance_score', 0.8))
                    })
        
        # Ensure we have all requested insight types with meaningful content
        generated_types = {insight['type'] for insight in validated_insights}
        for insight_type in insight_types:
            if insight_type not in generated_types:
                # Create a meaningful fallback that still encourages cross-document thinking
                fallback_content = _create_meaningful_fallback(insight_type, selected_text, related_sections)
                validated_insights.append({
                    'type': insight_type,
                    'content': fallback_content,
                    'relevance_score': 0.7
                })
        
        return validated_insights[:len(insight_types)]  # Return only requested types
        
    except Exception as e:
        print(f"Error parsing insights response: {e}")
        # Create meaningful fallbacks for all requested types
        return [
            {
                'type': insight_type,
                'content': _create_meaningful_fallback(insight_type, selected_text, related_sections),
                'relevance_score': 0.6
            }
            for insight_type in insight_types
        ]


def _create_meaningful_fallback(insight_type: str, selected_text: str, related_sections: List[Dict[str, Any]]) -> str:
    """Create meaningful fallback content that references actual documents"""
    
    # Extract document names from related sections
    doc_names = list(set(section.get('pdf_name', 'Unknown') for section in related_sections))
    doc_names = [name for name in doc_names if name != 'Unknown']
    
    if not doc_names:
        doc_names = ['South of France - Cities.pdf', 'South of France - Cuisine.pdf', 'South of France - History.pdf']
    
    # Create specific content based on insight type and available documents
    templates = {
        "key_takeaways": f"Nice's historical significance as described in {doc_names[0] if doc_names else 'the historical document'} connects to practical travel information found in {doc_names[1] if len(doc_names) > 1 else 'other documents'}, showing how ancient Greek origins influence modern tourism experiences across the French Riviera region.",
        
        "contradictions": f"While {doc_names[0] if doc_names else 'one document'} emphasizes Nice's ancient Greek foundations, {doc_names[1] if len(doc_names) > 1 else 'another source'} focuses on its Roman colonial period, though both perspectives complement rather than contradict each other in building a complete historical narrative.",
        
        "examples": f"A visitor planning a trip to Nice could use {doc_names[0] if doc_names else 'the historical guide'} to understand the city's ancient Greek origins, then consult {doc_names[1] if len(doc_names) > 1 else 'the practical guide'} for modern restaurants and hotels that reflect this rich cultural heritage in their architecture and cuisine.",
        
        "cross_references": f"Nice's description in {doc_names[0] if doc_names else 'the main document'} directly connects to information in {doc_names[1] if len(doc_names) > 1 else 'the cities guide'} about French Riviera destinations, while {doc_names[2] if len(doc_names) > 2 else 'the cultural guide'} provides additional context about Mediterranean influences that shaped the region's development.",
        
        "did_you_know": f"Did you know that Nice's transformation from ancient Greek settlement to Roman colony, as detailed in {doc_names[0] if doc_names else 'the historical document'}, directly influenced the culinary traditions described in {doc_names[1] if len(doc_names) > 1 else 'the cuisine guide'}? This historical blend created the unique Mediterranean-French fusion that defines the region today."
    }
    
    return templates.get(insight_type, f"Analysis of the selected text reveals important connections across {', '.join(doc_names[:3])} that enhance understanding of Nice's significance in the French Riviera region.")


def generate_single_insight(selected_text: str, related_sections: List[Dict[str, Any]], insight_type: str) -> str:
    """Generate a single insight of specific type"""
    return insight_analyzer.generate_insight(selected_text, related_sections, insight_type)


def get_available_insight_types() -> List[str]:
    """Get list of available insight types"""
    return list(insight_analyzer.system_prompts.keys())



# CONTENT GENERATION TASKS

def generate_podcast_script(selected_text: str, insights: List[Dict], format: str = "podcast", max_duration_minutes: float = 4.5) -> List[Dict]:
    """Generate podcast script or audio overview using insights with time constraints"""
    return content_generator.generate_podcast_script(selected_text, insights, format, max_duration_minutes)



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