"""
Contradictions generator module for analyzing conflicting information.
"""

import json
from utils import get_llm_client
from models.individual_insights_model import ContradictionsResponse, ContradictingSource, Respond


class ContradictionsGenerator:
    """Handles contradictions analysis generation."""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_contradictions(self, selected_text: str, document_id: str,
                              page_no: int, original_insight: Respond,
                              context: dict, utils, parser) -> ContradictionsResponse:
        """Generate contradictions analysis with specific structure"""
        system_prompt = """You are a critical analysis expert. Create a structured contradictions analysis with exactly 3 sections:

1. source_a: Object with pdf_name and description (1 line)
2. source_b: Object with pdf_name and description (1 line)  
3. resolution_strategy: A thoughtful 2-3 line strategy for resolving conflicts

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "source_a": {
    "pdf_name": "Document A.pdf",
    "description": "Brief one-line description of this source's perspective."
  },
  "source_b": {
    "pdf_name": "Document B.pdf", 
    "description": "Brief one-line description of this source's perspective."
  },
  "resolution_strategy": "Detailed 2-3 line strategy for resolving or reconciling the conflicting information."
}

No markdown, no explanations, just pure JSON."""

        user_prompt = f"""Document Context: {context['pdf_context']}

Primary Document: {context['primary_document']} (Page {context['page_number']})

Selected Text: "{selected_text}"

Original Insight: "{original_insight.content}"

Analyze potential contradictions and provide resolution strategy:"""

        try:
            response = self.client.generate(
                prompt=user_prompt,
                max_tokens=700,
                temperature=0.6,
                system_prompt=system_prompt
            )
            
            print(f"DEBUG Contradictions Raw Response: {response}")
            
            cleaned_response = parser.clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Extract source information
            source_a_data = data.get('source_a', {})
            source_b_data = data.get('source_b', {})
            
            return ContradictionsResponse(
                # Common fields
                title=utils.generate_title("contradictions", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.8),
                # Specific fields
                source_a=ContradictingSource(
                    pdf_name=source_a_data.get('pdf_name', context['primary_document']),
                    description=source_a_data.get('description', 'Primary perspective on the topic.')
                ),
                source_b=ContradictingSource(
                    pdf_name=source_b_data.get('pdf_name', 'Related document'),
                    description=source_b_data.get('description', 'Alternative perspective on the topic.')
                ),
                resolution_strategy=data.get('resolution_strategy', '').strip() or "Cross-reference both sources and consider context to develop a balanced understanding that incorporates valid points from each perspective."
            )
            
        except Exception as e:
            print(f"Error generating contradictions: {e}")
            return ContradictionsResponse(
                # Common fields
                title=utils.generate_title("contradictions", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.6),
                # Specific fields
                source_a=ContradictingSource(
                    pdf_name=context['primary_document'],
                    description="Primary source providing one perspective on the topic."
                ),
                source_b=ContradictingSource(
                    pdf_name="Alternative source",
                    description="Secondary source offering different viewpoint."
                ),
                resolution_strategy="Compare both perspectives carefully and synthesize a balanced view that considers the context and validity of each source."
            )
