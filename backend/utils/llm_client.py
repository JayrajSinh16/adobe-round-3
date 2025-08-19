"""
LLM Client - Task-specific interface for document analysis
"""

import os
from typing import Dict, Any, List

# Import task-specific modules
from .core_llm import chat_with_llm, get_llm_client
from .task_modules import summary_generator, insight_analyzer, content_generator


def get_all_pdf_outlines() -> List[Dict[str, Any]]:
    """Get outlines from all uploaded PDFs to provide context to LLM"""
    try:
        from services.document_service import document_service
        
        outlines = []
        documents = document_service.get_all_documents()
        
        for doc in documents:
            outline = document_service.get_document_outline(doc.id)
            if outline:
                # Format outline for LLM context
                formatted_outline = {
                    "pdf_name": doc.filename,
                    "document_id": doc.id,
                    "outline": outline.get('outline', []),
                    "summary": outline.get('summary', outline.get('title', 'No summary available'))
                }
                outlines.append(formatted_outline)
        
        return outlines
        
    except Exception as e:
        print(f"Error fetching PDF outlines: {e}")
        return []


def format_outlines_for_context(outlines: List[Dict[str, Any]]) -> str:
    """Format PDF outlines for inclusion in LLM prompts"""
    if not outlines:
        return "No PDF documents have been uploaded yet."
    
    context_parts = []
    context_parts.append("AVAILABLE DOCUMENTS AND THEIR STRUCTURE:")
    
    for outline in outlines:
        context_parts.append(f"\n--- {outline['pdf_name']} ---")
        context_parts.append(f"Summary: {outline['summary']}")
        
        # Add outline structure
        outline_items = outline.get('outline', [])
        if outline_items:
            context_parts.append("Document Structure:")
            for i, item in enumerate(outline_items):
                if i >= 10:  # Limit to first 10 items to conserve tokens
                    break
                level = item.get('level', 'H1')
                heading = item.get('text', item.get('heading', 'Unknown'))  # Try 'text' first, then 'heading'
                try:
                    # Handle both numeric and string levels
                    if isinstance(level, str):
                        if level.lower().startswith('h'):
                            level_num = int(level[1:]) if level[1:].isdigit() else 1
                        else:
                            level_num = 1
                    else:
                        level_num = int(level) if level else 1
                    indent = "  " * max(0, level_num - 1)
                except (ValueError, TypeError):
                    indent = ""
                context_parts.append(f"{indent}- {heading}")
    
    return "\n".join(context_parts)


# SUMMARY GENERATION TASKS

def generate_snippet_summary(text: str, limit: int = 2) -> str:
    """Generate a concise summary of the given text"""
    return summary_generator.generate_snippet_summary(text, limit)


def generate_executive_summary(content: List[str], max_length: int = 5) -> str:
    """Generate an executive summary from multiple content pieces"""
    return summary_generator.generate_executive_summary(content, max_length)



# INSIGHT ANALYSIS TASKS

def generate_insights_multi_call(selected_text: str, related_sections: List[Dict[str, Any]], insight_types: List[str]) -> List[Dict[str, Any]]:
    """Generate insights using multiple focused LLM calls for better quality and specificity"""
    
    # Define insight batches with specific focus
    insight_batches = [
        {
            "types": ["key_takeaways", "examples"],
            "focus": "practical_analysis",
            "description": "Key Takeaways and Practical Examples"
        },
        {
            "types": ["cross_references", "did_you_know"],
            "focus": "connections_discovery", 
            "description": "Cross-References and Interesting Facts"
        },
        {
            "types": ["contradictions"],
            "focus": "conflict_analysis",
            "description": "Contradictions and Conflicting Views"
        }
    ]
    
    # Filter batches to only include requested insight types
    filtered_batches = []
    for batch in insight_batches:
        requested_types = [t for t in batch["types"] if t in insight_types]
        if requested_types:
            filtered_batches.append({
                **batch,
                "types": requested_types
            })
    
    all_insights = []
    pdf_context = format_outlines_for_context(get_all_pdf_outlines())
    
    # Process each batch with focused LLM calls
    for batch_idx, batch in enumerate(filtered_batches):
        print(f"🔄 Processing batch {batch_idx + 1}/{len(filtered_batches)}: {batch['description']}")
        
        batch_insights = _generate_insight_batch(
            selected_text=selected_text,
            related_sections=related_sections,
            insight_types=batch["types"],
            focus=batch["focus"],
            pdf_context=pdf_context,
            batch_description=batch["description"]
        )
        
        all_insights.extend(batch_insights)
        
        # Small delay between calls to be respectful to API
        import time
        time.sleep(0.1)
    
    # Ensure we have all requested types (fill any missing ones)
    existing_types = {insight["type"] for insight in all_insights}
    for insight_type in insight_types:
        if insight_type not in existing_types:
            print(f"⚠️ Missing insight type: {insight_type}, generating fallback")
            fallback_insight = _generate_fallback_insight(insight_type, selected_text, related_sections)
            all_insights.append(fallback_insight)
    
    # Sort insights to match the original order requested
    sorted_insights = []
    for insight_type in insight_types:
        for insight in all_insights:
            if insight["type"] == insight_type:
                sorted_insights.append(insight)
                break
    
    return sorted_insights


