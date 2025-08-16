"""
Task-specific LLM modules for different document analysis tasks
"""

from typing import List, Dict, Any
from .core_llm import get_llm_client


def get_pdf_context() -> str:
    """Get PDF outlines context for all LLM requests"""
    try:
        # Import here to avoid circular imports
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
        
        # Format for context
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
                    if i >= 8:  # Limit to first 8 items to conserve tokens
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
        
    except Exception as e:
        print(f"Error getting PDF context: {e}")
        return "Document context unavailable."


class SummaryGenerator:
    """Handles document summarization tasks"""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_snippet_summary(self, text: str, limit: int = 2) -> str:
        """Generate a concise summary of the given text"""
        pdf_context = get_pdf_context()
        
        system_prompt = f"""You are a professional content summarizer with access to a document library. Your task is to create concise, informative summaries that capture the essential points of any text while considering the broader context of available documents. Always write exactly {limit} sentences - no more, no less. Focus on the most important information and make it accessible to readers. Always respond in plain text format - no markdown, bullets, or special formatting. Consider how this content relates to the available documents when creating your summary."""
        
        user_prompt = f"""Document Library Context:
{pdf_context}

Summarize the following text in exactly {limit} sentences, considering how it relates to the available documents:
{text}"""
        
        return self.client.generate(
            prompt=user_prompt,
            max_tokens=150,
            temperature=0.3,
            system_prompt=system_prompt
        )
    
    def generate_executive_summary(self, content: List[str], max_length: int = 5) -> str:
        """Generate an executive summary from multiple content pieces"""
        pdf_context = get_pdf_context()
        
        system_prompt = f"""You are an executive summary specialist with access to a document library. Create a comprehensive overview that captures the key points from multiple sources while considering the broader context of available documents. Write exactly {max_length} sentences that provide a high-level understanding of the content. Focus on strategic insights and main conclusions. Always respond in plain text format - no markdown, bullets, or special formatting."""
        
        combined_content = "\n\n".join(content)
        user_prompt = f"""Document Library Context:
{pdf_context}

Create an executive summary of the following content in {max_length} sentences, considering how it relates to the available documents:

{combined_content}"""
        
        return self.client.generate(
            prompt=user_prompt,
            max_tokens=200,
            temperature=0.4,
            system_prompt=system_prompt
        )


class InsightAnalyzer:
    """Handles insight generation and analysis tasks"""
    
    def __init__(self):
        self.client = get_llm_client()
        self.system_prompts = {
            "key_takeaways": """You are an expert content analyst with access to a document library. Your task is to identify the most important takeaways from the provided text and related sections while considering the broader context of available documents. Focus on actionable insights, practical advice, and core concepts that readers should remember. Always respond in plain text format - no markdown, bullets, or special formatting. Respond in 1-2 clear sentences that capture the essence of the content in relation to the document library.""",
            
            "contradictions": """You are a critical analysis expert with access to a document library. Your task is to find discrepancies between different pieces of information, conflicting advice, or opposing viewpoints while considering the broader context of available documents. If no contradictions exist, explain how the content complements each other and maintains consistency. Be thorough and objective in your analysis. Always respond in plain text format - no markdown, bullets, or special formatting. Respond in 1-2 clear sentences.""",
            
            "examples": """You are a practical application specialist with access to a document library. Your task is to provide specific, actionable examples that demonstrate how the content can be applied in practice while considering the broader context of available documents. Create detailed scenarios that readers can relate to and implement. Make examples diverse and comprehensive. Always respond in plain text format - no markdown, bullets, or special formatting. Respond in 1-2 clear sentences with concrete examples.""",
            
            "cross_references": """You are a knowledge connection expert with access to a document library. Your task is to find connections, patterns, and relationships across different pieces of content within the available documents. Show how ideas link together, build upon each other, or create a coherent narrative across the document library. Always respond in plain text format - no markdown, bullets, or special formatting. Respond in 2-3 sentences that clearly explain the connections.""",
            
            "did_you_know": """You are a fascinating facts curator with access to a document library. Your task is to identify intriguing, lesser-known facts or surprising aspects of the content while considering the broader context of available documents. Focus on information that would make readers say "I didn't know that!" and that relates to the document library. Make it engaging and memorable. Always respond in plain text format - no markdown, bullets, or special formatting. Respond in 2-3 sentences with fascinating insights."""
        }
    
    def generate_insight(self, selected_text: str, related_sections: List[Dict[str, Any]], insight_type: str) -> str:
        """Generate a specific type of insight"""
        pdf_context = get_pdf_context()
        
        # Get the appropriate system prompt
        system_prompt = self.system_prompts.get(insight_type, self.system_prompts["key_takeaways"])
        
        # Format related sections
        related_text = "\n\n".join([
            f"From {section.get('pdf_name', 'Unknown')}, {section.get('heading', 'Section')}:\n{section.get('content', '')}"
            for section in related_sections
        ])
        
        # Create user prompt based on insight type with PDF context
        user_prompt = self._get_user_prompt_with_context(insight_type, selected_text, related_text, pdf_context)
        
        return self.client.generate(
            prompt=user_prompt,
            max_tokens=250,  # Conservative for free tier
            temperature=0.7,
            system_prompt=system_prompt
        )
    
    def _get_user_prompt_with_context(self, insight_type: str, selected_text: str, related_text: str, pdf_context: str) -> str:
        """Get user prompt template for specific insight type with PDF context"""
        base_context = f"""Document Library Context:
{pdf_context}

Selected text: {selected_text}

Related sections:
{related_text}"""
        
        templates = {
            "key_takeaways": f"""{base_context}

Based on the above content and considering the available documents in the library, provide the most important key takeaways that readers should remember:""",
            
            "contradictions": f"""{base_context}

Analyze the above content for contradictions or conflicts, considering the broader context of the document library:""",
            
            "examples": f"""{base_context}

Provide practical examples based on this content, considering how it relates to other documents in the library:""",
            
            "cross_references": f"""{base_context}

Identify connections and relationships between this content and other documents in the library:""",
            
            "did_you_know": f"""{base_context}

Generate fascinating facts from this content that relate to the broader document library:"""
        }
        
        return templates.get(insight_type, templates["key_takeaways"])
    
    def generate_multiple_insights(self, selected_text: str, related_sections: List[Dict[str, Any]], insight_types: List[str]) -> List[Dict[str, Any]]:
        """Generate multiple insights in a single batch to conserve API calls"""
        insights = []
        
        for insight_type in insight_types:
            try:
                content = self.generate_insight(selected_text, related_sections, insight_type)
                insights.append({
                    "type": insight_type,
                    "content": content,
                    "relevance_score": 0.8  # Default score
                })
            except Exception as e:
                print(f"Error generating {insight_type} insight: {e}")
                insights.append({
                    "type": insight_type,
                    "content": f"Unable to generate {insight_type} insight at this time.",
                    "relevance_score": 0.0
                })
        
        return insights


