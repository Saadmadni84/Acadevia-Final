import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Search,
  Plus,
  HardDrive,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  X,
  Info,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/useAuthStore';
import { ROUTES } from '@/config/routes.config';
import type {
  OfflineDownloadItem,
  DownloadStatus,
  DownloadType,
} from '@/types/download.types';
import { offlineStorage } from '@/lib/offlineStorage';
import { offlineDownloadEngine } from '@/services/offlineDownloadEngine';
import { DownloadLessonModal } from './DownloadLessonModal';
import { OfflinePlayerModal } from './OfflinePlayerModal';
import { DownloadDetailsModal } from './DownloadDetailsModal';
import { formatFileSize, cn } from '@/lib/utils';

type FilterCategory =
  | 'all'
  | 'videos'
  | 'documents'
  | 'downloading'
  | 'completed'
  | 'failed';

export const OfflineLearningCenter: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Download items state loaded from IndexedDB
  const [downloads, setDownloads] = useState<OfflineDownloadItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [isManageStorageMode, setIsManageStorageMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Modals state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [playingItem, setPlayingItem] = useState<OfflineDownloadItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<OfflineDownloadItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<OfflineDownloadItem | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Active contextual menu dropdown tracking
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Initial Seed for authentic first-time experience if empty
  const loadInitialDownloads = useCallback(async () => {
    let items = await offlineStorage.getAllMeta();
    if (items.length === 0) {
      // Seed default offline lessons
      const defaultItems: OfflineDownloadItem[] = [
        {
          id: 'dl_seed_1',
          lessonId: 'less_math_10_quad',
          courseId: 'c_math',
          courseName: 'Mathematics',
          subject: 'Mathematics',
          classGrade: 10,
          chapter: 'Chapter 5: Quadratic Equations',
          title: 'Understanding Quadratic Formula & Roots',
          fileType: 'video',
          quality: '480p',
          totalBytes: 52428800, // 50 MB
          downloadedBytes: 52428800,
          status: 'completed',
          speedBytesPerSec: 0,
          etaSeconds: 0,
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          downloadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          author: 'Dr. R. K. Sharma',
        },
        {
          id: 'dl_seed_2',
          lessonId: 'less_sci_10_light',
          courseId: 'c_sci',
          courseName: 'Science',
          subject: 'Science',
          classGrade: 10,
          chapter: 'Chapter 3: Light and Reflection',
          title: 'Spherical Mirrors & Ray Diagrams',
          fileType: 'video',
          quality: '480p',
          totalBytes: 73400320, // 70 MB
          downloadedBytes: 73400320,
          status: 'completed',
          speedBytesPerSec: 0,
          etaSeconds: 0,
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          downloadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          author: 'Prof. A. Verma',
        },
        {
          id: 'dl_seed_3',
          lessonId: 'less_eng_10_notes',
          courseId: 'c_eng',
          courseName: 'English',
          subject: 'English',
          classGrade: 10,
          chapter: 'Grammar Essentials',
          title: 'English Grammar & Composition Study Notes',
          fileType: 'document',
          quality: '480p',
          totalBytes: 2097152, // 2 MB
          downloadedBytes: 2097152,
          status: 'completed',
          speedBytesPerSec: 0,
          etaSeconds: 0,
          downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          downloadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          author: 'Mrs. S. Sen',
        },
      ];

      for (const item of defaultItems) {
        await offlineStorage.saveMeta(item);
      }
      items = defaultItems;
    }
    setDownloads(items);
  }, []);

  useEffect(() => {
    loadInitialDownloads();

    // Subscribe to engine progress notifications
    const unsubscribe = offlineDownloadEngine.subscribe((updatedItem) => {
      setDownloads((prev) => {
        const index = prev.findIndex((i) => i.id === updatedItem.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedItem;
          return next;
        }
        return [updatedItem, ...prev];
      });
    });

    return () => unsubscribe();
  }, [loadInitialDownloads]);

  // Dynamic storage calculations
  const storageBreakdown = useMemo(
    () => offlineStorage.calculateBreakdown(downloads),
    [downloads]
  );
  const usedPercentage = Math.min(
    100,
    Math.round((storageBreakdown.usedBytes / storageBreakdown.totalBytes) * 100)
  );
  const isStorageAlmostFull = usedPercentage >= 80;
  const availableStorageBytes = Math.max(
    0,
    storageBreakdown.totalBytes - storageBreakdown.usedBytes
  );

  // Active / in-progress downloads
  const activeDownloads = useMemo(
    () =>
      downloads.filter((d) =>
        ['downloading', 'pending', 'paused'].includes(d.status)
      ),
    [downloads]
  );

  // Filtered completed / offline downloads
  const filteredDownloads = useMemo(() => {
    let list = downloads.filter((d) =>
      ['completed', 'failed'].includes(d.status)
    );

    // Apply category filter
    if (activeCategory === 'videos') {
      list = list.filter((d) => d.fileType === 'video');
    } else if (activeCategory === 'documents') {
      list = list.filter((d) => d.fileType === 'document');
    } else if (activeCategory === 'completed') {
      list = list.filter((d) => d.status === 'completed');
    } else if (activeCategory === 'failed') {
      list = list.filter((d) => d.status === 'failed');
    } else if (activeCategory === 'downloading') {
      list = activeDownloads;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.courseName.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.chapter.toLowerCase().includes(q)
      );
    }

    return list;
  }, [downloads, activeCategory, searchQuery, activeDownloads]);

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------
  const handleStartDownload = (item: OfflineDownloadItem) => {
    setDownloads((prev) => [item, ...prev]);
    offlineDownloadEngine.startDownload(item);
  };

  const handlePause = (item: OfflineDownloadItem) => {
    offlineDownloadEngine.pauseDownload(item);
  };

  const handleResume = (item: OfflineDownloadItem) => {
    offlineDownloadEngine.resumeDownload(item);
  };

  const handleCancel = async (id: string) => {
    await offlineDownloadEngine.cancelDownload(id);
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRetry = (item: OfflineDownloadItem) => {
    offlineDownloadEngine.retryDownload(item);
  };

  const handleDeleteItem = async (id: string) => {
    await offlineStorage.remove(id);
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    setDeleteConfirmItem(null);
  };

  const handleBulkDelete = async () => {
    await offlineStorage.removeMany(selectedItemIds);
    setDownloads((prev) => prev.filter((d) => !selectedItemIds.includes(d.id)));
    setSelectedItemIds([]);
    setIsBulkDeleteConfirmOpen(false);
    setIsManageStorageMode(false);
  };

  const toggleSelectAll = () => {
    const completedIds = downloads
      .filter((d) => d.status === 'completed')
      .map((d) => d.id);
    if (selectedItemIds.length === completedIds.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(completedIds);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalSelectedBytes = useMemo(() => {
    return downloads
      .filter((d) => selectedItemIds.includes(d.id))
      .reduce((acc, curr) => acc + (curr.downloadedBytes || curr.totalBytes), 0);
  }, [downloads, selectedItemIds]);

  return (
    <div className="space-y-6 select-none p-1 sm:p-2 max-w-6xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Downloads
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            Save lessons and learning materials for offline study.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="md"
            onClick={() => setIsDownloadModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="cursor-pointer shadow-xs font-extrabold"
          >
            + Download Lesson
          </Button>
        </div>
      </div>

      {/* 2. Top Storage Summary Card (IDM Inspired) */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                Offline Learning Storage
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  {formatFileSize(storageBreakdown.usedBytes)}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  / {formatFileSize(storageBreakdown.totalBytes)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Storage Breakdown Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <Video className="h-3.5 w-3.5" />
              <span>{storageBreakdown.videosCount} Videos</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <FileText className="h-3.5 w-3.5" />
              <span>{storageBreakdown.documentsCount} Documents</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{storageBreakdown.completedCount} Available Offline</span>
            </div>

            <Button
              variant={isManageStorageMode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                setIsManageStorageMode(!isManageStorageMode);
                setSelectedItemIds([]);
              }}
              className="cursor-pointer text-xs"
            >
              {isManageStorageMode ? 'Done Managing' : 'Manage Storage'}
            </Button>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
            <div
              className="h-full bg-primary rounded-l-full transition-all duration-500"
              style={{
                width: `${(storageBreakdown.videoBytes / storageBreakdown.totalBytes) * 100}%`,
              }}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${(storageBreakdown.documentBytes / storageBreakdown.totalBytes) * 100}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-500">
            <span>
              {formatFileSize(availableStorageBytes)} available for new lessons
            </span>
            <span className="font-bold">{usedPercentage}% Used</span>
          </div>
        </div>

        {/* Warning if storage is almost full */}
        {isStorageAlmostFull && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Storage almost full — remove unused downloads to continue saving new
              offline lessons.
            </span>
          </div>
        )}
      </div>

      {/* 3. Search & Category Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800 text-xs font-bold">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'videos', label: 'Videos' },
              { id: 'documents', label: 'Documents' },
              {
                id: 'downloading',
                label: `Downloading (${activeDownloads.length})`,
              },
              { id: 'completed', label: 'Completed' },
              { id: 'failed', label: 'Failed' },
            ] as Array<{ id: FilterCategory; label: string }>
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer',
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search downloaded lessons..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Bulk Actions Bar (When Manage Storage Mode is Active) */}
      {isManageStorageMode && (
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200 cursor-pointer"
            >
              {selectedItemIds.length > 0 ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
              <span>Select All</span>
            </button>
            <span className="text-gray-400">|</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {selectedItemIds.length} Selected (Total:{' '}
              {formatFileSize(totalSelectedBytes)})
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={selectedItemIds.length === 0}
            onClick={() => setIsBulkDeleteConfirmOpen(true)}
            leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 cursor-pointer"
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* 5. CURRENTLY DOWNLOADING SECTION */}
      {activeDownloads.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary animate-spin" />
            Currently Downloading ({activeDownloads.length})
          </h2>

          <div className="space-y-3">
            {activeDownloads.map((item) => {
              const progressPct =
                item.totalBytes > 0
                  ? Math.min(
                      100,
                      Math.round((item.downloadedBytes / item.totalBytes) * 100)
                    )
                  : 0;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-primary/20 bg-white dark:bg-card-dark p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-primary flex items-center justify-center shrink-0">
                        {item.fileType === 'video' ? (
                          <Video className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-primary block truncate">
                          {item.subject || item.courseName.replace(/\s*Class\s*\d+/i, '')} · Class {item.classGrade}
                        </span>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <span className="text-[11px] text-gray-500">
                          {item.fileType.toUpperCase()} • {item.quality} •{' '}
                          {formatFileSize(item.downloadedBytes)} /{' '}
                          {formatFileSize(item.totalBytes)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Percentage & Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-extrabold text-primary">
                        {progressPct}%
                      </span>

                      {item.status === 'downloading' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePause(item)}
                          leftIcon={<Pause className="h-3.5 w-3.5" />}
                          className="cursor-pointer"
                        >
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => handleResume(item)}
                          leftIcon={<Play className="h-3.5 w-3.5" />}
                          className="cursor-pointer"
                        >
                          Resume
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCancel(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Cancel download"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Real Stream Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300 rounded-full',
                          item.status === 'paused' ? 'bg-amber-500' : 'bg-primary'
                        )}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                      <span>
                        {item.status === 'downloading' && item.speedBytesPerSec > 0
                          ? `↓ ${formatFileSize(item.speedBytesPerSec)}/s`
                          : item.status === 'paused'
                          ? 'Paused'
                          : 'Preparing download...'}
                      </span>
                      <span>
                        {item.status === 'downloading' && item.etaSeconds > 0
                          ? `About ${item.etaSeconds}s remaining`
                          : ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. AVAILABLE OFFLINE ITEMS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            Available Offline ({filteredDownloads.length})
          </h2>
        </div>

        {filteredDownloads.length === 0 ? (
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-12 text-center shadow-xs">
            <EmptyState
              icon={<Download className="h-8 w-8 text-primary" />}
              title={
                searchQuery
                  ? 'No matching downloads'
                  : activeCategory === 'failed'
                  ? 'No failed downloads'
                  : 'Nothing downloaded yet'
              }
              description={
                searchQuery
                  ? 'Try searching for another lesson, subject, or course.'
                  : 'Download lessons to continue learning even when you are offline without internet.'
              }
              action={
                !searchQuery && (
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => navigate(ROUTES.COURSES)}
                    className="mt-4 cursor-pointer"
                  >
                    Browse Courses
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {filteredDownloads.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isDropdownOpen = openDropdownId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      'rounded-2xl border transition-all duration-200 bg-white dark:bg-card-dark p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-primary/40',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-gray-200/80 dark:border-gray-800'
                    )}
                  >
                    {/* Left: Thumbnail / Icon + Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {isManageStorageMode && (
                        <button
                          type="button"
                          onClick={() => toggleItemSelection(item.id)}
                          className="text-primary cursor-pointer shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-300 dark:text-gray-700" />
                          )}
                        </button>
                      )}

                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs text-lg',
                          item.fileType === 'video'
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/40'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40'
                        )}
                      >
                        {item.fileType === 'video' ? (
                          <Video className="h-6 w-6" />
                        ) : (
                          <FileText className="h-6 w-6" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-primary block truncate">
                            {item.subject || item.courseName.replace(/\s*Class\s*\d+/i, '')} · Class {item.classGrade}
                          </span>
                          <span className="text-[10px] text-gray-400">·</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            {item.quality}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>{formatFileSize(item.totalBytes)}</span>
                          <span>•</span>
                          {item.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Available Offline
                            </span>
                          ) : (
                            <span className="font-bold text-red-500">
                              Download Failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 relative">
                      {item.status === 'completed' ? (
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => setPlayingItem(item)}
                          leftIcon={
                            item.fileType === 'video' ? (
                              <Play className="h-3.5 w-3.5 fill-current" />
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )
                          }
                          className="cursor-pointer shadow-xs text-xs font-bold"
                        >
                          {item.fileType === 'video'
                            ? 'Watch Offline'
                            : 'Open Offline'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(item)}
                          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                          className="cursor-pointer text-xs"
                        >
                          Retry
                        </Button>
                      )}

                      {/* Details button */}
                      <button
                        type="button"
                        onClick={() => setInspectingItem(item)}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Info className="h-4 w-4" />
                      </button>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem(item)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        title="Delete from offline storage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODALS: Download Lesson, Offline Player, Details     */}
      {/* ---------------------------------------------------- */}

      {/* 1. Download Lesson Task Modal */}
      <DownloadLessonModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        availableStorageBytes={availableStorageBytes}
        onStartDownload={handleStartDownload}
      />

      {/* 2. Offline Video & Document Player Modal */}
      <OfflinePlayerModal
        item={playingItem}
        onClose={() => setPlayingItem(null)}
      />

      {/* 3. Download Details Modal */}
      <DownloadDetailsModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
      />

      {/* 4. Single Item Delete Confirmation Dialog */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-card-dark p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Remove this download?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                "{deleteConfirmItem.title}" will be removed from your device
                offline storage. You can download it again later.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteItem(deleteConfirmItem.id)}
                className="flex-1 cursor-pointer"
              >
                Remove
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. Bulk Delete Confirmation Dialog */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-card-dark p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Delete {selectedItemIds.length} Downloads?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                This will free up{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatFileSize(totalSelectedBytes)}
                </span>{' '}
                of storage on your device.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 cursor-pointer"
              >
                Delete Selected
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
