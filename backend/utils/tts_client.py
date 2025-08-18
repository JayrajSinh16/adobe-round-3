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
    
    print(f"🎵 ===== TTS ENGINE SELECTION =====")
    print(f"   Configured Provider: {provider}")
    print(f"   Speaker: {speaker}")
    print(f"   Text Length: {len(text)} characters")
    print(f"   Output File: {output_filename}")
    
    try:
        if provider == "azure" and settings.azure_tts_key and settings.azure_tts_endpoint:
            print(f"🔵 USING AZURE SPEECH SERVICES")
            print(f"   ✅ Azure credentials available")
            
            from azure.cognitiveservices.speech import (
                SpeechConfig, SpeechSynthesizer, AudioConfig
            )
            
            # Use explicit region from environment variable instead of extracting from endpoint
            region = settings.azure_tts_region or "centralindia"  # Default to centralindia if not set
            
            print(f"🔧 Azure TTS Configuration:")
            print(f"   Endpoint: {settings.azure_tts_endpoint}")
            print(f"   Region: {region}")
            print(f"   Key: {settings.azure_tts_key[:10]}...")
            
            speech_config = SpeechConfig(
                subscription=settings.azure_tts_key,
                region=region
            )
            
            # Set voice based on speaker
            if speaker in ["Host", "Alex"]:  # Female voice
                speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
                print(f"🎭 Selected voice: en-US-JennyNeural (Female - {speaker})")
            elif speaker in ["Expert", "Jamie"]:  # Male voice
                speech_config.speech_synthesis_voice_name = "en-US-GuyNeural"
                print(f"🎭 Selected voice: en-US-GuyNeural (Male - {speaker})")
            else:
                speech_config.speech_synthesis_voice_name = "en-US-AriaNeural"
                print(f"🎭 Selected voice: en-US-AriaNeural (Default - {speaker})")
            
            audio_config = AudioConfig(filename=output_path)
            synthesizer = SpeechSynthesizer(
                speech_config=speech_config,
                audio_config=audio_config
            )
            
            print(f"🎤 Generating Azure TTS audio for text: '{text[:50]}...'")
            result = synthesizer.speak_text_async(text).get()
            
            # Check the result
            if result.reason.name == 'SynthesizingAudioCompleted':
                print(f"✅ AZURE TTS SUCCESS: {output_filename}")
                print(f"   Output file: {output_path}")
                print(f"   File size: {os.path.getsize(output_path) if os.path.exists(output_path) else 'N/A'} bytes")
                print(f"🔵 ENGINE USED: AZURE SPEECH SERVICES")
                return output_filename
            else:
                print(f"❌ Azure TTS failed: {result.reason}")
                if hasattr(result, 'error_details'):
                    print(f"   Error details: {result.error_details}")
                print(f"🔄 Falling back to local TTS...")
                raise Exception(f"Azure TTS synthesis failed: {result.reason}")
            
        elif provider == "gcp" and hasattr(settings, 'gcp_tts_credentials'):
            print(f"🟢 USING GOOGLE CLOUD TEXT-TO-SPEECH")
            print(f"   ✅ GCP credentials available")
            
            from google.cloud import texttospeech
            
            client = texttospeech.TextToSpeechClient()
            
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Set voice based on speaker
            if speaker in ["Host", "Alex"]:  # Female voice
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-F"
                )
                print(f"🎭 Selected voice: en-US-Wavenet-F (Female - {speaker})")
            elif speaker in ["Expert", "Jamie"]:  # Male voice
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-D"
                )
                print(f"🎭 Selected voice: en-US-Wavenet-D (Male - {speaker})")
            else:
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Wavenet-C"
                )
                print(f"🎭 Selected voice: en-US-Wavenet-C (Default - {speaker})")
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            print(f"🎤 Generating GCP TTS audio...")
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            with open(output_path, "wb") as out:
                out.write(response.audio_content)
            
            print(f"✅ GCP TTS SUCCESS: {output_filename}")
            print(f"🟢 ENGINE USED: GOOGLE CLOUD TEXT-TO-SPEECH")
                
        else:
            # Determine why we're using fallback
            if provider == "azure":
                if not settings.azure_tts_key:
                    print(f"⚠️  Azure provider selected but no API key found")
                elif not settings.azure_tts_endpoint:
                    print(f"⚠️  Azure provider selected but no endpoint found")
                else:
                    print(f"⚠️  Azure provider selected but credentials incomplete")
            elif provider == "gcp":
                print(f"⚠️  GCP provider selected but credentials not available")
            else:
                print(f"⚠️  Provider '{provider}' not recognized or local selected")
            
            print(f"🟡 USING LOCAL TTS (PYTTSX3) AS FALLBACK")
            print(f"   Reason: {f'Provider={provider}' if provider != 'azure' else 'Azure credentials issue'}")
            
            import pyttsx3
            
            engine = pyttsx3.init()
            
            # Configure voice based on speaker with enhanced natural settings
            voices = engine.getProperty('voices')
            print(f"   Available local voices: {len(voices) if voices else 0}")
            
            if voices and len(voices) > 1:
                if speaker in ["Host", "Alex"] and len(voices) > 0:  # Female voice (Zira)
                    engine.setProperty('voice', voices[1].id if len(voices) > 1 else voices[0].id)
                    print(f"🎭 Selected local voice: {voices[1].name if len(voices) > 1 else voices[0].name} (Female - {speaker})")
                elif speaker in ["Expert", "Jamie"] and len(voices) > 1:  # Male voice (David)
                    engine.setProperty('voice', voices[0].id)
                    print(f"🎭 Selected local voice: {voices[0].name} (Male - {speaker})")
                else:
                    engine.setProperty('voice', voices[0].id)  # Default voice
                    print(f"🎭 Selected local voice: {voices[0].name} (Default - {speaker})")
            else:
                print(f"🎭 Using system default voice (no alternative voices available)")
            
            # Enhanced natural speech settings based on speaker personality
            if speaker in ["Alex", "Host"]:
                # Female host: Friendly, curious, slightly slower
                engine.setProperty('rate', 152)  # Slower, more thoughtful
                engine.setProperty('volume', 0.92)  # Slightly higher volume
                print(f"   Speech settings: Rate=152, Volume=0.92 (Female host style)")
            elif speaker in ["Jamie", "Expert"]:
                # Male expert: Authoritative but approachable
                engine.setProperty('rate', 158)  # Measured pace
                engine.setProperty('volume', 0.88)  # Slightly lower volume for depth
                print(f"   Speech settings: Rate=158, Volume=0.88 (Male expert style)")
            else:
                # Default settings
                engine.setProperty('rate', 155)
                engine.setProperty('volume', 0.9)
                print(f"   Speech settings: Rate=155, Volume=0.9 (Default style)")
            
            print(f"🎤 Generating local TTS audio...")
            # pyttsx3 generates WAV files
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            
            if os.path.exists(output_path):
                print(f"✅ LOCAL TTS SUCCESS: {output_filename}")
                print(f"   File size: {os.path.getsize(output_path)} bytes")
                print(f"🟡 ENGINE USED: LOCAL PYTTSX3")
            else:
                print(f"❌ LOCAL TTS FAILED: File not created")
                raise Exception("Local TTS failed to create audio file")
            
    except Exception as e:
        print(f"❌ TTS GENERATION ERROR: {str(e)}")
        print(f"   Provider attempted: {provider}")
        print(f"   Speaker: {speaker}")
        print(f"   Text length: {len(text)} chars")
        print(f"🔄 Creating transcript fallback...")
        
        # Create a text transcript as ultimate fallback
        try:
            transcript_filename = f"transcript_{uuid.uuid4()}.txt"
            transcript_path = os.path.join(settings.audio_folder, transcript_filename)
            
            with open(transcript_path, "w", encoding="utf-8") as f:
                f.write(f"Speaker: {speaker}\n")
                f.write(f"Text: {text}\n")
                f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"TTS Provider: {provider}\n")
                f.write(f"Error: {str(e)}\n")
            
            print(f"✅ TRANSCRIPT FALLBACK CREATED: {transcript_filename}")
            print(f"🟠 ENGINE USED: TRANSCRIPT FALLBACK (TTS FAILED)")
            return transcript_filename
        except Exception as fallback_error:
            print(f"❌ TRANSCRIPT FALLBACK FAILED: {fallback_error}")
            print(f"🔴 ENGINE USED: NONE (COMPLETE FAILURE)")
            return None
    
    print(f"✅ AUDIO GENERATION COMPLETED: {output_filename}")
    return output_filename

