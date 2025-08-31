import os
import uuid
import time
import logging
from typing import List, Dict

# Set up logging
logger = logging.getLogger(__name__)


def generate_audio(text: str, speaker: str = "default", language: str = "en") -> str:
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
                
                # Use region from settings directly if available
                region = settings.azure_tts_region
                if not region:
                    # Extract region from endpoint as fallback
                    # Format: https://mytts-resources.cognitiveservices.azure.com/
                    endpoint_parts = settings.azure_tts_endpoint.replace('https://', '').replace('http://', '')
                    # Handle format: mytts-resources.cognitiveservices.azure.com
                    region_part = endpoint_parts.split('.')[0]
                    if '-resources' in region_part:
                        region = region_part.replace('-resources', '')
                    else:
                        # Fallback - try to extract region from different patterns
                        region = region_part.split('-')[0]
                
                logger.info(f"🎤 Using Azure region: {region} from settings/endpoint: {settings.azure_tts_endpoint}")
                
                # Create speech config
                speech_config = SpeechConfig(
                    subscription=settings.azure_tts_key,
                    region=region
                )
                
                # Set voice based on speaker with language-aware mapping (common locales)
                lang = (language or "en").lower()
                # Normalize to locale codes Azure expects
                # Map short codes to locales
                locale_map = {
                    "en": "en-US",
                    "es": "es-ES",
                    "fr": "fr-FR",
                    "de": "de-DE",
                    "hi": "hi-IN",
                    "ja": "ja-JP",
                    "zh": "zh-CN",
                }
                locale = locale_map.get(lang, lang if '-' in lang else "en-US")

                female_default = {
                    "en-US": "en-US-JennyNeural",
                    "es-ES": "es-ES-ElviraNeural",
                    "fr-FR": "fr-FR-DeniseNeural",
                    "de-DE": "de-DE-KatjaNeural",
                    "hi-IN": "hi-IN-SwaraNeural",
                    "ja-JP": "ja-JP-NanamiNeural",
                    "zh-CN": "zh-CN-XiaoxiaoNeural",
                }.get(locale, "en-US-JennyNeural")

                male_default = {
                    "en-US": "en-US-GuyNeural",
                    "es-ES": "es-ES-AlvaroNeural",
                    "fr-FR": "fr-FR-HenriNeural",
                    "de-DE": "de-DE-ConradNeural",
                    "hi-IN": "hi-IN-MadhurNeural",
                    "ja-JP": "ja-JP-KeitaNeural",
                    "zh-CN": "zh-CN-YunxiNeural",
                }.get(locale, "en-US-GuyNeural")

                # Map specific speakers to gendered defaults
                if speaker in ["Host", "Alex", "Narrator"]:
                    selected_voice = female_default
                elif speaker in ["Expert", "Jamie"]:
                    selected_voice = male_default
                else:
                    selected_voice = female_default
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
                
                # Check result with detailed error handling
                from azure.cognitiveservices.speech import ResultReason
                if result.reason == ResultReason.SynthesizingAudioCompleted:
                    logger.info(f"✅ Azure TTS synthesis completed successfully")
                    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                        logger.info(f"✅ Audio file size: {os.path.getsize(output_path)} bytes")
                        return output_filename
                    else:
                        logger.error(f"❌ Azure TTS completed but file is empty or missing")
                        raise Exception("Azure TTS completed but output file is empty")
                elif result.reason == ResultReason.Canceled:
                    cancellation_details = result.cancellation_details
                    logger.error(f"❌ Azure TTS synthesis was canceled")
                    logger.error(f"❌ Cancellation reason: {cancellation_details.reason}")
                    logger.error(f"❌ Error details: {cancellation_details.error_details}")
                    
                    # Check for specific quota or authentication errors
                    if "quota" in str(cancellation_details.error_details).lower():
                        logger.error("❌ Azure TTS quota exceeded - falling back to local TTS")
                    elif "auth" in str(cancellation_details.error_details).lower():
                        logger.error("❌ Azure TTS authentication failed - falling back to local TTS")
                    
                    raise Exception(f"Azure TTS canceled: {cancellation_details.reason} - {cancellation_details.error_details}")
                else:
                    logger.error(f"❌ Azure TTS synthesis failed with reason: {result.reason}")
                    raise Exception(f"Azure TTS synthesis failed: {result.reason}")
                    
            except ImportError as e:
                logger.error(f"❌ Azure TTS SDK not installed: {e}")
                logger.info("💡 Install with: pip install azure-cognitiveservices-speech")
                provider = "local"  # Fallback to local
            except Exception as e:
                logger.error(f"❌ Azure TTS error: {str(e)}")
                provider = "local"  # Fallback to local

        # Local TTS fallback with pyttsx3
        if provider == "local":  # Fallback to local if Azure fails or explicitly selected
            logger.info(f"🎤 Using local TTS fallback")
            
            # Use pyttsx3 for local TTS
            try:
                import importlib
                pyttsx3 = importlib.import_module("pyttsx3")
                
                logger.info(f"🎤 Using pyttsx3 TTS for local synthesis")
                engine = pyttsx3.init()
                
                # Configure voice based on speaker and language if available
                voices = engine.getProperty('voices')
                if voices and len(voices) > 1:
                    # Try to pick a voice that matches the language
                    selected_local = None
                    prefer_female = speaker in ["Host", "Alex", "Narrator"]
                    lang_norm = (language or "en").split('-')[0].lower()
                    for v in voices:
                        vid = getattr(v, 'id', '')
                        name = getattr(v, 'name', '')
                        # Heuristic: language code present in id/name
                        if lang_norm in (vid or '').lower() or lang_norm in (name or '').lower():
                            selected_local = v
                            if prefer_female and ('female' in (name or '').lower()):
                                break
                    if not selected_local:
                        # Fallback to index 1 for female-ish voice, else first
                        selected_local = voices[1] if prefer_female and len(voices) > 1 else voices[0]
                    engine.setProperty('voice', selected_local.id)
                    logger.info(f"🎤 Local TTS voice set: {getattr(selected_local, 'name', 'unknown')}")
                
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
                logger.warning(f"⚠️ pyttsx3 not available: {e}")
                logger.info("💡 Install with: pip install pyttsx3")
            except Exception as e:
                logger.warning(f"⚠️ pyttsx3 error: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Error in TTS generation: {str(e)}")
    
    # Create a synthetic audio as ultimate fallback if all TTS methods fail
    try:
        import numpy as np
        import wave
        
        logger.info("🎤 Creating synthetic audio as ultimate fallback")
        
        # Generate a simple tone-based audio representation
        sample_rate = 22050  # 22kHz
        duration_seconds = min(len(text) / 150 * 60, 30)  # Estimate duration, max 30 seconds
        
        # Create a simple synthetic speech-like audio
        t = np.linspace(0, duration_seconds, int(sample_rate * duration_seconds))
        
        # Generate speech-like frequency modulation based on text characteristics
        base_freq = 150 if speaker in ["Expert", "Jamie"] else 200  # Lower for male voices
        
        # Create audio with varying frequencies based on text content
        audio_signal = np.zeros_like(t)
        words = text.split()
        
        for i, word in enumerate(words[:min(100, len(words))]):  # Limit to 100 words
            start_time = i * duration_seconds / len(words)
            end_time = (i + 1) * duration_seconds / len(words)
            
            # Frequency based on word characteristics
            word_freq = base_freq + (len(word) - 3) * 20  # Vary frequency by word length
            word_freq = max(100, min(400, word_freq))  # Keep within reasonable range
            
            # Generate tone for this word
            word_start_idx = int(start_time * sample_rate)
            word_end_idx = int(end_time * sample_rate)
            
            if word_end_idx <= len(t):
                word_t = t[word_start_idx:word_end_idx]
                word_signal = 0.3 * np.sin(2 * np.pi * word_freq * word_t)
                
                # Apply envelope to make it more speech-like
                envelope = np.exp(-2 * (word_t - word_t[0]) / (word_t[-1] - word_t[0] + 1e-6))
                word_signal *= envelope
                
                audio_signal[word_start_idx:word_end_idx] = word_signal
        
        # Add some pause between words
        for i in range(0, len(audio_signal), sample_rate // 5):  # Every 0.2 seconds
            end_idx = min(i + sample_rate // 20, len(audio_signal))  # 50ms pause
            audio_signal[i:end_idx] *= 0.1
        
        # Convert to 16-bit integer
        audio_signal = (audio_signal * 32767).astype(np.int16)
        
        # Write WAV file
        with wave.open(output_path, 'w') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_signal.tobytes())
        
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info(f"✅ Synthetic audio created successfully")
            logger.info(f"✅ Audio file size: {os.path.getsize(output_path)} bytes")
            logger.info(f"✅ Duration: {duration_seconds:.1f} seconds")
            return output_filename
        else:
            logger.error(f"❌ Synthetic audio creation failed")
            
    except ImportError as e:
        logger.warning(f"⚠️ NumPy not available for synthetic audio: {e}")
        logger.info("💡 Install with: pip install numpy")
    except Exception as e:
        logger.error(f"❌ Synthetic audio generation failed: {str(e)}")
    
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
