from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from services import search_service

router = APIRouter()

@router.get("/headings")
async def search_headings(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Maximum number of results")
) -> List[Dict[str, Any]]:
    """Search for headings across all PDFs"""
    try:
        results = search_service.search_headings(query, limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-level/{level}")
async def get_headings_by_level(level: str) -> List[Dict[str, Any]]:
    """Get all headings of a specific level (H1, H2, H3, etc.)"""
    try:
        results = search_service.search_by_level(level)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))