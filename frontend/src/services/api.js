import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  // Prefer Vite env if provided, fallback to localhost:8000
  baseURL: (import.meta?.env?.VITE_API_BASE_URL?.trim?.() || 'http://localhost:8080'),
  timeout: parseInt(import.meta?.env?.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, remove any preset JSON content-type so browser sets the boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && 'Content-Type' in config.headers) {
        delete config.headers['Content-Type'];
      }
      // Axios also keeps method-specific headers
      if (config.headers && config.headers.post && config.headers.post['Content-Type']) {
        delete config.headers.post['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    try {
      const url = response?.config?.url || 'unknown-url';
      const method = (response?.config?.method || 'get').toUpperCase();
      // Keep logs compact; avoid huge dumps
      console.debug(`[API ${method}] ${url} -> ${response.status}`);
    } catch {}
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Upload documents function
export const uploadDocuments = async (files) => {
  const formData = new FormData();
  
  // Add each file to FormData
  files.forEach((fileObj, index) => {
    if (fileObj && fileObj.file) {
      // include filename explicitly
      formData.append('files', fileObj.file, fileObj.name || fileObj.file.name || `file-${index}.pdf`);
    }
    // Optionally add metadata for each file
    formData.append(`metadata[${index}]`, JSON.stringify({
      id: fileObj.id,
      filename: fileObj.name,
      size: fileObj.size,
      upload_time: fileObj.uploadedAt
    }));
  });

  // Guard: no valid files
  if (![...formData.keys()].some((k) => k === 'files')) {
    throw new Error('No valid PDF files to upload');
  }

  try {
  // Override default JSON header so the browser sets the proper multipart boundary
  const response = await api.post('/api/documents/bulk-upload', formData, {
      onUploadProgress: (progressEvent) => {
        // Optional: Handle upload progress
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload documents');
  }
};

// Process selected text function
export const processSelectedText = async (textData) => {
  try {
  const response = await api.post('/api/documents/process-text', {
      selectedText: textData.text,
      fileName: textData.fileName,
      pageNumber: textData.pageNumber,
      documentId: textData.documentId,
      selectionContext: textData.context
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to process selected text');
  }
};

// Other API functions you might need
export const getDocuments = async () => {
  try {
    // Backend exposes list at /api/documents/list
    const response = await api.get('/api/documents/list');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch documents');
  }
};

// Explicit listDocuments alias (same as getDocuments)
export const listDocuments = async () => {
  return getDocuments();
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/api/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete document');
  }
};

// Generate podcast function
export const generatePodcast = async (content, documentIds = []) => {
  try {
    const response = await api.post('/api/podcast/generate', {
      content: content,
      documentIds: documentIds,
      type: 'analysis_discussion',
      format: 'mp3',
      duration: 'medium', // short, medium, long
      voices: ['host1', 'host2'], // AI voice selection
      style: 'conversational'
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate podcast');
  }
};

// Get podcast status (for checking generation progress)
export const getPodcastStatus = async (podcastId) => {
  try {
    const response = await api.get(`/api/podcast/status/${podcastId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get podcast status');
  }
};

// Download podcast
export const downloadPodcast = async (podcastId) => {
  try {
    const response = await api.get(`/api/podcast/download/${podcastId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to download podcast');
  }
};

export default api;

// Search API functions
export const searchHeadings = async (query, limit = 10) => {
  try {
    const response = await api.get('/api/search/headings', {
      params: { query, limit }
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to search headings';
    throw new Error(msg);
  }
};

export const getHeadingsByLevel = async (level) => {
  try {
    const response = await api.get(`/api/search/by-level/${level}`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to get headings by level';
    throw new Error(msg);
  }
};

// Connections: find cross-document connections for selected text
export const findConnections = async ({ selected_text, current_document_id, current_page, context_before = '', context_after = '' }) => {
  // Input sanitation to satisfy backend schema and avoid 422
  const toStringSafe = (v) => {
    if (v == null) return '';
    try {
      return typeof v === 'string' ? v : String(v);
    } catch {
      return '';
    }
  };
  const toNumberSafe = (v, fallback = 1) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

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

  try {
  const response = await api.post('/api/connections/find', payload);

    // Normalize shape to avoid rendering [object Object] in UI
    const asString = (v) => {
      if (v == null) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      // common cases: { text: '...', name: '...' }
      if (typeof v === 'object') return v.text || v.name || JSON.stringify(v);
      try { return String(v); } catch { return ''; }
    };
    const pagesToArray = (p) => {
      if (Array.isArray(p)) return p.filter((x) => Number.isFinite(Number(x))).map((x) => Number(x));
      if (Number.isFinite(Number(p))) return [Number(p)];
      return [];
    };

    const data = response?.data || {};
    const normalized = {
      connections: Array.isArray(data.connections)
        ? data.connections.map((c) => ({
            title: asString(c?.title),
            type: asString(c?.type),
            document: asString(c?.document?.name ?? c?.document),
            pages: pagesToArray(c?.pages),
            snippet: asString(c?.snippet),
            strength: asString(c?.strength) || 'medium',
          }))
        : [],
      summary: asString(data.summary),
      processing_time: Number(data.processing_time) || 0,
    };

  console.log('Connections response:', normalized);
  return normalized; // { connections: [...], summary: string, processing_time: number }
  } catch (error) {
    const detail = error.response?.data?.detail;
    // Pydantic detail can be array or string
    const msg = Array.isArray(detail)
      ? (detail[0]?.msg || 'Failed to fetch connections')
      : (detail || error.response?.data?.message || 'Failed to fetch connections');
    throw new Error(msg);
  }
};

// Insights: generate insights for selected text
export const generateInsights = async ({ selected_text, document_id, page_number = 1, insight_types = undefined }) => {
  const toStringSafe = (v) => {
    if (v == null) return '';
    try { return typeof v === 'string' ? v : String(v); } catch { return ''; }
  };
  const toNumberSafe = (v, fallback = 1) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const payload = {
    selected_text: toStringSafe(selected_text),
    document_id: toStringSafe(document_id),
    page_number: toNumberSafe(page_number, 1),
  };
  if (Array.isArray(insight_types) && insight_types.length > 0) {
    payload.insight_types = insight_types;
  }

  if (!payload.selected_text?.trim()) throw new Error('No selected text provided');
  if (!payload.document_id?.trim()) throw new Error('Missing server document id');

  try {
  const response = await api.post('/api/insights/generate', payload);
    const data = response?.data || {};
    // Normalize minimal shape expected by UI
    const norm = {
      selected_text: data.selected_text || payload.selected_text,
      processing_time: Number(data.processing_time) || 0,
      insights: Array.isArray(data.insights) ? data.insights.map((i) => ({
        type: toStringSafe(i?.type),
        title: toStringSafe(i?.title),
        content: toStringSafe(i?.content),
        confidence: Number(i?.confidence) || 0,
        source_documents: Array.isArray(i?.source_documents) ? i.source_documents.map((s) => ({
          pdf_name: toStringSafe(s?.pdf_name || s?.document || s?.name),
          pdf_id: toStringSafe(s?.pdf_id || s?.id),
          page: toNumberSafe(s?.page, 1),
        })) : [],
      })) : [],
    };
    console.log('Insights response:', norm);
    return norm;
  } catch (error) {
    const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to generate insights';
    throw new Error(msg);
  }
};

// === Individual Insights API ===
const buildIndividualPayload = ({
  selected_text,
  document_id,
  page_no,
  insight_type,
  respond,
}) => {
  return {
    selected_text: selected_text || '',
    document_id: document_id || '',
    page_no: Number.isFinite(Number(page_no)) ? Number(page_no) : 1,
    insight_type,
    respond,
  };
};

const postIndividualInsight = async (route, payload) => {
  try {
    console.log(`Calling /api/individual-insights/${route} with payload:`, payload);
    const res = await api.post(`/api/individual-insights/${route}`, payload);
    console.log(`Individual insight [${route}] response:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`Individual insight [${route}] error:`, error.response?.data || error.message);
    const msg = error.response?.data?.detail || error.response?.data?.message || `Failed to fetch ${route}`;
    throw new Error(msg);
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