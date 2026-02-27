import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unreadCount: number;
  /** Render prop or component for the notification panel dropdown */
  panelContent?: React.ReactNode;
  onOpen?: () => void;
}

export default function NotificationBell({
  unreadCount,
  panelContent,
  onOpen,
}: NotificationBellProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const prevCountRef = useRef(unreadCount);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pulse animation when new notification arrives
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) onOpen?.();
  }, [isOpen, onOpen]);

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label={t('notification.bell', 'Notifications ({{count}} unread)', {
          count: unreadCount,
        })}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
            >
              {displayCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        <AnimatePresence>
          {pulse && (
            <motion.span
              key="pulse"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute -right-0.5 -top-0.5 h-[18px] w-[18px] rounded-full bg-red-400"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && panelContent && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:w-96 dark:border-gray-700 dark:bg-gray-800"
            role="dialog"
            aria-label={t('notification.panel', 'Notification panel')}
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
