"""
Did you know generator module for generating knowledge discovery insights.
"""

import json
from utils import get_llm_client
from models.individual_insights_model import DidYouKnowResponse, KnowledgeDepth, SourceContext, Respond


class DidYouKnowGenerator:
    """Handles did you know insight generation."""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_did_you_know(self, selected_text: str, document_id: str,
                             page_no: int, original_insight: Respond,
                             context: dict, utils, parser) -> DidYouKnowResponse:
        """Generate did you know insight with specific structure"""
        system_prompt = """You are a knowledge discovery expert. Create a structured "Did You Know" analysis with exactly 3 sections:

1. knowledge_depth: Object with novelty_factor ("high"/"medium"/"low") and surprise_level (1-5 scale)
2. source_context: Object with pdf_name and page_number
3. why_this_matters: A compelling 2-4 line explanation of significance

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "knowledge_depth": {
    "novelty_factor": "high",
    "surprise_level": 4
  },
  "source_context": {
    "pdf_name": "Document Name.pdf",
    "page_number": 1
  },
  "why_this_matters": "Detailed 2-4 line explanation of why this information is significant and impactful."
}

No markdown, no explanations, just pure JSON."""

        user_prompt = f"""Document Context: {context['pdf_context']}

Primary Document: {context['primary_document']} (Page {context['page_number']})

Selected Text: "{selected_text}"

Original Insight: "{original_insight.content}"

Generate a fascinating "Did You Know" analysis:"""

        try:
            response = self.client.generate(
                prompt=user_prompt,
                max_tokens=600,
                temperature=0.7,
                system_prompt=system_prompt
            )
            
            print(f"DEBUG Did You Know Raw Response: {response}")
            
            cleaned_response = parser.clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Extract and validate knowledge_depth
            knowledge_depth_data = data.get('knowledge_depth', {})
            novelty_factor = knowledge_depth_data.get('novelty_factor', 'medium')
            if novelty_factor not in ['high', 'medium', 'low']:
                novelty_factor = 'medium'
            
            surprise_level = knowledge_depth_data.get('surprise_level', 3)
            if not isinstance(surprise_level, int) or not (1 <= surprise_level <= 5):
                surprise_level = 3
            
            # Extract and validate source_context
            source_context_data = data.get('source_context', {})
            pdf_name = source_context_data.get('pdf_name', context['primary_document'])
            page_number = source_context_data.get('page_number', context['page_number'])
            
            # Extract why_this_matters
            why_matters = data.get('why_this_matters', '').strip()
            
            return DidYouKnowResponse(
                # Common fields
                title=utils.generate_title("did_you_know", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.85),
                # Specific fields
                knowledge_depth=KnowledgeDepth(
                    novelty_factor=novelty_factor,
                    surprise_level=surprise_level
                ),
                source_context=SourceContext(
                    pdf_name=pdf_name,
                    page_number=page_number
                ),
                why_this_matters=why_matters or "This information provides valuable insights that enhance understanding of the topic and its broader implications."
            )
            
        except Exception as e:
            print(f"Error generating did you know: {e}")
            return DidYouKnowResponse(
                # Common fields
                title=utils.generate_title("did_you_know", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.6),
                # Specific fields
                knowledge_depth=KnowledgeDepth(
                    novelty_factor="medium",
                    surprise_level=3
                ),
                source_context=SourceContext(
                    pdf_name=context['primary_document'],
                    page_number=context['page_number']
                ),
                why_this_matters="This information reveals interesting aspects that contribute to a deeper understanding of the subject matter."
            )
