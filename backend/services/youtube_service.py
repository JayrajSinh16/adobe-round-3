"""
YouTube Recommendations Service

Uses the YouTube Data API v3 to fetch video links relevant to a query.
Reads YOUTUBE_API_KEY from environment at runtime. Falls back gracefully
when the key is missing or when the API returns errors.

No new dependencies beyond 'requests' (already present in requirements.txt).
"""
from __future__ import annotations

import os
import hashlib
import time
from typing import List, Dict, Any

import requests
from config import settings


class YouTubeService:
    BASE_URL = "https://www.googleapis.com/youtube/v3/search"

    def __init__(self) -> None:
        # Simple in-memory cache to reduce duplicate calls within a short window
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._ttl_seconds = 300  # 5 minutes

    def _cache_key(self, query: str, max_results: int) -> str:
        src = f"{query.strip().lower()}::{max_results}"
        return hashlib.sha256(src.encode("utf-8")).hexdigest()

    def _get_cached(self, key: str) -> List[str] | None:
        item = self._cache.get(key)
        if not item:
            return None
        if time.time() - item["ts"] > self._ttl_seconds:
            # expired
            self._cache.pop(key, None)
            return None
        return item["links"]

    def _set_cached(self, key: str, links: List[str]) -> None:
        self._cache[key] = {"ts": time.time(), "links": links}

    def recommend(self, text: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Return up to max_results video objects relevant to the text.

        Each object: { url, title, thumbnail, id, channelTitle, publishedAt }
        Raises ValueError for invalid inputs and RuntimeError for runtime failures.
        """

        q = (text or "").strip()
        if not q:
            raise ValueError("Query text must not be empty")

        # bounds
        if max_results < 1:
            max_results = 1
        if max_results > 10:
            max_results = 10

        # Resolve API key from multiple sources (env, settings, or file)
        api_key = os.getenv("YOUTUBE_API_KEY") or os.getenv("YT_API_KEY")
        if not api_key:
            # pydantic Settings loads .env for local runs
            api_key = settings.youtube_api_key
        if not api_key:
            # optional file-based secret pattern
            key_file = os.getenv("YOUTUBE_API_KEY_FILE", "")
            if key_file and os.path.isfile(key_file):
                try:
                    with open(key_file, "r", encoding="utf-8") as fh:
                        api_key = fh.read().strip()
                except Exception:
                    api_key = None
        if not api_key:
            # Graceful but explicit
            raise RuntimeError("YouTube API key not configured.")

        # cache first
        ckey = self._cache_key(q, max_results)
        cached = self._get_cached(ckey)
        if cached is not None:
            return cached

        params = {
            "part": "snippet",
            "q": q,
            "type": "video",
            "maxResults": max_results,
            "key": api_key,
            "safeSearch": "moderate",
        }

        try:
            resp = requests.get(self.BASE_URL, params=params, timeout=8)
        except requests.RequestException as e:
            raise RuntimeError(f"Network error: {e}")

        if resp.status_code != 200:
            # Try to surface API error message if any
            try:
                data = resp.json()
                msg = data.get("error", {}).get("message", "Unknown error")
            except Exception:
                msg = resp.text[:200]
            raise RuntimeError(f"YouTube API error ({resp.status_code}): {msg}")

        try:
            data = resp.json()
            items = data.get("items", [])
            results: List[Dict[str, Any]] = []
            for it in items:
                vid = it.get("id", {}).get("videoId")
                if not vid:
                    continue
                snip = it.get("snippet", {})
                title = snip.get("title", "Untitled")
                thumbs = snip.get("thumbnails", {})
                # choose medium, fallback to default
                thumb = (
                    thumbs.get("medium", {}).get("url")
                    or thumbs.get("default", {}).get("url")
                    or ""
                )
                results.append({
                    "id": vid,
                    "url": f"https://www.youtube.com/watch?v={vid}",
                    "title": title,
                    "thumbnail": thumb,
                    "channelTitle": snip.get("channelTitle", ""),
                    "publishedAt": snip.get("publishedAt", ""),
                })
            # uniqueness by id and trim
            uniq: Dict[str, Dict[str, Any]] = {}
            for r in results:
                uniq.setdefault(r["id"], r)
            results = list(uniq.values())[:max_results]
        except Exception as e:
            raise RuntimeError(f"Malformed API response: {e}")

        self._set_cached(ckey, results)
        return results


# Singleton instance
youtube_service = YouTubeService()
