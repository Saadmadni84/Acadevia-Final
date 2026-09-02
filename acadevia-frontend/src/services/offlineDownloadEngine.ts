import type { OfflineDownloadItem, DownloadStatus, VideoQuality } from '@/types/download.types';
import { offlineStorage } from '@/lib/offlineStorage';

type ProgressListener = (item: OfflineDownloadItem) => void;

class OfflineDownloadEngine {
  private activeControllers = new Map<string, AbortController>();
  private listeners = new Set<ProgressListener>();

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(item: OfflineDownloadItem) {
    this.listeners.forEach((listener) => {
      try {
        listener(item);
      } catch (e) {
        console.error('Error notifying download listener:', e);
      }
    });
  }

  /**
   * Start or resume downloading an item with real stream tracking
   */
  public async startDownload(item: OfflineDownloadItem): Promise<void> {
    const controller = new AbortController();
    this.activeControllers.set(item.id, controller);

    let updatedItem: OfflineDownloadItem = {
      ...item,
      status: 'downloading' as DownloadStatus,
      errorMessage: undefined,
    };
    await offlineStorage.saveMeta(updatedItem);
    this.notify(updatedItem);

    try {
      const response = await fetch(item.downloadUrl, {
        signal: controller.signal,
        headers: {
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with HTTP ${response.status}`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : item.totalBytes || 52428800; // fallback to expected size

      const reader = response.body?.getReader();

      if (!reader) {
        // Fallback for environments without stream reader
        const blob = await response.blob();
        await offlineStorage.saveBlob(item.id, blob);

        updatedItem = {
          ...updatedItem,
          status: 'completed',
          downloadedBytes: blob.size,
          totalBytes: blob.size,
          speedBytesPerSec: 0,
          etaSeconds: 0,
          downloadedAt: new Date().toISOString(),
        };
        await offlineStorage.saveMeta(updatedItem);
        this.notify(updatedItem);
        this.activeControllers.delete(item.id);
        return;
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      let lastReportTime = Date.now();
      let lastReportBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        const now = Date.now();
        const timeDiffSec = (now - lastReportTime) / 1000;

        // Throttle state emission to ~250ms for UI smoothness
        if (timeDiffSec >= 0.25 || receivedBytes === totalBytes) {
          const speed =
            timeDiffSec > 0
              ? Math.round((receivedBytes - lastReportBytes) / timeDiffSec)
              : 0;
          const remainingBytes = Math.max(0, totalBytes - receivedBytes);
          const eta = speed > 0 ? Math.round(remainingBytes / speed) : 0;

          updatedItem = {
            ...updatedItem,
            downloadedBytes: receivedBytes,
            totalBytes,
            speedBytesPerSec: speed,
            etaSeconds: eta,
          };

          this.notify(updatedItem);
          lastReportTime = now;
          lastReportBytes = receivedBytes;
        }
      }

      // Combine chunks into binary Blob
      const combinedBlob = new Blob(chunks as BlobPart[], {
        type: item.fileType === 'video' ? 'video/mp4' : 'application/pdf',
      });

      await offlineStorage.saveBlob(item.id, combinedBlob);

      updatedItem = {
        ...updatedItem,
        status: 'completed',
        downloadedBytes: combinedBlob.size,
        totalBytes: combinedBlob.size,
        speedBytesPerSec: 0,
        etaSeconds: 0,
        downloadedAt: new Date().toISOString(),
      };

      await offlineStorage.saveMeta(updatedItem);
      this.notify(updatedItem);
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        // Paused or cancelled
        return;
      }

      const errorMsg =
        err instanceof Error ? err.message : 'Network download error';
      updatedItem = {
        ...updatedItem,
        status: 'failed',
        errorMessage: errorMsg,
        speedBytesPerSec: 0,
        etaSeconds: 0,
      };
      await offlineStorage.saveMeta(updatedItem);
      this.notify(updatedItem);
    } finally {
      this.activeControllers.delete(item.id);
    }
  }

  /**
   * Pause active download
   */
  public async pauseDownload(item: OfflineDownloadItem): Promise<void> {
    const controller = this.activeControllers.get(item.id);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(item.id);
    }

    const updatedItem: OfflineDownloadItem = {
      ...item,
      status: 'paused',
      speedBytesPerSec: 0,
      etaSeconds: 0,
    };
    await offlineStorage.saveMeta(updatedItem);
    this.notify(updatedItem);
  }

  /**
   * Resume paused download
   */
  public async resumeDownload(item: OfflineDownloadItem): Promise<void> {
    await this.startDownload(item);
  }

  /**
   * Cancel and delete download
   */
  public async cancelDownload(id: string): Promise<void> {
    const controller = this.activeControllers.get(id);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(id);
    }
    await offlineStorage.remove(id);
  }

  /**
   * Retry failed download
   */
  public async retryDownload(item: OfflineDownloadItem): Promise<void> {
    await this.startDownload(item);
  }
}

export const offlineDownloadEngine = new OfflineDownloadEngine();
