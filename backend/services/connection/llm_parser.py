"""
LLM response parser module for handling and validating LLM responses.
"""

import json
import re
import logging
from typing import List, Optional, Any
from models import DocumentConnection

# Optional tolerant JSON parser
try:
    import demjson3 as demjson
except Exception:  # pragma: no cover
    demjson = None

logger = logging.getLogger(__name__)


class LLMParser:
    """Handles parsing and validation of LLM responses for connection extraction."""

    def parse_llm_response(self, response: str, source_pdf_name: str) -> List[DocumentConnection]:
        """Enhanced LLM response parsing with multiple fallback strategies and tolerant JSON parsing"""
        connections: List[DocumentConnection] = []
        response = (response or "").strip()

        if not response:
            logger.warning("LLMParser: Empty response received; returning 0 connections")
            return connections

        # Strategy 1: Try to find JSON using patterns, decode with stdlib first then demjson3 as tolerant fallback
        json_patterns = [
            (r"```json\s*(\[.*?\])\s*```", "code_block_array"),
            (r"```\s*(\[.*?\])\s*```", "code_block_array_nolang"),
            (r"```json\s*(\{.*?\})\s*```", "code_block_object"),
            (r"```\s*(\{.*?\})\s*```", "code_block_object_nolang"),
            (r"\[.*?\]", "array"),
            (r"\{.*?\}", "object"),
        ]

        for pattern, pattern_type in json_patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            if not matches:
                continue
            for match in matches:
                data = self._attempt_json_load(match, pattern_type)
                if data is None:
                    continue

                # Normalize to list of dicts
                if isinstance(data, list):
                    candidates = [x for x in data if isinstance(x, dict)]
                elif isinstance(data, dict):
                    candidates = [data]
                else:
                    candidates = []

                for item in candidates:
                    if self.is_valid_connection_dict(item):
                        conn = self.dict_to_connection(item, source_pdf_name)
                        if conn:
                            connections.append(conn)

                if connections:
                    logger.info(
                        f"LLMParser: Parsed {len(connections)} connections using pattern '{pattern_type}'"
                    )
                    return connections

        logger.debug("LLMParser: JSON patterns failed; attempting line-by-line heuristic parse")

        # Strategy 2: Try to parse line-by-line structured text
        lines = response.split("\n")
        current_connection: dict[str, Any] = {}

        for raw_line in lines:
            line = raw_line.strip()
            if not line:
                continue

            # Look for key-value patterns
            if ":" in line:
                parts = line.split(":", 1)
                key = parts[0].strip().lower()
                value = parts[1].strip().strip("\"'")

                if key in ["title", "heading"]:
                    current_connection["title"] = value
                elif key in ["type", "connection_type"]:
                    current_connection["type"] = value
                elif key in ["document", "pdf", "file"]:
                    current_connection["document"] = value
                elif key in ["snippet", "description", "summary"]:
                    current_connection["snippet"] = value
                elif key in ["strength", "relevance"]:
                    current_connection["strength"] = value
                elif key in ["pages", "page"]:
                    try:
                        # Handle various page formats
                        page_str = (
                            value.replace("[", "")
                            .replace("]", "")
                            .replace("p.", "")
                            .replace("page", "")
                        )
                        pages = [int(x.strip()) for x in page_str.split(",") if x.strip().isdigit()]
                        current_connection["pages"] = pages if pages else [1]
                    except Exception:
                        current_connection["pages"] = [1]

            # Check if we have enough info to create a connection
            if len(current_connection) >= 3 and "title" in current_connection:
                conn = self.dict_to_connection(current_connection, source_pdf_name)
                if conn:
                    connections.append(conn)
                current_connection = {}

        # Handle last connection if any
        if len(current_connection) >= 3 and "title" in current_connection:
            conn = self.dict_to_connection(current_connection, source_pdf_name)
            if conn:
                connections.append(conn)

        if connections:
            logger.info(
                f"LLMParser: Parsed {len(connections)} connections using heuristic line-by-line parsing"
            )
        else:
            logger.warning("LLMParser: Failed to parse any connections from LLM response")

        return connections

    def _attempt_json_load(self, text: str, pattern_type: str) -> Optional[Any]:
        """Try parsing JSON using stdlib first, then demjson3 (tolerant)."""
        # First try strict json
        try:
            data = json.loads(text)
            logger.debug(
                f"LLMParser: json.loads succeeded for pattern '{pattern_type}'"
            )
            return data
        except Exception:
            pass

        # Try demjson3 as tolerant parser
        if demjson is not None:
            try:
                data = demjson.decode(text, strict=False)  # tolerant
                logger.debug(
                    f"LLMParser: demjson3.decode succeeded for pattern '{pattern_type}'"
                )
                return data
            except Exception:
                logger.debug(
                    f"LLMParser: demjson3.decode failed for pattern '{pattern_type}'"
                )
                return None
        else:
            logger.debug("LLMParser: demjson3 not installed; skipping tolerant decode")
            return None

    def is_valid_connection_dict(self, data: dict) -> bool:
        """Check if dictionary contains valid connection fields"""
        required_fields = ["title", "document"]
        optional_fields = ["type", "snippet", "pages", "strength"]

        # Must have title and document at minimum
        if not all(field in data for field in required_fields):
            return False

        # Check if it has some optional fields
        has_optional = any(field in data for field in optional_fields)
        return has_optional

    def dict_to_connection(self, data: dict, source_pdf_name: str) -> Optional[DocumentConnection]:
        """Convert dictionary to DocumentConnection object"""
        try:
            # Get document name
            doc_name = data.get("document", "")
            
            # Handle special case for source document connections (marked as SOURCE_DOCUMENT or actual name)
            if doc_name == "SOURCE_DOCUMENT":
                doc_name = source_pdf_name
            
            # Allow source document connections if explicitly marked as internal type
            connection_type = data.get("type", "concept")
            if doc_name == source_pdf_name and connection_type != "internal":
                # Only allow source document connections if explicitly typed as internal
                return None

            # Ensure snippet is reasonable length
            snippet = data.get("snippet", "Related content found.")
            words = snippet.split()
            if len(words) > 25:
                snippet = " ".join(words[:25]) + "..."

            # Handle pages
            pages = data.get("pages", [1])
            if not isinstance(pages, list):
                if isinstance(pages, (int, str)):
                    try:
                        pages = [int(pages)]
                    except Exception:
                        pages = [1]
                else:
                    pages = [1]

            # Normalize strength field to match our model's Literal values
            strength = data.get("strength", "medium").lower()
            if strength in ["strong", "very strong", "very high"]:
                strength = "high"
            elif strength in ["moderate", "average"]:
                strength = "medium"
            elif strength in ["weak", "minimal"]:
                strength = "low"
            elif strength not in ["low", "medium", "high"]:
                strength = "medium"  # Default fallback

            return DocumentConnection(
                title=data.get("title", "Document Section"),
                type=connection_type,
                document=doc_name,
                pages=pages,
                snippet=snippet,
                strength=strength,
            )
        except Exception as e:
            logger.error(f"LLMParser: Error creating connection from dict: {e}")
            return None