class ContentGenerator:
    """Handles content generation tasks like podcast scripts"""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_podcast_script(self, selected_text: str, connections: List[Dict], insights: List[Dict], format: str = "podcast") -> List[Dict]:
        """Generate podcast script or audio overview"""
        pdf_context = get_pdf_context()
        
        if format == "podcast":
            system_prompt = """You are a professional podcast script writer with access to a document library. Your task is to write dialogue between a Host (who asks questions) and an Expert (who provides detailed answers) while incorporating relevant information from the available documents. Make the conversation flow naturally with realistic speech patterns. The Host should be curious and ask insightful follow-up questions. The Expert should be knowledgeable, provide clear explanations, and reference the document library when relevant. Always format your response as valid JSON with speaker and text fields. Keep the dialogue relevant to the uploaded documents."""
            
            user_prompt = f"""Document Library Context:
{pdf_context}

Create a 2-3 minute podcast dialogue (300-450 words) about this topic, incorporating relevant information from the document library:

Main topic: {selected_text}

Related information: {str(connections)[:300]}...

Key insights: {str(insights)[:300]}...

Format as JSON array with objects containing:
- "speaker": "Host" or "Expert"
- "text": what they say

Make sure to reference relevant documents from the library in the conversation."""
        
        else:  # overview format
            system_prompt = """You are a professional audio content creator with access to a document library. Your task is to create smooth, informative overview scripts that sound natural when read aloud while incorporating relevant information from the available documents. Use transitions that flow well and maintain listener engagement throughout. Always format your response as valid JSON. Reference relevant documents from the library in your narration."""
            
            user_prompt = f"""Document Library Context:
{pdf_context}

Create a 2-3 minute audio overview (300-450 words) about this topic, incorporating relevant information from the document library:

Main topic: {selected_text}

Related information: {str(connections)[:300]}...

Key insights: {str(insights)[:300]}...

Format as JSON array with a single object:
- "speaker": "Narrator"
- "text": the complete narration

Make sure to reference relevant documents from the library in the narration."""
        
        response = self.client.generate(
            prompt=user_prompt,
            max_tokens=300,  # Conservative for free tier
            temperature=0.8,
            system_prompt=system_prompt
        )
        
        try:
            import json
            script = json.loads(response)
            if not isinstance(script, list):
                script = [script]
            return script
        except:
            # Fallback if JSON parsing fails
            if format == "podcast":
                return [
                    {"speaker": "Host", "text": "Today we're discussing an interesting topic from our document library."},
                    {"speaker": "Expert", "text": response}
                ]
            else:
                return [{"speaker": "Narrator", "text": response}]


# Task-specific instances
summary_generator = SummaryGenerator()
insight_analyzer = InsightAnalyzer()
content_generator = ContentGenerator()
