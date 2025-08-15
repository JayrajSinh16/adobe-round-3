from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentUpload(BaseModel):
    filename: str
    content_type: str = "application/pdf"

class DocumentInfo(BaseModel):
    id: str
    filename: str
    filepath: str
    outline_path: Optional[str] = None
    upload_time: datetime
    has_outline: bool = False
    page_count: Optional[int] = None

class DocumentOutline(BaseModel):
    title: str
    outline: List[Dict[str, Any]]

class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int