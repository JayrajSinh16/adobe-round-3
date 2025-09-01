/**
 * Centralized error handling for API responses
 * Provides consistent error messages and logging across all endpoints
 */

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  // Extract error message from various response formats
  const detail = error.response?.data?.detail;
  
  // Handle Pydantic validation errors (422) - detail can be array or string
  if (error.response?.status === 422 && Array.isArray(detail)) {
    return detail[0]?.msg || 'Validation error';
  }
  
  // Standard error message extraction
  const errorMessage = 
    detail ||
    error.response?.data?.message ||
    error.message ||
    defaultMessage;

  // Handle authentication errors (401)
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    return 'Authentication required';
  }

  // Handle server errors (5xx)
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return errorMessage;
};

export const createApiError = (message, status = null, originalError = null) => {
  const error = new Error(message);
  error.status = status;
  error.originalError = originalError;
  return error;
};
