import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, onChange, min = 0, max = 100, step = 1, label, showValue = false, disabled = false, className }, ref) => {
    const [hovering, setHovering] = useState(false);
    const [dragging, setDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const percent = useMemo(() => ((value - min) / (max - min)) * 100, [value, min, max]);

    const clampToStep = useCallback(
      (raw: number) => {
        const clamped = Math.min(max, Math.max(min, raw));
        return Math.round((clamped - min) / step) * step + min;
      },
      [min, max, step],
    );

    const getValueFromPointer = useCallback(
      (clientX: number) => {
        if (!trackRef.current) return value;
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return clampToStep(min + ratio * (max - min));
      },
      [min, max, value, clampToStep],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);
        onChange(getValueFromPointer(e.clientX));
      },
      [disabled, getValueFromPointer, onChange],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragging) return;
        onChange(getValueFromPointer(e.clientX));
      },
      [dragging, getValueFromPointer, onChange],
    );

    const handlePointerUp = useCallback(() => setDragging(false), []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;
        let next = value;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            e.preventDefault();
            next = clampToStep(value + step);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            e.preventDefault();
            next = clampToStep(value - step);
            break;
          case 'Home':
            e.preventDefault();
            next = min;
            break;
          case 'End':
            e.preventDefault();
            next = max;
            break;
          default:
            return;
        }
        onChange(next);
      },
      [disabled, value, step, min, max, clampToStep, onChange],
    );

    const showTooltip = hovering || dragging;

    return (
      <div ref={ref} className={cn('w-full', disabled && 'opacity-50 pointer-events-none', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
            {showValue && <span className="text-sm font-semibold text-primary">{value}</span>}
          </div>
        )}

        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
          tabIndex={disabled ? -1 : 0}
          className="relative h-6 flex items-center cursor-pointer select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* Track background */}
          <div className="absolute inset-x-0 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />

          {/* Filled track */}
          <div
            className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${percent}%` }}
          />

          {/* Thumb */}
          <motion.div
            className="absolute h-5 w-5 rounded-full bg-white dark:bg-gray-100 border-2 border-primary shadow-md"
            style={{ left: `${percent}%`, translateX: '-50%' }}
            animate={{ scale: dragging ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs font-semibold text-white bg-gray-900 dark:bg-gray-600 rounded-md whitespace-nowrap pointer-events-none"
                >
                  {value}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export { Slider };
export type { SliderProps };
