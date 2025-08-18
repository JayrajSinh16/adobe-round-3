# Insights endpoints
from fastapi import APIRouter
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
            insight_types=request.insight_types,
        )
        return response
    except Exception as e:
        # Return a safe empty response instead of 500 to keep UX smooth
        print(f"/api/insights/generate error: {e}")
        return InsightResponse(insights=[], selected_text=request.selected_text, processing_time=0.0)