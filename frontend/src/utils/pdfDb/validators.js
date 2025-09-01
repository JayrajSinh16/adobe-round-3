/**
 * PDF Data Validation and Transformation Utilities
 * Handles data validation, normalization, and format conversion
 */

import { PDF_MIME_TYPE } from './config.js';

/**
 * Validates PDF record structure
 * @param {Object} record - PDF record to validate
 * @returns {boolean} True if valid
 */
export function isValidPDFRecord(record) {
  return (
    record &&
    typeof record.name === 'string' &&
    record.name.length > 0 &&
    typeof record.size === 'number' &&
    record.size > 0 &&
    record.blob instanceof Blob
  );
}

/**
 * Validates PDF record array
 * @param {Array} records - Array of PDF records
 * @returns {Array} Filtered valid records
 */
export function validatePDFRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }
  
  return records.filter(isValidPDFRecord);
}

/**
 * Normalizes PDF record with required fields
 * @param {Object} record - Raw PDF record
 * @param {number} expiry - Expiry timestamp
 * @returns {Object} Normalized record
 */
export function normalizePDFRecord(record, expiry) {
  const now = Date.now();
  
  return {
    id: record.id || generatePDFId(record.name, record.size, now),
    name: record.name,
    size: record.size,
    type: record.type || PDF_MIME_TYPE,
    uploadedAt: record.uploadedAt || new Date().toISOString(),
    blob: record.blob,
    expiry
  };
}

/**
 * Generates unique PDF ID
 * @param {string} name - PDF name
 * @param {number} size - PDF size
 * @param {number} timestamp - Current timestamp
 * @returns {string} Unique ID
 */
export function generatePDFId(name, size, timestamp) {
  const random = Math.random().toString(36).substring(2);
  return `${name}-${size}-${timestamp}-${random}`;
}

/**
 * Creates deduplication key from PDF metadata
 * @param {string} name - PDF name
 * @param {number} size - PDF size
 * @returns {string} Deduplication key
 */
export function createDedupeKey(name, size) {
  return `${name}|${size}`;
}

/**
 * Converts data URL to Blob
 * @param {string} dataUrl - Data URL string
 * @returns {Blob|null} Converted blob or null if invalid
 */
export function dataUrlToBlob(dataUrl) {
  try {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return null;
    }

    const [meta, base64Data] = dataUrl.split(',');
    if (!base64Data) return null;

    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mimeType = mimeMatch?.[1] || PDF_MIME_TYPE;
    
    const byteString = atob(base64Data);
    const byteArray = new Uint8Array(byteString.length);
    
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.warn('Failed to convert data URL to blob:', error);
    return null;
  }
}

/**
 * Checks if PDF record is expired
 * @param {Object} record - PDF record
 * @param {number} currentTime - Current timestamp
 * @returns {boolean} True if expired
 */
export function isExpired(record, currentTime = Date.now()) {
  return typeof record.expiry === 'number' && record.expiry <= currentTime;
}
