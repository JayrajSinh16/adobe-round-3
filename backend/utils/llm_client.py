import os
import json
from typing import Dict, Any, Optional, List
from config import settings

def chat_with_llm(prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
    """
    Unified LLM interface that uses environment variables to determine provider
    """
    provider = settings.llm_provider
    
    try:
        if provider == "gemini":
            import google.generativeai as genai
            
            if settings.google_application_credentials:
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.google_application_credentials
            
            genai.configure()
            model = genai.GenerativeModel(settings.gemini_model)
            response = model.generate_content(prompt)
            return response.text
            
        elif provider == "openai":
            from openai import OpenAI
            
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
            
        elif provider == "ollama":
            import httpx
            
            response = httpx.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60.0
            )
            return response.json()["response"]
            
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
            
    except Exception as e:
        print(f"Error in LLM call: {str(e)}")
        # Fallback response
        return "Unable to generate response at this time."

def generate_snippet_summary(text: str, limit: int = 3) -> str:
    """Generate a 2-3 sentence summary of the given text"""
    prompt = f"""
    Summarize the following text in exactly {limit} sentences. 
    Be concise and capture the main points:
    
    {text}
    
    Summary:
    """
    return chat_with_llm(prompt, max_tokens=150, temperature=0.3)

def generate_insights(selected_text: str, related_sections: List[Dict[str, Any]], insight_type: str) -> str:
    """Generate specific insights based on the type requested"""
    
    prompt_templates = {
        "key_takeaways": """
        Based on the selected text and related sections, provide 3-4 key takeaways:
        
        Selected text: {selected_text}
        
        Related sections:
        {related_sections}
        
        Format as bullet points, each starting with "• ".
        """,
        
        "contradictions": """
        Identify any contradictions or conflicting viewpoints between the selected text and related sections:
        
        Selected text: {selected_text}
        
        Related sections:
        {related_sections}
        
        If no contradictions exist, explain how they complement each other.
        """,
        
        "examples": """
        Provide practical examples or applications based on the selected text and related content:
        
        Selected text: {selected_text}
        
        Related sections:
        {related_sections}
        
        Give 2-3 concrete examples.
        """,
        
        "cross_references": """
        Identify cross-document connections and inspirations:
        
        Selected text: {selected_text}
        
        Related sections:
        {related_sections}
        
        Show how ideas connect across different documents.
        """,
        
        "did_you_know": """
        Generate interesting "Did you know?" facts based on the content:
        
        Selected text: {selected_text}
        
        Related sections:
        {related_sections}
        
        Provide 2-3 fascinating facts or insights.
        """
    }
    
    template = prompt_templates.get(insight_type, prompt_templates["key_takeaways"])
    
    # Format related sections for the prompt
    related_text = "\n\n".join([
        f"From {section.get('pdf_name', 'Unknown')}, {section.get('heading', 'Section')}:\n{section.get('content', '')}"
        for section in related_sections
    ])
    
    prompt = template.format(
        selected_text=selected_text,
        related_sections=related_text
    )
    
    return chat_with_llm(prompt, max_tokens=500, temperature=0.7)

def generate_podcast_script(selected_text: str, connections: List[Dict], insights: List[Dict], format: str = "podcast") -> List[Dict]:
    """Generate a podcast script based on the content"""
    
    if format == "podcast":
        prompt = f"""
        Create a natural, engaging podcast dialogue between two speakers (Host and Expert) discussing the following topic.
        The conversation should be 3-4 minutes when read aloud (approximately 450-600 words).
        
        Main topic from selected text:
        {selected_text}
        
        Related information:
        {json.dumps(connections, indent=2)}
        
        Key insights:
        {json.dumps(insights, indent=2)}
        
        Format the response as a JSON array with objects containing:
        - "speaker": "Host" or "Expert"
        - "text": what they say
        
        Make it conversational, with natural transitions, questions, and explanations.
        Include "um", "well", and other natural speech patterns occasionally.
        The Host should ask insightful questions and the Expert should provide detailed explanations.
        """
    else:  # overview format
        prompt = f"""
        Create an engaging audio overview narration about the following topic.
        The narration should be 2-3 minutes when read aloud (approximately 300-450 words).
        
        Main topic:
        {selected_text}
        
        Related information:
        {json.dumps(connections, indent=2)}
        
        Key insights:
        {json.dumps(insights, indent=2)}
        
        Format the response as a JSON array with a single object containing:
        - "speaker": "Narrator"
        - "text": the complete narration
        
        Make it engaging and informative, with smooth transitions between topics.
        """
    
    response = chat_with_llm(prompt, max_tokens=1500, temperature=0.8)
    
    try:
        # Try to parse as JSON
        script = json.loads(response)
        if not isinstance(script, list):
            script = [script]
        return script
    except:
        # If not valid JSON, create a simple script
        if format == "podcast":
            return [
                {"speaker": "Host", "text": "Today we're discussing an interesting topic from our document library."},
                {"speaker": "Expert", "text": response}
            ]
        else:
            return [{"speaker": "Narrator", "text": response}]