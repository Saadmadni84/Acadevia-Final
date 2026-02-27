import { create } from 'zustand';
import type { DownloadManifest } from '@/types/download.types';

interface DownloadState {
  activeDownloads: Map<string, DownloadManifest & { progress: number; speed: number }>;
  completedDownloads: DownloadManifest[];
  totalStorageUsed: number;
  startDownload: (manifest: DownloadManifest) => void;
  updateProgress: (id: string, progress: number, speed: number) => void;
  markComplete: (id: string) => void;
  removeDownload: (id: string) => void;
}

export const useDownloadStore = create<DownloadState>()((set) => ({
  activeDownloads: new Map(),
  completedDownloads: [],
  totalStorageUsed: 0,
  startDownload: (manifest) => set((s) => {
    const next = new Map(s.activeDownloads);
    next.set(manifest.id, { ...manifest, progress: 0, speed: 0 });
    return { activeDownloads: next };
  }),
  updateProgress: (id, progress, speed) => set((s) => {
    const next = new Map(s.activeDownloads);
    const item = next.get(id);
    if (item) next.set(id, { ...item, progress, speed });
    return { activeDownloads: next };
  }),
  markComplete: (id) => set((s) => {
    const next = new Map(s.activeDownloads);
    const item = next.get(id);
    next.delete(id);
    return {
      activeDownloads: next,
      completedDownloads: item ? [...s.completedDownloads, item] : s.completedDownloads,
      totalStorageUsed: s.totalStorageUsed + (item?.totalSize || 0),
    };
  }),
  removeDownload: (id) => set((s) => ({
    completedDownloads: s.completedDownloads.filter(d => d.id !== id),
  })),
}));
