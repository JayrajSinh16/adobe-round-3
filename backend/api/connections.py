from fastapi import APIRouter
from models import ConnectionRequest, ConnectionResponse
from services import connection_service

router = APIRouter()

@router.post("/find", response_model=ConnectionResponse)
async def find_connections(request: ConnectionRequest):
    """Find connections for selected text across all documents"""
    try:
        response = connection_service.find_connections(
            selected_text=request.selected_text,
            current_doc_id=request.current_document_id,
            context_before=request.context_before,
            context_after=request.context_after,
        )
        return response
    except Exception as e:
        # Return a safe empty response instead of 500 to keep UX smooth
        print(f"/api/connections/find error: {e}")
        return ConnectionResponse(connections=[], summary="", processing_time=0.0)