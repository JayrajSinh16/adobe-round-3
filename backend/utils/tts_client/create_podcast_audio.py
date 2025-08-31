import os
import uuid
import logging
from typing import List, Dict

# Set up logging
logger = logging.getLogger(__name__)

from .generate_audio import generate_audio
from .combine_text_transcripts import combine_text_transcripts


def create_podcast_audio(script: List[Dict[str, str]], language: str = "en") -> str:
    """
    Create a complete podcast audio from script
    Returns the path to the combined audio file
    """
    logger.info(f"🎵 Creating podcast audio from {len(script)} script segments...")
    
    audio_files_created = []
    
    # Generate individual audio files
    for i, entry in enumerate(script):
        logger.info(f"🎤 Generating audio for segment {i+1}/{len(script)}: {entry['speaker']}")
        audio_file = generate_audio(entry["text"], entry["speaker"], language=language)
        if audio_file and (audio_file.endswith('.wav') or audio_file.endswith('.txt')):
            from config import settings
            audio_path = os.path.join(settings.audio_folder, audio_file)
            if os.path.exists(audio_path):
                audio_files_created.append(audio_file)
                logger.info(f"✅ Created: {audio_file}")
            else:
                logger.error(f"❌ File not found: {audio_path}")
        else:
            logger.error(f"❌ Failed to generate audio for segment {i+1}")
    
    if not audio_files_created:
        logger.error("❌ No audio files were created")
        return None
    
    # Check if all files are text transcripts
    if all(f.endswith('.txt') for f in audio_files_created):
        logger.info("📝 All files are text transcripts, combining them...")
        return combine_text_transcripts(audio_files_created)
    
    # Try to combine using pydub for audio files
    wav_files = [f for f in audio_files_created if f.endswith('.wav')]
    if wav_files:
        try:
            from pydub import AudioSegment
            from config import settings
            logger.info("🎵 Attempting to combine WAV audio using pydub...")
            
            audio_segments = []
            previous_speaker = None
            
            for i, audio_file in enumerate(wav_files):
                audio_path = os.path.join(settings.audio_folder, audio_file)
                try:
                    segment = AudioSegment.from_wav(audio_path)
                    audio_segments.append(segment)
                    
                    # Add natural pauses between segments
                    if i < len(wav_files) - 1:
                        current_speaker = script[i]['speaker'] if i < len(script) else 'unknown'
                        
                        if previous_speaker != current_speaker:
                            pause_duration = 850  # ms for speaker change
                        else:
                            pause_duration = 400  # ms for same speaker
                        
                        audio_segments.append(AudioSegment.silent(duration=pause_duration))
                        previous_speaker = current_speaker
                    
                    logger.info(f"✅ Loaded: {audio_file}")
                    
                except Exception as e:
                    logger.error(f"❌ Could not load {audio_file}: {e}")
                    continue
            
            if audio_segments:
                # Combine all segments
                combined = audio_segments[0]
                for segment in audio_segments[1:]:
                    combined += segment
                
                # Save combined audio
                output_filename = f"podcast_combined_{uuid.uuid4()}.wav"
                output_path = os.path.join(settings.audio_folder, output_filename)
                
                combined.export(output_path, format="wav")
                logger.info(f"✅ Combined WAV audio saved: {output_filename}")
                
                # Clean up individual files
                for audio_file in wav_files:
                    try:
                        os.remove(os.path.join(settings.audio_folder, audio_file))
                        logger.info(f"🗑️ Cleaned up: {audio_file}")
                    except:
                        pass
                
                return output_filename
                
        except ImportError:
            logger.warning("⚠️ pydub not available, using custom combining method...")
        except Exception as e:
            logger.warning(f"⚠️ pydub combining failed: {e}")
    
    # Return the first available file as fallback
    if audio_files_created:
        logger.info(f"⚠️ Returning first audio file as fallback: {audio_files_created[0]}")
        return audio_files_created[0]
    
    return None
