// Lightweight IndexedDB helper for storing PDFs as Blobs with TTL and dedupe
// Store: 'pdfs' with keyPath 'id'

const DB_NAME = 'pdf-store-v1';
const STORE_NAME = 'pdfs';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    try {
      if (!('indexedDB' in window)) {
        return reject(new Error('IndexedDB not supported'));
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          // Helpful indexes
          try {
            store.createIndex('name_size', ['name', 'size'], { unique: false });
            store.createIndex('expiry', 'expiry', { unique: false });
          } catch {}
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Failed to open DB'));
    } catch (e) {
      reject(e);
    }
  });
}

function tx(db, mode = 'readonly') {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

export async function getActivePDFs() {
  // Returns array of { id, name, size, type, uploadedAt, blob, expiry }
  const now = Date.now();
  let db;
  try {
    db = await openDB();
  } catch (e) {
    console.warn('IndexedDB unavailable:', e?.message || e);
    return [];
  }
  return new Promise((resolve) => {
    const store = tx(db, 'readwrite');
    const request = store.getAll();
    request.onsuccess = () => {
      const all = Array.isArray(request.result) ? request.result : [];
      const active = [];
      for (const rec of all) {
        if (!rec) continue;
        if (typeof rec.expiry === 'number' && rec.expiry <= now) {
          // clean up expired
          try { store.delete(rec.id); } catch {}
          continue;
        }
        // Only accept expected shape
        if (!rec.name || typeof rec.size !== 'number' || !rec.blob) continue;
        active.push(rec);
      }
      resolve(active);
    };
    request.onerror = () => resolve([]);
  });
}

export async function upsertPDFs(records, ttlMs = 60 * 60 * 1000) {
  // records: array of { id, name, size, type, uploadedAt, blob }
  if (!Array.isArray(records) || records.length === 0) return { added: 0, kept: 0 };
  let db;
  try {
    db = await openDB();
  } catch (e) {
    console.warn('IndexedDB unavailable:', e?.message || e);
    return { added: 0, kept: 0 };
  }

  const now = Date.now();
  const expiry = now + (typeof ttlMs === 'number' ? ttlMs : 60 * 60 * 1000);
  // Dedup against existing by name|size
  const existing = await new Promise((resolve) => {
    const store = tx(db, 'readonly');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });

  const seen = new Map();
  for (const rec of existing) {
    if (!rec?.name || typeof rec?.size !== 'number') continue;
    seen.set(`${rec.name}|${rec.size}`, true);
  }

  let added = 0;
  let kept = 0;
  await new Promise((resolve) => {
    const store = tx(db, 'readwrite');
    let pending = 0;
    const done = () => { if (pending === 0) resolve(); };

    records.forEach((r) => {
      if (!r || !r.name || typeof r.size !== 'number' || !r.blob) {
        return; // skip invalid
      }
      const key = `${r.name}|${r.size}`;
      if (seen.has(key)) {
        kept += 1;
        return;
      }
      const toPut = {
        id: r.id || `${r.name}-${r.size}-${now}-${Math.random()}`,
        name: r.name,
        size: r.size,
        type: r.type || 'application/pdf',
        uploadedAt: r.uploadedAt || new Date().toISOString(),
        blob: r.blob, // Blob
        expiry,
      };
      pending += 1;
      const putReq = store.put(toPut);
      putReq.onsuccess = () => { added += 1; pending -= 1; done(); };
      putReq.onerror = () => { pending -= 1; done(); };
    });
    done();
  });

  return { added, kept };
}

export async function replaceAllPDFs(records, ttlMs = 60 * 60 * 1000) {
  // Clears and writes the provided records
  let db;
  try { db = await openDB(); } catch (e) { console.warn('IndexedDB unavailable:', e); return { added: 0 }; }
  await new Promise((resolve) => {
    const store = tx(db, 'readwrite');
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve();
    clearReq.onerror = () => resolve();
  });
  return upsertPDFs(records, ttlMs);
}

export async function purgeExpiredPDFs() {
  let db;
  try { db = await openDB(); } catch { return 0; }
  const now = Date.now();
  return new Promise((resolve) => {
    const store = tx(db, 'readwrite');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      let removed = 0;
      all.forEach((rec) => {
        if (typeof rec?.expiry === 'number' && rec.expiry <= now) {
          try { store.delete(rec.id); removed += 1; } catch {}
        }
      });
      resolve(removed);
    };
    req.onerror = () => resolve(0);
  });
}

// Helpers
export function dataUrlToBlob(dataUrl) {
  try {
    const [meta, b64] = (dataUrl || '').split(',');
    const mime = /data:(.*?);base64/.exec(meta)?.[1] || 'application/pdf';
    const byteStr = atob(b64 || '');
    const len = byteStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = byteStr.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch (e) {
    return null;
  }
}

export async function deletePDF(id) {
  // Delete a single PDF by ID
  if (!id) return false;
  let db;
  try {
    db = await openDB();
  } catch (e) {
    console.warn('IndexedDB unavailable:', e?.message || e);
    return false;
  }

  return new Promise((resolve) => {
    try {
      const store = tx(db, 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}
