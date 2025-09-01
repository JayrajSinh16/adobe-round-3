/**
 * YouTube recommendations API
 * Provides video recommendations based on document content
 */
import { api } from '../config';
import { handleApiError } from '../utils/errorHandler';
import { validateTextInput } from '../utils/validators';
import { transformYouTubeVideo } from '../utils/transformers';

export const recommendYouTube = async ({ text, limit = 12 }) => {
  try {
    const validatedText = validateTextInput(text, 'Search text');
    
    const response = await api.post('/api/youtube/recommend', { 
      text: validatedText, 
      limit 
    });
    
    const data = response?.data || {};
    const links = Array.isArray(data.links) ? data.links : [];
    
    return links.map(transformYouTubeVideo);
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch YouTube recommendations'));
  }
};
