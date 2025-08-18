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

class DocumentService:
    INDEX_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "documents_index.json")

    def __init__(self):
        self.documents: Dict[str, DocumentInfo] = {}
        self._id_filename_map: Dict[str, str] = {}
        self._rebuild_index_from_files()  # Always rebuild from actual files
        self._load_existing_documents()

    def _rebuild_index_from_files(self):
        """Rebuild index completely from actual files on disk, ignoring any existing index"""
        print("🔄 Rebuilding index from actual files...")
        
        # Clear any existing data
        self._id_filename_map.clear()
        
        # Scan actual PDF files
        if not os.path.exists(settings.upload_folder):
            print("📁 Upload folder doesn't exist, starting with empty index")
            self._save_index()
            return
        
        actual_files = []
        for file_path in Path(settings.upload_folder).glob("*.pdf"):
            actual_files.append(file_path.name)
        
        print(f"📁 Found {len(actual_files)} actual PDF files")
        
        # Try to load existing index to preserve IDs for existing files
        existing_index = {}
        if os.path.exists(self.INDEX_FILE):
            try:
                with open(self.INDEX_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if isinstance(data, dict):
                    existing_index = data
                elif isinstance(data, list):
                    for entry in data:
                        if isinstance(entry, dict) and 'id' in entry and 'filename' in entry:
                            existing_index[entry['id']] = entry['filename']
            except Exception as e:
                print(f"⚠️ Could not read existing index: {e}")
        
        # Build clean index - one entry per actual file
        file_to_id = {}
        for doc_id, filename in existing_index.items():
            if filename in actual_files and filename not in file_to_id:
                file_to_id[filename] = doc_id
                self._id_filename_map[doc_id] = filename
        
        # Generate new IDs for files that don't have them
        for filename in actual_files:
            if filename not in file_to_id:
                new_id = str(uuid.uuid4())
                self._id_filename_map[new_id] = filename
                print(f"🆕 Generated new ID for {filename}: {new_id[:8]}...")
        
        print(f"✅ Rebuilt clean index with {len(self._id_filename_map)} entries")
        
        # Save the clean index
        self._save_index()

    def _save_index(self):
        """Save index with validation and atomic write"""
        try:
            # Validate entries before saving
            valid_entries = {}
            cleaned_count = 0
            
            for doc_id, filename in self._id_filename_map.items():
                pdf_path = os.path.join(settings.upload_folder, filename)
                if os.path.exists(pdf_path):
                    valid_entries[doc_id] = filename
                else:
                    cleaned_count += 1
                    print(f"🗑️ Skipping invalid entry during save: {doc_id[:8]}... -> {filename}")
            
            if cleaned_count > 0:
                print(f"🧹 Cleaned {cleaned_count} invalid entries during save")
                self._id_filename_map = valid_entries
            
            # Atomic write
            os.makedirs(os.path.dirname(self.INDEX_FILE), exist_ok=True)
            temp_file = self.INDEX_FILE + ".tmp"
            
            with open(temp_file, 'w', encoding='utf-8') as f:
                json.dump(self._id_filename_map, f, indent=2)
            
            # Atomic rename
            if os.path.exists(self.INDEX_FILE):
                os.replace(temp_file, self.INDEX_FILE)
            else:
                os.rename(temp_file, self.INDEX_FILE)
                
            print(f"💾 Saved clean index with {len(self._id_filename_map)} entries")
            
        except Exception as e:
            print(f"Failed to save index: {e}")
            # Clean up temp file if it exists
            temp_file = self.INDEX_FILE + ".tmp"
            if os.path.exists(temp_file):
                os.remove(temp_file)
    
    def _load_existing_documents(self):
        """Load existing documents from storage using index mapping"""
        if not os.path.exists(settings.upload_folder):
            return
        for doc_id, filename in self._id_filename_map.items():
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
    
    @staticmethod
    def _sanitize_filename(name: str) -> str:
        # Remove path components and restrict characters
        name = os.path.basename(name).strip().replace('\\', '_').replace('/', '_')
        # Prevent empty
        return name or f"document_{uuid.uuid4().hex}.pdf"

    def _ensure_unique_filename(self, filename: str) -> str:
        base, ext = os.path.splitext(filename)
        counter = 1
        final = filename
        existing_files = set(os.listdir(settings.upload_folder)) if os.path.exists(settings.upload_folder) else set()
        while final in existing_files:
            final = f"{base}_{counter}{ext}"
            counter += 1
        return final

    def _check_duplicate_document(self, filename: str) -> Optional[DocumentInfo]:
        """Check if document is duplicate based on exact filename matching.
        Returns existing document if exact duplicate found, preventing new upload.
        Allows numbered variants like file01_1.pdf, file01_2.pdf but blocks exact duplicates.
        """
        for doc in self.documents.values():
            if doc.filename == filename:
                print(f"🚫 DUPLICATE BLOCKED: {filename} already exists")
                print(f"   Exact filename '{filename}' already exists in the system")
                print(f"   Existing file: {doc.filename}")
                print(f"   Blocked upload: {filename}")
                
                # Return the existing document to prevent upload of exact duplicate
                return doc
        
        print(f"✅ NEW FILE ALLOWED: {filename}")
        return None

    async def upload_document(self, file: UploadFile) -> DocumentInfo:
        """Upload a new document keeping original filename and outline base.
        - Checks for duplicates before uploading
        - Stores PDF with user provided name (sanitized & deduplicated)
        - Outline JSON saved as <original_base>.json
        - Maintains internal ID for referencing
        """
        # Sanitize filename first
        original_name = self._sanitize_filename(file.filename)
        if not original_name.lower().endswith('.pdf'):
            original_name += '.pdf'
        
        # Check for duplicates before processing
        duplicate_doc = self._check_duplicate_document(original_name)
        if duplicate_doc:
            print(f"🚫 UPLOAD BLOCKED: {original_name} is a duplicate")
            print(f"   Existing document: {duplicate_doc.filename} (ID: {duplicate_doc.id[:8]}...)")
            print(f"   Upload prevented to avoid duplicates")
            return duplicate_doc
        
        print(f"📄 Processing new document upload: {original_name}")
        
        # Ensure storage directories exist
        os.makedirs(settings.upload_folder, exist_ok=True)
        os.makedirs(settings.outline_folder, exist_ok=True)

        doc_id = str(uuid.uuid4())
        filepath = os.path.join(settings.upload_folder, original_name)

        # Save uploaded file
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)

        print(f"💾 Saved PDF: {filepath}")

        pdf_info = extract_pdf_info(filepath)

        # Generate & persist outline with same base name
        print(f"📋 Generating outline...")
        outline = generate_pdf_outline(filepath)
        base_name = os.path.splitext(original_name)[0]
        outline_path = os.path.join(settings.outline_folder, f"{base_name}.json")
        try:
            with open(outline_path, 'w', encoding='utf-8') as f:
                json.dump(outline, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved outline: {outline_path}")
        except Exception as e:
            print(f"❌ Failed to write outline for {original_name}: {e}")
            outline_path = None

        doc_info = DocumentInfo(
            id=doc_id,
            filename=original_name,
            filepath=filepath,
            outline_path=outline_path,
            upload_time=datetime.now(),
            has_outline=outline_path is not None,
            page_count=pdf_info.get("page_count")
        )

        # Persist mapping index
        self._id_filename_map[doc_id] = original_name
        self._save_index()

        # Register in runtime instance
        self.documents[doc_id] = doc_info

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

        print(f"✅ Document upload completed: {original_name}")
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
        doc = self.documents.get(doc_id)
        if doc is None:
            return None
        
        # Check if file still exists on disk
        if not os.path.exists(doc.filepath):
            print(f"🗑️ Document file missing for {doc.filename}, cleaning up entry")
            
            # Remove from runtime
            del self.documents[doc_id]
            
            # Remove from index mapping
            if doc_id in self._id_filename_map:
                del self._id_filename_map[doc_id]
            
            # Save updated index
            self._save_index()
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
                
                # Remove from index mapping
                if doc_id in self._id_filename_map:
                    del self._id_filename_map[doc_id]
            
            # Save updated index
            self._save_index()
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
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document and its associated files"""
        if doc_id not in self.documents:
            return False
        
        doc = self.documents[doc_id]
        
        # Delete PDF file
        if os.path.exists(doc.filepath):
            os.remove(doc.filepath)
        
        # Delete outline file
        if doc.outline_path and os.path.exists(doc.outline_path):
            os.remove(doc.outline_path)
        
        # Remove from index
        if doc_id in self._id_filename_map:
            del self._id_filename_map[doc_id]
            self._save_index()
        
        # Remove from runtime
        del self.documents[doc_id]
        
        return True
    
    def sync_with_filesystem(self) -> None:
        """Manually sync the document index with actual files on disk.
        This will clean up stale entries and add any missing files."""
        print("🔄 Syncing document index with filesystem...")
        
        # Rebuild index to catch any new files
        self._rebuild_index_from_files()
        
        # Reload documents to update metadata
        self._load_existing_documents()
        
        print(f"✅ Sync completed. Active documents: {len(self.documents)}")

    def get_document_outline(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get document outline by ID"""
        doc = self.get_document(doc_id)
        if not doc or not doc.outline_path or not os.path.exists(doc.outline_path):
            return None
        
        try:
            with open(doc.outline_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to read outline for {doc_id}: {e}")
            return None

# Create singleton instance
document_service = DocumentService()