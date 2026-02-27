import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', searchable = false, disabled = false, className, label }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedOption = useMemo(() => options.find((o) => o.value === value), [options, value]);

    const filtered = useMemo(
      () =>
        search
          ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
          : options,
      [options, search],
    );

    const close = useCallback(() => {
      setOpen(false);
      setSearch('');
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

    // Focus search on open
    useEffect(() => {
      if (open && searchable) searchRef.current?.focus();
    }, [open, searchable]);

    // Scroll highlighted into view
    useEffect(() => {
      if (highlightIndex >= 0 && listRef.current) {
        const el = listRef.current.children[highlightIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'nearest' });
      }
    }, [highlightIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!open) {
            setOpen(true);
          } else {
            setHighlightIndex((prev) => {
              let next = prev + 1;
              while (next < filtered.length && filtered[next].disabled) next++;
              return next < filtered.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && filtered[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (open && highlightIndex >= 0 && filtered[highlightIndex] && !filtered[highlightIndex].disabled) {
            onChange(filtered[highlightIndex].value);
            close();
          } else if (!open) {
            setOpen(true);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    };

    const hasValue = !!selectedOption;

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        <div
          ref={containerRef}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            'relative flex items-center gap-2 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 cursor-pointer transition-all duration-200',
            'focus-within:ring-2 focus-within:ring-primary focus-within:border-primary',
            disabled && 'opacity-50 pointer-events-none',
            open && 'ring-2 ring-primary border-primary',
          )}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
        >
          {/* Floating label */}
          {label && (
            <span
              className={cn(
                'absolute left-3 transition-all duration-200 pointer-events-none bg-white dark:bg-gray-800 px-1',
                hasValue || open
                  ? '-top-2.5 text-xs text-primary font-medium'
                  : 'top-1/2 -translate-y-1/2 text-sm text-gray-400',
              )}
            >
              {label}
            </span>
          )}

          {/* Selected value */}
          <span className="flex items-center gap-2 flex-1 truncate">
            {selectedOption?.icon}
            <span className={cn('truncate', !hasValue && 'text-gray-400')}>
              {selectedOption?.label ?? placeholder}
            </span>
          </span>

          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="Clear selection"
              className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                close();
              }}
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}

          <ChevronDown
            className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', open && 'rotate-180')}
          />
        </div>

        {/* Dropdown panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700',
                'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl',
                'overflow-hidden',
              )}
            >
              {searchable && (
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setHighlightIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
                    aria-label="Search options"
                  />
                </div>
              )}

              <ul
                ref={listRef}
                role="listbox"
                className="max-h-60 overflow-y-auto py-1"
              >
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">No results found</li>
                ) : (
                  filtered.map((option, idx) => {
                    const isSelected = option.value === value;
                    const isHighlighted = idx === highlightIndex;
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer transition-colors',
                          isHighlighted && 'bg-primary/10 dark:bg-primary/20',
                          isSelected && 'text-primary font-medium',
                          option.disabled && 'opacity-40 pointer-events-none',
                          !isHighlighted && !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                        )}
                        onClick={() => {
                          if (!option.disabled) {
                            onChange(option.value);
                            close();
                          }
                        }}
                        onMouseEnter={() => setHighlightIndex(idx)}
                      >
                        {option.icon && <span className="shrink-0">{option.icon}</span>}
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
