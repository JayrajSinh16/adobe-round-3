import os
import uuid
import time
import logging
from typing import List, Dict

# Set up logging
logger = logging.getLogger(__name__)

def generate_audio(text: str, speaker: str = "default") -> str:
    """
    Generate audio from text using configured TTS provider
    Returns the path to the generated audio file
    """
    from config import settings
    
    provider = settings.tts_provider
    output_filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(settings.audio_folder, output_filename)
    
    logger.info(f"🎤 Starting TTS generation for speaker '{speaker}' using provider '{provider}'")
    logger.info(f"🎤 Output file: {output_filename}")
    logger.info(f"🎤 Text length: {len(text)} characters")
    
    try:
        if provider == "azure" and settings.azure_tts_key and settings.azure_tts_endpoint:
            logger.info("🎤 Using Azure Cognitive Services TTS")
            logger.info(f"🎤 Azure endpoint: {settings.azure_tts_endpoint}")
            
            try:
                from azure.cognitiveservices.speech import (
                    SpeechConfig, SpeechSynthesizer, AudioConfig
                )
                
                # Extract region from endpoint
                # Format: https://mytts-resources.cognitiveservices.azure.com/
                endpoint_parts = settings.azure_tts_endpoint.replace('https://', '').replace('http://', '')
                # Handle format: mytts-resources.cognitiveservices.azure.com
                region_part = endpoint_parts.split('.')[0]
                if '-resources' in region_part:
                    region = region_part.replace('-resources', '')
                else:
                    # Fallback - try to extract region from different patterns
                    region = region_part.split('-')[0]
                
                logger.info(f"🎤 Extracted Azure region: {region} from endpoint: {settings.azure_tts_endpoint}")
                
                # Create speech config
                speech_config = SpeechConfig(
                    subscription=settings.azure_tts_key,
                    region=region
                )
                
                # Set voice based on speaker with enhanced mapping
                voice_mapping = {
                    "Host": "en-US-JennyNeural",      # Female, friendly
                    "Alex": "en-US-AriaNeural",       # Female, professional  
                    "Expert": "en-US-GuyNeural",      # Male, authoritative
                    "Jamie": "en-US-DavisNeural",     # Male, conversational
                    "default": "en-US-AriaNeural"
                }
                
                selected_voice = voice_mapping.get(speaker, voice_mapping["default"])
                speech_config.speech_synthesis_voice_name = selected_voice
                
                logger.info(f"🎤 Selected Azure voice: {selected_voice} for speaker: {speaker}")
                
                # Configure audio output
                audio_config = AudioConfig(filename=output_path)
                synthesizer = SpeechSynthesizer(
                    speech_config=speech_config,
                    audio_config=audio_config
                )
                
                logger.info("🎤 Starting Azure TTS synthesis...")
                result = synthesizer.speak_text_async(text).get()
                
                # Check result
                if result.reason == 3:  # SynthesizingAudioCompleted
                    logger.info(f"✅ Azure TTS synthesis completed successfully")
                    logger.info(f"✅ Audio file size: {os.path.getsize(output_path)} bytes")
                    return output_filename
                else:
                    logger.error(f"❌ Azure TTS synthesis failed: {result.reason}")
                    if hasattr(result, 'cancellation_details'):
                        logger.error(f"❌ Cancellation details: {result.cancellation_details}")
                    raise Exception(f"Azure TTS synthesis failed: {result.reason}")
                    
            except ImportError as e:
                logger.error(f"❌ Azure TTS SDK not installed: {e}")
                logger.info("💡 Install with: pip install azure-cognitiveservices-speech")
                provider = "local"  # Fallback to local
            except Exception as e:
                logger.error(f"❌ Azure TTS error: {str(e)}")
                provider = "local"  # Fallback to local
        
        # Local TTS fallback
        if provider == "local" or provider == "azure":  # Fallback to local if Azure fails
            logger.info(f"🎤 Using local pyttsx3 TTS")
            try:
                import pyttsx3
                
                engine = pyttsx3.init()
                
                # Configure voice based on speaker
                voices = engine.getProperty('voices')
                if voices and len(voices) > 1:
                    if speaker in ["Host", "Alex"]:  # Female voice
                        engine.setProperty('voice', voices[1].id if len(voices) > 1 else voices[0].id)
                        logger.info(f"🎤 Set female voice for {speaker}")
                    elif speaker in ["Expert", "Jamie"]:  # Male voice
                        engine.setProperty('voice', voices[0].id)
                        logger.info(f"🎤 Set male voice for {speaker}")
                    else:
                        engine.setProperty('voice', voices[0].id)
                        logger.info(f"🎤 Set default voice for {speaker}")
                
                # Set speech parameters
                if speaker in ["Alex", "Host"]:
                    engine.setProperty('rate', 152)
                    engine.setProperty('volume', 0.92)
                    logger.info(f"🎤 Set friendly settings for {speaker}")
                elif speaker in ["Jamie", "Expert"]:
                    engine.setProperty('rate', 158)
                    engine.setProperty('volume', 0.88)
                    logger.info(f"🎤 Set authoritative settings for {speaker}")
                else:
                    engine.setProperty('rate', 155)
                    engine.setProperty('volume', 0.9)
                    logger.info(f"🎤 Set default settings for {speaker}")
                
                # Generate audio
                logger.info("🎤 Starting pyttsx3 synthesis...")
                engine.save_to_file(text, output_path)
                engine.runAndWait()
                
                # Verify file was created
                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    logger.info(f"✅ pyttsx3 TTS synthesis completed")
                    logger.info(f"✅ Audio file size: {os.path.getsize(output_path)} bytes")
                    return output_filename
                else:
                    logger.error(f"❌ pyttsx3 failed to create audio file")
                    raise Exception("pyttsx3 failed to create audio file")
                    
            except ImportError as e:
                logger.error(f"❌ pyttsx3 not installed: {e}")
                logger.info("💡 Install with: pip install pyttsx3")
            except Exception as e:
                logger.error(f"❌ pyttsx3 error: {str(e)}")
                
    except Exception as e:
        logger.error(f"❌ Error in TTS generation: {str(e)}")
    
    # Create a text transcript as ultimate fallback
    try:
        transcript_filename = f"transcript_{uuid.uuid4()}.txt"
        transcript_path = os.path.join(settings.audio_folder, transcript_filename)
        
        with open(transcript_path, "w", encoding="utf-8") as f:
            f.write(f"Speaker: {speaker}\n")
            f.write(f"Text: {text}\n")
            f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        logger.info(f"📝 Created transcript fallback: {transcript_filename}")
        return transcript_filename
    except Exception as fallback_error:
        logger.error(f"❌ Even transcript fallback failed: {str(fallback_error)}")
        return None


