from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Application settings
    app_name: str = "Document Insight System"
    environment: str = "development"
    debug: bool = True
    host: str = "localhost"
    port: int = 8080
    
    # Storage settings
    storage_path: str = "./storage"
    upload_folder: str = "storage/pdfs"
    outline_folder: str = "storage/outlines"
    audio_folder: str = "storage/audio"
    upload_path: str = "./storage/uploads"
    outline_path: str = "./storage/outlines"
    index_path: str = "./storage/search_index.json"
    document_index_path: str = "./storage/document_index.json"
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    
    # LLM settings (Gemini only)
    google_api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Insights Configuration
    default_insight_types: str = os.getenv("DEFAULT_INSIGHT_TYPES", "key_takeaways,contradictions,examples,cross_references,did_you_know")
    max_tokens_per_insight: int = int(os.getenv("MAX_TOKENS_PER_INSIGHT", "200"))  # Reduced for free tier
    temperature: float = float(os.getenv("TEMPERATURE", "0.7"))
    top_p: float = float(os.getenv("TOP_P", "0.9"))
    llm_request_timeout: int = int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
    
    @property
    def default_insight_types_list(self) -> List[str]:
        """Convert comma-separated insight types to list"""
        return [t.strip() for t in self.default_insight_types.split(",")]
    
    # Search Configuration
    max_search_results: int = int(os.getenv("MAX_SEARCH_RESULTS", "10"))
    min_similarity_threshold: float = float(os.getenv("MIN_SIMILARITY_THRESHOLD", "0.1"))
    
    # Performance settings
    connection_limit: int = 5  # Max connections to return
    snippet_length: int = 300  # Characters per snippet
    enable_timing_measurements: bool = os.getenv("ENABLE_TIMING_MEASUREMENTS", "true").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # TTS settings
    tts_provider: str = os.getenv("TTS_PROVIDER", "local")
    azure_tts_key: Optional[str] = os.getenv("AZURE_TTS_KEY")
    azure_tts_endpoint: Optional[str] = os.getenv("AZURE_TTS_ENDPOINT")
    azure_tts_region: Optional[str] = os.getenv("AZURE_TTS_REGION")
    
    # Adobe Embed API
    adobe_embed_api_key: Optional[str] = os.getenv("ADOBE_EMBED_API_KEY")
    
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