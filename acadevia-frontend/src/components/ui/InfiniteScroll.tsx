import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children: React.ReactNode;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
  threshold?: number;
}

const DefaultLoader: React.FC = () => (
  <div className="flex flex-col gap-3 py-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse flex gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-3/4" />
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  hasMore,
  loading,
  children,
  loader,
  endMessage,
  error = false,
  onRetry,
  className,
  threshold = 0.1,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);

  // Keep ref in sync to avoid re-creating observer
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && !error) {
        loadMoreRef.current();
      }
    },
    [hasMore, loading, error],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [observerCallback, threshold]);

  return (
    <div className={cn('w-full', className)}>
      {children}

      {/* Sentinel element */}
      {hasMore && !error && (
        <div ref={sentinelRef} className="w-full h-1" aria-hidden="true" />
      )}

      {/* Loading indicator */}
      {loading && (loader ?? <DefaultLoader />)}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Something went wrong.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && !loading && !error && (
        endMessage ?? (
          <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
            No more items to load
          </p>
        )
      )}
    </div>
  );
};

export { InfiniteScroll };
export type { InfiniteScrollProps };
