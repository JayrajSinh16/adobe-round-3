import os
import uuid
import logging
from typing import List

# Set up logging
logger = logging.getLogger(__name__)


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
