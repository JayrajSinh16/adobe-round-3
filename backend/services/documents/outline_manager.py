"""
Outline manager module for PDF outline generation and management.
"""

import os
import json
from typing import Dict, Any, Optional
from config import settings
from models import DocumentInfo


class OutlineManager:
    """Handles PDF outline generation and management."""
    
    def generate_and_save_outline(self, doc_info: DocumentInfo) -> DocumentInfo:
        """Generate and save outline for a document"""
        print(f"📋 Generating outline...")
        
        # Ensure outline folder exists
        os.makedirs(settings.outline_folder, exist_ok=True)
        
        # Generate outline
        from utils import generate_pdf_outline
        outline = generate_pdf_outline(doc_info.filepath)
        
        # Save outline with same base name as PDF
        base_name = os.path.splitext(doc_info.filename)[0]
        outline_path = os.path.join(settings.outline_folder, f"{base_name}.json")
        
        try:
            with open(outline_path, 'w', encoding='utf-8') as f:
                json.dump(outline, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved outline: {outline_path}")
            
            # Update document info
            doc_info.outline_path = outline_path
            doc_info.has_outline = True
            
        except Exception as e:
            print(f"❌ Failed to write outline for {doc_info.filename}: {e}")
            doc_info.outline_path = None
            doc_info.has_outline = False
        
        return doc_info
    
    def get_document_outline(self, doc_info: Optional[DocumentInfo]) -> Optional[Dict[str, Any]]:
        """Get document outline by document info"""
        if not doc_info or not doc_info.outline_path or not os.path.exists(doc_info.outline_path):
            return None
        
        try:
            with open(doc_info.outline_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to read outline for {doc_info.id}: {e}")
            return None
