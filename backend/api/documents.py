# Document endpoints
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from models import DocumentInfo, DocumentListResponse, DocumentOutline
from services import document_service

router = APIRouter()

@router.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    """Upload a single PDF document"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check file size (50MB limit)
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB in bytes
        raise HTTPException(status_code=400, detail="File size must be less than 50MB")
    
    # Reset file pointer after reading
    await file.seek(0)
    
    try:
        document = await document_service.upload_document(file)
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-upload", response_model=List[DocumentInfo])
async def bulk_upload_documents(files: List[UploadFile] = File(...)):
    """Upload multiple PDF documents"""
    # Validate all files are PDFs and check file sizes
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} is not a PDF"
            )
        
        # Check file size (50MB limit)
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:  # 50MB in bytes
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} exceeds 50MB size limit"
            )
        
        # Reset file pointer after reading
        await file.seek(0)
    
    try:
        documents = await document_service.bulk_upload_documents(files)
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=DocumentListResponse)
async def list_documents():
    """Get list of all documents"""
    documents = document_service.get_all_documents()
    return DocumentListResponse(
        documents=documents,
        total=len(documents)
    )

@router.post("/sync")
async def sync_documents():
    """Sync document index with filesystem (useful after manual file operations)"""
    try:
        document_service.sync_with_filesystem()
        documents = document_service.get_all_documents()
        return {
            "message": "Document index synced successfully",
            "total_documents": len(documents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=DocumentInfo)
async def get_document(document_id: str):
    """Get document by ID"""
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/{document_id}/outline", response_model=DocumentOutline)
async def get_document_outline(document_id: str):
    """Get document outline"""
    outline = document_service.get_document_outline(document_id)
    if not outline:
        raise HTTPException(status_code=404, detail="Outline not found")
    return DocumentOutline(**outline)

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    success = document_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}