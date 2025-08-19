"""
Cache manager module for handling podcast caching.
"""

import hashlib
from typing import List, Dict, Any, Optional
from models import PodcastResponse


class CacheManager:
    """Handles podcast caching and cache key generation."""
    
    def __init__(self):
        self.generated_podcasts = {}
    
    def generate_cache_key(self, selected_text: str, insights: List[Dict[str, Any]], format: str, duration: str) -> str:
        """Generate a unique cache key based on content"""
        # Create a hash of the selected text and insights to ensure uniqueness
        content_hash = hashlib.md5(
            f"{selected_text}_{len(insights)}_{format}_{duration}".encode()
        ).hexdigest()
        return f"podcast_{content_hash}"
    
    def get_cached_podcast(self, cache_key: str) -> Optional[PodcastResponse]:
        """Get cached podcast if available"""
        cached = self.generated_podcasts.get(cache_key)
        if cached:
            print(f"🎵 Using cached podcast for key: {cache_key}")
            return cached
        return None
    
    def cache_podcast(self, cache_key: str, response: PodcastResponse) -> None:
        """Cache the podcast response"""
        self.generated_podcasts[cache_key] = response
    
    def is_cached(self, cache_key: str) -> bool:
        """Check if podcast is cached"""
        return cache_key in self.generated_podcasts
