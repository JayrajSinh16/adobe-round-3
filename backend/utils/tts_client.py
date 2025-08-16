import os
import uuid
import time
from typing import List, Dict
from config import settings

def generate_audio(text: str, speaker: str = "default") -> str:
    """
    Generate audio from text using configured TTS provider
    Returns the path to the generated audio file
    """
    provider = settings.tts_provider
    output_filename = f"{uuid.uuid4()}.mp3"
    output_path = os.path.join(settings.audio_folder, output_filename)
    
    try:
        if provider == "azure" and settings.azure_tts_key and settings.azure_tts_endpoint:
            from azure.cognitiveservices.speech import (
                SpeechConfig, SpeechSynthesizer, AudioConfig
            )
            
            speech_config = SpeechConfig(
                subscription=settings.azure_tts_key,
                region=settings.azure_tts_endpoint.split('.')[0].replace('https://', '')
            )
            
            # Set voice based on speaker
            if speaker == "Host":
                speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            elif speaker == "Expert":
                speech_config.speech_synthesis_voice_name = "en-US-GuyNeural"
            else:
                speech_config.speech_synthesis_voice_name = "en-US-AriaNeural"
            
            audio_config = AudioConfig(filename=output_path)
            synthesizer = SpeechSynthesizer(
                speech_config=speech_config,
                audio_config=audio_config
            )
            
            result = synthesizer.speak_text_async(text).get()
            
        elif provider == "gcp" and hasattr(settings, 'gcp_tts_credentials'):
            from google.cloud import texttospeech
            
            client = texttospeech.TextToSpeechClient()
            
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Set voice based on speaker
            if speaker == "Host":
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-F"
                )
            elif speaker == "Expert":
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-D"
                )
            else:
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-C"
                )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            with open(output_path, "wb") as out:
                out.write(response.audio_content)
                
        else:
            # Use local TTS as fallback for any provider
            print(f"Using local TTS fallback (provider: {provider})")
            import pyttsx3
            
            engine = pyttsx3.init()
            
            # Configure voice based on speaker
            voices = engine.getProperty('voices')
            if voices and len(voices) > 1:
                if speaker == "Host" and len(voices) > 0:
                    engine.setProperty('voice', voices[0].id)  # Female voice
                elif speaker == "Expert" and len(voices) > 1:
                    engine.setProperty('voice', voices[1].id)  # Male voice
                else:
                    engine.setProperty('voice', voices[0].id)  # Default voice
            
            # Set speech rate (words per minute)
            engine.setProperty('rate', 180)
            
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            
    except Exception as e:
        print(f"Error in TTS generation: {str(e)}")
        # Create a text transcript as ultimate fallback
        try:
            transcript_filename = f"transcript_{uuid.uuid4()}.txt"
            transcript_path = os.path.join(settings.audio_folder, transcript_filename)
            
            with open(transcript_path, "w", encoding="utf-8") as f:
                f.write(f"Speaker: {speaker}\n")
                f.write(f"Text: {text}\n")
                f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            print(f"Created transcript fallback: {transcript_filename}")
            return transcript_filename
        except:
            return None
    
    return output_filename

def create_podcast_audio(script: List[Dict[str, str]]) -> str:
    """
    Create a complete podcast audio from script
    Returns the path to the combined audio file
    """
    try:
        from pydub import AudioSegment
        
        audio_segments = []
        audio_files_created = []
        
        for entry in script:
            audio_file = generate_audio(entry["text"], entry["speaker"])
            if audio_file:
                audio_path = os.path.join(settings.audio_folder, audio_file)
                audio_files_created.append(audio_file)
                
                # Try to load audio segment
                try:
                    audio_segments.append(AudioSegment.from_mp3(audio_path))
                    # Add brief pause between speakers
                    audio_segments.append(AudioSegment.silent(duration=500))
                except Exception as e:
                    print(f"Warning: Could not process audio file {audio_file}: {e}")
                    continue
        
        # Combine all segments if possible
        if audio_segments:
            try:
                combined = audio_segments[0]
                for segment in audio_segments[1:]:
                    combined += segment
                
                # Save combined audio
                output_filename = f"podcast_{uuid.uuid4()}.mp3"
                output_path = os.path.join(settings.audio_folder, output_filename)
                combined.export(output_path, format="mp3")
                
                # Clean up individual files
                for audio_file in audio_files_created:
                    try:
                        os.remove(os.path.join(settings.audio_folder, audio_file))
                    except:
                        pass
                        
                return output_filename
                
            except Exception as e:
                print(f"Warning: Could not combine audio files: {e}")
                # Return the first audio file as fallback
                return audio_files_created[0] if audio_files_created else None
        
        # If no audio segments could be processed, return the first individual file
        return audio_files_created[0] if audio_files_created else None
        
    except ImportError:
        print("Warning: pydub not available, returning individual audio file")
        # Generate just the first audio file as fallback
        if script:
            return generate_audio(script[0]["text"], script[0]["speaker"])
        return None
    
    except Exception as e:
        print(f"Error creating podcast audio: {e}")
        # Try to generate at least one audio file
        if script:
            return generate_audio(script[0]["text"], script[0]["speaker"])
        return None