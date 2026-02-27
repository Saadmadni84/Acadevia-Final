import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: 'bottom' | 'right';
  className?: string;
}

const SWIPE_CLOSE_THRESHOLD = 100;

const Sheet: React.FC<SheetProps> = ({ open, onClose, children, title, side = 'bottom', className }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement;

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', trapFocus);

    // Auto-focus first focusable element
    requestAnimationFrame(() => {
      const first = contentRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });

    return () => {
      document.removeEventListener('keydown', trapFocus);
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (side === 'bottom' && info.offset.y > SWIPE_CLOSE_THRESHOLD) onClose();
      if (side === 'right' && info.offset.x > SWIPE_CLOSE_THRESHOLD) onClose();
    },
    [side, onClose],
  );

  const isBottom = side === 'bottom';

  const variants = {
    hidden: isBottom ? { y: '100%' } : { x: '100%' },
    visible: isBottom ? { y: 0 } : { x: 0 },
    exit: isBottom ? { y: '100%' } : { x: '100%' },
  };

  const dragConstraints = isBottom ? { top: 0 } : { left: 0 };
  const dragDirection = isBottom ? 'y' as const : 'x' as const;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title ?? 'Sheet'}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet content */}
          <motion.div
            ref={contentRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag={dragDirection}
            dragConstraints={dragConstraints}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'absolute z-10 flex flex-col bg-white dark:bg-gray-900 shadow-2xl',
              isBottom
                ? 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl'
                : 'top-0 right-0 bottom-0 w-full max-w-md rounded-l-2xl',
              className,
            )}
          >
            {/* Handle bar (mobile / bottom) */}
            {isBottom && (
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>
            )}

            {/* Header */}
            {(title || !isBottom) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { Sheet };
export type { SheetProps };