def _get_most_relevant_documents(related_sections: List[Dict[str, Any]], limit: int = 3) -> List[str]:
    """Get the most relevant documents based on related sections and connection strength"""
    if not related_sections:
        # Fallback to get any available documents
        try:
            from services.document_service import document_service
            all_docs = document_service.get_all_documents()
            return [doc.filename for doc in all_docs[:limit]]
        except Exception:
            return []
    
    # Score documents based on frequency and connection strength
    doc_scores = {}
    
    for section in related_sections:
        doc_name = section.get('pdf_name', section.get('document_name', ''))
        if not doc_name:
            continue
            
        # Base score for appearing in related sections
        if doc_name not in doc_scores:
            doc_scores[doc_name] = 0
        
        # Score based on connection strength
        strength = section.get('strength', 'medium')
        if strength == 'high':
            doc_scores[doc_name] += 3
        elif strength == 'medium':
            doc_scores[doc_name] += 2
        else:  # low
            doc_scores[doc_name] += 1
        
        # Bonus for having content/snippet (indicates better connection)
        if section.get('content') and len(section.get('content', '')) > 50:
            doc_scores[doc_name] += 1
    
    # Sort by score and return top documents
    sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)
    return [doc[0] for doc in sorted_docs[:limit]]


def _generate_insight_batch(selected_text: str, related_sections: List[Dict[str, Any]], 
                           insight_types: List[str], focus: str, pdf_context: str, 
                           batch_description: str) -> List[Dict[str, Any]]:
    """Generate a batch of insights with specific focus"""
    
    # Get system prompt for this specific focus
    system_prompt = _get_focused_system_prompt(focus, insight_types, batch_description)
    
    # Build related content text
    related_text = _build_related_content_text(related_sections)
    
    # Get the 3 most relevant documents based on related_sections
    relevant_docs = _get_most_relevant_documents(related_sections, limit=3)
    
    # Create focused user prompt with only the most relevant documents
    user_prompt = f"""SELECTED TEXT: "{selected_text}"

DOCUMENT LIBRARY CONTEXT:
{pdf_context}

{related_text}

MOST RELEVANT DOCUMENTS: {', '.join(relevant_docs)}

TASK: Generate {len(insight_types)} insights with types: {', '.join(insight_types)}

FOCUS: {batch_description}

REQUIREMENTS:
- Each insight should be 2-3 concise, meaningful sentences
- Reference ONLY the most relevant documents: {', '.join(relevant_docs)}
- For contradictions: Focus on conflicting information between documents
- For cross_references: Highlight specific connections between different sources
- Make insights informative and evidence-based
- Include specific details, not generic statements

Return only the JSON array:"""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=2000,  # Smaller token limit for focused responses
        temperature=0.7,
        system_prompt=system_prompt
    )
    
    # Parse the response with robust handling
    parsed_insights = _parse_batch_response(response, insight_types, selected_text, related_sections)
    
    return parsed_insights


