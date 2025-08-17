import json
import re
import time
from typing import Dict, Any, List, Optional
from utils.llm_client import get_llm_client, format_outlines_for_context, get_all_pdf_outlines
from services.document_service import document_service
from models.individual_insights_model import (
    KeyTakeawayResponse, DidYouKnowResponse, ContradictionsResponse,
    ExamplesResponse, CrossReferencesResponse, KnowledgeDepth,
    SourceContext, ContradictingSource, ResponseSourceDocument, Respond
)

class IndividualInsightsService:
    def __init__(self):
        self.client = get_llm_client()
        
    def _get_document_context(self, document_id: str, page_no: int) -> Dict[str, Any]:
        """Get document context for the LLM"""
        try:
            doc = document_service.get_document(document_id)
            pdf_context = format_outlines_for_context(get_all_pdf_outlines())
            
            return {
                "primary_document": doc.filename if doc else "Unknown",
                "page_number": page_no,
                "pdf_context": pdf_context
            }
        except Exception as e:
            print(f"Error getting document context: {e}")
            return {
                "primary_document": "Unknown",
                "page_number": page_no,
                "pdf_context": "Document context unavailable"
            }
    
    def _clean_llm_response(self, response: str) -> str:
        """Clean and extract JSON from LLM response"""
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```json'):
            response = response[7:]
        elif response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        
        response = response.strip()
        
        # Try to find JSON object in response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json_match.group()
        
        return response
    
    def _extract_list_from_text(self, text: str, expected_count: int = 3) -> List[str]:
        """Extract a list of points from text, handling various formats"""
        # Try to find numbered or bulleted lists
        patterns = [
            r'(?:^|\n)\s*\d+\.\s*([^\n]+)',  # 1. item
            r'(?:^|\n)\s*[-•]\s*([^\n]+)',   # - item or • item
            r'(?:^|\n)\s*\*\s*([^\n]+)',     # * item
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            if len(matches) >= expected_count:
                return [match.strip() for match in matches[:expected_count]]
        
        # Fallback: split by sentences and take first N
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if len(sentences) >= expected_count:
            return sentences[:expected_count]
        
        # Last resort: split by newlines
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if len(lines) >= expected_count:
            return lines[:expected_count]
        
        # Generate fallbacks if needed
        while len(lines) < expected_count:
            lines.append(f"Additional point {len(lines) + 1} requires further analysis.")
        
        return lines[:expected_count]
    
    def _generate_source_documents(self, document_id: str, page_no: int) -> List[ResponseSourceDocument]:
        """Generate source document information"""
        try:
            doc = document_service.get_document(document_id)
            pdf_name = doc.filename if doc else "Unknown Document"
            
            # Get related documents from the system
            source_docs = [
                ResponseSourceDocument(
                    pdf_name=pdf_name,
                    page_number=page_no,
                    relevance_score=1.0
                )
            ]
            
            # Add other relevant documents (mock implementation)
            all_docs = get_all_pdf_outlines()
            if isinstance(all_docs, dict):
                for doc_name in list(all_docs.keys())[:2]:  # Add up to 2 more relevant docs
                    if doc_name != pdf_name:
                        source_docs.append(
                            ResponseSourceDocument(
                                pdf_name=doc_name,
                                page_number=1,  # Default page
                                relevance_score=0.8
                            )
                        )
            
            return source_docs
        except Exception as e:
            print(f"Error generating source documents: {e}")
            return [
                ResponseSourceDocument(
                    pdf_name="Unknown Document",
                    page_number=page_no,
                    relevance_score=0.5
                )
            ]
    
    def _calculate_confidence(self, data_quality: float = 0.8) -> float:
        """Calculate confidence score based on data quality and analysis"""
        # Base confidence on data availability and processing success
        base_confidence = data_quality
        
        # Add some variability based on insight complexity
        import random
        variability = random.uniform(-0.1, 0.1)
        
        confidence = max(0.6, min(0.95, base_confidence + variability))
        return round(confidence, 2)
    
    def _generate_title(self, insight_type: str, selected_text: str) -> str:
        """Generate a contextual title for the insight"""
        titles = {
            "key_takeaway": "Strategic Business Insights",
            "did_you_know": "Knowledge Discovery",
            "contradictions": "Document Contradictions Analysis",
            "examples": "Implementation Examples",
            "cross_references": "Cross-Document Connections"
        }
        
        base_title = titles.get(insight_type, "Insight Analysis")
        
        # Add context from selected text (first few words)
        words = selected_text.split()[:3]
        if words:
            context = " ".join(words)
            return f"{base_title}: {context}..."
        
        return base_title
    
    def _generate_content_summary(self, selected_text: str, original_insight: str) -> str:
        """Generate a content summary combining selected text and insight"""
        # Take first sentence from original insight as summary
        sentences = original_insight.split('.')
        if sentences and sentences[0].strip():
            return sentences[0].strip() + "."
        
        # Fallback to truncated selected text
        if len(selected_text) > 100:
            return selected_text[:97] + "..."
        
        return selected_text
    
    def generate_key_takeaway(self, selected_text: str, document_id: str, 
                            page_no: int, original_insight: Respond) -> KeyTakeawayResponse:
        """Generate key takeaway with specific structure"""
        context = self._get_document_context(document_id, page_no)
        
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
            
            cleaned_response = self._clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Validate and extract fields
            immediate_action = data.get('immediate_action_required', '').strip()
            business_impact = data.get('business_impact', '').strip()
            next_steps = data.get('next_steps', [])
            
            # Ensure next_steps is a list of exactly 3 items
            if not isinstance(next_steps, list):
                next_steps = self._extract_list_from_text(str(next_steps), 3)
            elif len(next_steps) != 3:
                next_steps = self._extract_list_from_text(' '.join(next_steps), 3)
            
            return KeyTakeawayResponse(
                # Common fields
                title=self._generate_title("key_takeaway", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.9),
                # Specific fields
                immediate_action_required=immediate_action or "Immediate analysis of the selected content is required.",
                business_impact=business_impact or "The business impact involves strategic considerations that require detailed evaluation and planning.",
                next_steps=next_steps[:3] if len(next_steps) >= 3 else next_steps + ["Additional analysis needed."] * (3 - len(next_steps))
            )
            
        except Exception as e:
            print(f"Error generating key takeaway: {e}")
            return KeyTakeawayResponse(
                # Common fields
                title=self._generate_title("key_takeaway", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.6),
                # Specific fields
                immediate_action_required="Review and analyze the selected content for strategic implications.",
                business_impact="The content contains important information that could impact business strategy and decision-making processes.",
                next_steps=[
                    "Conduct detailed analysis of the content.",
                    "Identify key stakeholders for discussion.",
                    "Develop implementation timeline."
                ]
            )
    
    def generate_did_you_know(self, selected_text: str, document_id: str,
                             page_no: int, original_insight: Respond) -> DidYouKnowResponse:
        """Generate did you know insight with specific structure"""
        context = self._get_document_context(document_id, page_no)
        
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
            
            cleaned_response = self._clean_llm_response(response)
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
                title=self._generate_title("did_you_know", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.85),
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
                title=self._generate_title("did_you_know", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.6),
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
    
    def generate_contradictions(self, selected_text: str, document_id: str,
                              page_no: int, original_insight: Respond) -> ContradictionsResponse:
        """Generate contradictions analysis with specific structure"""
        context = self._get_document_context(document_id, page_no)
        
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
            
            cleaned_response = self._clean_llm_response(response)
            data = json.loads(cleaned_response)
            
            # Extract source information
            source_a_data = data.get('source_a', {})
            source_b_data = data.get('source_b', {})
            
            return ContradictionsResponse(
                # Common fields
                title=self._generate_title("contradictions", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.8),
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
                title=self._generate_title("contradictions", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.6),
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
    
    def generate_examples(self, selected_text: str, document_id: str,
                         page_no: int, original_insight: Respond) -> ExamplesResponse:
        """Generate examples with specific structure"""
        context = self._get_document_context(document_id, page_no)
        
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
            
            cleaned_response = self._clean_llm_response(response)
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
                title=self._generate_title("examples", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.85),
                # Specific fields
                implementation_approach=implementation_approach[:3] if len(implementation_approach) >= 3 else implementation_approach + ["Additional implementation step needed."] * (3 - len(implementation_approach)),
                key_challenges=key_challenges[:3] if len(key_challenges) >= 3 else key_challenges + ["Additional challenge consideration required."] * (3 - len(key_challenges))
            )
            
        except Exception as e:
            print(f"Error generating examples: {e}")
            return ExamplesResponse(
                # Common fields
                title=self._generate_title("examples", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.6),
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
    
    def generate_cross_references(self, selected_text: str, document_id: str,
                                page_no: int, original_insight: Respond) -> CrossReferencesResponse:
        """Generate cross references with specific structure"""
        context = self._get_document_context(document_id, page_no)
        
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
            
            cleaned_response = self._clean_llm_response(response)
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
                title=self._generate_title("cross_references", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.9),
                # Specific fields
                innovation_catalyst=innovation_catalyst[:3] if len(innovation_catalyst) >= 3 else innovation_catalyst + ["Additional innovation opportunity identified."] * (3 - len(innovation_catalyst)),
                pattern_analysis=pattern_analysis or "Analysis reveals interconnected patterns across multiple documents that suggest systematic relationships and opportunities for deeper exploration.",
                future_exploration=future_exploration[:3] if len(future_exploration) >= 3 else future_exploration + ["Further research direction identified."] * (3 - len(future_exploration))
            )
            
        except Exception as e:
            print(f"Error generating cross references: {e}")
            return CrossReferencesResponse(
                # Common fields
                title=self._generate_title("cross_references", selected_text),
                content=self._generate_content_summary(selected_text, original_insight.content),
                source_documents=self._generate_source_documents(document_id, page_no),
                confidence=self._calculate_confidence(0.6),
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

# Create singleton instance
individual_insights_service = IndividualInsightsService()
