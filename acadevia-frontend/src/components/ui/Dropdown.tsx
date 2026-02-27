import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left', className }) => {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  const actionableItems = items.filter((i) => !i.divider);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightIndex(0);
        } else {
          setHighlightIndex((prev) => {
            let next = prev + 1;
            while (next < actionableItems.length && actionableItems[next].disabled) next++;
            return next < actionableItems.length ? next : prev;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && actionableItems[next].disabled) next--;
          return next >= 0 ? next : prev;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open && highlightIndex >= 0) {
          const item = actionableItems[highlightIndex];
          if (item && !item.disabled) {
            item.onClick?.();
            close();
          }
        } else if (!open) {
          setOpen(true);
          setHighlightIndex(0);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  };

  // Map actionable highlight index to position in full items array
  let actionableIdx = 0;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={handleKeyDown}
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-50 mt-1 min-w-[180px] rounded-xl border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-800 shadow-xl overflow-hidden py-1',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {(() => {
              actionableIdx = 0;
              return items.map((item, idx) => {
                if (item.divider) {
                  return <div key={`divider-${idx}`} className="my-1 h-px bg-gray-200 dark:bg-gray-700" />;
                }

                const currentActionIdx = actionableIdx++;
                const isHighlighted = currentActionIdx === highlightIndex;

                return (
                  <button
                    key={idx}
                    role="menuitem"
                    disabled={item.disabled}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors',
                      isHighlighted && 'bg-gray-100 dark:bg-gray-700/50',
                      item.danger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50',
                      item.disabled && 'opacity-40 pointer-events-none',
                    )}
                    onClick={() => {
                      item.onClick?.();
                      close();
                    }}
                    onMouseEnter={() => setHighlightIndex(currentActionIdx)}
                  >
                    {item.icon && <span className="shrink-0 h-4 w-4">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              });
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Dropdown };
export type { DropdownProps };
