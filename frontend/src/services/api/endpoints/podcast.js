/**
 * Podcast generation API endpoints
 * Handles audio content creation and management for AI-generated podcasts
 */
import { api } from '../config';
import { handleApiError } from '../utils/errorHandler';
import { validateRequired } from '../utils/validators';
import { transformInsightForPodcast } from '../utils/transformers';

export const generatePodcastAudio = async ({ 
  selected_text, 
  insights, 
  document_id, 
  format = 'podcast', 
  duration = 'medium', 
  language = 'en' 
}) => {
  try {
    const payload = {
      selected_text: selected_text || '',
      insights: Array.isArray(insights) ? insights.map(transformInsightForPodcast) : [],
      format,
      duration,
      language
    };

    console.log('Generating podcast with payload:', payload);

    const response = await api.post('/api/podcast/generate-audio', payload, {
      responseType: 'blob',
      timeout: 60000, // 60 second timeout for audio generation
    });

    const audioBlob = response.data;
    const audioUrl = URL.createObjectURL(audioBlob);
    const headers = response.headers;

    return {
      audioUrl,
      audioBlob,
      transcript: headers['x-transcript-preview'] || headers['x-transcript'] || '',
      duration: parseFloat(headers['x-duration']) || 0,
      format: headers['x-format'] || format,
      language: headers['x-language'] || language,
      fileSize: parseInt(headers['x-file-size']) || 0,
      success: true
    };
  } catch (error) {
    console.error('Error generating podcast:', error);
    throw new Error(handleApiError(error, 'Failed to generate podcast audio'));
  }
};

export const generatePodcast = async (content, documentIds = []) => {
  try {
    validateRequired(content, 'Content');
    
    const response = await api.post('/api/podcast/generate', {
      content,
      documentIds,
      type: 'analysis_discussion',
      format: 'mp3',
      duration: 'medium',
      voices: ['host1', 'host2'],
      style: 'conversational'
    });

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to generate podcast'));
  }
};

export const getPodcastStatus = async (podcastId) => {
  try {
    validateRequired(podcastId, 'Podcast ID');
    const response = await api.get(`/api/podcast/status/${podcastId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to get podcast status'));
  }
};

export const downloadPodcast = async (podcastId) => {
  try {
    validateRequired(podcastId, 'Podcast ID');
    const response = await api.get(`/api/podcast/download/${podcastId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to download podcast'));
  }
};
