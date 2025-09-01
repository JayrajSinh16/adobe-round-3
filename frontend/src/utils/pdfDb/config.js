/**
 * PDF Database Configuration
 * Centralized configuration for IndexedDB PDF storage
 */

export const PDF_DB_CONFIG = {
  // Database settings
  DB_NAME: 'pdf-store-v1',
  STORE_NAME: 'pdfs',
  DB_VERSION: 1,
  
  // TTL settings
  DEFAULT_TTL_MS: 60 * 60 * 1000, // 1 hour
  
  // Storage settings
  KEY_PATH: 'id',
  
  // Index definitions
  INDEXES: {
    NAME_SIZE: {
      name: 'name_size',
      keyPath: ['name', 'size'],
      options: { unique: false }
    },
    EXPIRY: {
      name: 'expiry',
      keyPath: 'expiry',
      options: { unique: false }
    }
  }
};

export const PDF_MIME_TYPE = 'application/pdf';
