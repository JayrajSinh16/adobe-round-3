import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api' || 'http://localhost:8000/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
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
    formData.append('files', fileObj.file); // The actual File object
    // Optionally add metadata for each file
    formData.append(`metadata[${index}]`, JSON.stringify({
      id: fileObj.id,
      name: fileObj.name,
      size: fileObj.size,
      uploadedAt: fileObj.uploadedAt
    }));
  });

  try {
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
    const response = await api.get('/api/documents');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch documents');
  }
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