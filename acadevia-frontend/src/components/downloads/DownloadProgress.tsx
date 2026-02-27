import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';

interface DownloadProgressProps {
  title: string;
  progress: number; // 0-100
  speed: number; // bytes per second
  totalSize: number;
  downloadedSize: number;
  isPaused: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatETA(remaining: number, speed: number): string {
  if (speed <= 0) return '∞';
  const seconds = remaining / speed;
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.ceil((seconds % 3600) / 60)}m`;
}

export default function DownloadProgress({
  title,
  progress,
  speed,
  totalSize,
  downloadedSize,
  isPaused,
  onPause,
  onResume,
}: DownloadProgressProps) {
  const { t } = useTranslation();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const remaining = totalSize - downloadedSize;

  const eta = useMemo(() => formatETA(remaining, speed), [remaining, speed]);

  // Generate animated "chunk" dots
  const chunkCount = 5;
  const activeChunks = Math.ceil((clampedProgress / 100) * chunkCount);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mb-2 flex items-center justify-between">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <button
          type="button"
          onClick={isPaused ? onResume : onPause}
          className="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
          aria-label={
            isPaused
              ? t('downloads.resume', 'Resume download')
              : t('downloads.pause', 'Pause download')
          }
        >
          {isPaused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title} ${clampedProgress}%`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[#5B2C6F] to-[#7B3F95]"
        />
      </div>

      {/* Stats row */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{clampedProgress.toFixed(0)}%</span>
        <div className="flex items-center gap-3">
          {!isPaused && (
            <span>{formatSpeed(speed)}</span>
          )}
          <span>
            {formatSize(downloadedSize)} / {formatSize(totalSize)}
          </span>
          {!isPaused && (
            <span>
              {t('downloads.eta', 'ETA')}: {eta}
            </span>
          )}
        </div>
      </div>

      {/* Animated chunks */}
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {Array.from({ length: chunkCount }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: i < activeChunks ? [0.5, 1, 0.5] : 0.2,
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className={`h-1.5 flex-1 rounded-full ${
              i < activeChunks
                ? 'bg-indigo-400 dark:bg-indigo-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {isPaused && (
        <p className="mt-1 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
          {t('downloads.paused', 'Paused')}
        </p>
      )}
    </div>
  );
}
