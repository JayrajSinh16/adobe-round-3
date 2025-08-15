# Insights endpoints
from fastapi import APIRouter, HTTPException
from models import InsightRequest, InsightResponse
from services import insights_service

router = APIRouter()

@router.post("/generate", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """Generate insights for selected text"""
    try:
        response = insights_service.generate_insights(
            selected_text=request.selected_text,
            document_id=request.document_id,
            page_number=request.page_number,
            insight_types=request.insight_types
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))