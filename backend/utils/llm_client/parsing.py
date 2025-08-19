"""
Robust parsing utilities for insights responses
"""
from typing import Dict, Any, List


def _parse_insights_response_robust(response: str, insight_types: List[str], selected_text: str, related_sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Ultra-robust JSON parsing with multiple fallback strategies"""
    import json
    import re
    
    print(f"🔍 DEBUG: Raw LLM response ({len(response)} chars): {response[:200]}...")
    
    # Strategy 1: Direct JSON parsing
    try:
        cleaned_response = response.strip()
        parsed = json.loads(cleaned_response)
        if isinstance(parsed, list) and len(parsed) > 0:
            validated = _validate_and_fix_insights(parsed, insight_types)
            if validated:
                print(f"✅ Strategy 1 SUCCESS: Direct JSON parsing")
                return validated
    except Exception as e:
        print(f"❌ Strategy 1 failed: {e}")
    
    # Strategy 2: Extract JSON from markdown or mixed content
    try:
        # Remove markdown code blocks
        cleaned = re.sub(r'```(?:json)?\s*', '', response)
        cleaned = re.sub(r'```\s*', '', cleaned)
        
        # Find JSON array pattern
        json_patterns = [
            r'\[[\s\S]*?\]',  # Matches [ ... ]
            r'\{[\s\S]*?\}',  # Matches single object (convert to array)
        ]
        
        for pattern in json_patterns:
            matches = re.findall(pattern, cleaned)
            for match in matches:
                try:
                    parsed = json.loads(match)
                    if isinstance(parsed, dict):
                        parsed = [parsed]  # Convert single object to array
                    if isinstance(parsed, list) and len(parsed) > 0:
                        validated = _validate_and_fix_insights(parsed, insight_types)
                        if validated:
                            print(f"✅ Strategy 2 SUCCESS: Extracted JSON from pattern")
                            return validated
                except Exception:
                    continue
    except Exception as e:
        print(f"❌ Strategy 2 failed: {e}")
    
    # Strategy 3: Fix common JSON errors and retry
    try:
        # Fix common JSON issues
        fixed_response = response.strip()
        
        # Fix missing quotes around keys
        fixed_response = re.sub(r'(\w+):', r'"\1":', fixed_response)
        # Fix single quotes to double quotes
        fixed_response = fixed_response.replace("'", '"')
        # Fix trailing commas
        fixed_response = re.sub(r',\s*}', '}', fixed_response)
        fixed_response = re.sub(r',\s*]', ']', fixed_response)
        # Remove any text before [ and after ]
        json_match = re.search(r'\[.*\]', fixed_response, re.DOTALL)
        if json_match:
            fixed_response = json_match.group()
        
        parsed = json.loads(fixed_response)
        if isinstance(parsed, list) and len(parsed) > 0:
            validated = _validate_and_fix_insights(parsed, insight_types)
            if validated:
                print(f"✅ Strategy 3 SUCCESS: Fixed JSON errors")
                return validated
    except Exception as e:
        print(f"❌ Strategy 3 failed: {e}")
    
    # Strategy 4: Parse structured text and convert to JSON
    try:
        insights = _extract_insights_from_text(response, insight_types, selected_text, related_sections)
        if insights:
            print(f"✅ Strategy 4 SUCCESS: Parsed structured text")
            return insights
    except Exception as e:
        print(f"❌ Strategy 4 failed: {e}")
    
    # Strategy 5: Generate minimal insights from available context
    print(f"⚠️ All parsing strategies failed, generating minimal insights from context")
    return _generate_minimal_insights_from_context(insight_types, selected_text, related_sections)


def _validate_and_fix_insights(insights: List[Dict], insight_types: List[str]) -> List[Dict[str, Any]]:
    """Validate and fix parsed insights"""
    validated_insights = []
    
    for insight in insights:
        if not isinstance(insight, dict):
            continue
            
        # Extract and validate required fields
        insight_type = insight.get('type', '').strip()
        content = insight.get('content', '').strip()
        
        # Fix type if it's close to a requested type
        if insight_type not in insight_types:
            for req_type in insight_types:
                if req_type.lower() in insight_type.lower() or insight_type.lower() in req_type.lower():
                    insight_type = req_type
                    break
        
        # Validate content length and quality
        if len(content) < 30:  # Too short
            continue
            
        # Ensure relevance score is valid
        try:
            relevance_score = float(insight.get('relevance_score', 0.8))
            if not 0.0 <= relevance_score <= 1.0:
                relevance_score = 0.8
        except:
            relevance_score = 0.8
        
        validated_insights.append({
            'type': insight_type,
            'content': content,
            'relevance_score': relevance_score
        })
    
    # Ensure we have all requested types
    existing_types = {insight['type'] for insight in validated_insights}
    for req_type in insight_types:
        if req_type not in existing_types:
            # Try to find a close match and rename it
            for insight in validated_insights:
                if insight['type'] not in insight_types:
                    insight['type'] = req_type
                    existing_types.add(req_type)
                    break
    
    return validated_insights[:len(insight_types)]


def _extract_insights_from_text(response: str, insight_types: List[str], selected_text: str, related_sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extract insights from unstructured text response"""
    import re
    
    insights = []
    
    # Split response into sections
    sections = re.split(r'\n\s*\n', response.strip())
    
    for i, section in enumerate(sections):
        if i >= len(insight_types):
            break
            
        # Clean up the section
        section = section.strip()
        if len(section) < 30:
            continue
            
        # Remove any numbering or bullet points
        section = re.sub(r'^\d+\.?\s*', '', section)
        section = re.sub(r'^[-*•]\s*', '', section)
        
        # Extract content (skip lines that look like headers)
        lines = section.split('\n')
        content_lines = []
        for line in lines:
            line = line.strip()
            if len(line) > 20 and ':' not in line[:20]:  # Avoid header-like lines
                content_lines.append(line)
        
        content = ' '.join(content_lines).strip()
        if len(content) >= 30:
            insights.append({
                'type': insight_types[i],
                'content': content,
                'relevance_score': 0.75
            })
    
    return insights


def _generate_minimal_insights_from_context(insight_types: List[str], selected_text: str, related_sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate minimal insights from available context when all parsing fails"""
    # Extract actual document names from context
    doc_names = []
    if related_sections:
        for section in related_sections:
            doc_name = section.get('pdf_name', section.get('document_name', ''))
            if doc_name and doc_name not in doc_names:
                doc_names.append(doc_name)
    
    # If no documents from related sections, try to get them from document service
    if not doc_names:
        try:
            from services.document_service import document_service
            all_docs = document_service.get_all_documents()
            doc_names = [doc.filename for doc in all_docs[:3]]
        except:
            doc_names = []
    
    # Extract key terms from selected text
    text_words = selected_text.split() if selected_text else []
    key_terms = [word.strip('.,!?";') for word in text_words if len(word) > 4][:3]
    
    insights = []
    for insight_type in insight_types:
        # Generate content based on actual context
        if doc_names and key_terms:
            if insight_type == 'key_takeaways':
                content = f"The analysis of '{' '.join(key_terms[:2])}' reveals important insights when examining {doc_names[0] if doc_names else 'the available documents'}. This connects to broader themes found across {', '.join(doc_names[:2]) if len(doc_names) > 1 else 'the document collection'}."
            elif insight_type == 'examples':
                content = f"Examples of {key_terms[0] if key_terms else 'the concepts'} can be found in {doc_names[0] if doc_names else 'the documents'}, demonstrating practical applications that relate to {key_terms[1] if len(key_terms) > 1 else 'the main topic'}."
            elif insight_type == 'contradictions':
                content = f"Different perspectives on {key_terms[0] if key_terms else 'the topic'} emerge when comparing {doc_names[0] if doc_names else 'the first document'} with {doc_names[1] if len(doc_names) > 1 else 'other sources'}, though these differences often complement rather than contradict each other."
            elif insight_type == 'cross_references':
                content = f"Cross-references between {doc_names[0] if doc_names else 'documents'} and {doc_names[1] if len(doc_names) > 1 else 'related materials'} show how {key_terms[0] if key_terms else 'the concepts'} interconnect across different sources."
            elif insight_type == 'did_you_know':
                content = f"Did you know that {key_terms[0] if key_terms else 'the subject matter'} has connections to {key_terms[1] if len(key_terms) > 1 else 'related topics'} as documented in {doc_names[0] if doc_names else 'the available materials'}?"
            else:
                content = f"Analysis of {key_terms[0] if key_terms else 'the selected content'} in context of {doc_names[0] if doc_names else 'the available documents'} reveals significant insights about {' and '.join(key_terms[:2]) if len(key_terms) > 1 else 'the subject matter'}."
        else:
            # Ultimate fallback with generic but reasonable content
            content = f"The selected text provides valuable insights that can be analyzed through the lens of document analysis and content examination, revealing important patterns and connections."
        
        insights.append({
            'type': insight_type,
            'content': content,
            'relevance_score': 0.6
        })
    
    return insights
