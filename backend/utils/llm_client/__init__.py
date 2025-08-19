"""
LLM Client - Modular package aggregator preserving original public API.
Logic implementations live in sibling modules within this package.
"""

from typing import Dict, Any, List

# Keep original imports available to callers
from ..core_llm import chat_with_llm, get_llm_client  # noqa: F401
from ..task_modules import summary_generator, insight_analyzer, content_generator  # noqa: F401

# Re-export functions from submodules to keep the same API
from .context import get_all_pdf_outlines, format_outlines_for_context  # noqa: F401
from .summaries import generate_snippet_summary, generate_executive_summary  # noqa: F401
from .insights import (
    generate_insights_multi_call,
    generate_insights,
    get_insight_generation_stats,
)  # noqa: F401
from .parsing import (  # noqa: F401
    _parse_insights_response_robust,
    _validate_and_fix_insights,
    _extract_insights_from_text,
    _generate_minimal_insights_from_context,
)
from .content import generate_podcast_script  # noqa: F401
from .analysis import (
    analyze_document_structure,
    extract_key_concepts,
    compare_documents,
)  # noqa: F401


def get_task_modules_info() -> Dict[str, List[str]]:
    return {
        "summary_tasks": [
            "generate_snippet_summary",
            "generate_executive_summary",
        ],
        "insight_tasks": [
            "generate_insights",
            "generate_single_insight",
            "get_available_insight_types",
        ],
        "content_tasks": [
            "generate_podcast_script",
        ],
        "analysis_tasks": [
            "analyze_document_structure",
            "extract_key_concepts",
            "compare_documents",
        ],
    }


def optimize_for_free_tier(enable: bool = True):
    if enable:
        summary_generator.client._max_tokens = 150
        insight_analyzer.client._max_tokens = 200
        content_generator.client._max_tokens = 250
        print("✅ Optimized for free tier - reduced token limits")
    else:
        print("✅ Using standard token limits")


def generate_single_insight(selected_text: str, related_sections: List[Dict[str, Any]], insight_type: str) -> str:
    return insight_analyzer.generate_insight(selected_text, related_sections, insight_type)


def get_available_insight_types() -> List[str]:
    return list(insight_analyzer.system_prompts.keys())


def generate_insights_legacy(selected_text: str, insight_types: List[str]) -> List[Dict[str, Any]]:
    return generate_insights(selected_text, [], insight_types)
