"""
Connection analyzer module for analyzing document connections and generating templates.
"""

import re
from typing import List, Dict, Any
from services.document_service import document_service


class ConnectionAnalyzer:
    """Handles analysis of connections and template generation."""
    
    def generate_connection_templates(self, selected_text: str) -> List[Dict[str, str]]:
        """Generate intelligent connection templates based on actual PDF outline analysis"""
        templates = []
        
        # Get all available documents and their outlines
        all_documents = document_service.get_all_documents()
        
        # Extract key concepts from selected text
        text_words = self._extract_key_concepts(selected_text)
        
        # Analyze each document's outline for relevant connections
        for doc in all_documents:
            outline = document_service.get_document_outline(doc.id)
            if not outline or not outline.get('outline'):
                continue
            
            # Find matching sections in this document's outline
            relevant_sections = self.find_relevant_outline_sections(
                text_words, outline['outline'], doc.filename
            )
            
            # Convert relevant sections to connection templates
            for section in relevant_sections:
                connection_type = self.determine_connection_type(section['heading'], selected_text)
                snippet = self.generate_smart_snippet(section['heading'], selected_text)
                
                templates.append({
                    'title': section['heading'],
                    'type': connection_type,
                    'document': doc.filename,
                    'pages': [section.get('page', 1)],
                    'snippet': snippet,
                    'strength': section.get('relevance_score', 'medium')
                })
        
        # Sort by relevance and limit to top connections
        templates.sort(key=lambda x: self.calculate_relevance_score(x['title'], selected_text), reverse=True)
        
        # If no outline-based connections found, create minimal fallbacks
        if not templates:
            templates = self.create_minimal_fallback_templates(all_documents)
        
        return templates[:5]  # Limit to top 5 connections
    
    def find_relevant_outline_sections(self, key_concepts: List[str], outline: List[Dict], doc_filename: str) -> List[Dict]:
        """Find outline sections that match the key concepts"""
        relevant_sections = []
        
        for section in outline:
            heading = section.get('text', section.get('heading', '')).lower()
            
            # Calculate relevance score based on concept matching
            relevance_score = 0
            matched_concepts = []
            
            for concept in key_concepts:
                if concept in heading:
                    relevance_score += 2  # Exact match
                    matched_concepts.append(concept)
                elif any(word in heading for word in concept.split()):
                    relevance_score += 1  # Partial match
                    matched_concepts.append(concept)
            
            # Also check for semantic similarity (basic word overlap)
            heading_words = set(heading.split())
            concept_words = set(' '.join(key_concepts).split())
            overlap = len(heading_words.intersection(concept_words))
            relevance_score += overlap * 0.5
            
            # If section has some relevance, add it
            if relevance_score > 0:
                section_info = {
                    'heading': section.get('text', section.get('heading', 'Section')),
                    'page': section.get('page', 1),
                    'level': section.get('level', 'H1'),
                    'relevance_score': self.score_to_strength(relevance_score),
                    'matched_concepts': matched_concepts,
                    'document': doc_filename
                }
                relevant_sections.append(section_info)
        
        # Sort by relevance
        relevant_sections.sort(key=lambda x: len(x['matched_concepts']), reverse=True)
        
        return relevant_sections[:3]  # Top 3 per document
    
    def determine_connection_type(self, heading: str, selected_text: str) -> str:
        """Intelligently determine connection type based on heading and text content"""
        heading_lower = heading.lower()
        text_lower = selected_text.lower()
        
        # Analyze heading patterns to determine type
        if any(word in heading_lower for word in ['tip', 'guide', 'how', 'advice', 'practical']):
            return 'support'
        elif any(word in heading_lower for word in ['history', 'background', 'origin', 'past']):
            return 'concept'
        elif any(word in heading_lower for word in ['example', 'case', 'sample', 'instance']):
            return 'example'
        elif any(word in heading_lower for word in ['compare', 'versus', 'difference', 'similar']):
            return 'comparison'
        elif any(word in heading_lower for word in ['culture', 'tradition', 'custom', 'heritage']):
            return 'theme'
        elif any(word in heading_lower for word in ['reference', 'see', 'related', 'link']):
            return 'reference'
        else:
            # Default based on content similarity
            common_words = set(heading_lower.split()).intersection(set(text_lower.split()))
            if len(common_words) > 2:
                return 'concept'
            else:
                return 'reference'
    
    def generate_smart_snippet(self, heading: str, selected_text: str) -> str:
        """Generate an intelligent snippet based on the heading and selected text"""
        # Extract key theme from heading
        heading_words = heading.lower().split()
        text_words = selected_text.lower().split()
        
        # Find common themes
        common_themes = set(heading_words).intersection(set(text_words))
        
        if common_themes:
            main_theme = list(common_themes)[0]
            return f"Provides additional information about {main_theme} and related topics."
        else:
            # Generic but contextual snippet
            if len(heading) > 30:
                short_heading = heading[:25] + "..."
            else:
                short_heading = heading
            return f"Contains relevant details that complement the selected content about {short_heading.lower()}."
    
    def calculate_relevance_score(self, title: str, selected_text: str) -> float:
        """Calculate numerical relevance score for sorting"""
        title_words = set(title.lower().split())
        text_words = set(selected_text.lower().split())
        
        # Calculate word overlap
        overlap = len(title_words.intersection(text_words))
        
        # Weight by title length (shorter titles with overlap are more relevant)
        title_length_factor = 1.0 / max(1, len(title_words) - 2)
        
        return overlap + title_length_factor
    
    def score_to_strength(self, score: float) -> str:
        """Convert numerical score to strength category"""
        if score >= 3:
            return 'high'
        elif score >= 1.5:
            return 'medium'
        else:
            return 'low'
    
    def create_minimal_fallback_templates(self, documents: List) -> List[Dict[str, str]]:
        """Create minimal fallback templates when no outline matches found"""
        templates = []
        
        for i, doc in enumerate(documents[:3]):
            templates.append({
                'title': f"Related Content",
                'type': 'reference',
                'document': doc.filename,
                'pages': [1],
                'snippet': f"Additional information available in {doc.filename}.",
                'strength': 'low'
            })
        
        return templates
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts and important words from text"""
        # Clean and normalize text
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filter out common stop words and short words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 
            'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 
            'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
        }
        
        # Extract meaningful words (longer than 2 chars, not stop words)
        key_words = [word for word in words if len(word) > 2 and word not in stop_words]
        
        # Also extract noun phrases and important concepts
        # Look for capitalized words (proper nouns)
        original_words = text.split()
        capitalized = [word.strip('.,!?()[]{}"\';:') for word in original_words if word[0].isupper() and len(word) > 2]
        
        return list(set(key_words + [word.lower() for word in capitalized]))
