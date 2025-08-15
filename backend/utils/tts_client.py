import os
import uuid
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
        if provider == "azure":
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
            
        elif provider == "gcp":
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
                
        elif provider == "local":
            # Use pyttsx3 for local TTS
            import pyttsx3
            
            engine = pyttsx3.init()
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            
        else:
            raise ValueError(f"Unsupported TTS provider: {provider}")
            
    except Exception as e:
        print(f"Error in TTS generation: {str(e)}")
        # Create a silent audio file as fallback
        return None
    
    return output_filename

def create_podcast_audio(script: List[Dict[str, str]]) -> str:
    """
    Create a complete podcast audio from script
    Returns the path to the combined audio file
    """
    from pydub import AudioSegment
    
    audio_segments = []
    
    for entry in script:
        audio_file = generate_audio(entry["text"], entry["speaker"])
        if audio_file:
            audio_path = os.path.join(settings.audio_folder, audio_file)
            audio_segments.append(AudioSegment.from_mp3(audio_path))
            # Add brief pause between speakers
            audio_segments.append(AudioSegment.silent(duration=500))
    
    # Combine all segments
    if audio_segments:
        combined = audio_segments[0]
        for segment in audio_segments[1:]:
            combined += segment
        
        # Save combined audio
        output_filename = f"podcast_{uuid.uuid4()}.mp3"
        output_path = os.path.join(settings.audio_folder, output_filename)
        combined.export(output_path, format="mp3")
        
        # Clean up individual files
        for i in range(0, len(audio_segments), 2):  # Every other element is audio (not silence)
            try:
                os.remove(os.path.join(settings.audio_folder, script[i//2]["audio_file"]))
            except:
                pass
                
        return output_filename
    
    return None