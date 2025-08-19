"""
Examples generator module for generating practical implementation examples.
"""

import json
from utils import get_llm_client
from models.individual_insights_model import ExamplesResponse, Respond


class ExamplesGenerator:
    """Handles examples generation with implementation approaches and challenges."""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_examples(self, selected_text: str, document_id: str,
                         page_no: int, original_insight: Respond,
                         context: dict, utils, parser) -> ExamplesResponse:
        """Generate examples with specific structure"""
        system_prompt = """You are a practical implementation expert. Create a structured examples analysis with exactly 2 sections:

1. implementation_approach: Array of exactly 3 one-line practical steps
2. key_challenges: Array of exactly 3 one-line potential challenges

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "implementation_approach": [
    "First specific implementation step.",
    "Second specific implementation step.", 
    "Third specific implementation step."
  ],
  "key_challenges": [
    "First potential challenge to address.",
    "Second potential challenge to address.",
    "Third potential challenge to address."
  ]
}

No markdown, no explanations, just pure JSON."""

        user_prompt = f"""Document Context: {context['pdf_context']}

Primary Document: {context['primary_document']} (Page {context['page_number']})

Selected Text: "{selected_text}"

Original Insight: "{original_insight.content}"

Generate practical implementation approach and key challenges:"""

        try:
            response = self.client.generate(
                prompt=user_prompt,
                max_tokens=700,
                temperature=0.6,
                system_prompt=system_prompt
            )
            
            print(f"DEBUG Examples Raw Response: {response}")
            
            cleaned_response = parser.clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Extract and validate arrays
            implementation_approach = data.get('implementation_approach', [])
            key_challenges = data.get('key_challenges', [])
            
            # Ensure exactly 3 items in each array
            if not isinstance(implementation_approach, list):
                implementation_approach = self._extract_list_from_text(str(implementation_approach), 3)
            elif len(implementation_approach) != 3:
                implementation_approach = self._extract_list_from_text(' '.join(implementation_approach), 3)
            
            if not isinstance(key_challenges, list):
                key_challenges = self._extract_list_from_text(str(key_challenges), 3)
            elif len(key_challenges) != 3:
                key_challenges = self._extract_list_from_text(' '.join(key_challenges), 3)
            
            return ExamplesResponse(
                # Common fields
                title=utils.generate_title("examples", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.85),
                # Specific fields
                implementation_approach=implementation_approach[:3] if len(implementation_approach) >= 3 else implementation_approach + ["Additional implementation step needed."] * (3 - len(implementation_approach)),
                key_challenges=key_challenges[:3] if len(key_challenges) >= 3 else key_challenges + ["Additional challenge consideration required."] * (3 - len(key_challenges))
            )
            
        except Exception as e:
            print(f"Error generating examples: {e}")
            return ExamplesResponse(
                # Common fields
                title=utils.generate_title("examples", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.6),
                # Specific fields
                implementation_approach=[
                    "Analyze the content thoroughly for key insights.",
                    "Develop a structured implementation plan.",
                    "Execute with regular monitoring and adjustments."
                ],
                key_challenges=[
                    "Resource allocation and timeline management.",
                    "Stakeholder alignment and communication.",
                    "Quality assurance and performance measurement."
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
