/**
 * Insights generation API endpoints
 * Handles all insight-related operations including individual insight types
 */
import { api } from '../config';
import { handleApiError } from '../utils/errorHandler';
import { validateRequired, toStringSafe, toNumberSafe } from '../utils/validators';
import { transformInsight } from '../utils/transformers';

export const generateInsights = async ({ selected_text, document_id, page_number = 1, insight_types }) => {
  try {
    const payload = {
      selected_text: toStringSafe(selected_text),
      document_id: toStringSafe(document_id),
      page_number: toNumberSafe(page_number, 1),
    };

    if (Array.isArray(insight_types) && insight_types.length > 0) {
      payload.insight_types = insight_types;
    }

    if (!payload.selected_text?.trim()) {
      throw new Error('No selected text provided');
    }
    if (!payload.document_id?.trim()) {
      throw new Error('Missing server document id');
    }

    const response = await api.post('/api/insights/generate', payload);
    const data = response?.data || {};

    const normalized = {
      selected_text: data.selected_text || payload.selected_text,
      processing_time: Number(data.processing_time) || 0,
      insights: Array.isArray(data.insights) ? data.insights.map(transformInsight) : [],
    };

    console.log('Insights response:', normalized);
    return normalized;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to generate insights'));
  }
};

// Individual insight API endpoints
const buildIndividualPayload = ({ selected_text, document_id, page_no, insight_type, respond }) => ({
  selected_text: selected_text || '',
  document_id: document_id || '',
  page_no: Number.isFinite(Number(page_no)) ? Number(page_no) : 1,
  insight_type,
  respond,
});

const postIndividualInsight = async (route, payload) => {
  try {
    console.log(`Calling /api/individual-insights/${route} with payload:`, payload);
    const response = await api.post(`/api/individual-insights/${route}`, payload);
    console.log(`Individual insight [${route}] response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Individual insight [${route}] error:`, error.response?.data || error.message);
    throw new Error(handleApiError(error, `Failed to fetch ${route}`));
  }
};

export const fetchKeyTakeaway = async (args) => {
  return postIndividualInsight('key-takeaway', buildIndividualPayload(args));
};

export const fetchDidYouKnow = async (args) => {
  return postIndividualInsight('did-you-know', buildIndividualPayload(args));
};

export const fetchContradictions = async (args) => {
  return postIndividualInsight('contradictions', buildIndividualPayload(args));
};

export const fetchExamples = async (args) => {
  return postIndividualInsight('examples', buildIndividualPayload(args));
};

export const fetchCrossReferences = async (args) => {
  return postIndividualInsight('cross-references', buildIndividualPayload(args));
};
