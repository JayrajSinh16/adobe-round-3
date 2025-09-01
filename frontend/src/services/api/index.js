/**
 * Main API module - centralized exports
 * Provides clean import interface for all API functionality
 */

// Export the main API instance
export { api as default } from './config';

// Document management
export {
  uploadDocuments,
  getDocuments,
  listDocuments,
  deleteDocument,
  processSelectedText
} from './endpoints/documents';

// Insights and analysis
export {
  generateInsights,
  fetchKeyTakeaway,
  fetchDidYouKnow,
  fetchContradictions,
  fetchExamples,
  fetchCrossReferences
} from './endpoints/insights';

// Cross-document connections
export {
  findConnections
} from './endpoints/connections';

// Podcast generation
export {
  generatePodcastAudio,
  generatePodcast,
  getPodcastStatus,
  downloadPodcast
} from './endpoints/podcast';

// Search functionality
export {
  searchHeadings,
  getHeadingsByLevel
} from './endpoints/search';

// YouTube recommendations
export {
  recommendYouTube
} from './endpoints/youtube';

// Utilities (if needed externally)
export { handleApiError } from './utils/errorHandler';
export { 
  validateRequired, 
  validateFileUpload, 
  validateTextInput 
} from './utils/validators';
