import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
import aiofiles
from fastapi import UploadFile
from config import settings
from utils import extract_pdf_info, generate_pdf_outline
from models import DocumentInfo

# Import modular components
from .documents.index_manager import IndexManager
from .documents.file_handler import FileHandler
from .documents.document_operations import DocumentOperations
from .documents.outline_manager import OutlineManager
from .documents.utils import DocumentUtils


class DocumentService:
    INDEX_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "documents_index.json")

    def __init__(self):
        # Initialize modular components
        self.index_manager = IndexManager(self.INDEX_FILE)
        self.file_handler = FileHandler()
        self.document_operations = DocumentOperations()
        self.outline_manager = OutlineManager()
        self.utils = DocumentUtils()
        
        # Initialize data structures
        self.documents: Dict[str, DocumentInfo] = {}
        self._id_filename_map: Dict[str, str] = {}
        
        # Load data
        self._rebuild_index_from_files()  # Always rebuild from actual files
        self._load_existing_documents()

    def _rebuild_index_from_files(self):
        """Rebuild index completely from actual files on disk, ignoring any existing index"""
        self.index_manager.rebuild_index_from_files()
        self._id_filename_map = self.index_manager.get_id_filename_map()

    def _save_index(self):
        """Save index with validation and atomic write"""
        self.index_manager._id_filename_map = self._id_filename_map
        self.index_manager.save_index()
        
    def _load_existing_documents(self):
        """Load existing documents from storage using index mapping"""
        self.document_operations.load_existing_documents(self._id_filename_map)
        self.documents = self.document_operations.get_documents_dict()
    
    @staticmethod
    def _sanitize_filename(name: str) -> str:
        """Remove path components and restrict characters"""
        return DocumentUtils.sanitize_filename(name)

    def _ensure_unique_filename(self, filename: str) -> str:
        """Ensure filename is unique in upload folder"""
        return self.utils.ensure_unique_filename(filename)

    def _check_duplicate_document(self, filename: str) -> Optional[DocumentInfo]:
        """Check if document is duplicate based on exact filename matching"""
        return self.file_handler.check_duplicate_document(filename, self.documents)

    async def upload_document(self, file: UploadFile) -> DocumentInfo:
        """Upload a new document keeping original filename and outline base"""
        doc_info = await self.file_handler.upload_document(file, self.documents)
        
        # If it's a duplicate, return the existing document
        if doc_info.id in self.documents:
            return doc_info
        
        # Generate outline for new document
        doc_info = self.outline_manager.generate_and_save_outline(doc_info)
        
        # Add to index and runtime
        self._id_filename_map[doc_info.id] = doc_info.filename
        self._save_index()
        self.documents[doc_info.id] = doc_info
        
        # Refresh search / connection indexes (best-effort)
        try:
            from services.search_service import search_service  # local import
            from services.connection_service import connection_service  # local import
            search_service._build_search_index()
            if hasattr(connection_service, 'heading_metadata'):
                delattr(connection_service, 'heading_metadata')
            if hasattr(connection_service, 'document_vectors'):
                connection_service.document_vectors = {}
            print(f"🔄 Refreshed search indexes")
        except Exception as e:
            print(f"⚠️ Index refresh warning: {e}")

        return doc_info
    
    async def bulk_upload_documents(self, files: List[UploadFile]) -> List[DocumentInfo]:
        """Upload multiple documents with duplicate checking"""
        documents = []
        print(f"📦 Bulk upload started: {len(files)} files")
        print(f"📊 Index state before bulk upload: {len(self._id_filename_map)} entries")
        
        for i, file in enumerate(files, 1):
            print(f"📄 Processing file {i}/{len(files)}: {file.filename}")
            try:
                doc = await self.upload_document(file)
                documents.append(doc)
                print(f"✅ File {i} completed: {doc.filename}")
            except Exception as e:
                print(f"❌ File {i} failed ({file.filename}): {e}")
                # Continue with other files instead of failing entire batch
                continue
        
        print(f"📊 Index state after bulk upload: {len(self._id_filename_map)} entries")
        
        # After bulk upload ensure index built once (local import to avoid circular)
        try:
            from services.search_service import search_service  # local import
            search_service._build_search_index()
            print(f"🔄 Bulk upload index refresh completed")
        except Exception as e:
            print(f"⚠️ Bulk index build warning: {e}")
        
        print(f"📦 Bulk upload completed: {len(documents)}/{len(files)} successful")
        return documents
    
    def get_document(self, doc_id: str) -> Optional[DocumentInfo]:
        """Get document by ID with automatic cleanup if file is missing"""
        doc = self.document_operations.get_document(doc_id)
        if doc is None:
            # Clean up from index if document was removed
            if doc_id in self._id_filename_map:
                del self._id_filename_map[doc_id]
                self._save_index()
        else:
            # Update local documents dict
            self.documents = self.document_operations.get_documents_dict()
        return doc
    
    def get_all_documents(self) -> List[DocumentInfo]:
        """Get all documents with automatic cleanup of missing files"""
        documents = self.document_operations.get_all_documents()
        
        # Update local state
        self.documents = self.document_operations.get_documents_dict()
        
        # Sync index with cleaned documents
        current_ids = set(self.documents.keys())
        index_ids = set(self._id_filename_map.keys())
        
        # Remove stale entries from index
        stale_index_ids = index_ids - current_ids
        if stale_index_ids:
            for doc_id in stale_index_ids:
                del self._id_filename_map[doc_id]
            self._save_index()
        
        return documents

    def get_document_by_filename(self, filename: str) -> Optional[DocumentInfo]:
        """Get a document by its filename (exact match)"""
        return self.document_operations.get_document_by_filename(filename)
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document and its associated files"""
        doc = self.document_operations.get_document(doc_id)
        if not doc:
            return False
        
        # Delete files
        if not self.file_handler.delete_document_files(doc):
            return False
        
        # Remove from index
        self.index_manager.remove_document_from_index(doc_id)
        self._id_filename_map = self.index_manager.get_id_filename_map()
        
        # Remove from runtime
        self.document_operations.remove_document(doc_id)
        self.documents = self.document_operations.get_documents_dict()
        
        return True
    
    def sync_with_filesystem(self) -> None:
        """Manually sync the document index with actual files on disk"""
        print("🔄 Syncing document index with filesystem...")
        
        # Sync index manager
        self.index_manager.sync_with_filesystem()
        self._id_filename_map = self.index_manager.get_id_filename_map()
        
        # Reload documents
        self._load_existing_documents()
        
        print(f"✅ Sync completed. Active documents: {len(self.documents)}")

    def get_document_outline(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get document outline by ID"""
        doc = self.get_document(doc_id)
        return self.outline_manager.get_document_outline(doc)

# Create singleton instance
document_service = DocumentService()