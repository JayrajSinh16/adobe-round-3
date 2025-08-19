"""
Utility functions for document processing and validation.
"""

import os
import uuid


class DocumentUtils:
    """Utility functions for document processing."""
    
    @staticmethod
    def sanitize_filename(name: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove path components and restrict characters
        name = os.path.basename(name).strip().replace('\\', '_').replace('/', '_')
        # Prevent empty
        return name or f"document_{uuid.uuid4().hex}.pdf"
    
    def ensure_unique_filename(self, filename: str) -> str:
        """Ensure filename is unique in upload folder"""
        from config import settings
        
        base, ext = os.path.splitext(filename)
        counter = 1
        final = filename
        existing_files = set(os.listdir(settings.upload_folder)) if os.path.exists(settings.upload_folder) else set()
        
        while final in existing_files:
            final = f"{base}_{counter}{ext}"
            counter += 1
            
        return final
