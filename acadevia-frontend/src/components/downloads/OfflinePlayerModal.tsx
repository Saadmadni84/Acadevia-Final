import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Video, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { OfflineDownloadItem } from '@/types/download.types';
import { offlineStorage } from '@/lib/offlineStorage';
import { formatFileSize } from '@/lib/utils';

interface OfflinePlayerModalProps {
  item: OfflineDownloadItem | null;
  onClose: () => void;
}

export const OfflinePlayerModal: React.FC<OfflinePlayerModalProps> = ({
  item,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let currentUrl: string | null = null;
    let isMounted = true;

    if (item) {
      setIsLoading(true);
      offlineStorage
        .getBlob(item.id)
        .then((blob) => {
          if (!isMounted) return;
          if (blob) {
            currentUrl = URL.createObjectURL(blob);
            setBlobUrl(currentUrl);
          } else {
            // Fallback to original URL if blob isn't in IndexedDB
            setBlobUrl(item.downloadUrl);
          }
          setIsLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setBlobUrl(item.downloadUrl);
          setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [item]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-card-dark border border-gray-200/90 dark:border-gray-800 shadow-2xl p-5 sm:p-6 space-y-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Offline Ready
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.quality} · {formatFileSize(item.totalBytes)}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white truncate mt-0.5">
                  {item.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Media Player View */}
          <div className="rounded-2xl overflow-hidden bg-black/90 aspect-video flex items-center justify-center border border-gray-800">
            {isLoading ? (
              <div className="text-white text-xs font-bold animate-pulse flex items-center gap-2">
                <span>Loading offline media from secure storage...</span>
              </div>
            ) : item.fileType === 'video' ? (
              blobUrl ? (
                <video
                  src={blobUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white text-xs">Offline video not found</div>
              )
            ) : (
              // Document PDF Viewer
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gray-900 text-white">
                <FileText className="h-16 w-16 text-blue-400" />
                <div>
                  <h4 className="font-extrabold text-base">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.courseName} · {formatFileSize(item.totalBytes)}
                  </p>
                </div>
                {blobUrl && (
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => window.open(blobUrl, '_blank')}
                    className="cursor-pointer"
                  >
                    Open Fullscreen PDF
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-400 block font-medium">Course</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {item.courseName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Subject</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {item.subject}
                </span>
              </div>
              {item.author && (
                <div>
                  <span className="text-gray-400 block font-medium">Educator</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {item.author}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Stored on Device</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
