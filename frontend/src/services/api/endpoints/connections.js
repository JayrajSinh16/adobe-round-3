/**
 * Cross-document connections API
 * Finds relationships and connections between different documents
 */
import { api } from '../config';
import { handleApiError } from '../utils/errorHandler';
import { toStringSafe, toNumberSafe } from '../utils/validators';
import { transformConnection } from '../utils/transformers';

export const findConnections = async ({ 
  selected_text, 
  current_document_id, 
  current_page, 
  context_before = '', 
  context_after = '' 
}) => {
  try {
    const payload = {
      selected_text: toStringSafe(selected_text),
      current_document_id: toStringSafe(current_document_id),
      current_page: toNumberSafe(current_page, 1),
      context_before: toStringSafe(context_before),
      context_after: toStringSafe(context_after),
    };

    if (!payload.selected_text?.trim()) {
      throw new Error('No selected text provided');
    }
    if (!payload.current_document_id?.trim()) {
      throw new Error('Missing document identifier');
    }

    const response = await api.post('/api/connections/find', payload);
    const data = response?.data || {};

    const normalized = {
      connections: Array.isArray(data.connections) 
        ? data.connections.map(transformConnection) 
        : [],
      summary: toStringSafe(data.summary),
      processing_time: Number(data.processing_time) || 0,
    };

    console.log('Connections response:', normalized);
    return normalized;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch connections'));
  }
};
