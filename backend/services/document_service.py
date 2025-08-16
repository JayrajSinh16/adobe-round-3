import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import aiofiles
from fastapi import UploadFile
from config import settings
from utils import extract_pdf_info, generate_pdf_outline
from models import DocumentInfo

class DocumentService:
    INDEX_FILE = "storage/documents_index.json"

    def __init__(self):
        self.documents: Dict[str, DocumentInfo] = {}
        self._id_filename_map: Dict[str, str] = {}
        self._load_index()
        self._load_existing_documents()

    def _load_index(self):
        if os.path.exists(self.INDEX_FILE):
            try:
                with open(self.INDEX_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if isinstance(data, list):  # backwards compatibility
                    for entry in data:
                        if isinstance(entry, dict) and 'id' in entry and 'filename' in entry:
                            self._id_filename_map[entry['id']] = entry['filename']
                elif isinstance(data, dict):
                    self._id_filename_map.update(data)
            except Exception as e:
                print(f"Failed to load index: {e}")

    def _save_index(self):
        try:
            os.makedirs(os.path.dirname(self.INDEX_FILE), exist_ok=True)
            with open(self.INDEX_FILE, 'w', encoding='utf-8') as f:
                json.dump(self._id_filename_map, f, indent=2)
        except Exception as e:
            print(f"Failed to save index: {e}")
    
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

    async def upload_document(self, file: UploadFile) -> DocumentInfo:
        """Upload a new document keeping original filename and outline base.
        - Stores PDF with user provided name (sanitized & deduplicated)
        - Outline JSON saved as <original_base>.json
        - Maintains internal ID for referencing
        """
        # Ensure storage directories exist
        os.makedirs(settings.upload_folder, exist_ok=True)
        os.makedirs(settings.outline_folder, exist_ok=True)

        doc_id = str(uuid.uuid4())
        original_name = self._sanitize_filename(file.filename)
        if not original_name.lower().endswith('.pdf'):
            original_name += '.pdf'
        original_name = self._ensure_unique_filename(original_name)
        filepath = os.path.join(settings.upload_folder, original_name)

        # Save uploaded file
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)

        pdf_info = extract_pdf_info(filepath)

        # Generate & persist outline with same base name
        outline = generate_pdf_outline(filepath)
        base_name = os.path.splitext(original_name)[0]
        outline_path = os.path.join(settings.outline_folder, f"{base_name}.json")
        try:
            with open(outline_path, 'w', encoding='utf-8') as f:
                json.dump(outline, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Failed to write outline for {original_name}: {e}")
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
        except Exception as e:
            print(f"Index refresh warning: {e}")

        return doc_info
    
    async def bulk_upload_documents(self, files: List[UploadFile]) -> List[DocumentInfo]:
        """Upload multiple documents"""
        documents = []
        for file in files:
            doc = await self.upload_document(file)
            documents.append(doc)
        # After bulk upload ensure index built once (local import to avoid circular)
        try:
            from services.search_service import search_service  # local import
            search_service._build_search_index()
        except Exception as e:
            print(f"Bulk index build warning: {e}")
        return documents
    
    def get_document(self, doc_id: str) -> Optional[DocumentInfo]:
        """Get document by ID"""
        return self.documents.get(doc_id)
    
    def get_all_documents(self) -> List[DocumentInfo]:
        """Get all documents"""
        return list(self.documents.values())
    
    def get_document_by_filename(self, filename: str) -> Optional[DocumentInfo]:
        """Get document by filename"""
        for doc in self.documents.values():
            if doc.filename == filename:
                return doc
        return None
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document"""
        if doc_id in self.documents:
            doc = self.documents[doc_id]
            
            # Remove files
            try:
                if os.path.exists(doc.filepath):
                    os.remove(doc.filepath)
                if doc.outline_path and os.path.exists(doc.outline_path):
                    os.remove(doc.outline_path)
                
                del self.documents[doc_id]
                return True
            except Exception as e:
                print(f"Error deleting document: {str(e)}")
                return False
        return False
    
    def get_document_outline(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get document outline"""
        doc = self.documents.get(doc_id)
        if doc and doc.outline_path and os.path.exists(doc.outline_path):
            with open(doc.outline_path, 'r') as f:
                return json.load(f)
        return None

# Create singleton instance
document_service = DocumentService()