def create_podcast_audio(script: List[Dict[str, str]]) -> str:
    """
    Create a complete podcast audio from script
    Returns the path to the combined audio file
    """
    print(f"🎙️ ===== PODCAST CREATION STARTED =====")
    print(f"   Script segments: {len(script)}")
    print(f"   TTS Provider: {settings.tts_provider}")
    print(f"   Expected engine: {'Azure Speech Services' if settings.tts_provider == 'azure' else 'Local TTS'}")
    print(f"🎙️ =========================================")
    
    audio_files_created = []
    engines_used = []  # Track which engines were actually used
    
    # Generate individual audio files
    for i, entry in enumerate(script):
        print(f"\n--- Segment {i+1}/{len(script)} ---")
        print(f"Generating audio for segment {i+1}/{len(script)}: {entry['speaker']}")
        audio_file = generate_audio(entry["text"], entry["speaker"])
        
        # Track the engine used (look for the engine indicator in the output)
        if audio_file and audio_file.endswith('.wav'):  # Changed from .mp3 to .wav
            audio_path = os.path.join(settings.audio_folder, audio_file)
            if os.path.exists(audio_path):
                audio_files_created.append(audio_file)
                print(f"✅ Created: {audio_file}")
                
                # Determine which engine was used based on previous output
                # This is a simple way to track it
                if settings.tts_provider == "azure" and settings.azure_tts_key:
                    engines_used.append("Azure")
                elif settings.tts_provider == "gcp":
                    engines_used.append("GCP")
                else:
                    engines_used.append("Local")
            else:
                print(f"❌ File not found: {audio_path}")
                engines_used.append("Failed")
        else:
            print(f"❌ Failed to generate audio for segment {i+1}")
            engines_used.append("Failed")
    
    # Report engine usage summary
    print(f"\n🔍 ===== ENGINE USAGE SUMMARY =====")
    azure_count = engines_used.count("Azure")
    gcp_count = engines_used.count("GCP") 
    local_count = engines_used.count("Local")
    failed_count = engines_used.count("Failed")
    
    print(f"   Azure Speech Services: {azure_count}/{len(script)} segments")
    print(f"   Google Cloud TTS: {gcp_count}/{len(script)} segments")
    print(f"   Local TTS (pyttsx3): {local_count}/{len(script)} segments")
    print(f"   Failed generations: {failed_count}/{len(script)} segments")
    
    if azure_count > 0:
        print(f"   🔵 Primary engine: AZURE SPEECH SERVICES")
    elif gcp_count > 0:
        print(f"   🟢 Primary engine: GOOGLE CLOUD TTS")
    elif local_count > 0:
        print(f"   🟡 Primary engine: LOCAL TTS")
    else:
        print(f"   🔴 Primary engine: NONE (ALL FAILED)")
    print(f"🔍 ==================================")
    
    if not audio_files_created:
        print("❌ No audio files were created")
        return None
    
    # Try to combine using pydub first
    try:
        from pydub import AudioSegment
        print("Attempting to combine WAV audio using pydub...")
        
        # Load all audio segments with natural timing
        audio_segments = []
        previous_speaker = None
        
        for i, audio_file in enumerate(audio_files_created):
            audio_path = os.path.join(settings.audio_folder, audio_file)
            try:
                segment = AudioSegment.from_wav(audio_path)
                audio_segments.append(segment)
                
                # Determine current speaker from script
                current_speaker = script[i]['speaker'] if i < len(script) else 'unknown'
                
                # Add natural pauses based on speaker transitions and content
                if i < len(audio_files_created) - 1:  # Not the last segment
                    # Different pause lengths for more natural conversation
                    if previous_speaker != current_speaker:
                        # Speaker change: longer pause for natural turn-taking
                        pause_duration = 850  # ms
                    else:
                        # Same speaker continuing: shorter pause
                        pause_duration = 400  # ms
                    
                    # Add slight variation to pause lengths for naturalness
                    import random
                    pause_variation = random.randint(-50, 50)
                    final_pause = max(200, pause_duration + pause_variation)
                    
                    audio_segments.append(AudioSegment.silent(duration=final_pause))
                
                previous_speaker = current_speaker
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