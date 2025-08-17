from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any

class SourceDocument(BaseModel):
    pdf_name: str
    pdf_id: str
    page: int

class Insight(BaseModel):
    type: str
    title: str
    content: str
    source_documents: List[SourceDocument]
    confidence: float

class PodcastRequest(BaseModel):
    selected_text: str
    insights: List[Insight]
    format: Literal["podcast", "overview"] = "podcast"
    duration: Literal["short", "medium", "long"] = "medium"

class PodcastScript(BaseModel):
    speaker: str
    text: str

class PodcastResponse(BaseModel):
    audio_url: str
    transcript: List[PodcastScript]
    duration: float
    format: str