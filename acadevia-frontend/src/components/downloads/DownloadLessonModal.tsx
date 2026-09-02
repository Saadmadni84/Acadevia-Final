import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Video,
  FileText,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { uploadedContentStore } from '@/stores/uploadedContentStore';
import {
  QUALITY_PRESETS,
  type VideoQuality,
  type OfflineDownloadItem,
  type DownloadType,
} from '@/types/download.types';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DownloadLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStorageBytes: number;
  onStartDownload: (item: OfflineDownloadItem) => void;
}

export const DownloadLessonModal: React.FC<DownloadLessonModalProps> = ({
  isOpen,
  onClose,
  availableStorageBytes,
  onStartDownload,
}) => {
  const user = useAuthStore((state) => state.user);
  const studentClass = useMemo(() => {
    if (user?.className) {
      const match = user.className.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 10;
  }, [user]);

  // Available curriculum lessons based on authenticated student's grade
  const availableLessons = useMemo(() => {
    const uploaded = uploadedContentStore.getAll();
    const curriculumLessons = [
      {
        id: 'less_math_10_quad',
        title: 'Chapter 5: Quadratic Equations',
        subject: 'Mathematics',
        courseName: 'Mathematics',
        courseId: 'c_math',
        chapter: 'Quadratic Equations',
        fileType: 'video' as DownloadType,
        baseSizeBytes: 52428800, // 50 MB
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        author: 'Dr. R. K. Sharma',
      },
      {
        id: 'less_sci_10_light',
        title: 'Chapter 3: Light, Reflection and Refraction',
        subject: 'Science',
        courseName: 'Science',
        courseId: 'c_sci',
        chapter: 'Light & Optics',
        fileType: 'video' as DownloadType,
        baseSizeBytes: 73400320, // 70 MB
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        author: 'Prof. A. Verma',
      },
      {
        id: 'less_eng_10_notes',
        title: 'Complete English Grammar & Composition Notes',
        subject: 'English',
        courseName: 'English Literature',
        courseId: 'c_eng',
        chapter: 'Grammar Essentials',
        fileType: 'document' as DownloadType,
        baseSizeBytes: 2097152, // 2 MB
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        author: 'Mrs. S. Sen',
      },
      {
        id: 'less_soc_10_hist',
        title: 'The Rise of Nationalism in India',
        subject: 'Social Science',
        courseName: 'Social Science',
        courseId: 'c_soc',
        chapter: 'Indian History',
        fileType: 'video' as DownloadType,
        baseSizeBytes: 62914560, // 60 MB
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        author: 'Dr. M. Iyer',
      },
    ];

    // Combine with uploaded content from teachers if available
    const uploadedFormatted = uploaded.map((u) => ({
      id: u.id,
      title: `${u.chapter}: ${u.title}`,
      subject: u.subject,
      courseName: u.subject,
      courseId: `c_${u.subject.toLowerCase()}`,
      chapter: u.chapter,
      fileType: 'video' as DownloadType,
      baseSizeBytes: u.fileSize || 45000000,
      url: u.cloudinaryUrl,
      author: u.uploadedBy,
    }));

    return [...curriculumLessons, ...uploadedFormatted];
  }, [studentClass]);

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    availableLessons[0]?.id || ''
  );
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('480p');

  const selectedLesson = useMemo(
    () => availableLessons.find((l) => l.id === selectedLessonId) || availableLessons[0],
    [availableLessons, selectedLessonId]
  );

  const estimatedSizeBytes = useMemo(() => {
    if (!selectedLesson) return 0;
    if (selectedLesson.fileType === 'document') return selectedLesson.baseSizeBytes;
    return Math.round(
      selectedLesson.baseSizeBytes * QUALITY_PRESETS[selectedQuality].sizeMultiplier
    );
  }, [selectedLesson, selectedQuality]);

  const hasEnoughStorage = availableStorageBytes >= estimatedSizeBytes;

  const handleStart = () => {
    if (!selectedLesson || !hasEnoughStorage) return;

    const newItem: OfflineDownloadItem = {
      id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      lessonId: selectedLesson.id,
      courseId: selectedLesson.courseId,
      courseName: selectedLesson.courseName,
      subject: selectedLesson.subject,
      classGrade: studentClass,
      chapter: selectedLesson.chapter,
      title: selectedLesson.title,
      fileType: selectedLesson.fileType,
      quality: selectedQuality,
      totalBytes: estimatedSizeBytes,
      downloadedBytes: 0,
      status: 'pending',
      speedBytesPerSec: 0,
      etaSeconds: 0,
      downloadUrl: selectedLesson.url,
      author: selectedLesson.author,
    };

    onStartDownload(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-card-dark border border-gray-200/90 dark:border-gray-800 shadow-2xl p-6 sm:p-7 space-y-6 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                  Download Lesson
                </h3>
                <p className="text-xs text-gray-500">
                  Class {studentClass} Authorized Curriculum
                </p>
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

          {/* Lesson Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Select Lesson
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableLessons.map((lesson) => {
                const isSelected = selectedLessonId === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={cn(
                      'w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/15 ring-2 ring-primary/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900/40'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm',
                          lesson.fileType === 'video'
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/40'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40'
                        )}
                      >
                        {lesson.fileType === 'video' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-primary block truncate">
                          {lesson.subject} · {lesson.chapter}
                        </span>
                        <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                          {lesson.title}
                        </h4>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Options (For Videos) */}
          {selectedLesson?.fileType === 'video' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Video Download Quality
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['360p', '480p', '720p'] as VideoQuality[]).map((q) => {
                  const opt = QUALITY_PRESETS[q];
                  const isSelected = selectedQuality === q;
                  const estimatedMb = Math.round(
                    (selectedLesson.baseSizeBytes * opt.sizeMultiplier) / (1024 * 1024)
                  );

                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuality(q)}
                      className={cn(
                        'p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[90px]',
                        isSelected
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-gray-300'
                      )}
                    >
                      <div>
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white block">
                          {opt.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block',
                            q === '360p'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40'
                              : q === '480p'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40'
                          )}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500 mt-2">
                        ~{estimatedMb} MB
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage & Estimation Summary */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-bold text-gray-700 dark:text-gray-300 block">
                  Required Size: {formatFileSize(estimatedSizeBytes)}
                </span>
                <span className="text-[11px] text-gray-500">
                  Available: {formatFileSize(availableStorageBytes)}
                </span>
              </div>
            </div>

            {!hasEnoughStorage && (
              <span className="text-[11px] font-bold text-red-500">
                Not enough storage
              </span>
            )}
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              disabled={!hasEnoughStorage || !selectedLesson}
              onClick={handleStart}
              leftIcon={<Download className="h-4 w-4" />}
              className="cursor-pointer shadow-xs"
            >
              Start Download
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
