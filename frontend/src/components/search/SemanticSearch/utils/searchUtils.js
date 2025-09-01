/**
 * SemanticSearch Utilities
 * Helper functions for processing search results and UI interactions
 */

import { searchHeadings } from '../../../../services/api';
import { SEARCH_CONFIG } from './constants';

/**
 * Create debounced search function
 * @param {Function} searchCallback - Callback to execute search
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced search function
 */
export const createDebouncedSearch = (searchCallback, delay = SEARCH_CONFIG.SEARCH_DELAY) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => searchCallback.apply(null, args), delay);
  };
};

/**
 * Perform semantic search API call
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export const performSemanticSearch = async (query) => {
  if (!query?.trim() || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
    return [];
  }
  
  try {
    return await searchHeadings(query.trim());
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
};

/**
 * Calculate relevance color based on score
 * @param {number} relevance - Relevance score (0-1)
 * @returns {string} CSS class string for color
 */
export const getRelevanceColor = (relevance) => {
  if (relevance >= 0.9) return 'border-l-red-600 bg-red-50/50';
  if (relevance >= 0.6) return 'border-l-red-500 bg-red-50/30';
  if (relevance >= 0.4) return 'border-l-red-400 bg-red-50/20';
  return 'border-l-red-300 bg-red-50/50';
};

/**
 * Calculate relevance bar width
 * @param {number} relevance - Relevance score (0-1)
 * @returns {string} Width percentage string
 */
export const getRelevanceWidth = (relevance) => `${Math.max(relevance * 100, 10)}%`;

/**
 * Get display file name from path
 * @param {string} filePath - Full file path
 * @returns {string} Display name
 */
export const getDisplayFileName = (filePath) => {
  if (!filePath) return 'Unknown';
  return filePath.split('/').pop()?.replace('.pdf', '') || 'Unknown';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 200) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
