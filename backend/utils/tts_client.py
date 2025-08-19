"""
Thin wrapper module that re-exports the TTS functions from the
modularized utils/tts_client/ package without changing their logic.
"""

from __future__ import annotations

import importlib.util
import os

__all__ = [
    "generate_audio",
    "create_podcast_audio",
    "combine_text_transcripts",
]


def _import_attr(module_filename: str, attr_name: str):
    """Load a module from the sibling tts_client package by file path and return an attribute."""
    pkg_dir = os.path.join(os.path.dirname(__file__), "tts_client")
    module_path = os.path.join(pkg_dir, f"{module_filename}.py")

    spec = importlib.util.spec_from_file_location(
        f"utils.tts_client.{module_filename}", module_path
    )
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module: {module_filename} from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore[attr-defined]
    return getattr(module, attr_name)


# Re-export functions implemented in the new modular package files
generate_audio = _import_attr("generate_audio", "generate_audio")
create_podcast_audio = _import_attr("create_podcast_audio", "create_podcast_audio")
combine_text_transcripts = _import_attr("combine_text_transcripts", "combine_text_transcripts")