def create_podcast_audio(script: List[Dict[str, str]]) -> str:
    """
    Create a complete podcast audio from script
    Returns the path to the combined audio file
    """
    logger.info(f"🎵 Creating podcast audio from {len(script)} script segments...")
    
    audio_files_created = []
    
    # Generate individual audio files
    for i, entry in enumerate(script):
        logger.info(f"🎤 Generating audio for segment {i+1}/{len(script)}: {entry['speaker']}")
        audio_file = generate_audio(entry["text"], entry["speaker"])
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


def combine_text_transcripts(transcript_files: List[str]) -> str:
    """
    Combine multiple text transcript files into one
    """
    from config import settings
    logger.info(f"📝 Combining {len(transcript_files)} text transcripts...")
    
    output_filename = f"podcast_transcript_{uuid.uuid4()}.txt"
    output_path = os.path.join(settings.audio_folder, output_filename)
    
    try:
        with open(output_path, "w", encoding="utf-8") as output_file:
            output_file.write("PODCAST TRANSCRIPT\n")
            output_file.write("==================\n\n")
            
            for i, transcript_file in enumerate(transcript_files):
                transcript_path = os.path.join(settings.audio_folder, transcript_file)
                
                if os.path.exists(transcript_path):
                    with open(transcript_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        output_file.write(f"--- Segment {i+1} ---\n")
                        output_file.write(content)
                        output_file.write("\n\n")
                    
                    # Clean up individual transcript
                    try:
                        os.remove(transcript_path)
                        logger.info(f"🗑️ Cleaned up: {transcript_file}")
                    except:
                        pass
        
        logger.info(f"✅ Combined transcript saved: {output_filename}")
        return output_filename
        
    except Exception as e:
        logger.error(f"❌ Error combining transcripts: {str(e)}")
        return transcript_files[0] if transcript_files else None