def _get_focused_system_prompt(focus: str, insight_types: List[str], batch_description: str) -> str:
    """Get specialized system prompt based on the focus area"""
    
    base_prompt = f"""You are a specialized document analysis expert focusing on {batch_description}. 

CRITICAL RESPONSE REQUIREMENTS:
1. Return ONLY a valid JSON array
2. Array must contain exactly {len(insight_types)} objects  
3. Each object must have: "type", "content", "relevant_document", "page_number", "relevance_score"
4. types must be: {', '.join(insight_types)}
5. content must be concise but informative (150-250 characters MAX)
6. relevant_document must be a specific document name from the provided context
7. page_number must be a specific page number where the insight is most relevant
8. relevance_score must be between 0.0 and 1.0
9. NO markdown, NO explanations, NO code blocks
10. Start response with [ and end with ]"""

    if focus == "practical_analysis":
        focused_prompt = """
SPECIALIZED FOCUS: Key Takeaways and Practical Examples
- For key_takeaways: Extract the most important, actionable insights from the content
- For examples: Identify concrete, specific examples that illustrate key concepts
- Emphasize practical applications and real-world relevance
- Reference specific document sections and page numbers where these insights originate
- Focus on actionable information and concrete evidence"""

    elif focus == "connections_discovery":
        focused_prompt = """
SPECIALIZED FOCUS: Cross-References and Interesting Facts  
- For cross_references: Find SPECIFIC connections between different documents or sections
  * Identify where Document A references concepts also found in Document B
  * Quote key phrases that connect across sources (be concise)
  * Focus on informative connections, not generic similarities
- For did_you_know: Discover surprising, data-driven facts
  * Include specific numbers, dates, or unique details
  * Reference concrete examples from the documents
  * Avoid generic statements - be specific and factual"""

    elif focus == "conflict_analysis":
        focused_prompt = """
SPECIALIZED FOCUS: Contradictions and Conflicting Views
- For contradictions: Identify SPECIFIC conflicting information with evidence
  * Quote key conflicting statements from different sources (be brief)
  * Example: "Doc A: X is 25%, Doc B: X is 40%"
  * Highlight different approaches that lead to different conclusions
  * Focus on meaningful disagreements with specific details
  * Reference exact sources where conflicting information appears"""

    else:
        focused_prompt = """
SPECIALIZED FOCUS: General Analysis
- Provide meaningful, specific insights based on the requested types
- Reference concrete examples from the document library
- Ensure insights are substantial and valuable"""

    example_format = f"""
EXAMPLE FORMAT:
[
  {{"type": "{insight_types[0] if insight_types else 'key_takeaways'}", "content": "Doc A (p.5) shows X methodology gives Y result, contrasting Doc B's Z approach.", "relevant_document": "Document Name.pdf", "page_number": 5, "relevance_score": 0.85}},
  {{"type": "{insight_types[1] if len(insight_types) > 1 else 'examples'}", "content": "Doc B (p.12) provides ABC company case: XYZ strategy yielded 25% improvement.", "relevant_document": "Another Doc.pdf", "page_number": 12, "relevance_score": 0.78}}
]"""

    return base_prompt + focused_prompt + example_format


def _build_related_content_text(related_sections: List[Dict[str, Any]]) -> str:
    """Build related content text from sections"""
    if not related_sections:
        return "No directly related content sections available."
    
    document_groups = {}
    for section in related_sections:
        doc_name = section.get('pdf_name', section.get('document_name', 'Document'))
        if doc_name not in document_groups:
            document_groups[doc_name] = []
        document_groups[doc_name].append(section)
    
    related_text = "RELATED CONTENT FROM DOCUMENTS:\n"
    for doc_name, sections in document_groups.items():
        related_text += f"\nFrom '{doc_name}':\n"
        for section in sections[:3]:  # Limit to 3 sections per document
            heading = section.get('heading', section.get('text', 'Content'))
            content = section.get('content', '').strip()
            page = section.get('page', 1)
            related_text += f"- {heading} (page {page}): {content[:150]}...\n"
    
    return related_text


