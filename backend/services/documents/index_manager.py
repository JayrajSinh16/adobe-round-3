"""
Index manager module for handling document index operations.
"""

import os
import json
import uuid
from typing import Dict
from pathlib import Path
from config import settings


class IndexManager:
    """Handles document index management and file system synchronization."""
    
    def __init__(self, index_file: str):
        self.INDEX_FILE = index_file
        self._id_filename_map: Dict[str, str] = {}
    
    def rebuild_index_from_files(self):
        """Rebuild index completely from actual files on disk, ignoring any existing index"""
        print("🔄 Rebuilding index from actual files...")
        
        # Clear any existing data
        self._id_filename_map.clear()
        
        # Scan actual PDF files
        if not os.path.exists(settings.upload_folder):
            print("📁 Upload folder doesn't exist, starting with empty index")
            self.save_index()
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
        self.save_index()
    
    def save_index(self):
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
    
    def get_id_filename_map(self) -> Dict[str, str]:
        """Get the current ID to filename mapping"""
        return self._id_filename_map.copy()
    
    def add_document_to_index(self, doc_id: str, filename: str):
        """Add a document to the index"""
        self._id_filename_map[doc_id] = filename
        self.save_index()
    
    def remove_document_from_index(self, doc_id: str):
        """Remove a document from the index"""
        if doc_id in self._id_filename_map:
            del self._id_filename_map[doc_id]
            self.save_index()
    
    def sync_with_filesystem(self):
        """Manually sync the document index with actual files on disk"""
        print("🔄 Syncing document index with filesystem...")
        self.rebuild_index_from_files()
        print(f"✅ Sync completed. Active documents: {len(self._id_filename_map)}")
