import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSync } from '@/hooks/useSync';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockGetPendingActions = vi.fn();
const mockClearSyncedActions = vi.fn();
const mockSyncActions = vi.fn();

vi.mock('@/services/syncService', () => ({
  syncService: {
    getPendingActions: (...args: unknown[]) => mockGetPendingActions(...args),
    clearSyncedActions: (...args: unknown[]) => mockClearSyncedActions(...args),
    syncActions: (...args: unknown[]) => mockSyncActions(...args),
  },
}));

vi.mock('@/lib/indexedDB', () => ({
  indexedDB: {
    getAll: vi.fn().mockResolvedValue([]),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('triggerSync() reads from IndexedDB and syncs', async () => {
    const pendingActions = [
      { id: '1', type: 'QUIZ_ANSWER', payload: { questionId: 'q1', answer: 1 }, timestamp: Date.now() },
      { id: '2', type: 'LESSON_COMPLETE', payload: { lessonId: 'l1' }, timestamp: Date.now() },
    ];
    mockGetPendingActions.mockResolvedValue(pendingActions);
    mockSyncActions.mockResolvedValue({ synced: 2, failed: 0 });

    const { result } = renderHook(() => useSync(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(mockGetPendingActions).toHaveBeenCalled();
    expect(mockSyncActions).toHaveBeenCalledWith(pendingActions);
  });

  it('updates sync status during sync', async () => {
    mockGetPendingActions.mockResolvedValue([{ id: '1', type: 'TEST', payload: {} }]);
    mockSyncActions.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ synced: 1, failed: 0 }), 100))
    );

    const { result } = renderHook(() => useSync(), { wrapper: createWrapper() });

    expect(result.current.syncStatus).toBe('idle');

    let syncPromise: Promise<void>;
    act(() => {
      syncPromise = result.current.triggerSync();
    });

    expect(result.current.syncStatus).toBe('syncing');

    await act(async () => {
      vi.advanceTimersByTime(200);
      await syncPromise!;
    });

    expect(result.current.syncStatus).toBe('synced');
  });

  it('handles offline state', async () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: false });

    const { result } = renderHook(() => useSync(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(mockSyncActions).not.toHaveBeenCalled();
    expect(result.current.syncStatus).toBe('offline');
  });
});
