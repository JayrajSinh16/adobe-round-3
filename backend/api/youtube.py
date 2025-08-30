from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel, Field

from services.youtube_service import youtube_service


router = APIRouter()


class YouTubeRecommendRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Free-form text to search relevant YouTube videos")
    limit: Optional[int] = Field(5, ge=1, le=10, description="Max number of links to return")


class YouTubeVideo(BaseModel):
    id: str
    url: str
    title: str
    thumbnail: Optional[str] = None
    channelTitle: Optional[str] = None
    publishedAt: Optional[str] = None


class YouTubeRecommendResponse(BaseModel):
    links: List[YouTubeVideo]


@router.get("/recommend", response_model=YouTubeRecommendResponse)
async def recommend_videos(
    text: str = Query(..., min_length=1, description="Free-form text to search relevant YouTube videos"),
    limit: int = Query(5, ge=1, le=10, description="Max number of links to return"),
) -> YouTubeRecommendResponse:
    """Return YouTube video links related to the input text.

    Always returns a JSON object: { "links": [ ... ] }
    """
    try:
        links = youtube_service.recommend(text, max_results=limit)
        return YouTubeRecommendResponse(links=links)
    except ValueError as ve:
        # Input validation issues → 400
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        # Config/API/network issues → 502 to indicate upstream problem
        raise HTTPException(status_code=502, detail=str(re))
    except Exception:
        # Catch-all safety
        raise HTTPException(status_code=500, detail="Internal error while fetching recommendations")


@router.post("/recommend", response_model=YouTubeRecommendResponse)
async def recommend_videos_json(payload: YouTubeRecommendRequest) -> YouTubeRecommendResponse:
    """JSON body variant for frontend usage.

    Body: { "text": "...", "limit": 5 }
    Response: { "links": [ ... ] }
    """
    try:
        links = youtube_service.recommend(payload.text, max_results=payload.limit or 5)
        return YouTubeRecommendResponse(links=links)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=502, detail=str(re))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal error while fetching recommendations")
