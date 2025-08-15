from pydantic import BaseModel
from typing import List, Dict, Optional

class ConnectionRequest(BaseModel):
    selected_text: str
    current_document_id: str
    current_page: int
    context_before: Optional[str] = ""
    context_after: Optional[str] = ""

class ConnectionSnippet(BaseModel):
    heading: str
    page_number: int
    pdf_name: str
    pdf_id: str
    snippet: str
    relevance_score: float

class ConnectionResponse(BaseModel):
    connections: List[ConnectionSnippet]
    summary: str  # LLM-generated summary
    processing_time: float