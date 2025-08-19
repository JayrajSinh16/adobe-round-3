"""
Audio generator module for creating audio files and handling fallbacks.
"""

import os
from typing import List, Dict, Any
from config import settings
from utils import create_podcast_audio


class AudioGenerator:
    """Handles audio generation and fallback mechanisms."""
    
    def __init__(self):
        pass
    
    def generate_audio(self, script_data: List[Dict[str, Any]]) -> str:
        """Generate audio with different voices"""
        print(f"🎤 Calling create_podcast_audio with {len(script_data)} segments...")
        audio_filename = create_podcast_audio(script_data)
        print(f"🎤 create_podcast_audio returned: {audio_filename}")
        return audio_filename or ""
    
    def process_audio_result(self, audio_filename: str, script_data: List[Dict[str, Any]]) -> str:
        """Process audio generation result and handle fallbacks"""
        if audio_filename and audio_filename.endswith('.wav'):
            # Verify the audio file exists and is not empty
            audio_path = os.path.join(settings.audio_folder, audio_filename)
            if os.path.exists(audio_path) and os.path.getsize(audio_path) > 100:  # At least 100 bytes
                audio_url = f"/static/audio/{audio_filename}"
                print(f"✅ Audio URL set to: {audio_url}")
                return audio_url
            else:
                print(f"❌ Audio file is empty or doesn't exist: {audio_path}")
                # Create synthetic audio as fallback
                return self._create_fallback_audio(script_data)
        elif audio_filename and audio_filename.endswith('.txt'):
            # Transcript was generated instead of audio
            print(f"⚠️ Only transcript available: {audio_filename}")
            audio_url = f"/static/audio/{audio_filename}"
            return audio_url
        else:
            print("❌ No audio filename returned, setting empty audio_url")
            return ""
    
    def _create_fallback_audio(self, script_data: List[Dict[str, Any]]) -> str:
        """Create synthetic audio as fallback"""
        try:
            from utils.tts_client import generate_audio
            combined_text = " ".join([entry["text"] for entry in script_data[:3]])  # First 3 segments
            fallback_audio = generate_audio(combined_text, "Host")
            if fallback_audio and fallback_audio.endswith('.wav'):
                audio_url = f"/static/audio/{fallback_audio}"
                print(f"✅ Fallback audio URL set to: {audio_url}")
                return audio_url
            else:
                print("❌ Fallback audio generation also failed")
                return ""
        except Exception as e:
            print(f"❌ Error creating fallback audio: {e}")
            return ""
    
    def validate_audio_file(self, audio_path: str) -> bool:
        """Validate that audio file exists and is not empty"""
        return os.path.exists(audio_path) and os.path.getsize(audio_path) > 100
