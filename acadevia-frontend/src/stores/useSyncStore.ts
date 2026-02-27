import { create } from 'zustand';
import type { SyncStatus } from '@/types/common.types';

interface SyncState {
  isOnline: boolean;
  status: SyncStatus;
  pendingCount: number;
  lastSyncAt: string | null;
  syncProgress: number;
  setOnline: (online: boolean) => void;
  setStatus: (status: SyncStatus) => void;
  setPendingCount: (count: number) => void;
  setLastSync: (timestamp: string) => void;
  setSyncProgress: (progress: number) => void;
}

export const useSyncStore = create<SyncState>()((set) => ({
  isOnline: navigator.onLine,
  status: navigator.onLine ? 'SYNCED' : 'OFFLINE',
  pendingCount: 0,
  lastSyncAt: null,
  syncProgress: 0,
  setOnline: (isOnline) => set({ isOnline, status: isOnline ? 'SYNCED' : 'OFFLINE' }),
  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSync: (lastSyncAt) => set({ lastSyncAt }),
  setSyncProgress: (syncProgress) => set({ syncProgress }),
}));
