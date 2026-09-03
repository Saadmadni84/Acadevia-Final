import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/services/api.client';
import { useSyncStore } from '@/stores/useSyncStore';
import { offlineDb, type PendingSyncItem } from '@/sw/offline-db';

interface SyncBatchPayload {
  items: PendingSyncItem[];
}

interface SyncBatchResponse {
  processed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export function useSync() {
  const { setStatus, setLastSync, setPendingCount, setSyncProgress } = useSyncStore();

  const syncMutation = useMutation<SyncBatchResponse, Error, SyncBatchPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<SyncBatchResponse>(
        '/api/v1/sync/batch',
        payload,
      );
      return response.data;
    },
  });

  const checkPending = useCallback(async (): Promise<number> => {
    const count = await offlineDb.pendingSyncQueue.count();
    setPendingCount(count);
    return count;
  }, [setPendingCount]);

  const triggerSync = useCallback(async () => {
    const pending = await offlineDb.pendingSyncQueue.toArray();

    if (pending.length === 0) {
      setPendingCount(0);
      setStatus('SYNCED');
      return;
    }

    setStatus('SYNCING');
    setSyncProgress(0);

    try {
      const batchSize = 50;
      const totalBatches = Math.ceil(pending.length / batchSize);

      for (let i = 0; i < pending.length; i += batchSize) {
        const batch = pending.slice(i, i + batchSize);
        const result = await syncMutation.mutateAsync({ items: batch });

        const processedIds = batch
          .filter((_, idx) => !result.errors.some((e) => String(e.id) === String(batch[idx].id)))
          .map((item) => item.id!)
          .filter(Boolean);

        if (processedIds.length > 0) {
          await offlineDb.pendingSyncQueue.bulkDelete(processedIds);
        }

        const batchIndex = Math.floor(i / batchSize) + 1;
        setSyncProgress(Math.round((batchIndex / totalBatches) * 100));
      }

      setLastSync(new Date().toISOString());
      setStatus('SYNCED');
    } catch {
      setStatus('ERROR');
    } finally {
      await checkPending();
    }
  }, [setStatus, setLastSync, setPendingCount, setSyncProgress, syncMutation, checkPending]);

  return {
    triggerSync,
    checkPending,
    isSyncing: syncMutation.isPending,
  };
}
