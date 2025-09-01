/**
 * API Configuration and Axios Instance
 * Centralizes axios configuration, interceptors, and base settings
 */
import axios from 'axios';

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta?.env?.VITE_API_BASE_URL?.trim?.() || 'http://localhost:8080',
  timeout: parseInt(import.meta?.env?.VITE_API_TIMEOUT) || 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens and handling FormData
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData uploads - remove Content-Type to let browser set multipart boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers?.post?.['Content-Type']) {
        delete config.headers.post['Content-Type'];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent logging and error handling
api.interceptors.response.use(
  (response) => {
    // Compact logging for successful requests
    try {
      const url = response?.config?.url || 'unknown-url';
      const method = (response?.config?.method || 'get').toUpperCase();
      console.debug(`[API ${method}] ${url} -> ${response.status}`);
    } catch {}
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
