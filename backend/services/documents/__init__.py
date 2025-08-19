"""
Documents service module for handling document management operations.
This module provides modular components for document storage, indexing, and management.
"""

from .index_manager import IndexManager
from .file_handler import FileHandler
from .document_operations import DocumentOperations
from .outline_manager import OutlineManager
from .utils import DocumentUtils

__all__ = [
    'IndexManager',
    'FileHandler',
    'DocumentOperations',
    'OutlineManager',
    'DocumentUtils'
]
