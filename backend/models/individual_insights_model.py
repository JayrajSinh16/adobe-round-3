from typing import List, Literal
from pydantic import BaseModel

class SourceDocument(BaseModel):
    pdf_name: str
    pdf_id: str
    page: int


# This is used to get the frontend data properly - NOT for the API response
# Keep this in mind: this is not the response of the API, this is part of the request
class Respond(BaseModel):
    type: Literal["key_takeaways", "did_you_know", "examples", "cross_references", "contradictions"]
    title: str
    content: str
    source_documents: List[SourceDocument]
    confidence: float

class IndividualInsightRequest(BaseModel):
    selected_text: str
    document_id: str
    page_no: int
    insight_type: Literal["key_takeaway", "did_you_know", "examples", "cross_references", "contradictions"]
    respond: Respond

# === API RESPONSE MODELS ===
# Common source document model for responses
class ResponseSourceDocument(BaseModel):
    pdf_name: str
    page_number: int
    relevance_score: float

# Base response model with common fields
class BaseInsightResponse(BaseModel):
    type: Literal["key_takeaway", "did_you_know", "examples", "cross_references", "contradictions"]
    title: str
    content: str
    source_documents: List[ResponseSourceDocument]
    confidence: float

# Key Takeaway Models
class KeyTakeawayResponse(BaseInsightResponse):
    type: Literal["key_takeaway"] = "key_takeaway"
    immediate_action_required: str  # 1-2 line sentence
    business_impact: str  # 2-3 line sentence
    next_steps: List[str]  # 3 single-line strings

# Did You Know Models
class KnowledgeDepth(BaseModel):
    novelty_factor: Literal["high", "medium", "low"]
    surprise_level: int  # Scale of 1-5

class SourceContext(BaseModel):
    pdf_name: str
    page_number: int

class DidYouKnowResponse(BaseInsightResponse):
    type: Literal["did_you_know"] = "did_you_know"
    knowledge_depth: KnowledgeDepth
    source_context: SourceContext
    why_this_matters: str  # 2-4 line sentence

# Contradictions Models
class ContradictingSource(BaseModel):
    pdf_name: str
    description: str  # 1 line description

class ContradictionsResponse(BaseInsightResponse):
    type: Literal["contradictions"] = "contradictions"
    source_a: ContradictingSource
    source_b: ContradictingSource
    resolution_strategy: str  # 2-3 line sentences

# Examples Models
class ExamplesResponse(BaseInsightResponse):
    type: Literal["examples"] = "examples"
    implementation_approach: List[str]  # 3 single-line strings
    key_challenges: List[str]  # 3 single-line strings

# Cross References Models
class CrossReferencesResponse(BaseInsightResponse):
    type: Literal["cross_references"] = "cross_references"
    innovation_catalyst: List[str]  # 3 single-line strings
    pattern_analysis: str  # 2-3 line sentences
    future_exploration: List[str]  # 3 single-line strings
