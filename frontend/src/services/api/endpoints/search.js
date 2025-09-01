/**
 * Search functionality API endpoints
 * Handles document search, heading queries, and text-based searches
 */
import { api } from '../config';
import { handleApiError } from '../utils/errorHandler';
import { validateRequired } from '../utils/validators';

export const searchHeadings = async (query, limit = 10) => {
  try {
    validateRequired(query, 'Search query');
    
    const response = await api.get('/api/search/headings', {
      params: { query, limit }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to search headings'));
  }
};

export const getHeadingsByLevel = async (level) => {
  try {
    validateRequired(level, 'Heading level');
    
    const response = await api.get(`/api/search/by-level/${level}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to get headings by level'));
  }
};
