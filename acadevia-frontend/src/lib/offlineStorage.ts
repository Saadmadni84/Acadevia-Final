import type { OfflineDownloadItem, StorageBreakdown } from '@/types/download.types';

const DB_NAME = 'acadevia_offline_db';
const DB_VERSION = 1;
const META_STORE = 'downloads_meta';
const BLOB_STORE = 'downloads_blobs';

const DEFAULT_STORAGE_QUOTA_BYTES = 1073741824; // 1 GB fallback

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export const offlineStorage = {
  /**
   * Save or update download metadata in IndexedDB
   */
  async saveMeta(item: OfflineDownloadItem): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(META_STORE, 'readwrite');
        const store = tx.objectStore(META_STORE);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Could not save metadata to IndexedDB:', err);
    }
  },

  /**
   * Get all download items metadata
   */
  async getAllMeta(): Promise<OfflineDownloadItem[]> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(META_STORE, 'readonly');
        const store = tx.objectStore(META_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  },

  /**
   * Save a binary Blob into IndexedDB
   */
  async saveBlob(id: string, blob: Blob): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, 'readwrite');
        const store = tx.objectStore(BLOB_STORE);
        const req = store.put(blob, id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Could not save blob to IndexedDB:', err);
    }
  },

  /**
   * Get binary Blob from IndexedDB
   */
  async getBlob(id: string): Promise<Blob | null> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, 'readonly');
        const store = tx.objectStore(BLOB_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  /**
   * Remove a download (metadata and blob)
   */
  async remove(id: string): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([META_STORE, BLOB_STORE], 'readwrite');
        tx.objectStore(META_STORE).delete(id);
        tx.objectStore(BLOB_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Error deleting download from IndexedDB:', err);
    }
  },

  /**
   * Remove multiple downloads
   */
  async removeMany(ids: string[]): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([META_STORE, BLOB_STORE], 'readwrite');
        const metaStore = tx.objectStore(META_STORE);
        const blobStore = tx.objectStore(BLOB_STORE);
        ids.forEach((id) => {
          metaStore.delete(id);
          blobStore.delete(id);
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Error deleting downloads batch from IndexedDB:', err);
    }
  },

  /**
   * Calculate storage breakdown dynamically from actual downloads
   */
  calculateBreakdown(items: OfflineDownloadItem[]): StorageBreakdown {
    const completedItems = items.filter((i) => i.status === 'completed');

    let videoBytes = 0;
    let documentBytes = 0;
    let quizBytes = 0;
    let videosCount = 0;
    let documentsCount = 0;

    for (const item of completedItems) {
      const bytes = item.downloadedBytes || item.totalBytes || 0;
      if (item.fileType === 'video') {
        videoBytes += bytes;
        videosCount++;
      } else if (item.fileType === 'document') {
        documentBytes += bytes;
        documentsCount++;
      } else {
        quizBytes += bytes;
      }
    }

    const usedBytes = videoBytes + documentBytes + quizBytes;

    return {
      usedBytes,
      totalBytes: DEFAULT_STORAGE_QUOTA_BYTES,
      videoBytes,
      documentBytes,
      quizBytes,
      videosCount,
      documentsCount,
      completedCount: completedItems.length,
    };
  },
};
