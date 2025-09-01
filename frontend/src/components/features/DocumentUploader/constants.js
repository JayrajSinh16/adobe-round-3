// Constants and configuration for DocumentUploader
// Centralizes all configuration values, file type restrictions, and storage settings

export const FILE_CONFIG = {
  ALLOWED_TYPES: ['application/pdf'],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  STORAGE_TTL_MS: 30 * 60 * 1000,  // 30 minutes
};

export const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const ANIMATIONS = {
  SPRING_CONFIG: { type: 'spring', stiffness: 200, damping: 30 },
  DURATION: {
    FAST: 0.3,
    NORMAL: 0.5,
    SLOW: 0.8,
  },
};
