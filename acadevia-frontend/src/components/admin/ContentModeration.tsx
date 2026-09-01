import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Eye,
  CheckSquare,
  Square,
  FileVideo,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';

type ContentStatus = 'pending' | 'approved' | 'rejected';

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  teacher: string;
  subject: string;
  className: string;
  uploadDate: string;
  status: ContentStatus;
  rejectionReason?: string;
  duration: string;
}

const mockContent: ContentItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `content-${i + 1}`,
  title: `Lesson ${i + 1}: ${['Algebra Basics', 'Photosynthesis', 'Grammar Rules', 'World War II', 'Chemical Reactions'][i % 5]}`,
  thumbnail: '',
  teacher: `Teacher ${(i % 8) + 1}`,
  subject: ['Mathematics', 'Science', 'English', 'History', 'Chemistry'][i % 5],
  className: `Class ${(i % 4) + 6}`,
  uploadDate: `2026-02-${String(15 - (i % 10)).padStart(2, '0')}`,
  status: (['pending', 'approved', 'rejected'] as ContentStatus[])[i % 3],
  duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
}));

const statusConfig: Record<ContentStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  approved: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  rejected: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
};

const ContentModeration: React.FC = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!statusFilter) return content;
    return content.filter((c) => c.status === statusFilter);
  }, [content, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const approveItem = (id: string) => {
    setContent((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c))
    );
  };

  const rejectItem = (id: string, reason: string) => {
    setContent((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'rejected' as const, rejectionReason: reason } : c
      )
    );
    setRejectingId(null);
    setRejectionReason('');
  };

  const bulkApprove = () => {
    setContent((prev) =>
      prev.map((c) =>
        selectedIds.has(c.id) ? { ...c, status: 'approved' as const } : c
      )
    );
    setSelectedIds(new Set());
  };

  const bulkReject = () => {
    setContent((prev) =>
      prev.map((c) =>
        selectedIds.has(c.id) ? { ...c, status: 'rejected' as const, rejectionReason: 'Bulk rejected' } : c
      )
    );
    setSelectedIds(new Set());
  };

  const pendingCount = content.filter((c) => c.status === 'pending').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.moderation.title', 'Content Moderation')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {pendingCount} {t('admin.moderation.pending', 'items pending review')}
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {(['', 'pending', 'approved', 'rejected'] as (ContentStatus | '')[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status === '' ? t('common.all', 'All') : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-3"
        >
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selectedIds.size} {t('admin.moderation.selected', 'selected')}
          </span>
          <button
            type="button"
            onClick={bulkApprove}
            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {t('admin.moderation.approveAll', 'Approve All')}
          </button>
          <button
            type="button"
            onClick={bulkReject}
            className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            {t('admin.moderation.rejectAll', 'Reject All')}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t('common.clearSelection', 'Clear')}
          </button>
        </motion.div>
      )}

      {/* Content Grid */}
      <div className="space-y-3">
        {/* Select all */}
        <button
          type="button"
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {selectedIds.size === filtered.length && filtered.length > 0 ? (
            <CheckSquare className="h-4 w-4 text-indigo-500" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          {t('common.selectAll', 'Select All')}
        </button>

        <AnimatePresence>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 sm:flex-row sm:items-center"
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleSelect(item.id)}
                className="self-start sm:self-center"
                aria-label={selectedIds.has(item.id) ? 'Deselect' : 'Select'}
              >
                {selectedIds.has(item.id) ? (
                  <CheckSquare className="h-5 w-5 text-indigo-500" />
                ) : (
                  <Square className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                )}
              </button>

              {/* Thumbnail */}
              <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <FileVideo className="h-8 w-8 text-gray-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> {item.teacher}
                  </span>
                  <span>{item.subject}</span>
                  <span>{item.className}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {item.uploadDate}
                  </span>
                  <span>{item.duration}</span>
                </div>
                {item.status === 'rejected' && item.rejectionReason && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <MessageSquare className="h-3 w-3" /> {item.rejectionReason}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[item.status].color} ${statusConfig[item.status].bg}`}
              >
                {statusConfig[item.status].icon}
                {item.status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  aria-label={t('admin.moderation.preview', 'Preview')}
                >
                  <Eye className="h-4 w-4" />
                </button>
                {item.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => approveItem(item.id)}
                      className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      aria-label={t('admin.moderation.approve', 'Approve')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingId(item.id)}
                      className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      aria-label={t('admin.moderation.reject', 'Reject')}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            {t('admin.moderation.empty', 'No content items')}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setRejectingId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl"
              role="dialog"
              aria-label="Rejection reason"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('admin.moderation.rejectReason', 'Rejection Reason')}
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('admin.moderation.reasonPlaceholder', 'Enter reason for rejection...')}
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason('');
                  }}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => rejectItem(rejectingId, rejectionReason || 'No reason provided')}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  {t('admin.moderation.confirmReject', 'Reject Content')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Panel */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden"
              role="dialog"
              aria-label="Content preview"
            >
              <div className="flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-900">
                <FileVideo className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{previewItem.title}</h3>
                  <button type="button" onClick={() => setPreviewItem(null)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{previewItem.teacher}</span>
                  <span>{previewItem.subject}</span>
                  <span>{previewItem.className}</span>
                  <span>{previewItem.uploadDate}</span>
                  <span>{previewItem.duration}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export { ContentModeration };
export default ContentModeration;
