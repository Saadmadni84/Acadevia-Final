import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Play,
  Trash2,
  Filter,
  ArrowUpDown,
  Video,
  HelpCircle,
  FileText,
} from 'lucide-react';
import DownloadProgress from './DownloadProgress';
import StorageIndicator from './StorageIndicator';

type ContentType = 'video' | 'quiz' | 'document';
type FilterType = 'all' | ContentType;
type SortType = 'date' | 'size' | 'name';

interface ActiveDownload {
  id: string;
  title: string;
  type: ContentType;
  progress: number; // 0-100
  speed: number; // bytes per second
  totalSize: number;
  downloadedSize: number;
  isPaused: boolean;
}

interface CompletedDownload {
  id: string;
  title: string;
  type: ContentType;
  size: number;
  downloadedAt: string;
  thumbnailUrl?: string;
}

interface StorageInfo {
  used: number;
  total: number;
  videoSize: number;
  quizSize: number;
  cacheSize: number;
}

interface DownloadsPageProps {
  activeDownloads?: ActiveDownload[];
  completedDownloads?: CompletedDownload[];
  storage?: StorageInfo;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPlay?: (id: string) => void;
  onClearCache?: () => void;
}

const typeIcons: Record<ContentType, React.ElementType> = {
  video: Video,
  quiz: HelpCircle,
  document: FileText,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function DownloadsPage({
  activeDownloads = [],
  completedDownloads = [],
  storage,
  onPause,
  onResume,
  onDelete,
  onPlay,
  onClearCache,
}: DownloadsPageProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const filteredCompleted = useMemo(() => {
    let items = [...completedDownloads];

    // Filter
    if (filter !== 'all') {
      items = items.filter((d) => d.type === filter);
    }

    // Sort
    items.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
      }
    });

    return items;
  }, [completedDownloads, filter, sort]);

  const handleSwipe = useCallback((id: string) => {
    setSwipedId((prev) => (prev === id ? null : id));
  }, []);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: t('downloads.all', 'All') },
    { value: 'video', label: t('downloads.videos', 'Videos') },
    { value: 'quiz', label: t('downloads.quizzes', 'Quizzes') },
    { value: 'document', label: t('downloads.documents', 'Documents') },
  ];

  const sorts: { value: SortType; label: string }[] = [
    { value: 'date', label: t('downloads.sortDate', 'Date') },
    { value: 'size', label: t('downloads.sortSize', 'Size') },
    { value: 'name', label: t('downloads.sortName', 'Name') },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('downloads.title', 'Downloads')}
        </h1>
      </div>

      {/* Storage Indicator */}
      {storage && (
        <StorageIndicator
          used={storage.used}
          total={storage.total}
          videoSize={storage.videoSize}
          quizSize={storage.quizSize}
          cacheSize={storage.cacheSize}
          onClearCache={onClearCache}
        />
      )}

      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('downloads.active', 'Active Downloads')}
        >
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            {t('downloads.active', 'Active Downloads')} ({activeDownloads.length})
          </h2>
          <div className="space-y-4">
            {activeDownloads.map((dl) => (
              <DownloadProgress
                key={dl.id}
                title={dl.title}
                progress={dl.progress}
                speed={dl.speed}
                totalSize={dl.totalSize}
                downloadedSize={dl.downloadedSize}
                isPaused={dl.isPaused}
                onPause={() => onPause?.(dl.id)}
                onResume={() => onResume?.(dl.id)}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f.value
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
              aria-pressed={filter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            aria-label={t('downloads.sortBy', 'Sort by')}
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completed Downloads */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('downloads.completed', 'Completed Downloads')}
      >
        <h2 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          {t('downloads.completed', 'Completed')} ({filteredCompleted.length})
        </h2>
        {filteredCompleted.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700" role="list">
            <AnimatePresence>
              {filteredCompleted.map((dl) => {
                const Icon = typeIcons[dl.type];
                const isSwiped = swipedId === dl.id;
                return (
                  <motion.li
                    key={dl.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="relative flex items-center justify-between gap-3 overflow-hidden p-4"
                    onTouchEnd={() => handleSwipe(dl.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{dl.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatSize(dl.size)} ·{' '}
                          {new Date(dl.downloadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dl.type === 'video' && (
                        <button
                          type="button"
                          onClick={() => onPlay?.(dl.id)}
                          className="rounded-lg p-2 text-indigo-500 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                          aria-label={t('downloads.play', 'Play {{title}}', { title: dl.title })}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete?.(dl.id)}
                        className={`rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 ${
                          isSwiped ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400' : ''
                        }`}
                        aria-label={t('downloads.delete', 'Delete {{title}}', { title: dl.title })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
            {t('downloads.noCompleted', 'No downloaded content yet')}
          </p>
        )}
      </motion.section>
    </div>
  );
}
