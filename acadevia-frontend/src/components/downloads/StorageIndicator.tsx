import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Trash2, AlertTriangle } from 'lucide-react';

interface StorageIndicatorProps {
  used: number;
  total: number;
  videoSize: number;
  quizSize: number;
  cacheSize: number;
  onClearCache?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function StorageIndicator({
  used,
  total,
  videoSize,
  quizSize,
  cacheSize,
  onClearCache,
}: StorageIndicatorProps) {
  const { t } = useTranslation();
  const [confirmClear, setConfirmClear] = useState(false);

  const pct = useMemo(() => (total > 0 ? (used / total) * 100 : 0), [used, total]);
  const videoPct = useMemo(() => (total > 0 ? (videoSize / total) * 100 : 0), [videoSize, total]);
  const quizPct = useMemo(() => (total > 0 ? (quizSize / total) * 100 : 0), [quizSize, total]);
  const cachePct = useMemo(() => (total > 0 ? (cacheSize / total) * 100 : 0), [cacheSize, total]);

  const isWarning = pct > 80;

  const segments = [
    { label: t('storage.videos', 'Videos'), pct: videoPct, color: 'bg-[#5B2C6F]', textColor: 'text-[#5B2C6F]', size: videoSize },
    { label: t('storage.quizzes', 'Quizzes'), pct: quizPct, color: 'bg-[#7B3F95]', textColor: 'text-[#7B3F95]', size: quizSize },
    { label: t('storage.cache', 'Cache'), pct: cachePct, color: 'bg-amber-400', textColor: 'text-amber-500', size: cacheSize },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 shadow-sm ${
        isWarning
          ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive
            className={`h-5 w-5 ${isWarning ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('storage.title', 'Storage')}
          </span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatSize(used)} / {formatSize(total)}
        </span>
      </div>

      {/* Stacked bar */}
      <div
        className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('storage.usage', 'Storage usage {{pct}}%', { pct: Math.round(pct) })}
      >
        <div className="flex h-full">
          {segments.map((seg) => (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              animate={{ width: `${seg.pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full ${seg.color}`}
            />
          ))}
        </div>
      </div>

      {/* Warning */}
      {isWarning && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          {t('storage.warning', 'Storage is getting full. Consider clearing cache.')}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${seg.color}`} aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-400">{seg.label}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{formatSize(seg.size)}</span>
          </div>
        ))}
      </div>

      {/* Clear Cache */}
      {onClearCache && (
        <div className="mt-3 flex justify-end">
          <AnimatePresence mode="wait">
            {confirmClear ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    onClearCache();
                    setConfirmClear(false);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  {t('common.confirm', 'Confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="clear"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t('storage.clearCache', 'Clear Cache')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
