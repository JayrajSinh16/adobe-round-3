from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application settings
    app_name: str = "Document Insight System"
    environment: str = "development"
    
    # Storage settings
    upload_folder: str = "storage/pdfs"
    outline_folder: str = "storage/outlines"
    audio_folder: str = "storage/audio"
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    
    # LLM settings
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    google_application_credentials: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    ollama_model: Optional[str] = os.getenv("OLLAMA_MODEL", "llama3")
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    openai_model: Optional[str] = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    # TTS settings
    tts_provider: str = os.getenv("TTS_PROVIDER", "azure")
    azure_tts_key: Optional[str] = os.getenv("AZURE_TTS_KEY")
    azure_tts_endpoint: Optional[str] = os.getenv("AZURE_TTS_ENDPOINT")
    
    # Adobe Embed API
    adobe_embed_api_key: Optional[str] = os.getenv("ADOBE_EMBED_API_KEY")
    
    # Performance settings
    connection_limit: int = 5  # Max connections to return
    snippet_length: int = 300  # Characters per snippet
    
    class Config:
        env_file = ".env"

settings = Settings()

# Round 1A outline extraction Config (copied from temp-repo, kept separate from runtime Settings)
class Config:
    # Performance limits
    MAX_PROCESSING_TIME = 10
    MAX_MODEL_SIZE = 200

    # Detection thresholds
    TITLE_SIZE_RATIO = 1.5
    H1_SIZE_RATIO = 1.3
    H2_SIZE_RATIO = 1.15
    H3_SIZE_RATIO = 1.1

    # PDF Analysis thresholds
    MIN_TEXT_EXTRACTION_RATE = 0.5
    MAX_FONT_VARIETY = 15
    SCANNED_PAGE_THRESHOLD = 0.3

    # Performance settings
    ENABLE_PARALLEL = True
    PARALLEL_THRESHOLD = 10  # pages
    CACHE_SIZE = 128
    OCR_DPI = 1.5  # Balance quality/speed

    # Heading patterns (kept for potential future expansion)
    HEADING_PATTERNS = {
        'number_patterns': [
            r'^\d+\.?\s+',
            r'^\d+\.\d+\.?\s+',
            r'^\d+\.\d+\.\d+\.?\s+'  # 1.1.1. or 1.1.1
        ],
        'keyword_patterns': [
            r'^(Chapter|CHAPTER|Section|SECTION)\s+\d+',
            r'^(Introduction|Conclusion|Abstract|References)',
            r'^(Background|Methodology|Results|Discussion)'
        ]
    }

    DEBUG = False
    LOG_LEVEL = 'INFO'
    SAVE_INTERMEDIATE = False