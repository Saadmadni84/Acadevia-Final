import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, Pause, Play, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QualityOption {
  label: string;
  value: string;
  sizeMB: number;
}

type DownloadState = 'idle' | 'downloading' | 'paused' | 'done';

const qualityOptions: QualityOption[] = [
  { label: '144p', value: '144', sizeMB: 10 },
  { label: '240p', value: '240', sizeMB: 25 },
  { label: '360p', value: '360', sizeMB: 50 },
  { label: '480p', value: '480', sizeMB: 100 },
  { label: '720p', value: '720', sizeMB: 200 },
];

interface VideoDownloadButtonProps {
  videoId: string;
  onDownload?: (quality: string) => void;
  className?: string;
}

function estimateTime(sizeMB: number, speedMbps = 5): string {
  const seconds = Math.ceil((sizeMB * 8) / speedMbps);
  if (seconds < 60) return `~${seconds}s`;
  return `~${Math.ceil(seconds / 60)}m`;
}

const VideoDownloadButton: React.FC<VideoDownloadButtonProps> = ({
  videoId,
  onDownload,
  className,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<QualityOption | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startDownload = (option: QualityOption) => {
    setSelectedQuality(option);
    setOpen(false);
    setState('downloading');
    setProgress(0);
    onDownload?.(option.value);

    // Simulate download progress
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setState('done');
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };

  const pauseDownload = () => {
    clearInterval(intervalRef.current);
    setState('paused');
  };

  const resumeDownload = () => {
    setState('downloading');
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setState('done');
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };

  const cancelDownload = () => {
    clearInterval(intervalRef.current);
    setState('idle');
    setProgress(0);
    setSelectedQuality(null);
  };

  if (state === 'done') {
    return (
      <Button variant="ghost" className={cn('text-success', className)} disabled>
        <CheckCircle2 className="h-4 w-4 mr-1.5" aria-hidden />
        {t('download.downloaded')}
      </Button>
    );
  }

  if (state === 'downloading' || state === 'paused') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Progress bar */}
        <div className="flex-1 min-w-[120px]">
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {progress}% — {selectedQuality?.label}
          </p>
        </div>

        {/* Pause / Resume */}
        <button
          onClick={state === 'downloading' ? pauseDownload : resumeDownload}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label={state === 'downloading' ? t('download.pause') : t('download.resume')}
        >
          {state === 'downloading' ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>

        {/* Cancel */}
        <button
          onClick={cancelDownload}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
          aria-label={t('download.cancel')}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        leftIcon={<Download className="h-4 w-4" />}
        rightIcon={
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        }
      >
        {t('download.download')}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-lg py-1 z-40"
            role="menu"
          >
            {qualityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => startDownload(opt)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                role="menuitem"
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs text-gray-400">
                  {opt.sizeMB} MB · {estimateTime(opt.sizeMB)}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { VideoDownloadButton };
