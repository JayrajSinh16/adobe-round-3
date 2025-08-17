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
    output_filename = f"{uuid.uuid4()}.wav"  # Use WAV for pyttsx3
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
            if speaker in ["Host", "Alex"]:  # Female voice
                speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            elif speaker in ["Expert", "Jamie"]:  # Male voice
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
            if speaker in ["Host", "Alex"]:  # Female voice
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-F"
                )
            elif speaker in ["Expert", "Jamie"]:  # Male voice
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
                if speaker in ["Host", "Alex"] and len(voices) > 0:  # Female voice
                    engine.setProperty('voice', voices[0].id)  
                elif speaker in ["Expert", "Jamie"] and len(voices) > 1:  # Male voice
                    engine.setProperty('voice', voices[1].id)  
                else:
                    engine.setProperty('voice', voices[0].id)  # Default voice
            
            # Set speech rate (words per minute)
            engine.setProperty('rate', 180)
            
            # pyttsx3 generates WAV files
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
    print(f"Creating podcast audio from {len(script)} script segments...")
    
    audio_files_created = []
    
    # Generate individual audio files
    for i, entry in enumerate(script):
        print(f"Generating audio for segment {i+1}/{len(script)}: {entry['speaker']}")
        audio_file = generate_audio(entry["text"], entry["speaker"])
        if audio_file and audio_file.endswith('.wav'):  # Changed from .mp3 to .wav
            audio_path = os.path.join(settings.audio_folder, audio_file)
            if os.path.exists(audio_path):
                audio_files_created.append(audio_file)
                print(f"✅ Created: {audio_file}")
            else:
                print(f"❌ File not found: {audio_path}")
        else:
            print(f"❌ Failed to generate audio for segment {i+1}")
    
    if not audio_files_created:
        print("❌ No audio files were created")
        return None
    
    # Try to combine using pydub first
    try:
        from pydub import AudioSegment
        print("Attempting to combine WAV audio using pydub...")
        
        # Load all audio segments
        audio_segments = []
        for audio_file in audio_files_created:
            audio_path = os.path.join(settings.audio_folder, audio_file)
            try:
                segment = AudioSegment.from_wav(audio_path)  # Changed from from_mp3 to from_wav
                audio_segments.append(segment)
                # Add brief pause between speakers (500ms)
                audio_segments.append(AudioSegment.silent(duration=500))
                print(f"✅ Loaded: {audio_file}")
            except Exception as e:
                print(f"❌ Could not load {audio_file}: {e}")
                continue
        
        if audio_segments:
            # Combine all segments
            combined = audio_segments[0]
            for segment in audio_segments[1:]:
                combined += segment
            
            # Save combined audio as WAV
            output_filename = f"podcast_combined_{uuid.uuid4()}.wav"  # Changed to .wav
            output_path = os.path.join(settings.audio_folder, output_filename)
            
            # Export as WAV format
            try:
                combined.export(output_path, format="wav")
                print(f"✅ Combined WAV audio saved: {output_filename}")
                
                # Clean up individual files
                for audio_file in audio_files_created:
                    try:
                        os.remove(os.path.join(settings.audio_folder, audio_file))
                        print(f"🗑️ Cleaned up: {audio_file}")
                    except:
                        pass
                
                return output_filename
                
            except Exception as e:
                print(f"❌ Export failed: {e}")
                # Try alternative method without format specification
                try:
                    combined.export(output_path)
                    print(f"✅ Combined audio saved (alternative method): {output_filename}")
                    return output_filename
                except Exception as e2:
                    print(f"❌ Alternative export failed: {e2}")
        
    except ImportError:
        print("⚠️ pydub not available, using custom combining method...")
    except Exception as e:
        print(f"⚠️ pydub combining failed: {e}")
    
    # Custom audio combining method (binary concatenation for WAV files)
    try:
        print("Attempting custom WAV audio combining...")
        return combine_audio_files_custom(audio_files_created)
        
    except Exception as e:
        print(f"❌ Custom combining failed: {e}")
    
    # Return the first audio file as ultimate fallback
    if audio_files_created:
        print(f"⚠️ Returning first audio file as fallback: {audio_files_created[0]}")
        return audio_files_created[0]
    
    return None