def _parse_batch_response(response: str, insight_types: List[str], selected_text: str, related_sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Parse batch response with robust JSON handling"""
    import json
    import re
    
    print(f"🔍 DEBUG: Batch response ({len(response)} chars): {response[:200]}...")
    
    # Strategy 1: Direct JSON parsing
    try:
        cleaned_response = response.strip()
        parsed = json.loads(cleaned_response)
        if isinstance(parsed, list) and len(parsed) > 0:
            validated = _validate_batch_insights(parsed, insight_types, related_sections)
            if validated:
                print(f"✅ Batch parsing SUCCESS: Direct JSON")
                return validated
    except Exception as e:
        print(f"❌ Batch direct parsing failed: {e}")
    
    # Strategy 2: Extract JSON from response
    try:
        # Remove markdown and find JSON
        cleaned = re.sub(r'```(?:json)?\s*', '', response)
        cleaned = re.sub(r'```\s*', '', cleaned)
        json_match = re.search(r'\[[\s\S]*?\]', cleaned)
        
        if json_match:
            parsed = json.loads(json_match.group())
            if isinstance(parsed, list):
                validated = _validate_batch_insights(parsed, insight_types, related_sections)
                if validated:
                    print(f"✅ Batch parsing SUCCESS: Extracted JSON")
                    return validated
    except Exception as e:
        print(f"❌ Batch extraction parsing failed: {e}")
    
    # Strategy 3: Generate fallback insights
    print(f"⚠️ Batch parsing failed, generating fallback insights")
    return [_generate_fallback_insight(insight_type, selected_text, related_sections) for insight_type in insight_types]


def _validate_batch_insights(insights: List[Dict], insight_types: List[str], related_sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Validate and fix batch insights"""
    validated_insights = []
    
    # Get the most relevant documents for validation
    relevant_docs = _get_most_relevant_documents(related_sections, limit=3)
    available_docs = set(relevant_docs)
    
    # Add any additional docs from related sections as backup
    for section in related_sections:
        doc_name = section.get('pdf_name', section.get('document_name', ''))
        if doc_name:
            available_docs.add(doc_name)
    
    # Fallback to any available documents if we still have none
    if not available_docs:
        try:
            from services.document_service import document_service
            all_docs = document_service.get_all_documents()
            available_docs.update(doc.filename for doc in all_docs[:3])  # Limit to 3
        except:
            pass
    
    for insight in insights:
        if not isinstance(insight, dict):
            continue
            
        # Validate and fix fields
        insight_type = insight.get('type', '').strip()
        content = insight.get('content', '').strip()
        relevant_document = insight.get('relevant_document', '').strip()
        page_number = insight.get('page_number', 1)
        relevance_score = insight.get('relevance_score', 0.8)
        
        # Fix type if needed
        if insight_type not in insight_types:
            for req_type in insight_types:
                if req_type.lower() in insight_type.lower():
                    insight_type = req_type
                    break
        
        # Validate content - require more informative content
        if len(content) < 50:  # Increased from 20 to 50 for more informative content
            continue
            
        # Validate document name - prefer most relevant documents
        if not relevant_document or relevant_document not in available_docs:
            if relevant_docs:
                relevant_document = relevant_docs[0]  # Use most relevant document
            elif available_docs:
                relevant_document = list(available_docs)[0]
            else:
                relevant_document = "Unknown Document"
        
        # Validate page number
        try:
            page_number = int(page_number)
            if page_number < 1:
                page_number = 1
        except:
            page_number = 1
        
        # Validate relevance score
        try:
            relevance_score = float(relevance_score)
            if not 0.0 <= relevance_score <= 1.0:
                relevance_score = 0.8
        except:
            relevance_score = 0.8
        
        validated_insights.append({
            'type': insight_type,
            'content': content,
            'relevant_document': relevant_document,
            'page_number': page_number,
            'relevance_score': relevance_score
        })
    
    return validated_insights


def _generate_fallback_insight(insight_type: str, selected_text: str, related_sections: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate a fallback insight when parsing fails"""
    
    # Get the most relevant documents for fallback
    relevant_docs = _get_most_relevant_documents(related_sections, limit=3)
    doc_name = relevant_docs[0] if relevant_docs else "Unknown Document"
    page_num = 1
    
    if related_sections:
        first_section = related_sections[0]
        page_num = first_section.get('page', 1)
    
    # Generate type-specific content with more detail and relevance
    key_terms = selected_text.split()[:3] if selected_text else ['content']
    first_term = key_terms[0] if key_terms else 'the topic'
    
    content_map = {
        'key_takeaways': f"Analysis of '{first_term}' in {doc_name} reveals key insights about implementation approaches and practical applications that connect to broader patterns found across the document collection.",
        
        'examples': f"Concrete examples of {first_term} implementation can be found in {doc_name}, demonstrating specific methodologies and real-world applications that illustrate the practical aspects of the concept.",
        
        'contradictions': f"{doc_name} presents a different perspective on {first_term} compared to other sources, with specific variations in methodology or conclusions that highlight different approaches to the same underlying concepts.",
        
        'cross_references': f"Analysis shows {doc_name} contains information about {first_term} that directly connects to related concepts in {relevant_docs[1] if len(relevant_docs) > 1 else 'other documents'}, creating cross-document relationships.",
        
        'did_you_know': f"Detailed examination of {first_term} in {doc_name} reveals specific data points and interesting details that provide deeper understanding of the subject matter beyond surface-level information."
    }
    
    content = content_map.get(insight_type, f"Comprehensive analysis of {first_term} within {doc_name} provides valuable insights about the subject matter, revealing important patterns and connections to related concepts.")
    
    return {
        'type': insight_type,
        'content': content,
        'relevant_document': doc_name,
        'page_number': page_num,
        'relevance_score': 0.65  # Slightly higher for more informative fallbacks
    }


def generate_insights(selected_text: str, related_sections: List[Dict[str, Any]], insight_types: List[str]) -> List[Dict[str, Any]]:
    """Main insights generation function - now uses multi-call approach"""
    return generate_insights_multi_call(selected_text, related_sections, insight_types)


def get_insight_generation_stats() -> Dict[str, Any]:
    """Get statistics about the multi-call insight generation approach"""
    return {
        "approach": "multi_call_focused_batching_v2",
        "version": "2.0 - Enhanced with relevance filtering",
        "key_improvements": [
            "Limited source documents to 3 most relevant PDFs",
            "Enhanced contradiction insights with specific conflict identification",
            "Improved cross-reference insights with concrete connections",
            "Better content quality requirements (150-300 characters)",
            "Document relevance scoring based on connection strength"
        ],
        "batches": [
            {
                "batch_1": {
                    "types": ["key_takeaways", "examples"],
                    "focus": "practical_analysis",
                    "description": "Extracts actionable insights and concrete examples with evidence"
                }
            },
            {
                "batch_2": {
                    "types": ["cross_references", "did_you_know"], 
                    "focus": "connections_discovery",
                    "description": "Finds specific cross-document connections and data-driven facts"
                }
            },
            {
                "batch_3": {
                    "types": ["contradictions"],
                    "focus": "conflict_analysis", 
                    "description": "Identifies specific conflicting information with evidence and quotes"
                }
            }
        ],
        "document_relevance": {
            "scoring_method": "connection_strength_and_frequency",
            "max_documents": 3,
            "scoring_factors": [
                "Connection strength (high=3, medium=2, low=1)",
                "Content quality (bonus for substantial snippets)",
                "Frequency of appearance in related sections"
            ]
        },
        "content_quality": {
            "length_requirement": "150-250 characters",
            "specificity": "Evidence-based with concrete details",
            "contradiction_format": "Brief quotes of conflicting statements with sources",
            "cross_reference_format": "Concise connections with document references"
        },
        "response_format": {
            "type": "insight type",
            "content": "Evidence-based insight with specific details",
            "relevant_document": "most relevant document name (from top 3)",
            "page_number": "specific page number",
            "relevance_score": "0.0 to 1.0"
        }
    }


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


def generate_single_insight(selected_text: str, related_sections: List[Dict[str, Any]], insight_type: str) -> str:
    """Generate a single insight of specific type"""
    return insight_analyzer.generate_insight(selected_text, related_sections, insight_type)


def get_available_insight_types() -> List[str]:
    """Get list of available insight types"""
    return list(insight_analyzer.system_prompts.keys())



# CONTENT GENERATION TASKS

def generate_podcast_script(selected_text: str, insights: List[Dict], format: str = "podcast", max_duration_minutes: float = 4.5) -> List[Dict]:
    """Generate podcast script or audio overview using insights with time constraints"""
    return content_generator.generate_podcast_script(selected_text, insights, format, max_duration_minutes)



# SPECIALIZED ANALYSIS TASKS

def analyze_document_structure(content: str) -> Dict[str, Any]:
    """Analyze document structure and provide insights"""
    pdf_context = get_all_pdf_outlines()
    context_str = format_outlines_for_context(pdf_context)
    
    system_prompt = """You are a document structure analyst with access to a document library. Analyze the given content and provide insights about its organization, key themes, and structural elements while considering how it fits within the broader context of available documents. Focus on how the content is organized and what patterns emerge in relation to the document library. Always respond in plain text format - no markdown, bullets, or special formatting."""
    
    user_prompt = f"""Document Library Context:
{context_str}

Analyze the structure and organization of this document content, considering how it relates to the available documents:

{content[:1000]}..."""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=1000,  # Increased for complete document analysis
        temperature=0.6,
        system_prompt=system_prompt
    )
    
    return {
        "analysis": response,
        "content_length": len(content),
        "analysis_type": "structural"
    }


def extract_key_concepts(content: str) -> List[str]:
    """Extract key concepts and terms from content"""
    pdf_context = get_all_pdf_outlines()
    context_str = format_outlines_for_context(pdf_context)
    
    system_prompt = """You are a concept extraction specialist with access to a document library. Identify the most important concepts, terms, and keywords from the given content while considering the broader context of available documents. Focus on technical terms, important ideas, and key concepts that define the content in relation to the document library. Return only the concepts as a comma-separated list in plain text format."""
    
    user_prompt = f"""Document Library Context:
{context_str}

Extract key concepts from this content, considering how they relate to the available documents:

{content[:800]}..."""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=500,  # Increased for complete concept extraction
        temperature=0.4,
        system_prompt=system_prompt
    )
    
    # Parse comma-separated concepts
    try:
        concepts = [concept.strip() for concept in response.split(',')]
        return concepts[:10]  # Return top 10 concepts
    except:
        return ["Unable to extract concepts"]


def compare_documents(doc1_content: str, doc2_content: str) -> Dict[str, str]:
    """Compare two documents and find similarities/differences"""
    pdf_context = get_all_pdf_outlines()
    context_str = format_outlines_for_context(pdf_context)
    
    system_prompt = """You are a document comparison specialist with access to a document library. Compare two documents and identify their similarities, differences, and relationships while considering the broader context of available documents. Focus on content themes, approaches, and key insights in relation to the document library. Be concise and objective. Always respond in plain text format - no markdown, bullets, or special formatting."""
    
    user_prompt = f"""Document Library Context:
{context_str}

Compare these two document excerpts, considering how they relate to the available documents:

Document 1:
{doc1_content[:400]}...

Document 2:
{doc2_content[:400]}..."""
    
    client = get_llm_client()
    response = client.generate(
        prompt=user_prompt,
        max_tokens=1000,  # Increased for complete document comparison
        temperature=0.6,
        system_prompt=system_prompt
    )
    
    return {
        "comparison": response,
        "doc1_length": len(doc1_content),
        "doc2_length": len(doc2_content)
    }



# UTILITY FUNCTIONS

def get_task_modules_info() -> Dict[str, List[str]]:
    """Get information about available task modules and their functions"""
    return {
        "summary_tasks": [
            "generate_snippet_summary",
            "generate_executive_summary"
        ],
        "insight_tasks": [
            "generate_insights", 
            "generate_single_insight",
            "get_available_insight_types"
        ],
        "content_tasks": [
            "generate_podcast_script"
        ],
        "analysis_tasks": [
            "analyze_document_structure",
            "extract_key_concepts", 
            "compare_documents"
        ]
    }


def optimize_for_free_tier(enable: bool = True):
    """Configure settings to optimize for free tier usage"""
    if enable:
        # Reduce default token limits
        summary_generator.client._max_tokens = 150
        insight_analyzer.client._max_tokens = 200
        content_generator.client._max_tokens = 250
        print("✅ Optimized for free tier - reduced token limits")
    else:
        print("✅ Using standard token limits")


# BACKWARD COMPATIBILITY


# Legacy function signatures for backward compatibility
def generate_insights_legacy(selected_text: str, insight_types: List[str]) -> List[Dict[str, Any]]:
    """Legacy function for backward compatibility"""
    return generate_insights(selected_text, [], insight_types)