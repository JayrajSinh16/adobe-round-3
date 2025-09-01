/**
 * PDF Database Operations
 * Core CRUD operations for PDF storage management
 */

import { createTransaction, safeDbOperation } from './connection.js';
import { PDF_DB_CONFIG } from './config.js';
import { 
  isExpired, 
  dataUrlToBlob, 
  normalizePDFRecord, 
  createDedupeKey,
  validatePDFRecords 
} from './validators.js';

/**
 * Retrieves all active (non-expired) PDFs from storage
 * @returns {Promise<Array>} Array of active PDF records
 */
export async function getActivePDFs() {
  return safeDbOperation(async (db) => {
    return new Promise((resolve) => {
      const store = createTransaction(db, 'readwrite');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allRecords = Array.isArray(request.result) ? request.result : [];
        const activeRecords = [];
        const currentTime = Date.now();
        
        for (const record of allRecords) {
          if (!record) continue;
          
          // Clean up expired records
          if (isExpired(record, currentTime)) {
            try {
              store.delete(record.id);
            } catch (error) {
              console.warn('Failed to delete expired record:', error);
            }
            continue;
          }
          
          // Skip invalid records
          if (!record.name) continue;
          
          // Handle legacy data URL records
          let blob = record.blob;
          if (!blob && typeof record.dataUrl === 'string') {
            blob = dataUrlToBlob(record.dataUrl);
            if (blob) {
              // Migrate legacy record to blob format
              const updatedRecord = { 
                ...record, 
                blob, 
                size: typeof record.size === 'number' ? record.size : blob.size 
              };
              try {
                store.put(updatedRecord);
                record.blob = blob;
                record.size = updatedRecord.size;
              } catch (error) {
                console.warn('Failed to migrate legacy record:', error);
              }
            }
          }
          
          // Validate final record
          const size = typeof record.size === 'number' ? record.size : 
                      (blob && typeof blob.size === 'number' ? blob.size : undefined);
          
          if (blob && typeof size === 'number') {
            activeRecords.push({ ...record, blob, size });
          }
        }
        
        resolve(activeRecords);
      };
      
      request.onerror = () => resolve([]);
    });
  }, []);
}

/**
 * Inserts or updates PDF records with deduplication
 * @param {Array} records - PDF records to upsert
 * @param {number} ttlMs - Time to live in milliseconds
 * @returns {Promise<{added: number, kept: number}>} Operation result
 */
export async function upsertPDFs(records, ttlMs = PDF_DB_CONFIG.DEFAULT_TTL_MS) {
  const validRecords = validatePDFRecords(records);
  if (validRecords.length === 0) {
    return { added: 0, kept: 0 };
  }
  
  return safeDbOperation(async (db) => {
    const currentTime = Date.now();
    const expiry = currentTime + ttlMs;
    
    // Get existing records for deduplication
    const existingRecords = await new Promise((resolve) => {
      const store = createTransaction(db, 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
    
    // Build deduplication map
    const existingKeys = new Set();
    for (const record of existingRecords) {
      if (record?.name && typeof record?.size === 'number') {
        existingKeys.add(createDedupeKey(record.name, record.size));
      }
    }
    
    // Process new records
    let added = 0;
    let kept = 0;
    
    await new Promise((resolve) => {
      const store = createTransaction(db, 'readwrite');
      let pendingOperations = 0;
      
      const checkComplete = () => {
        if (pendingOperations === 0) resolve();
      };
      
      for (const record of validRecords) {
        const dedupeKey = createDedupeKey(record.name, record.size);
        
        if (existingKeys.has(dedupeKey)) {
          kept++;
          continue;
        }
        
        const normalizedRecord = normalizePDFRecord(record, expiry);
        pendingOperations++;
        
        const putRequest = store.put(normalizedRecord);
        putRequest.onsuccess = () => {
          added++;
          pendingOperations--;
          checkComplete();
        };
        putRequest.onerror = () => {
          pendingOperations--;
          checkComplete();
        };
      }
      
      checkComplete(); // Handle case where no operations were started
    });
    
    return { added, kept };
  }, { added: 0, kept: 0 });
}

/**
 * Replaces all PDFs with new records
 * @param {Array} records - New PDF records
 * @param {number} ttlMs - Time to live in milliseconds
 * @returns {Promise<{added: number}>} Operation result
 */
export async function replaceAllPDFs(records, ttlMs = PDF_DB_CONFIG.DEFAULT_TTL_MS) {
  return safeDbOperation(async (db) => {
    // Clear existing records
    await new Promise((resolve) => {
      const store = createTransaction(db, 'readwrite');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => resolve();
    });
    
    // Insert new records
    const result = await upsertPDFs(records, ttlMs);
    return { added: result.added };
  }, { added: 0 });
}

/**
 * Deletes a single PDF by ID
 * @param {string} id - PDF ID to delete
 * @returns {Promise<boolean>} True if successfully deleted
 */
export async function deletePDF(id) {
  if (!id) return false;
  
  return safeDbOperation(async (db) => {
    return new Promise((resolve) => {
      try {
        const store = createTransaction(db, 'readwrite');
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        resolve(false);
      }
    });
  }, false);
}

/**
 * Removes all expired PDF records
 * @returns {Promise<number>} Number of records removed
 */
export async function purgeExpiredPDFs() {
  return safeDbOperation(async (db) => {
    const currentTime = Date.now();
    
    return new Promise((resolve) => {
      const store = createTransaction(db, 'readwrite');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allRecords = request.result || [];
        let removedCount = 0;
        
        for (const record of allRecords) {
          if (isExpired(record, currentTime)) {
            try {
              store.delete(record.id);
              removedCount++;
            } catch (error) {
              console.warn('Failed to delete expired record:', error);
            }
          }
        }
        
        resolve(removedCount);
      };
      
      request.onerror = () => resolve(0);
    });
  }, 0);
}
