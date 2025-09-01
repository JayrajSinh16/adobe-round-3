/**
 * IndexedDB Connection Manager
 * Handles database initialization and connection management
 */

import { PDF_DB_CONFIG } from './config.js';

/**
 * Opens IndexedDB connection with proper error handling
 * @returns {Promise<IDBDatabase>} Database instance
 * @throws {Error} When IndexedDB is not supported or connection fails
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    try {
      if (!('indexedDB' in window)) {
        return reject(new Error('IndexedDB not supported in this browser'));
      }

      const request = indexedDB.open(PDF_DB_CONFIG.DB_NAME, PDF_DB_CONFIG.DB_VERSION);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains(PDF_DB_CONFIG.STORE_NAME)) {
          const store = db.createObjectStore(PDF_DB_CONFIG.STORE_NAME, { 
            keyPath: PDF_DB_CONFIG.KEY_PATH 
          });
          
          // Create indexes for efficient querying
          try {
            const { NAME_SIZE, EXPIRY } = PDF_DB_CONFIG.INDEXES;
            store.createIndex(NAME_SIZE.name, NAME_SIZE.keyPath, NAME_SIZE.options);
            store.createIndex(EXPIRY.name, EXPIRY.keyPath, EXPIRY.options);
          } catch (error) {
            console.warn('Failed to create indexes:', error);
          }
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a transaction for the PDF store
 * @param {IDBDatabase} db - Database instance
 * @param {IDBTransactionMode} mode - Transaction mode ('readonly' | 'readwrite')
 * @returns {IDBObjectStore} Object store instance
 */
export function createTransaction(db, mode = 'readonly') {
  return db.transaction(PDF_DB_CONFIG.STORE_NAME, mode).objectStore(PDF_DB_CONFIG.STORE_NAME);
}

/**
 * Safely handles database operations with automatic error handling
 * @param {Function} operation - Database operation function
 * @param {*} fallback - Fallback value on error
 * @returns {Promise} Operation result or fallback
 */
export async function safeDbOperation(operation, fallback = null) {
  try {
    const db = await openDB();
    return await operation(db);
  } catch (error) {
    console.warn('Database operation failed:', error?.message || error);
    return fallback;
  }
}
