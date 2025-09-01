/**
 * Input validation utilities for API requests
 * Ensures data integrity and prevents backend validation errors
 */

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new Error(`${fieldName} is required`);
  }
};

export const sanitizeString = (value) => {
  if (value == null) return '';
  try {
    return typeof value === 'string' ? value : String(value);
  } catch {
    return '';
  }
};

export const sanitizeNumber = (value, fallback = 1) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

export const validateFileUpload = (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  const validFiles = files.filter(fileObj => 
    fileObj?.file && 
    typeof fileObj.file.name === 'string' && 
    typeof fileObj.file.size === 'number'
  );

  if (validFiles.length === 0) {
    throw new Error('No valid PDF files found');
  }

  return validFiles;
};

export const validateTextInput = (text, fieldName = 'Text') => {
  validateRequired(text, fieldName);
  const trimmed = String(text).trim();
  if (trimmed.length < 3) {
    throw new Error(`${fieldName} must be at least 3 characters long`);
  }
  return trimmed;
};

// Safe conversion utilities used throughout the API
export const toStringSafe = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return value.text || value.name || JSON.stringify(value);
  try { return String(value); } catch { return ''; }
};

export const toNumberSafe = (value, fallback = 1) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};
