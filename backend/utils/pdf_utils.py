import fitz  # PyMuPDF
import os
from typing import Dict, List, Any, Optional
import json
from outline_engine.rule_engine import SmartRuleEngine

_outline_engine_instance: Optional[SmartRuleEngine] = None

def extract_pdf_info(pdf_path: str) -> Dict[str, Any]:
    """Extract basic information from PDF"""
    try:
        pdf_document = fitz.open(pdf_path)
        info = {
            "page_count": len(pdf_document),
            "title": pdf_document.metadata.get("title", os.path.basename(pdf_path)),
            "author": pdf_document.metadata.get("author", "Unknown"),
            "subject": pdf_document.metadata.get("subject", ""),
            "keywords": pdf_document.metadata.get("keywords", ""),
        }
        pdf_document.close()
        return info
    except Exception as e:
        print(f"Error extracting PDF info: {str(e)}")
        return {"page_count": 0, "title": os.path.basename(pdf_path)}

def extract_text_around_heading(pdf_path: str, page_number: int, heading_text: str, context_size: int = 500) -> str:
    """Extract text around a specific heading in a PDF"""
    try:
        pdf_document = fitz.open(pdf_path)
        if page_number <= len(pdf_document):
            page = pdf_document[page_number - 1]  # Convert to 0-based index
            text = page.get_text()
            
            # Find the heading in the text
            heading_index = text.lower().find(heading_text.lower())
            if heading_index != -1:
                # Extract context around the heading
                start = max(0, heading_index - 100)
                end = min(len(text), heading_index + len(heading_text) + context_size)
                context_text = text[start:end]
                pdf_document.close()
                return context_text.strip()
        
        pdf_document.close()
        return ""
    except Exception as e:
        print(f"Error extracting text around heading: {str(e)}")
        return ""

def get_page_text(pdf_path: str, page_number: int) -> str:
    """Get full text from a specific page"""
    try:
        pdf_document = fitz.open(pdf_path)
        if page_number <= len(pdf_document):
            page = pdf_document[page_number - 1]
            text = page.get_text()
            pdf_document.close()
            return text
        pdf_document.close()
        return ""
    except Exception as e:
        print(f"Error getting page text: {str(e)}")
        return ""

def generate_pdf_outline(pdf_path: str) -> Dict[str, Any]:
    """Generate outline using imported Round 1A SmartRuleEngine logic."""
    global _outline_engine_instance
    if _outline_engine_instance is None:
        _outline_engine_instance = SmartRuleEngine()
    try:
        return _outline_engine_instance.extract(pdf_path)
    except Exception as e:
        # Fallback to minimal structure if extraction fails
        return {"title": os.path.basename(pdf_path), "outline": []}