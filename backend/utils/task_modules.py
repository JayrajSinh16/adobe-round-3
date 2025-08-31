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
        self.client = get_llm_client("default")  
    
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
        self.client = get_llm_client("insights")  # Dedicated insights client
        self.system_prompts = {
            "key_takeaways": """You are an expert content analyst with access to a multi-document library. Your PRIMARY task is to synthesize information from MULTIPLE PDFs to provide comprehensive takeaways. You must actively analyze the selected text in relation to information from different documents in the library.

REQUIREMENTS:
1. MUST reference at least 2-3 different PDF documents by name
2. Show how concepts connect across different documents
3. Synthesize information from multiple sources
4. Highlight actionable insights that emerge from cross-document analysis
5. Always respond in plain text format - no markdown, bullets, or special formatting
6. Respond in 2-3 clear sentences that demonstrate multi-document connections

Focus on showing how the selected text relates to and is enhanced by information from other documents in the library.""",
            
            "contradictions": """You are a critical analysis expert specializing in cross-document analysis. Your PRIMARY task is to compare information across MULTIPLE PDFs to identify contradictions, conflicts, or complementary viewpoints.

REQUIREMENTS:
1. MUST analyze content from at least 2-3 different PDF documents
2. Compare how different documents treat the same topic
3. Identify any conflicting information, differing perspectives, or contradictory advice
4. If no contradictions exist, explain how different documents complement each other
5. Show specific examples of how documents align or differ
6. Always respond in plain text format - no markdown, bullets, or special formatting
7. Respond in 2-3 clear sentences with specific document references

Focus on multi-document comparison rather than single-document analysis.""",
            
            "examples": """You are a practical application specialist with expertise in cross-document synthesis. Your PRIMARY task is to create comprehensive examples by combining information from MULTIPLE PDFs in the document library.

REQUIREMENTS:
1. MUST draw examples from at least 2-3 different PDF documents
2. Create scenarios that integrate knowledge from multiple sources
3. Show how concepts from different documents work together in practice
4. Provide specific, actionable examples that readers can implement
5. Demonstrate how multi-document knowledge enhances practical application
6. Always respond in plain text format - no markdown, bullets, or special formatting
7. Respond in 2-3 clear sentences with concrete, cross-document examples

Focus on creating richer examples by combining insights from multiple documents.""",
            
            "cross_references": """You are a knowledge connection expert specializing in multi-document relationship mapping. Your PRIMARY task is to identify and explain connections across MULTIPLE PDFs in the document library.

REQUIREMENTS:
1. MUST identify connections between at least 3-4 different PDF documents
2. Show how ideas from different documents build upon each other
3. Explain the narrative flow across multiple documents
4. Identify patterns and themes that span multiple sources
5. Highlight how documents complement and enhance each other
6. Always respond in plain text format - no markdown, bullets, or special formatting
7. Respond in 3-4 sentences that clearly map connections across documents

This is your specialty - focus entirely on multi-document connections and relationships.""",
            
            "did_you_know": """You are a fascinating facts curator with expertise in cross-document knowledge discovery. Your PRIMARY task is to uncover surprising connections and insights that emerge when analyzing MULTIPLE PDFs together.

REQUIREMENTS:
1. MUST reveal insights that connect information from at least 2-3 different PDFs
2. Find surprising facts that emerge from cross-document analysis
3. Highlight unexpected connections between different documents
4. Show how information from one document adds new perspective to another
5. Focus on "aha moments" that come from multi-document synthesis
6. Always respond in plain text format - no markdown, bullets, or special formatting
7. Respond in 2-3 sentences with fascinating cross-document insights

Specialize in finding surprising connections that only become apparent when analyzing multiple documents together."""
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
        """Get user prompt template for specific insight type with enhanced PDF context"""
        base_context = f"""Document Library Context:
{pdf_context}

Selected text: {selected_text}

Related sections from multiple documents:
{related_text}"""
        
        templates = {
            "key_takeaways": f"""{base_context}

CROSS-DOCUMENT ANALYSIS REQUIRED: Analyze the selected text and related sections to provide key takeaways that synthesize information from MULTIPLE PDFs in the library. You MUST reference specific documents by name and show how information from different PDFs connects to create comprehensive takeaways. Do not focus on just one document - your strength is in connecting information across the entire document library:""",
            
            "contradictions": f"""{base_context}

CROSS-DOCUMENT COMPARISON REQUIRED: Compare how different PDFs in the library treat the same topics. Look for contradictions, conflicts, or complementary viewpoints across MULTIPLE documents. You MUST analyze at least 2-3 different PDF documents and show how they differ or align. Reference specific document names and show the comparison:""",
            
            "examples": f"""{base_context}

MULTI-DOCUMENT SYNTHESIS REQUIRED: Create practical examples by combining information from MULTIPLE PDFs in the library. You MUST draw from at least 2-3 different documents to create richer, more comprehensive examples. Show how concepts from different PDFs work together in real-world scenarios. Reference specific documents:""",
            
            "cross_references": f"""{base_context}

MULTI-DOCUMENT RELATIONSHIP MAPPING REQUIRED: Your specialty is finding connections across MULTIPLE PDFs. You MUST identify how the selected text connects to information in at least 3-4 different documents in the library. Show the relationship web between documents and explain how they build upon each other. Reference specific document names:""",
            
            "did_you_know": f"""{base_context}

CROSS-DOCUMENT DISCOVERY REQUIRED: Find fascinating insights that emerge when you connect information from MULTIPLE PDFs together. You MUST reveal surprising connections between at least 2-3 different documents. Show how information from one PDF adds unexpected perspective to another. Reference specific documents and their connections:"""
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
        self.client = get_llm_client("podcast")  # Dedicated podcast client
    
    def generate_podcast_script(self, selected_text: str, insights: List[Dict], format: str = "podcast", max_duration_minutes: float = 4.5, language: str = "en") -> List[Dict]:
        """Generate natural, informative podcast script with human-like expressions and strict time limits"""
        pdf_context = get_pdf_context()
        
        # Calculate maximum words based on duration limit
        # Assuming average 160 WPM speech rate
        max_words = int(max_duration_minutes * 160)
        target_exchanges = min(20, max(12, int(max_words / 25)))  # 25 words per exchange average
        
        print(f"🕐 Time limit: {max_duration_minutes} minutes ({max_words} words max, {target_exchanges} exchanges)")
        
        # Format insights for better LLM understanding
        insights_summary = self._format_insights_for_prompt(insights)
        
        # Language directive (LLM must produce the dialogue in this language)
        # Map language code to human-readable name for better LLM adherence
        lang_code = (language or "en").split('-')[0].lower()
        lang_name_map = {
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "hi": "Hindi",
            "ja": "Japanese",
            "zh": "Chinese",
        }
        lang_name = lang_name_map.get(lang_code, language or "English")
        language_directive = (
            f"Respond exclusively in {lang_name} ({language}). If the selected text or insights are in a different language, translate them into {lang_name}."
        )

        if format == "podcast":
            system_prompt = f"""You are a professional podcast script writer creating natural, engaging dialogue between Alex (Host - Female) and Jamie (Expert - Male). 

CRITICAL LANGUAGE CONSTRAINT:
Respond exclusively in {lang_name} ({language}). Translate any content into {lang_name}. Do not include any other language.

CRITICAL TIME CONSTRAINTS:
1. MAXIMUM DURATION: {max_duration_minutes} minutes ({max_words} words total)
2. TARGET EXCHANGES: {target_exchanges} back-and-forth conversations
3. AVERAGE per exchange: 25-30 words maximum
4. You MUST respond with ONLY valid JSON - no other text, no explanations, no markdown

NATURAL VOICE CHARACTERISTICS:
Alex (Female Host):
- Slightly higher pitch, friendly, curious tone
- Uses "So", "Right?", "That's fascinating"
- Natural fillers: "um", "you know", "like"
- Asks engaging follow-up questions

Jamie (Male Expert):
- Deeper voice, authoritative but approachable
- Uses "Actually", "Basically", "I mean"
- Natural fillers: "uh", "well", "honestly"
- Provides detailed explanations

CONVERSATION REQUIREMENTS:
1. NO generic greetings like "Welcome to our podcast"
2. Start mid-conversation style: "So Jamie, I've been thinking about..."
3. Include natural speech patterns and fillers
4. Use conversational flow with natural interruptions
5. Include detailed, informative content from insights
6. End naturally without formal conclusions

STRICT WORD COUNT MANAGEMENT:
- Keep each exchange concise but informative
- Prioritize key insights over lengthy explanations
- Use natural speech compression techniques
- Aim for exactly {target_exchanges} exchanges

EXACT JSON FORMAT:
[
  {{"speaker": "Alex", "text": "Your natural dialogue here"}},
  {{"speaker": "Jamie", "text": "Your detailed response here"}}
]"""
            
            user_prompt = f"""{language_directive}

Create a natural conversation about: {selected_text}

Available insights with detailed information:
{insights_summary}

START NATURALLY: Begin with something like "So Alex, we're here to discuss [topic]..." or "You know Jamie, I've been looking into [topic]..."

CONVERSATION FLOW:
1. Direct topic introduction (no formal greetings)
2. Explore each insight in detail with 2-3 informative sentences
3. Ask natural follow-up questions
4. Make connections between different insights
5. Use natural speech fillers and expressions
6. Provide specific examples and details
7. Create 15-20 exchanges for proper length

Focus on being informative while maintaining natural conversation flow. Include specific details from the source documents.

Output pure JSON only - no markdown, no explanations."""
        
        else:  # overview format
            system_prompt = f"""You are a professional audio narrator creating a comprehensive overview. 

CRITICAL LANGUAGE CONSTRAINT:
Respond exclusively in {lang_name} ({language}). Translate any content into {lang_name}. Do not include any other language.

CRITICAL: You MUST respond with ONLY valid JSON format. No markdown, no explanations, no backticks, just pure JSON.

Create a 3-5 minute detailed overview with natural pacing and informative content.

EXACT OUTPUT FORMAT:
[
  {
    "speaker": "Narrator",
    "text": "Complete detailed narration text here..."
  }
]"""
            
            user_prompt = f"""{language_directive}

Create a comprehensive 3-5 minute audio overview about: {selected_text}

Available insights to incorporate:
{insights_summary}

Create a flowing, detailed narrative that incorporates all key insights with specific information and examples. Use natural pacing with occasional pauses indicated by "..." 

Remember: Respond with ONLY the JSON array, no other text."""
        
        response = self.client.generate(
            prompt=user_prompt,
            max_tokens=1200,  # Increased significantly for longer content
            temperature=0.8,  # Increased for more natural variation
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
            
            # Validate structure and apply time constraints
            valid_script = []
            total_words = 0
            
            for segment in script:
                if isinstance(segment, dict) and 'speaker' in segment and 'text' in segment:
                    # Clean up text content
                    text = segment['text'].strip()
                    if text:
                        word_count = len(text.split())
                        
                        # Check if adding this segment would exceed time limit
                        if total_words + word_count <= max_words:
                            valid_script.append({
                                "speaker": segment['speaker'],
                                "text": text
                            })
                            total_words += word_count
                        else:
                            print(f"⏰ Stopping at segment {len(valid_script)+1} to stay within {max_duration_minutes} minute limit")
                            break
            
            # Calculate estimated duration
            estimated_duration = total_words / 160  # 160 WPM average
            
            print(f"📊 Generated script: {len(valid_script)} segments, {total_words} words, ~{estimated_duration:.1f} minutes")
            
            # Validate minimum and maximum length
            if len(valid_script) < 8 and format == "podcast":
                print("⚠️ Generated script too short, using extended fallback with time limits")
                return self._get_extended_fallback_script(format, selected_text, insights, max_duration_minutes, language)
            
            if estimated_duration > max_duration_minutes:
                print(f"⚠️ Script exceeds time limit, truncating to {max_duration_minutes} minutes")
                valid_script = self._truncate_script_to_time_limit(valid_script, max_duration_minutes)
            
            # Enforce language by translating if needed (LLM might ignore language directive)
            if valid_script:
                try:
                    target = (language or "en").lower()
                    if not target.startswith("en"):
                        texts = [seg["text"] for seg in valid_script]
                        translated = self._translate_texts(texts, language)
                        for i, t in enumerate(translated):
                            valid_script[i]["text"] = t
                except Exception:
                    pass

            return valid_script if valid_script else self._get_extended_fallback_script(format, selected_text, insights, max_duration_minutes, language)
            
        except Exception as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response[:200]}...")
            return self._get_extended_fallback_script(format, selected_text, insights, max_duration_minutes, language)
    
    def _truncate_script_to_time_limit(self, script: List[Dict], max_duration_minutes: float) -> List[Dict]:
        """Truncate script to fit within time limit"""
        max_words = int(max_duration_minutes * 160)
        
        truncated_script = []
        total_words = 0
        
        for segment in script:
            text = segment['text']
            word_count = len(text.split())
            
            if total_words + word_count <= max_words:
                truncated_script.append(segment)
                total_words += word_count
            else:
                # Try to fit a partial segment if there's remaining capacity
                remaining_words = max_words - total_words
                if remaining_words > 10:  # Only if we can fit at least 10 words
                    words = text.split()
                    truncated_text = ' '.join(words[:remaining_words])
                    if truncated_text.endswith((',', 'and', 'or', 'but')):
                        # Remove incomplete trailing words
                        truncated_text = ' '.join(words[:remaining_words-1])
                    
                    truncated_script.append({
                        "speaker": segment['speaker'],
                        "text": truncated_text + "..."
                    })
                break
        
        print(f"⏱️ Script truncated to {len(truncated_script)} segments ({total_words} words)")
        return truncated_script
    
    def _fix_json_response(self, response: str) -> str:
        """Fix common JSON formatting issues"""
        import re
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

    def _translate_texts(self, texts: List[str], language: str) -> List[str]:
        """Translate a list of strings to the given language using the LLM client. Returns originals on failure."""
        try:
            target = (language or "en").lower()
            if target.startswith("en"):
                return texts
            # Use a compact prompt focused only on translation
            import json as _json
            system = f"You are a precise translator. Translate every item to {language}. Output ONLY a JSON array of translated strings."
            user = "Translate these strings: " + _json.dumps(texts, ensure_ascii=False)
            resp = self.client.generate(prompt=user, max_tokens=800, temperature=0.2, system_prompt=system).strip()
            if resp.startswith('```json'):
                resp = resp[7:]
            elif resp.startswith('```'):
                resp = resp[3:]
            if resp.endswith('```'):
                resp = resp[:-3]
            parsed = _json.loads(resp)
            if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed) and len(parsed) == len(texts):
                return parsed
            return texts
        except Exception:
            return texts
    
    def _get_fallback_script(self, format: str, selected_text: str, language: str = "en") -> List[Dict]:
        """Get basic fallback script if JSON parsing fails. Ensures language via translation."""
        if format == "podcast":
            base = [
                {"speaker": "Alex", "text": f"So Jamie, we're here to discuss {selected_text}."},
                {"speaker": "Jamie", "text": "That's right Alex. This is actually a really fascinating topic with, uh, quite a bit of depth to it."},
                {"speaker": "Alex", "text": "What makes this particularly interesting to you?"},
                {"speaker": "Jamie", "text": "Well, you know, when you look at the details, there are some really compelling aspects that most people don't realize."}
            ]
        else:
            base = [{"speaker": "Narrator", "text": f"Today we explore {selected_text}, uncovering its significance and key insights from our comprehensive analysis."}]

        try:
            target = (language or "en").lower()
            if not target.startswith("en"):
                texts = [s["text"] for s in base]
                translated = self._translate_texts(texts, language)
                for i, t in enumerate(translated):
                    base[i]["text"] = t
        except Exception:
            pass
        return base
    
    def _get_extended_fallback_script(self, format: str, selected_text: str, insights: List[Dict], max_duration_minutes: float = 4.5, language: str = "en") -> List[Dict]:
        """Get comprehensive fallback script with natural conversation and strict time limits. Ensures language via translation."""
        if format == "podcast":
            # Calculate word limits based on duration
            max_words = int(max_duration_minutes * 160)  # 160 WPM
            target_segments = min(16, max(8, max_words // 30))  # 30 words per segment
            
            print(f"🕐 Fallback script: {max_words} words max, {target_segments} segments")
            
            # Extract key topics from insights, or create synthetic topics
            topics = []
            if insights and len(insights) > 0:
                for insight in insights[:2]:  # Reduced to 2 insights for time constraint
                    if isinstance(insight, dict):
                        title = insight.get('title', 'Key Point')
                        content = insight.get('content', 'Interesting information')
                        topics.append({'title': title, 'content': content[:100]})  # Very short content for time limits
            else:
                # Create concise synthetic topics when no insights are available
                topics = [
                    {'title': 'Key Aspects', 'content': f'The main aspects of {selected_text} include several important elements.'},
                    {'title': 'Modern Relevance', 'content': f'Today, {selected_text} continues to be significant in various ways.'}
                ]
            
            # Start with concise opening
            script = [
                {"speaker": "Alex", "text": f"So Jamie, I've been looking into {selected_text}."},
                {"speaker": "Jamie", "text": "That's great, Alex. What did you find most interesting?"},
                {"speaker": "Alex", "text": "Well, there are several key points worth discussing."},
                {"speaker": "Jamie", "text": "Absolutely. Let's dive into those."}
            ]
            
            current_words = sum(len(segment['text'].split()) for segment in script)
            
            # Add content based on topics (keeping it very concise)
            for i, topic in enumerate(topics):
                if current_words >= max_words:
                    break
                    
                new_segments = []
                if i == 0:
                    new_segments = [
                        {"speaker": "Jamie", "text": f"First, about {topic['title'].lower()}. {topic['content'][:60]}"},
                        {"speaker": "Alex", "text": "That's interesting. Can you tell us more?"},
                        {"speaker": "Jamie", "text": "Yes, this connects to the broader picture quite well."}
                    ]
                elif i == 1:
                    new_segments = [
                        {"speaker": "Alex", "text": f"What about {topic['title'].lower()}?"},
                        {"speaker": "Jamie", "text": f"{topic['content'][:60]} This shows the connections."},
                        {"speaker": "Alex", "text": "That makes sense."}
                    ]
                
                # Check if adding new segments would exceed word limit
                segment_words = sum(len(seg['text'].split()) for seg in new_segments)
                if current_words + segment_words <= max_words:
                    script.extend(new_segments)
                    current_words += segment_words
                else:
                    # Add minimal content if there's room
                    remaining_words = max_words - current_words
                    if remaining_words > 10:
                        script.append({
                            "speaker": "Jamie", 
                            "text": f"Another key point is {topic['title'].lower()}."
                        })
                    break
            
            # Add brief conclusion only if we have room
            if current_words < max_words - 15:
                script.extend([
                    {"speaker": "Alex", "text": "Thanks for sharing these insights, Jamie."},
                    {"speaker": "Jamie", "text": "My pleasure. Great discussion, Alex."}
                ])
            
            # Final word count check and truncation
            final_words = sum(len(segment['text'].split()) for segment in script)
            if final_words > max_words:
                print(f"⚠️ Fallback script exceeds word limit, truncating...")
                script = self._truncate_script_to_time_limit(script, max_duration_minutes)
            
            print(f"📊 Fallback script: {len(script)} segments, {sum(len(s['text'].split()) for s in script)} words")

            # Translate if needed
            try:
                target = (language or "en").lower()
                if not target.startswith("en"):
                    texts = [s["text"] for s in script]
                    translated = self._translate_texts(texts, language)
                    for i, t in enumerate(translated):
                        script[i]["text"] = t
            except Exception:
                pass

            return script
        else:
            # Extended narrator format
            content = f"Today we explore {selected_text}, uncovering key insights."
            base = [{"speaker": "Narrator", "text": content}]
            try:
                target = (language or "en").lower()
                if not target.startswith("en"):
                    texts = [s["text"] for s in base]
                    translated = self._translate_texts(texts, language)
                    for i, t in enumerate(translated):
                        base[i]["text"] = t
            except Exception:
                pass
            return base
    
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
