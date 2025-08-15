from pydantic import BaseModel
from typing import List, Optional, Literal

class PodcastRequest(BaseModel):
    selected_text: str
    document_id: str
    connections: List[str]  # List of connection IDs
    insights: List[str]  # List of insight IDs
    format: Literal["podcast", "overview"] = "podcast"
    duration: Literal["short", "medium", "long"] = "medium"  # 2, 3.5, 5 minutes

class PodcastScript(BaseModel):
    speaker: str
    text: str
    timestamp: float

class PodcastResponse(BaseModel):
    audio_url: str
    transcript: List[PodcastScript]
    duration: float
    format: str