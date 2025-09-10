"""
Core LLM client with rate limiting and error handling
"""

import os
import time
from typing import Optional, Dict
from config import settings

# Rate limiting globals - separate for each service
_last_request_times: Dict[str, float] = {}
_min_request_interval = 1  # seconds between requests (reduced from 2)


class LLMClient:
    """Core LLM client with Gemini integration"""
    
    def __init__(self, service_type: str = "default"):
        self._client = None
        self.service_type = service_type
        self._configure_client()
    
    def _get_api_key_for_service(self) -> Optional[str]:
        """Get the appropriate API key based on service type"""
        if self.service_type == "insights":
            return settings.google_api_key_insights or settings.google_api_key
        elif self.service_type == "connections":
            return settings.google_api_key_connections or settings.google_api_key
        elif self.service_type == "podcast":
            return settings.google_api_key_podcast or settings.google_api_key
        else:
            return settings.google_api_key
    
    def _configure_client(self):
        """Configure the Gemini client"""
        try:
            import google.generativeai as genai
            
            api_key = self._get_api_key_for_service()
            if api_key:
                genai.configure(api_key=api_key)
            elif settings.google_application_credentials:
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.google_application_credentials
                genai.configure()
            else:
                raise ValueError(f"No Google API key or credentials found for service: {self.service_type}")
            
            self._client = genai
            
        except Exception as e:
            print(f"Error configuring LLM client for {self.service_type}: {e}")
            self._client = None
    
    def _apply_rate_limiting(self):
        """Apply rate limiting per service to prevent quota exhaustion"""
        global _last_request_times
        
        current_time = time.time()
        last_request_time = _last_request_times.get(self.service_type, 0)
        time_since_last = current_time - last_request_time
        
        if time_since_last < _min_request_interval:
            wait_time = _min_request_interval - time_since_last
            print(f"Rate limiting ({self.service_type}): waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
        
        _last_request_times[self.service_type] = time.time()
    
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
            return f"LLM client not configured properly for service: {self.service_type}."
        
        self._apply_rate_limiting()
        
        try:
            # Remove conservative token limiting - use the requested max_tokens directly
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
        print(f"Error in LLM generation ({self.service_type}): {error_message}")
        
        if "429" in error_message or "quota" in error_message.lower():
            print(f"⚠️  API quota exceeded for {self.service_type}. Consider using a paid tier or waiting for quota reset.")
            return f"API quota exceeded for {self.service_type}. Please try again later or upgrade to a paid plan."
        elif "401" in error_message or "authentication" in error_message.lower():
            return f"Authentication error for {self.service_type}. Please check your API key."
        elif "timeout" in error_message.lower():
            return "Request timeout. Please try again."
        else:
            return f"Unable to generate response at this time for {self.service_type}."


# Global client instances for different services
_llm_clients: Dict[str, LLMClient] = {}


def get_llm_client(service_type: str = "default") -> LLMClient:
    """Get the LLM client instance for a specific service"""
    if service_type not in _llm_clients:
        _llm_clients[service_type] = LLMClient(service_type)
    return _llm_clients[service_type]


def chat_with_llm(
    prompt: str, 
    max_tokens: int = 8000,  # Increased default
    temperature: float = 0.7,
    system_prompt: Optional[str] = None,
    service_type: str = "default"
) -> str:
    """
    Legacy function for backward compatibility with service type support
    """
    return get_llm_client(service_type).generate(prompt, max_tokens, temperature, system_prompt)
