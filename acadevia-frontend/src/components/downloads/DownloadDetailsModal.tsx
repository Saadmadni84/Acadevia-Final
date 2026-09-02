import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Video, FileText, Calendar, HardDrive, ShieldCheck, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { OfflineDownloadItem } from '@/types/download.types';
import { formatFileSize } from '@/lib/utils';

interface DownloadDetailsModalProps {
  item: OfflineDownloadItem | null;
  onClose: () => void;
}

export const DownloadDetailsModal: React.FC<DownloadDetailsModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-card-dark border border-gray-200/90 dark:border-gray-800 shadow-2xl p-6 space-y-5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                  Download Details
                </h3>
                <p className="text-xs text-gray-500">Offline Learning Metadata</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200/70 dark:border-gray-700/60 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-gray-500 font-medium">Lesson Title</span>
              <span className="font-bold text-gray-900 dark:text-white text-right max-w-[200px] truncate">
                {item.title}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-gray-500 font-medium">Course</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {item.courseName}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-gray-500 font-medium">Subject & Class</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {item.subject} · Class {item.classGrade}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-gray-500 font-medium">File Format</span>
              <span className="font-bold uppercase text-primary">
                {item.fileType} {item.quality && `(${item.quality})`}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-gray-500 font-medium">Size on Disk</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatFileSize(item.totalBytes)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-gray-500 font-medium">Status</span>
              <span className="font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                {item.status === 'completed' ? '✓ Available Offline' : item.status}
              </span>
            </div>

            {item.author && (
              <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                <span className="text-gray-500 font-medium">Teacher</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.author}
                </span>
              </div>
            )}

            {item.downloadedAt && (
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">Downloaded Date</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {new Date(item.downloadedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
