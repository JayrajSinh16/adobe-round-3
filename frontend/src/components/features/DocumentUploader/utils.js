// Utility functions for file operations in DocumentUploader
// Handles file validation, formatting, duplicate checking, and file object creation

import { FILE_CONFIG } from './constants';

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const fileToBase64 = (blob) => new Promise((resolve, reject) => {
  try {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  } catch (e) {
    reject(e);
  }
});

export const validateFile = (file) => {
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return 'Only PDF files are supported';
  }
  
  if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
    return `File size must be less than ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }
  
  return null;
};

export const checkDuplicate = (file, existingFiles) => {
  return existingFiles.some(f => 
    f.name === file.name && f.size === file.size
  );
};

export const createFileObject = (file) => ({
  id: Date.now() + Math.random(),
  name: file.name,
  size: file.size,
  type: file.type,
  file: file,
  status: 'ready',
  uploadProgress: 100,
  previewUrl: URL.createObjectURL(file),
  uploadedAt: new Date().toISOString(),
  pages: Math.floor(Math.random() * 50) + 1, // Mock page count
});
