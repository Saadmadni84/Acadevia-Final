import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

function getHeight(itemHeight: number | ((index: number) => number), index: number): number {
  return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
}

function VirtualListInner<T>(
  {
    items,
    renderItem,
    itemHeight,
    containerHeight,
    overscan = 5,
    className,
    getItemKey,
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Compute cumulative offsets
  const { offsets, totalHeight } = useMemo(() => {
    const offs: number[] = new Array(items.length);
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
      offs[i] = cumulative;
      cumulative += getHeight(itemHeight, i);
    }
    return { offsets: offs, totalHeight: cumulative };
  }, [items.length, itemHeight]);

  // Find first visible index via binary search
  const findStartIndex = useCallback(
    (scrollPos: number) => {
      let lo = 0;
      let hi = offsets.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (offsets[mid] < scrollPos) lo = mid + 1;
        else hi = mid - 1;
      }
      return Math.max(0, lo - 1);
    },
    [offsets],
  );

  const { visibleItems } = useMemo(() => {
    const rawStart = findStartIndex(scrollTop);
    const start = Math.max(0, rawStart - overscan);

    let end = rawStart;
    let accumulated = offsets[rawStart] ?? 0;
    while (end < items.length && accumulated < scrollTop + containerHeight) {
      accumulated += getHeight(itemHeight, end);
      end++;
    }
    end = Math.min(items.length - 1, end + overscan);

    const visible: { item: T; index: number; offset: number }[] = [];
    for (let i = start; i <= end; i++) {
      visible.push({ item: items[i], index: i, offset: offsets[i] });
    }

    return { startIndex: start, endIndex: end, visibleItems: visible };
  }, [scrollTop, containerHeight, items, offsets, overscan, itemHeight, findStartIndex]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrollTop(scrollRef.current.scrollTop);
  }, []);

  // Sync external ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') ref(scrollRef.current);
    else (ref as React.MutableRefObject<HTMLDivElement | null>).current = scrollRef.current;
  }, [ref]);

  return (
    <div
      ref={scrollRef}
      role="list"
      aria-rowcount={items.length}
      className={cn('overflow-y-auto will-change-transform', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div className="relative" style={{ height: totalHeight }}>
        {visibleItems.map(({ item, index, offset }) => (
          <div
            key={getItemKey ? getItemKey(item, index) : index}
            role="listitem"
            aria-rowindex={index + 1}
            className="absolute left-0 right-0"
            style={{
              top: offset,
              height: getHeight(itemHeight, index),
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Preserve generic with forwardRef
const VirtualList = React.forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

export { VirtualList };
export type { VirtualListProps };
