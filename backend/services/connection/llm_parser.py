"""
LLM response parser module for handling and validating LLM responses.
"""

import json
import re
from typing import List, Optional
from models import DocumentConnection


class LLMParser:
    """Handles parsing and validation of LLM responses for connection extraction."""
    
    def parse_llm_response(self, response: str, source_pdf_name: str) -> List[DocumentConnection]:
        """Enhanced LLM response parsing with multiple fallback strategies"""
        connections = []
        response = response.strip()
        
        if not response:
            return connections
        
        # Strategy 1: Try to find JSON array
        json_patterns = [
            (r'\[.*?\]', 'array'),
            (r'\{.*?\}', 'object'),
            (r'```json\s*(\[.*?\])\s*```', 'code_block'),
            (r'```\s*(\[.*?\])\s*```', 'code_block_no_lang')
        ]
        
        for pattern, pattern_type in json_patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            for match in matches:
                try:
                    if pattern_type == 'object':
                        # Single object, wrap in array
                        data = [json.loads(match)]
                    else:
                        data = json.loads(match)
                    
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and self.is_valid_connection_dict(item):
                                conn = self.dict_to_connection(item, source_pdf_name)
                                if conn:
                                    connections.append(conn)
                    elif isinstance(data, dict) and self.is_valid_connection_dict(data):
                        conn = self.dict_to_connection(data, source_pdf_name)
                        if conn:
                            connections.append(conn)
                    
                    if connections:
                        return connections
                except json.JSONDecodeError:
                    continue
        
        # Strategy 2: Try to parse line-by-line structured text
        lines = response.split('\n')
        current_connection = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for key-value patterns
            if ':' in line:
                parts = line.split(':', 1)
                key = parts[0].strip().lower()
                value = parts[1].strip().strip('"\'')
                
                if key in ['title', 'heading']:
                    current_connection['title'] = value
                elif key in ['type', 'connection_type']:
                    current_connection['type'] = value
                elif key in ['document', 'pdf', 'file']:
                    current_connection['document'] = value
                elif key in ['snippet', 'description', 'summary']:
                    current_connection['snippet'] = value
                elif key in ['strength', 'relevance']:
                    current_connection['strength'] = value
                elif key in ['pages', 'page']:
                    try:
                        # Handle various page formats
                        page_str = value.replace('[', '').replace(']', '').replace('p.', '').replace('page', '')
                        pages = [int(x.strip()) for x in page_str.split(',') if x.strip().isdigit()]
                        current_connection['pages'] = pages if pages else [1]
                    except:
                        current_connection['pages'] = [1]
            
            # Check if we have enough info to create a connection
            if len(current_connection) >= 3 and 'title' in current_connection:
                conn = self.dict_to_connection(current_connection, source_pdf_name)
                if conn:
                    connections.append(conn)
                current_connection = {}
        
        # Handle last connection if any
        if len(current_connection) >= 3 and 'title' in current_connection:
            conn = self.dict_to_connection(current_connection, source_pdf_name)
            if conn:
                connections.append(conn)
        
        return connections
    
    def is_valid_connection_dict(self, data: dict) -> bool:
        """Check if dictionary contains valid connection fields"""
        required_fields = ['title', 'document']
        optional_fields = ['type', 'snippet', 'pages', 'strength']
        
        # Must have title and document at minimum
        if not all(field in data for field in required_fields):
            return False
        
        # Check if it has some optional fields
        has_optional = any(field in data for field in optional_fields)
        return has_optional
    
    def dict_to_connection(self, data: dict, source_pdf_name: str) -> Optional[DocumentConnection]:
        """Convert dictionary to DocumentConnection object"""
        try:
            # Skip if it's the source document
            doc_name = data.get('document', '')
            if doc_name == source_pdf_name:
                return None
            
            # Ensure snippet is reasonable length
            snippet = data.get('snippet', 'Related content found.')
            words = snippet.split()
            if len(words) > 25:
                snippet = ' '.join(words[:25]) + '...'
            
            # Handle pages
            pages = data.get('pages', [1])
            if not isinstance(pages, list):
                if isinstance(pages, (int, str)):
                    try:
                        pages = [int(pages)]
                    except:
                        pages = [1]
                else:
                    pages = [1]
            
            # Normalize strength field to match our model's Literal values
            strength = data.get('strength', 'medium').lower()
            if strength in ['strong', 'very strong', 'very high']:
                strength = 'high'
            elif strength in ['moderate', 'average']:
                strength = 'medium'
            elif strength in ['weak', 'minimal']:
                strength = 'low'
            elif strength not in ['low', 'medium', 'high']:
                strength = 'medium'  # Default fallback
            
            return DocumentConnection(
                title=data.get('title', 'Document Section'),
                type=data.get('type', 'concept'),
                document=doc_name,
                pages=pages,
                snippet=snippet,
                strength=strength
            )
        except Exception as e:
            print(f"Error creating connection from dict: {e}")
            return None
