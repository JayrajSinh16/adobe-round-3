"""
Cross references generator module for generating knowledge connections and patterns.
"""

import json
from utils import get_llm_client
from models.individual_insights_model import CrossReferencesResponse, Respond


class CrossReferencesGenerator:
    """Handles cross-references generation with innovation catalysts and patterns."""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_cross_references(self, selected_text: str, document_id: str,
                                page_no: int, original_insight: Respond,
                                context: dict, utils, parser) -> CrossReferencesResponse:
        """Generate cross references with specific structure"""
        system_prompt = """You are a knowledge connection expert. Create a structured cross-references analysis with exactly 3 sections:

1. innovation_catalyst: Array of exactly 3 one-line innovation insights
2. pattern_analysis: A detailed 2-3 line pattern analysis
3. future_exploration: Array of exactly 3 one-line future directions

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "innovation_catalyst": [
    "First innovation insight or catalyst.",
    "Second innovation insight or catalyst.",
    "Third innovation insight or catalyst."
  ],
  "pattern_analysis": "Detailed 2-3 line analysis of patterns and relationships found across documents.",
  "future_exploration": [
    "First future exploration direction.",
    "Second future exploration direction.", 
    "Third future exploration direction."
  ]
}

No markdown, no explanations, just pure JSON."""

        user_prompt = f"""Document Context: {context['pdf_context']}

Primary Document: {context['primary_document']} (Page {context['page_number']})

Selected Text: "{selected_text}"

Original Insight: "{original_insight.content}"

Generate cross-references analysis focusing on innovation and patterns:"""

        try:
            response = self.client.generate(
                prompt=user_prompt,
                max_tokens=800,
                temperature=0.7,
                system_prompt=system_prompt
            )
            
            print(f"DEBUG Cross References Raw Response: {response}")
            
            cleaned_response = parser.clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Extract and validate arrays
            innovation_catalyst = data.get('innovation_catalyst', [])
            pattern_analysis = data.get('pattern_analysis', '').strip()
            future_exploration = data.get('future_exploration', [])
            
            # Ensure exactly 3 items in arrays
            if not isinstance(innovation_catalyst, list):
                innovation_catalyst = self._extract_list_from_text(str(innovation_catalyst), 3)
            elif len(innovation_catalyst) != 3:
                innovation_catalyst = self._extract_list_from_text(' '.join(innovation_catalyst), 3)
            
            if not isinstance(future_exploration, list):
                future_exploration = self._extract_list_from_text(str(future_exploration), 3)
            elif len(future_exploration) != 3:
                future_exploration = self._extract_list_from_text(' '.join(future_exploration), 3)
            
            return CrossReferencesResponse(
                # Common fields
                title=utils.generate_title("cross_references", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.9),
                # Specific fields
                innovation_catalyst=innovation_catalyst[:3] if len(innovation_catalyst) >= 3 else innovation_catalyst + ["Additional innovation opportunity identified."] * (3 - len(innovation_catalyst)),
                pattern_analysis=pattern_analysis or "Analysis reveals interconnected patterns across multiple documents that suggest systematic relationships and opportunities for deeper exploration.",
                future_exploration=future_exploration[:3] if len(future_exploration) >= 3 else future_exploration + ["Further research direction identified."] * (3 - len(future_exploration))
            )
            
        except Exception as e:
            print(f"Error generating cross references: {e}")
            return CrossReferencesResponse(
                # Common fields
                title=utils.generate_title("cross_references", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.6),
                # Specific fields
                innovation_catalyst=[
                    "Cross-document analysis reveals new innovation opportunities.",
                    "Pattern recognition enables strategic advantage identification.",
                    "Knowledge synthesis creates competitive differentiators."
                ],
                pattern_analysis="The content demonstrates consistent patterns that connect across multiple documents, revealing systematic relationships and strategic opportunities.",
                future_exploration=[
                    "Investigate deeper connections between related concepts.",
                    "Explore potential applications in different contexts.",
                    "Develop comprehensive integration strategies."
                ]
            )
    
    def _extract_list_from_text(self, text: str, count: int) -> list:
        """Extract a list of items from text when JSON parsing fails"""
        lines = text.split('\n')
        items = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith('{') and not line.startswith('}'):
                # Remove common list markers
                line = line.lstrip('- •*').strip()
                if line:
                    items.append(line)
                    
        # Ensure we have exactly 'count' items
        while len(items) < count:
            items.append(f"Additional item {len(items) + 1} needed.")
            
        return items[:count]
