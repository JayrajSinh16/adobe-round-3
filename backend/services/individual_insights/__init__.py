"""
Individual insights service module for handling various insight generation operations.
This module provides modular components for generating different types of insights.
"""

from .context_manager import ContextManager
from .response_parser import ResponseParser
from .key_takeaway_generator import KeyTakeawayGenerator
from .did_you_know_generator import DidYouKnowGenerator
from .contradictions_generator import ContradictionsGenerator
from .examples_generator import ExamplesGenerator
from .cross_references_generator import CrossReferencesGenerator
from .utils import InsightsUtils

__all__ = [
    'ContextManager',
    'ResponseParser',
    'KeyTakeawayGenerator',
    'DidYouKnowGenerator',
    'ContradictionsGenerator',
    'ExamplesGenerator',
    'CrossReferencesGenerator',
    'InsightsUtils'
]