def combine_audio_files_custom(audio_files: List[str]) -> str:
    """
    Custom audio file combining for WAV files generated by pyttsx3
    Properly handles WAV headers and concatenates audio data
    """
    if not audio_files:
        return None
    
    print(f"WAV combining {len(audio_files)} audio files...")
    
    # Create output filename with WAV extension since we're working with WAV files
    output_filename = f"podcast_custom_{uuid.uuid4()}.wav"
    output_path = os.path.join(settings.audio_folder, output_filename)
    
    try:
        # Read all audio data
        all_audio_data = []
        combined_header = None
        
        for i, audio_file in enumerate(audio_files):
            audio_path = os.path.join(settings.audio_folder, audio_file)
            
            if not os.path.exists(audio_path):
                print(f"❌ File not found: {audio_path}")
                continue
                
            file_size = os.path.getsize(audio_path)
            print(f"Processing file {i+1}/{len(audio_files)}: {audio_file} ({file_size} bytes)")
            
            with open(audio_path, 'rb') as f:
                data = f.read()
                
                # Check if it's a WAV file
                if data[:4] == b'RIFF' and data[8:12] == b'WAVE':
                    print(f"  Detected WAV format")
                    if i == 0:
                        # First file: keep header and data
                        combined_header = data[:44]  # Standard WAV header is 44 bytes
                        all_audio_data.append(data[44:])  # Skip header, keep audio data
                        print(f"  Header size: 44 bytes, Audio data: {len(data[44:])} bytes")
                    else:
                        # Subsequent files: skip header, only add audio data
                        audio_data = data[44:]  # Skip WAV header
                        all_audio_data.append(audio_data)
                        print(f"  Audio data: {len(audio_data)} bytes")
                else:
                    print(f"  Not a WAV file, treating as raw audio data")
                    all_audio_data.append(data)
        
        if not all_audio_data:
            print("❌ No valid audio files found to combine")
            return audio_files[0] if audio_files else None
            
        # Combine all audio data
        combined_audio = b''.join(all_audio_data)
        total_audio_size = len(combined_audio)
        
        # Update the header with new file size
        if combined_header:
            # Update ChunkSize (bytes 4-7): total file size - 8
            total_file_size = 44 + total_audio_size - 8
            combined_header = combined_header[:4] + total_file_size.to_bytes(4, 'little') + combined_header[8:]
            
            # Update Subchunk2Size (bytes 40-43): audio data size
            combined_header = combined_header[:40] + total_audio_size.to_bytes(4, 'little')
        
        # Write combined file
        with open(output_path, 'wb') as f:
            if combined_header:
                f.write(combined_header)
            f.write(combined_audio)
        
        # Verify output file was created
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            combined_size = os.path.getsize(output_path)
            print(f"✅ WAV combined audio created: {output_filename}")
            print(f"  Total size: {combined_size} bytes")
            print(f"  Header: 44 bytes")
            print(f"  Audio data: {total_audio_size} bytes")
            print(f"  Files combined: {len(all_audio_data)}")
            
            # Clean up individual files
            for audio_file in audio_files:
                try:
                    audio_path = os.path.join(settings.audio_folder, audio_file)
                    os.remove(audio_path)
                    print(f"🗑️ Cleaned up: {audio_file}")
                except:
                    pass
            
            return output_filename
        else:
            print("❌ WAV combining produced empty file")
            return audio_files[0] if audio_files else None
            
    except Exception as e:
        print(f"❌ Error combining WAV files: {str(e)}")
        import traceback
        traceback.print_exc()
        return audio_files[0] if audio_files else None