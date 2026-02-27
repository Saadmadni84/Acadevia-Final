import React, { useEffect, useCallback } from 'react';
import { useSyncStore } from '@/stores/useSyncStore';
import { syncService } from '@/services/sync.service';
import { useAuthStore } from '@/stores/useAuthStore';

const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setOnline = useSyncStore((s) => s.setOnline);
  const setStatus = useSyncStore((s) => s.setStatus);
  const setPendingCount = useSyncStore((s) => s.setPendingCount);
  const setLastSync = useSyncStore((s) => s.setLastSync);
  const setSyncProgress = useSyncStore((s) => s.setSyncProgress);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const performSync = useCallback(async () => {
    if (!useAuthStore.getState().isAuthenticated) return;

    try {
      setStatus('SYNCING');
      setSyncProgress(0);

      const { data } = await syncService.getStatus();
      const result = data.data;

      if (result) {
        setPendingCount(result.pendingCount);
        setLastSync(result.lastSyncAt);
      }

      setSyncProgress(100);
      setStatus('SYNCED');
    } catch {
      setStatus('ERROR');
      setSyncProgress(0);
    }
  }, [setStatus, setSyncProgress, setPendingCount, setLastSync]);

  const handleOnline = useCallback(() => {
    setOnline(true);
    performSync();
  }, [setOnline, performSync]);

  const handleOffline = useCallback(() => {
    setOnline(false);
    setStatus('OFFLINE');
  }, [setOnline, setStatus]);

  useEffect(() => {
    // Set initial state
    setOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, handleOnline, handleOffline]);

  // Sync when user becomes authenticated and is online
  useEffect(() => {
    if (isAuthenticated && navigator.onLine) {
      performSync();
    }
  }, [isAuthenticated, performSync]);

  return <>{children}</>;
};

export { SyncProvider };
