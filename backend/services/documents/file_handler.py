"""
File handler module for document upload and storage operations.
"""

import os
import uuid
from typing import List, Optional
from datetime import datetime
import aiofiles
from fastapi import UploadFile
from config import settings
from models import DocumentInfo


class FileHandler:
    """Handles file upload, storage, and validation operations."""
    
    def check_duplicate_document(self, filename: str, existing_documents: dict) -> Optional[DocumentInfo]:
        """Check if document is duplicate based on exact filename matching.
        Returns existing document if exact duplicate found, preventing new upload.
        Allows numbered variants like file01_1.pdf, file01_2.pdf but blocks exact duplicates.
        """
        for doc in existing_documents.values():
            if doc.filename == filename:
                print(f"🚫 DUPLICATE BLOCKED: {filename} already exists")
                print(f"   Exact filename '{filename}' already exists in the system")
                print(f"   Existing file: {doc.filename}")
                print(f"   Blocked upload: {filename}")
                
                # Return the existing document to prevent upload of exact duplicate
                return doc
        
        print(f"✅ NEW FILE ALLOWED: {filename}")
        return None
    
    async def save_uploaded_file(self, file: UploadFile, filename: str) -> str:
        """Save uploaded file to storage and return filepath"""
        # Ensure storage directories exist
        os.makedirs(settings.upload_folder, exist_ok=True)
        
        filepath = os.path.join(settings.upload_folder, filename)
        
        # Save uploaded file
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        print(f"💾 Saved PDF: {filepath}")
        return filepath
    
    async def upload_document(self, file: UploadFile, existing_documents: dict) -> DocumentInfo:
        """Upload a new document keeping original filename and outline base.
        - Checks for duplicates before uploading
        - Stores PDF with user provided name (sanitized & deduplicated)
        - Outline JSON saved as <original_base>.json
        - Maintains internal ID for referencing
        """
        # Sanitize filename first
        from .utils import DocumentUtils
        utils = DocumentUtils()
        original_name = utils.sanitize_filename(file.filename)
        if not original_name.lower().endswith('.pdf'):
            original_name += '.pdf'
        
        # Check for duplicates before processing
        duplicate_doc = self.check_duplicate_document(original_name, existing_documents)
        if duplicate_doc:
            print(f"🚫 UPLOAD BLOCKED: {original_name} is a duplicate")
            print(f"   Existing document: {duplicate_doc.filename} (ID: {duplicate_doc.id[:8]}...)")
            print(f"   Upload prevented to avoid duplicates")
            return duplicate_doc
        
        print(f"📄 Processing new document upload: {original_name}")
        
        doc_id = str(uuid.uuid4())
        filepath = await self.save_uploaded_file(file, original_name)
        
        # Extract PDF info
        from utils import extract_pdf_info
        pdf_info = extract_pdf_info(filepath)
        
        doc_info = DocumentInfo(
            id=doc_id,
            filename=original_name,
            filepath=filepath,
            outline_path=None,  # Will be set by outline manager
            upload_time=datetime.now(),
            has_outline=False,  # Will be updated by outline manager
            page_count=pdf_info.get("page_count")
        )
        
        print(f"✅ Document upload completed: {original_name}")
        return doc_info
    
    async def bulk_upload_documents(self, files: List[UploadFile], existing_documents: dict) -> List[DocumentInfo]:
        """Upload multiple documents with duplicate checking"""
        documents = []
        print(f"📦 Bulk upload started: {len(files)} files")
        
        for i, file in enumerate(files, 1):
            print(f"📄 Processing file {i}/{len(files)}: {file.filename}")
            try:
                doc = await self.upload_document(file, existing_documents)
                documents.append(doc)
                print(f"✅ File {i} completed: {doc.filename}")
            except Exception as e:
                print(f"❌ File {i} failed ({file.filename}): {e}")
                # Continue with other files instead of failing entire batch
                continue
        
        print(f"📦 Bulk upload completed: {len(documents)}/{len(files)} successful")
        return documents
    
    def delete_document_files(self, doc_info: DocumentInfo) -> bool:
        """Delete document files from storage"""
        try:
            # Delete PDF file
            if os.path.exists(doc_info.filepath):
                os.remove(doc_info.filepath)
            
            # Delete outline file
            if doc_info.outline_path and os.path.exists(doc_info.outline_path):
                os.remove(doc_info.outline_path)
            
            return True
        except Exception as e:
            print(f"Error deleting files for {doc_info.filename}: {e}")
            return False
