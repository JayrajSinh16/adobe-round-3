"""
Document operations module for CRUD operations and document management.
"""

import os
from typing import List, Dict, Optional
from datetime import datetime
from models import DocumentInfo
from config import settings


class DocumentOperations:
    """Handles document CRUD operations and management."""
    
    def __init__(self):
        self.documents: Dict[str, DocumentInfo] = {}
    
    def load_existing_documents(self, id_filename_map: Dict[str, str]):
        """Load existing documents from storage using index mapping"""
        self.documents.clear()
        
        if not os.path.exists(settings.upload_folder):
            return
            
        for doc_id, filename in id_filename_map.items():
            pdf_path = os.path.join(settings.upload_folder, filename)
            if not os.path.exists(pdf_path):
                continue
                
            base_name = os.path.splitext(filename)[0]
            outline_path = os.path.join(settings.outline_folder, f"{base_name}.json")
            
            self.documents[doc_id] = DocumentInfo(
                id=doc_id,
                filename=filename,
                filepath=pdf_path,
                outline_path=outline_path if os.path.exists(outline_path) else None,
                upload_time=datetime.fromtimestamp(os.path.getctime(pdf_path)),
                has_outline=os.path.exists(outline_path),
                page_count=None
            )
    
    def get_document(self, doc_id: str) -> Optional[DocumentInfo]:
        """Get document by ID with automatic cleanup if file is missing"""
        doc = self.documents.get(doc_id)
        if doc is None:
            return None
        
        # Check if file still exists on disk
        if not os.path.exists(doc.filepath):
            print(f"🗑️ Document file missing for {doc.filename}, cleaning up entry")
            
            # Remove from runtime
            del self.documents[doc_id]
            return None
        
        return doc
    
    def get_all_documents(self) -> List[DocumentInfo]:
        """Get all documents with automatic cleanup of missing files"""
        # Check for manually deleted files and clean up stale entries
        stale_docs = []
        for doc_id, doc in self.documents.items():
            if not os.path.exists(doc.filepath):
                stale_docs.append(doc_id)
                print(f"🗑️ Found stale entry: {doc.filename} (file missing from disk)")
        
        # Remove stale entries
        if stale_docs:
            print(f"🧹 Cleaning up {len(stale_docs)} stale document entries")
            for doc_id in stale_docs:
                doc = self.documents[doc_id]
                print(f"   Removing: {doc.filename}")
                
                # Remove from runtime
                del self.documents[doc_id]
            
            print(f"✅ Cleanup completed. Now showing {len(self.documents)} valid documents")
        
        return list(self.documents.values())
    
    def get_document_by_filename(self, filename: str) -> Optional[DocumentInfo]:
        """Get a document by its filename (exact match).
        This helps map connections that come back with document names.
        """
        if not filename:
            return None
            
        # Exact match first
        for doc in self.documents.values():
            if doc.filename == filename:
                return doc
                
        # Try a relaxed match ignoring common duplicate suffixes and case
        import os as _os
        import re as _re
        target_base = _os.path.splitext(filename)[0]
        target_base = _re.sub(r'_\d+$', '', target_base).lower()
        
        for doc in self.documents.values():
            base = _os.path.splitext(doc.filename)[0]
            base = _re.sub(r'_\d+$', '', base).lower()
            if base == target_base:
                return doc
                
        return None
    
    def add_document(self, doc_info: DocumentInfo):
        """Add a document to the runtime collection"""
        self.documents[doc_info.id] = doc_info
    
    def remove_document(self, doc_id: str) -> bool:
        """Remove a document from the runtime collection"""
        if doc_id in self.documents:
            del self.documents[doc_id]
            return True
        return False
    
    def get_documents_dict(self) -> Dict[str, DocumentInfo]:
        """Get the documents dictionary"""
        return self.documents
