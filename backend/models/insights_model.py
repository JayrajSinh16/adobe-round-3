from pydantic import BaseModel
from typing import Any, List, Dict, Optional, Literal

class InsightRequest(BaseModel):
    selected_text: str
    document_id: str
    page_number: int
    insight_types: Optional[List[Literal[
        "key_takeaways",
        "contradictions",
        "examples", 
        "cross_references",
        "did_you_know"
    ]]] = [
        "key_takeaways",
        "contradictions",
        "examples",
        "cross_references", 
        "did_you_know"
    ]

class Insight(BaseModel):
    type: str
    title: str
    content: str
    source_documents: List[Dict[str, Any]]  # References to source PDFs
    confidence: float

class InsightResponse(BaseModel):
    insights: List[Insight]
    selected_text: str
    processing_time: float