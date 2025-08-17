# Individual Insights endpoints for each insight type
from fastapi import APIRouter, HTTPException
from models.individual_insights_model import (
    IndividualInsightRequest, KeyTakeawayResponse, DidYouKnowResponse,
    ContradictionsResponse, ExamplesResponse, CrossReferencesResponse
)
from services.individual_insights_service import individual_insights_service

router = APIRouter()

@router.post("/key-takeaway", response_model=KeyTakeawayResponse)
async def generate_key_takeaway(request: IndividualInsightRequest):
    """Generate structured key takeaway analysis"""
    try:
        if request.insight_type != "key_takeaway":
            raise HTTPException(status_code=400, detail="Invalid insight_type for this endpoint")
        
        response = individual_insights_service.generate_key_takeaway(
            selected_text=request.selected_text,
            document_id=request.document_id,
            page_no=request.page_no,
            original_insight=request.respond
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating key takeaway: {str(e)}")

@router.post("/did-you-know", response_model=DidYouKnowResponse)
async def generate_did_you_know(request: IndividualInsightRequest):
    """Generate structured did you know analysis"""
    try:
        if request.insight_type != "did_you_know":
            raise HTTPException(status_code=400, detail="Invalid insight_type for this endpoint")
        
        response = individual_insights_service.generate_did_you_know(
            selected_text=request.selected_text,
            document_id=request.document_id,
            page_no=request.page_no,
            original_insight=request.respond
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating did you know: {str(e)}")

@router.post("/contradictions", response_model=ContradictionsResponse)
async def generate_contradictions(request: IndividualInsightRequest):
    """Generate structured contradictions analysis"""
    try:
        if request.insight_type != "contradictions":
            raise HTTPException(status_code=400, detail="Invalid insight_type for this endpoint")
        
        response = individual_insights_service.generate_contradictions(
            selected_text=request.selected_text,
            document_id=request.document_id,
            page_no=request.page_no,
            original_insight=request.respond
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating contradictions: {str(e)}")

@router.post("/examples", response_model=ExamplesResponse)
async def generate_examples(request: IndividualInsightRequest):
    """Generate structured examples analysis"""
    try:
        if request.insight_type != "examples":
            raise HTTPException(status_code=400, detail="Invalid insight_type for this endpoint")
        
        response = individual_insights_service.generate_examples(
            selected_text=request.selected_text,
            document_id=request.document_id,
            page_no=request.page_no,
            original_insight=request.respond
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating examples: {str(e)}")

@router.post("/cross-references", response_model=CrossReferencesResponse)
async def generate_cross_references(request: IndividualInsightRequest):
    """Generate structured cross references analysis"""
    try:
        if request.insight_type != "cross_references":
            raise HTTPException(status_code=400, detail="Invalid insight_type for this endpoint")
        
        response = individual_insights_service.generate_cross_references(
            selected_text=request.selected_text,
            document_id=request.document_id,
            page_no=request.page_no,
            original_insight=request.respond
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cross references: {str(e)}")
