import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStore } from '@/stores/useSyncStore';
import type { SyncStatus } from '@/types/common.types';

const STATUS_CONFIG: Record<SyncStatus, { color: string; pulseColor: string; labelKey: string }> = {
  SYNCED: {
    color: 'bg-green-500',
    pulseColor: 'bg-green-400',
    labelKey: 'sync.synced',
  },
  SYNCING: {
    color: 'bg-yellow-500',
    pulseColor: 'bg-yellow-400',
    labelKey: 'sync.syncing',
  },
  OFFLINE: {
    color: 'bg-red-500',
    pulseColor: 'bg-red-400',
    labelKey: 'sync.offline',
  },
  ERROR: {
    color: 'bg-red-600',
    pulseColor: 'bg-red-500',
    labelKey: 'sync.error',
  },
};

const SyncStatusIndicator: React.FC = () => {
  const { status } = useSyncStore();
  const { t } = useTranslation();

  const config = STATUS_CONFIG[status];
  const label = t(config.labelKey, status.toLowerCase());

  return (
    <div className="group relative inline-flex items-center" role="status" aria-label={label}>
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-3 w-3"
        >
          {/* Pulse ring for syncing */}
          {status === 'SYNCING' && (
            <motion.span
              className={`absolute inset-0 rounded-full ${config.pulseColor} opacity-75`}
              animate={{ scale: [1, 1.8], opacity: [0.75, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}

          {/* Dot */}
          <span
            className={`relative inline-flex h-3 w-3 rounded-full ${config.color} ${
              status === 'SYNCING' ? 'animate-spin' : ''
            }`}
            aria-hidden="true"
          />

          {/* Spinning border for syncing state */}
          {status === 'SYNCING' && (
            <motion.span
              className="absolute inset-[-2px] rounded-full border-2 border-transparent border-t-yellow-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            />
          )}
        </motion.span>
      </AnimatePresence>

      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-gray-700"
      >
        {label}
      </span>
    </div>
  );
};

export { SyncStatusIndicator };
