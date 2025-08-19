"""
Key takeaway generator module for generating business insight takeaways.
"""

import json
from utils import get_llm_client
from models.individual_insights_model import KeyTakeawayResponse, Respond


class KeyTakeawayGenerator:
    """Handles key takeaway insight generation."""
    
    def __init__(self):
        self.client = get_llm_client()
    
    def generate_key_takeaway(self, selected_text: str, document_id: str, 
                            page_no: int, original_insight: Respond,
                            context: dict, utils, parser) -> KeyTakeawayResponse:
        """Generate key takeaway with specific structure"""
        system_prompt = """You are a business insight analyst specializing in actionable recommendations. Create a structured key takeaway analysis with exactly 3 sections:

1. immediate_action_required: One concise 1-2 line sentence about what needs to be done immediately
2. business_impact: A detailed 2-3 line explanation of business implications
3. next_steps: Exactly 3 distinct one-line action items

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "immediate_action_required": "Brief actionable statement here.",
  "business_impact": "Detailed 2-3 line explanation of business implications and potential outcomes.",
  "next_steps": ["First specific action item.", "Second specific action item.", "Third specific action item."]
}

No markdown, no explanations, just pure JSON."""

        user_prompt = f"""Document Context: {context['pdf_context']}

Primary Document: {context['primary_document']} (Page {context['page_number']})

Selected Text: "{selected_text}"

Original Insight: "{original_insight.content}"

Generate a structured key takeaway analysis focusing on actionable business insights:"""

        try:
            response = self.client.generate(
                prompt=user_prompt,
                max_tokens=800,
                temperature=0.6,
                system_prompt=system_prompt
            )
            
            print(f"DEBUG Key Takeaway Raw Response: {response}")
            
            cleaned_response = parser.clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Validate and extract fields
            immediate_action = data.get('immediate_action_required', '').strip()
            business_impact = data.get('business_impact', '').strip()
            next_steps = data.get('next_steps', [])
            
            # Ensure next_steps is a list of exactly 3 items
            if not isinstance(next_steps, list):
                next_steps = parser.extract_list_from_text(str(next_steps), 3)
            elif len(next_steps) != 3:
                next_steps = parser.extract_list_from_text(' '.join(next_steps), 3)
            
            return KeyTakeawayResponse(
                # Common fields
                title=utils.generate_title("key_takeaway", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.9),
                # Specific fields
                immediate_action_required=immediate_action or "Immediate analysis of the selected content is required.",
                business_impact=business_impact or "The business impact involves strategic considerations that require detailed evaluation and planning.",
                next_steps=next_steps[:3] if len(next_steps) >= 3 else next_steps + ["Additional analysis needed."] * (3 - len(next_steps))
            )
            
        except Exception as e:
            print(f"Error generating key takeaway: {e}")
            return KeyTakeawayResponse(
                # Common fields
                title=utils.generate_title("key_takeaway", selected_text),
                content=utils.generate_content_summary(selected_text, original_insight.content),
                source_documents=utils.generate_source_documents(document_id, page_no),
                confidence=utils.calculate_confidence(0.6),
                # Specific fields
                immediate_action_required="Review and analyze the selected content for strategic implications.",
                business_impact="The content contains important information that could impact business strategy and decision-making processes.",
                next_steps=[
                    "Conduct detailed analysis of the content.",
                    "Identify key stakeholders for discussion.",
                    "Develop implementation timeline."
                ]
            )
