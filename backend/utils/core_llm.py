"""
Core LLM client with rate limiting and error handling
"""

import os
import time
from typing import Optional
from config import settings

# Rate limiting globals
_last_request_time = 0
_min_request_interval = 1  # seconds between requests (reduced from 2)


class LLMClient:
    """Core LLM client with Gemini integration"""
    
    def __init__(self):
        self._client = None
        self._configure_client()
    
    def _configure_client(self):
        """Configure the Gemini client"""
        try:
            import google.generativeai as genai
            
            if settings.google_api_key:
                genai.configure(api_key=settings.google_api_key)
            elif settings.google_application_credentials:
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.google_application_credentials
                genai.configure()
            else:
                raise ValueError("No Google API key or credentials found")
            
            self._client = genai
            
        except Exception as e:
            print(f"Error configuring LLM client: {e}")
            self._client = None
    
    def _apply_rate_limiting(self):
        """Apply rate limiting to prevent quota exhaustion"""
        global _last_request_time
        
        current_time = time.time()
        time_since_last = current_time - _last_request_time
        
        if time_since_last < _min_request_interval:
            wait_time = _min_request_interval - time_since_last
            print(f"Rate limiting: waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
        
        _last_request_time = time.time()
    
    def generate(
        self, 
        prompt: str, 
        max_tokens: int = 8000,  # Increased default limit
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Core generation method with rate limiting and error handling
        """
        if not self._client:
            return "LLM client not configured properly."
        
        self._apply_rate_limiting()
        
        try:
            # Remove conservative token limiting - use the requested max_tokens directly
            # Gemini 1.5 Flash supports up to 8,192 output tokens
            actual_tokens = min(max_tokens, 8192)  # Use Gemini's actual limit
            
            # Create model with optional system instruction
            if system_prompt:
                model = self._client.GenerativeModel(
                    settings.gemini_model,
                    system_instruction=system_prompt
                )
            else:
                model = self._client.GenerativeModel(settings.gemini_model)
            
            # Generate content
            generation_config = self._client.types.GenerationConfig(
                max_output_tokens=actual_tokens,
                temperature=temperature,
            )
            
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            return self._handle_error(e)
    
    def _handle_error(self, error: Exception) -> str:
        """Handle different types of errors"""
        error_message = str(error)
        print(f"Error in LLM generation: {error_message}")
        
        if "429" in error_message or "quota" in error_message.lower():
            print("⚠️  API quota exceeded. Consider using a paid tier or waiting for quota reset.")
            return "API quota exceeded. Please try again later or upgrade to a paid plan."
        elif "401" in error_message or "authentication" in error_message.lower():
            return "Authentication error. Please check your API key."
        elif "timeout" in error_message.lower():
            return "Request timeout. Please try again."
        else:
            return "Unable to generate response at this time."


# Global client instance
_llm_client = LLMClient()


def get_llm_client() -> LLMClient:
    """Get the global LLM client instance"""
    return _llm_client


def chat_with_llm(
    prompt: str, 
    max_tokens: int = 8000,  # Increased default
    temperature: float = 0.7,
    system_prompt: Optional[str] = None
) -> str:
    """
    Legacy function for backward compatibility
    """
    return _llm_client.generate(prompt, max_tokens, temperature, system_prompt)
