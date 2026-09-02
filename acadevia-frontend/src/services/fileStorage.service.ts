/**
 * File Storage Service
 *
 * Provides real, persistent binary storage for uploaded content (PDFs, Images, Videos)
 * using the browser's IndexedDB engine. Files persist across page reloads, browser restarts,
 * and user sessions, avoiding temporary in-memory URL expiration.
 */

const DB_NAME = 'acadevia_content_storage_v1';
const STORE_NAME = 'uploaded_files';
const DB_VERSION = 1;

export interface StoredFileRecord {
  id: string;
  name: string;
  type: string; // MIME type, e.g. 'application/pdf', 'image/png', 'video/mp4'
  size: number;
  blob: Blob;
  uploadedAt: string;
  dataUrl?: string;
}

class FileStorageService {
  private memoryStore = new Map<string, StoredFileRecord>();
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private getDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    });

    return this.dbPromise;
  }

  /**
   * Store a real File or Blob permanently in IndexedDB (with memory store fallback)
   */
  async storeFile(id: string, file: File | Blob, customName?: string): Promise<StoredFileRecord> {
    const name = customName || (file instanceof File ? file.name : `file-${id}`);
    const type = file.type || 'application/octet-stream';
    const size = file.size;
    const uploadedAt = new Date().toISOString();

    // Generate dataUrl for immediate previews (especially images/small docs)
    let dataUrl: string | undefined;
    if (typeof FileReader !== 'undefined') {
      try {
        dataUrl = await this.blobToDataUrl(file);
      } catch {
        // ignore
      }
    }

    const record: StoredFileRecord = {
      id,
      name,
      type,
      size,
      blob: file,
      uploadedAt,
      dataUrl,
    };

    try {
      const db = await this.getDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.put(record);

          req.onsuccess = () => resolve(record);
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // fallback
    }

    this.memoryStore.set(id, record);
    return record;
  }

  /**
   * Retrieve a stored file by ID
   */
  async getFile(id: string): Promise<StoredFileRecord | null> {
    try {
      const db = await this.getDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.get(id);

          req.onsuccess = () => {
            resolve(req.result || null);
          };
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // fallback
    }

    return this.memoryStore.get(id) || null;
  }

  /**
   * Generate an accessible URL for viewing or playing a stored file.
   */
  async getFileUrl(id: string): Promise<string | null> {
    const record = await this.getFile(id);
    if (!record) return null;
    if (record.dataUrl) return record.dataUrl;
    if (record.blob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      return URL.createObjectURL(record.blob);
    }
    return null;
  }

  /**
   * Remove a file from storage
   */
  async deleteFile(id: string): Promise<boolean> {
    this.memoryStore.delete(id);
    try {
      const db = await this.getDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const req = store.delete(id);

          req.onsuccess = () => resolve(true);
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // fallback
    }
    return true;
  }


  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const fileStorageService = new FileStorageService();
