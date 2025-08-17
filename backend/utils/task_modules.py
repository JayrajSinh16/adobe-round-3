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
    
    def generate_podcast_script(self, selected_text: str, insights: List[Dict], format: str = "podcast") -> List[Dict]:
        """Generate podcast script or audio overview using insights"""
        pdf_context = get_pdf_context()
        
        # Format insights for better LLM understanding
        insights_summary = self._format_insights_for_prompt(insights)
        
        if format == "podcast":
            system_prompt = """You are a professional podcast script writer creating engaging dialogue between Alex (Host - Female) and Jamie (Expert - Male). 

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON - no other text, no explanations, no markdown
2. Use proper JSON escaping for quotes within text
3. Create natural, engaging conversation about the topic
4. Reference the provided insights naturally in the dialogue
5. Generate 8-12 exchanges for a complete conversation

EXACT JSON FORMAT (copy this structure):
[
  {"speaker": "Alex", "text": "Your dialogue here"},
  {"speaker": "Jamie", "text": "Your response here"}
]

Use Alex for Host questions and Jamie for Expert responses. Ensure all quotes within text are properly escaped."""
            
            user_prompt = f"""Create a podcast dialogue about: {selected_text}

Available insights to incorporate:
{insights_summary}

Create 8-12 natural exchanges where Alex asks questions and Jamie provides expert answers. Reference specific insights and source documents naturally.

Output pure JSON only - no markdown, no explanations."""
        
        else:  # overview format
            system_prompt = """You are a professional audio narrator creating an informative overview. 

CRITICAL: You MUST respond with ONLY valid JSON format. No markdown, no explanations, no backticks, just pure JSON.

EXACT OUTPUT FORMAT:
[
  {
    "speaker": "Narrator",
    "text": "Complete narration text here..."
  }
]"""
            
            user_prompt = f"""Create a 2-3 minute audio overview about: {selected_text}

Available insights to incorporate:
{insights_summary}

Create a flowing narrative that incorporates all the key insights naturally.

Remember: Respond with ONLY the JSON array, no other text."""
        
        response = self.client.generate(
            prompt=user_prompt,
            max_tokens=600,  # Increased for longer dialogues
            temperature=0.7,
            system_prompt=system_prompt
        )
        
        # Clean response and parse JSON more robustly
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```json'):
            response = response[7:]
        elif response.startswith('```'):
            response = response[3:]
        
        if response.endswith('```'):
            response = response[:-3]
        
        response = response.strip()
        
        # Try to fix common JSON issues
        response = self._fix_json_response(response)
        
        try:
            import json
            script = json.loads(response)
            if not isinstance(script, list):
                script = [script] if isinstance(script, dict) else []
            
            # Validate structure
            valid_script = []
            for segment in script:
                if isinstance(segment, dict) and 'speaker' in segment and 'text' in segment:
                    # Clean up text content
                    text = segment['text'].strip()
                    if text:
                        valid_script.append({
                            "speaker": segment['speaker'],
                            "text": text
                        })
            
            return valid_script if valid_script else self._get_fallback_script(format, selected_text)
            
        except Exception as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response[:200]}...")
            return self._get_fallback_script(format, selected_text)
    
    def _fix_json_response(self, response: str) -> str:
        """Fix common JSON formatting issues"""
        import re
        
        # Fix unterminated strings by finding the last complete object
        try:
            # Find the last complete JSON object/array
            stack = []
            last_valid_pos = 0
            
            for i, char in enumerate(response):
                if char == '[':
                    stack.append('[')
                elif char == ']':
                    if stack and stack[-1] == '[':
                        stack.pop()
                        if not stack:  # Complete array
                            last_valid_pos = i + 1
                elif char == '{':
                    stack.append('{')
                elif char == '}':
                    if stack and stack[-1] == '{':
                        stack.pop()
            
            if last_valid_pos > 0:
                response = response[:last_valid_pos]
            
            # Fix common quote issues
            response = re.sub(r'([^\\])"([^"]*?)([^\\])"([^,}\]]*)', r'\1"\2\3"\4', response)
            
            return response
            
        except Exception:
            return response
    
    def _get_fallback_script(self, format: str, selected_text: str) -> List[Dict]:
        """Get fallback script if JSON parsing fails"""
        if format == "podcast":
            return [
                {"speaker": "Alex", "text": f"Welcome to our podcast. Today we're exploring {selected_text}."},
                {"speaker": "Jamie", "text": "Thanks Alex. This is indeed a fascinating topic with rich historical and cultural significance."},
                {"speaker": "Alex", "text": "Can you tell us more about what makes this so special?"},
                {"speaker": "Jamie", "text": "Absolutely. The insights from our document analysis reveal some incredible details about this subject."}
            ]
        else:
            return [{"speaker": "Narrator", "text": f"Today we explore {selected_text}, uncovering its significance and key insights from our comprehensive analysis."}]
    
    def _format_insights_for_prompt(self, insights: List[Dict]) -> str:
        """Format insights for LLM prompt"""
        if not insights:
            return "No specific insights available."
        
        formatted_insights = []
        for insight in insights:
            insight_type = insight.get('type', 'unknown')
            title = insight.get('title', 'Insight')
            content = insight.get('content', '').strip()
            confidence = insight.get('confidence', 0.0)
            
            # Get source documents
            sources = insight.get('source_documents', [])
            source_names = [doc.get('pdf_name', 'Unknown') for doc in sources[:3]]  # Limit to 3
            
            formatted_insight = f"""
{title} ({insight_type.replace('_', ' ').title()}):
{content}
Sources: {', '.join(source_names) if source_names else 'Various documents'}
Confidence: {confidence}
"""
            formatted_insights.append(formatted_insight.strip())
        
        return '\n\n'.join(formatted_insights)


# Task-specific instances
summary_generator = SummaryGenerator()
insight_analyzer = InsightAnalyzer()
content_generator = ContentGenerator()
