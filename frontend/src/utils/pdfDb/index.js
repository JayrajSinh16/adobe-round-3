/**
 * PDF Database - Professional IndexedDB Client-Side Storage
 * 
 * A robust PDF caching system with the following features:
 * - ✅ Client-side PDF storage using IndexedDB
 * - ✅ Automatic deduplication by name + size
 * - ✅ TTL (Time-to-Live) with auto-expiration
 * - ✅ Legacy data URL migration to Blobs
 * - ✅ Offline access to cached PDFs
 * - ✅ Memory-efficient blob storage
 * - ✅ Comprehensive error handling
 * 
 * @example
 * ```javascript
 * // Store PDFs with 2-hour cache
 * const result = await upsertPDFs(pdfFiles, 2 * 60 * 60 * 1000);
 * console.log(`Added: ${result.added}, Kept: ${result.kept}`);
 * 
 * // Get all active PDFs
 * const activePDFs = await getActivePDFs();
 * 
 * // Clean up expired files
 * const removed = await purgeExpiredPDFs();
 * ```
 */

// Re-export all functionality from organized modules
export {
  getActivePDFs,
  upsertPDFs,
  replaceAllPDFs,
  deletePDF,
  purgeExpiredPDFs
} from './operations.js';

export {
  dataUrlToBlob,
  isValidPDFRecord,
  validatePDFRecords,
  normalizePDFRecord,
  createDedupeKey,
  isExpired
} from './validators.js';

export {
  openDB,
  createTransaction,
  safeDbOperation
} from './connection.js';

export {
  PDF_DB_CONFIG,
  PDF_MIME_TYPE
} from './config.js';

// Legacy compatibility - re-export with original names
export { dataUrlToBlob } from './validators.js';
