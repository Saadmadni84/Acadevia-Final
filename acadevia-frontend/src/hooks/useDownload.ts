import { useCallback, useRef } from 'react';
import apiClient from '@/services/api.client';
import { useDownloadStore } from '@/stores/useDownloadStore';
import type { DownloadManifest } from '@/types/download.types';
import { offlineDb } from '@/sw/offline-db';

type VideoQuality = 'low' | 'medium' | 'high';

interface DownloadInitResponse {
  downloadUrl: string;
  fileSize: number;
  totalChunks: number;
  mimeType: string;
  title: string;
}

export function useDownload() {
  const {
    activeDownloads,
    completedDownloads,
    startDownload: storeStartDownload,
    updateProgress,
    markComplete,
    removeDownload,
  } = useDownloadStore();

  const abortControllers = useRef(new Map<string, AbortController>());

  const startDownload = useCallback(
    async (lessonId: string, quality: VideoQuality = 'medium') => {
      const controller = new AbortController();
      abortControllers.current.set(lessonId, controller);

      try {
        const { data: meta } = await apiClient.get<DownloadInitResponse>(
          `/api/v1/lessons/${lessonId}/download`,
          { params: { quality } },
        );

        const manifest: DownloadManifest = {
          id: lessonId,
          lessonId,
          title: meta.title,
          quality,
          totalSize: meta.fileSize,
          totalChunks: meta.totalChunks,
          completedChunks: 0,
          status: 'downloading',
          createdAt: new Date().toISOString(),
        };

        storeStartDownload(manifest);

        const response = await apiClient.get<ArrayBuffer>(meta.downloadUrl, {
          responseType: 'arraybuffer',
          signal: controller.signal,
          onDownloadProgress: (event) => {
            if (event.total) {
              const progress = Math.round((event.loaded / event.total) * 100);
              const elapsed = Date.now();
              const speed = event.loaded / (elapsed / 1000);
              updateProgress(lessonId, progress, speed);
            }
          },
        });

        const blob = new Blob([response.data], { type: meta.mimeType });

        await offlineDb.downloadedVideos.put({
          lessonId,
          quality,
          blob,
          mimeType: meta.mimeType,
          fileSize: meta.fileSize,
          downloadedAt: new Date().toISOString(),
        });

        markComplete(lessonId);
      } catch (error) {
        if ((error as Error).name !== 'CanceledError') {
          throw error;
        }
      } finally {
        abortControllers.current.delete(lessonId);
      }
    },
    [storeStartDownload, updateProgress, markComplete],
  );

  const pauseDownload = useCallback((lessonId: string) => {
    const controller = abortControllers.current.get(lessonId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(lessonId);
    }
  }, []);

  const resumeDownload = useCallback(
    async (lessonId: string) => {
      const download = activeDownloads.get(lessonId);
      if (download) {
        await startDownload(lessonId, download.quality as VideoQuality);
      }
    },
    [activeDownloads, startDownload],
  );

  const cancelDownload = useCallback(
    async (lessonId: string) => {
      const controller = abortControllers.current.get(lessonId);
      if (controller) {
        controller.abort();
        abortControllers.current.delete(lessonId);
      }
      removeDownload(lessonId);
      await offlineDb.downloadedVideos.delete(lessonId);
    },
    [removeDownload],
  );

  return {
    activeDownloads,
    completedDownloads,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
  };
}
