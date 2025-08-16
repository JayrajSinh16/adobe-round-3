"""
LLM Client Architecture Documentation
"""

MODULAR_ARCHITECTURE_DIAGRAM = """
┌─────────────────────────────────────────────────────────────────────┐
│                        MODULAR LLM CLIENT ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────────────────────────────┐  │
│  │   llm_client.py │────│              MAIN FACADE                │  │
│  │   (Main API)    │    │         (Task Orchestration)            │  │
│  └─────────────────┘    └─────────────────────────────────────────┘  │
│           │                                │                        │
│           │                                │                        │
│  ┌─────────────────┐    ┌─────────────────────────────────────────┐  │
│  │   core_llm.py   │────│            CORE LLM CLIENT             │  │
│  │   (Core Engine) │    │         (Rate Limiting & API)           │  │
│  └─────────────────┘    └─────────────────────────────────────────┘  │
│           │                                │                        │
│           │                                │                        │
│  ┌─────────────────┐    ┌─────────────────────────────────────────┐  │
│  │task_modules.py  │────│           TASK SPECIALISTS             │  │
│  │(Specialized)    │    │                                         │  │
│  └─────────────────┘    │  ┌─────────────┐  ┌─────────────────┐   │  │
│                         │  │   Summary   │  │     Insight     │   │  │
│                         │  │  Generator  │  │    Analyzer     │   │  │
│                         │  └─────────────┘  └─────────────────┘   │  │
│                         │                                         │  │
│                         │  ┌─────────────┐  ┌─────────────────┐   │  │
│                         │  │  Content    │  │   Specialized   │   │  │
│                         │  │ Generator   │  │    Analysis     │   │  │
│                         │  └─────────────┘  └─────────────────┘   │  │
│                         └─────────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                             FEATURES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🔧 MODULAR DESIGN          🚀 TASK-SPECIFIC OPTIMIZATION           │
│  • Separate concerns        • Summary Generation                    │
│  • Easy to extend           • Insight Analysis                      │
│  • Independent testing      • Content Creation                      │
│                             • Document Analysis                     │
│                                                                     │
│  ⚡ PERFORMANCE              🛡️ RELIABILITY                         │
│  • Shared rate limiting     • Error handling per task              │
│  • Token optimization       • Fallback responses                   │
│  • Free tier friendly       • Quota management                     │
│                                                                     │
│  🔄 COMPATIBILITY            📊 MONITORING                          │
│  • Backward compatible      • Task-specific metrics                │
│  • Legacy function support  • Usage tracking                       │
│  • Seamless migration       • Performance insights                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
"""

TASK_SPECIFIC_FUNCTIONS = """
┌─────────────────────────────────────────────────────────────────────┐
│                        TASK-SPECIFIC FUNCTIONS                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📝 SUMMARY TASKS                                                   │
│  ├── generate_snippet_summary()      → Quick 1-3 sentence summaries │
│  └── generate_executive_summary()    → Strategic overviews          │
│                                                                     │
│  🔍 INSIGHT TASKS                                                   │
│  ├── generate_insights()             → Multiple insight types       │
│  ├── generate_single_insight()       → Specific insight type        │
│  └── get_available_insight_types()   → List available types         │
│                                                                     │
│  🎙️ CONTENT TASKS                                                   │
│  └── generate_podcast_script()       → Audio content scripts        │
│                                                                     │
│  📊 ANALYSIS TASKS                                                  │
│  ├── analyze_document_structure()    → Document organization        │
│  ├── extract_key_concepts()          → Important terms/concepts     │
│  └── compare_documents()             → Document comparison          │
│                                                                     │
│  🛠️ UTILITY FUNCTIONS                                               │
│  ├── get_task_modules_info()         → Architecture overview        │
│  ├── optimize_for_free_tier()        → Performance tuning          │
│  └── chat_with_llm()                 → Legacy compatibility         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
"""

USAGE_EXAMPLES = """
# EXAMPLE USAGE OF MODULAR CLIENT

from utils.llm_client import (
    generate_snippet_summary,
    generate_insights,
    analyze_document_structure,
    optimize_for_free_tier
)

# 1. OPTIMIZE FOR FREE TIER
optimize_for_free_tier(True)

# 2. GENERATE SUMMARY
summary = generate_snippet_summary(
    text="Your document content here...",
    limit=2
)

# 3. GENERATE INSIGHTS
insights = generate_insights(
    selected_text="Key content section",
    related_sections=related_data,
    insight_types=["key_takeaways", "examples"]
)

# 4. ANALYZE STRUCTURE
structure = analyze_document_structure(content)

# 5. CHECK AVAILABLE MODULES
from utils.llm_client import get_task_modules_info
modules = get_task_modules_info()
"""

if __name__ == "__main__":
    print("LLM CLIENT ARCHITECTURE DOCUMENTATION")
    print("=" * 60)
    print(MODULAR_ARCHITECTURE_DIAGRAM)
    print(TASK_SPECIFIC_FUNCTIONS)
    print("USAGE EXAMPLES:")
    print(USAGE_EXAMPLES)
