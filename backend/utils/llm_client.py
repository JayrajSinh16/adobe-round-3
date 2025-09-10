"""
LLM Client - Modular aggregator preserving original public API.
Logic remains in submodules under utils/llm_client/.
"""

from typing import Dict, Any, List

# Keep original imports available to callers
from .task_modules import summary_generator, insight_analyzer, content_generator  # noqa: F401

# Re-export functions from submodules to keep the same API
from .llm_client.insights import (
    generate_insights,
) # noqa: F401


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