import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LessonViewer } from '@/components/lesson/LessonViewer';
import { uploadedContentStore, type UploadedContentItem } from '@/stores/uploadedContentStore';
import { fileStorageService } from '@/services/fileStorage.service';
import { learningProgressService } from '@/services/learningProgress.service';
import { useAuthStore } from '@/stores/useAuthStore';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId?: string; lessonId?: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [contentItem, setContentItem] = useState<UploadedContentItem | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [initialTime, setInitialTime] = useState<number>(0);
  const [currentProgressPct, setCurrentProgressPct] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const contentItemRef = useRef<UploadedContentItem | null>(null);
  const lastProgressRef = useRef<{ time: number; duration: number; pct: number } | null>(null);

  useEffect(() => {
    contentItemRef.current = contentItem;
  }, [contentItem]);

  useEffect(() => {
    if (!lessonId) return;

    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    async function loadLesson() {
      try {
        console.log('[LESSON ROUTE DEBUG start loading]', {
          lessonId,
          userId: user?.id,
          email: user?.email,
        });

        // 1. Find content item from uploaded store
        let allItems = uploadedContentStore.getAll();
        let item = allItems.find((i) => i.id === lessonId || String(i.id) === String(lessonId));

        if (!item) {
          // Await backend content synchronization
          await uploadedContentStore.syncFromBackend();
          allItems = uploadedContentStore.getAll();
          item = allItems.find((i) => i.id === lessonId || String(i.id) === String(lessonId));
        }

        if (!item) {
          // Direct fallback to API
          try {
            const res = await fetch('/api/v1/content/items');
            if (res.ok) {
              const json = await res.json();
              const itemsList = Array.isArray(json) ? json : (json?.data || []);
              if (Array.isArray(itemsList)) {
                item = itemsList.find((i: any) => i.id === lessonId || String(i.id) === String(lessonId));
              }
            }
          } catch (fetchErr) {
            console.warn('[LessonPage] Direct /api/v1/content/items fetch error:', fetchErr);
          }
        }

        // 2. Load saved progress for resume
        const savedProgress = await learningProgressService.getContentProgress(lessonId!, user?.id ? String(user.id) : undefined);
        if (isMounted && savedProgress) {
          setInitialTime(savedProgress.lastPositionSeconds || 0);
          setCurrentProgressPct(savedProgress.progressPercent || 0);
        }

        // If not found in uploadedContentStore or items API, use savedProgress metadata fallback
        if (!item && savedProgress && savedProgress.title) {
          item = {
            id: savedProgress.contentId,
            title: savedProgress.title,
            description: savedProgress.description || '',
            cloudinaryUrl: savedProgress.fileUrl || '',
            thumbnailUrl: savedProgress.thumbnailUrl || '',
            subject: savedProgress.subject,
            classGrade: savedProgress.classGrade || 10,
            chapter: savedProgress.chapter,
            contentType: (savedProgress.contentType as any) || 'VIDEO',
            uploadedBy: 'Teacher',
            uploadedAt: savedProgress.lastWatchedAt,
            language: 'en',
            fileSize: 0,
          };
        }

        if (isMounted && item) {
          setContentItem(item);
          contentItemRef.current = item;
        }

        // 3. Resolve video URL
        let resolvedUrl = '';
        if (item) {
          const localUrl = await fileStorageService.getFileUrl(item.id);
          if (localUrl) {
            resolvedUrl = localUrl;
          } else if (item.cloudinaryUrl) {
            resolvedUrl = item.cloudinaryUrl;
          } else if ((item as any).fileUrl) {
            resolvedUrl = (item as any).fileUrl;
          } else if (item.fileName) {
            resolvedUrl = `/api/v1/content/files/${item.fileName}`;
          }
        }

        if (!resolvedUrl && savedProgress?.fileUrl) {
          resolvedUrl = savedProgress.fileUrl;
        }

        if (isMounted) {
          setVideoUrl(resolvedUrl);
          setLoading(false);
        }

        console.log('LESSON ROUTE DEBUG', {
          lessonId,
          authenticatedUser: user,
          studentId: user?.id,
          contentId: lessonId,
          contentItem: item,
          videoUrl: resolvedUrl,
          title: item?.title,
          subject: item?.subject,
          chapter: item?.chapter,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('[LESSON ROUTE DEBUG error]', err);
        if (isMounted) {
          setLoadError(err?.message || 'Failed to load lesson content');
          setLoading(false);
        }
      }
    }

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId, user?.id]);

  const handleProgressUpdate = (currentTime: number, duration: number, progressPct: number) => {
    if (!lessonId) return;
    setCurrentProgressPct(progressPct);
    lastProgressRef.current = { time: currentTime, duration, pct: progressPct };

    const item = contentItemRef.current || contentItem;
    learningProgressService.saveProgress({
      contentId: lessonId,
      courseId: courseId || '',
      subject: item?.subject || 'General',
      chapter: item?.chapter || 'General',
      classGrade: item?.classGrade || user?.classGrade || 10,
      title: item?.title || `Lesson ${lessonId}`,
      description: item?.description || '',
      contentType: item?.contentType || 'VIDEO',
      fileUrl: videoUrl,
      thumbnailUrl: item?.thumbnailUrl || '',
      lastPositionSeconds: Math.round(currentTime),
      durationSeconds: Math.round(duration),
      progressPercent: progressPct,
      completed: (duration > 0 && currentTime >= duration - 0.5) || progressPct >= 90,
    });
  };

  // Flush on unmount/navigation
  useEffect(() => {
    return () => {
      if (lessonId && lastProgressRef.current) {
        const p = lastProgressRef.current;
        const item = contentItemRef.current;
        if (p.duration > 0 && p.time > 0) {
          learningProgressService.saveProgress({
            contentId: lessonId,
            courseId: courseId || '',
            subject: item?.subject || 'General',
            chapter: item?.chapter || 'General',
            classGrade: item?.classGrade || 10,
            title: item?.title || `Lesson ${lessonId}`,
            description: item?.description || '',
            contentType: 'VIDEO',
            fileUrl: videoUrl,
            thumbnailUrl: item?.thumbnailUrl || '',
            lastPositionSeconds: Math.round(p.time),
            durationSeconds: Math.round(p.duration),
            progressPercent: p.pct,
            completed: (p.duration > 0 && p.time >= p.duration - 0.5) || p.pct >= 90,
          });
        }
      }
    };
  }, [lessonId, courseId, videoUrl]);

  const handleComplete = () => {
    if (!lessonId) return;
    setCurrentProgressPct(100);

    const item = contentItemRef.current || contentItem;
    learningProgressService.saveProgress({
      contentId: lessonId,
      courseId: courseId || '',
      subject: item?.subject || 'General',
      chapter: item?.chapter || 'General',
      classGrade: item?.classGrade || user?.classGrade || 10,
      title: item?.title || `Lesson ${lessonId}`,
      description: item?.description || '',
      contentType: item?.contentType || 'VIDEO',
      fileUrl: videoUrl,
      thumbnailUrl: item?.thumbnailUrl || '',
      lastPositionSeconds: item?.duration || 300,
      durationSeconds: item?.duration || 300,
      progressPercent: 100,
      completed: true,
    });
  };

  const handleBack = () => {
    if (lessonId && lastProgressRef.current) {
      const p = lastProgressRef.current;
      const item = contentItemRef.current;
      if (p.duration > 0 && p.time > 0) {
        learningProgressService.saveProgress({
          contentId: lessonId,
          courseId: courseId || '',
          subject: item?.subject || 'General',
          chapter: item?.chapter || 'General',
          classGrade: item?.classGrade || 10,
          title: item?.title || `Lesson ${lessonId}`,
          description: item?.description || '',
          contentType: 'VIDEO',
          fileUrl: videoUrl,
          thumbnailUrl: item?.thumbnailUrl || '',
          lastPositionSeconds: Math.round(p.time),
          durationSeconds: Math.round(p.duration),
          progressPercent: p.pct,
          completed: (p.duration > 0 && p.time >= p.duration - 0.5) || p.pct >= 90,
        });
      }
    }

    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate('/courses');
    }
  };

  const lessonData = {
    id: lessonId || 'l1',
    type: 'video' as const,
    title: contentItem?.title || (lessonId ? `Lesson: ${lessonId}` : 'Class Lesson'),
    videoUrl: videoUrl,
    popupQuestions: [],
    initialTime,
  };

  const courseTitle = contentItem
    ? `${contentItem.subject} - ${contentItem.chapter}`
    : 'Class Lesson';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Loading lesson and saved progress...</p>
      </div>
    );
  }

  if (loadError && !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Could not load lesson</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">{loadError}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Retry Loading
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-4">
      <LessonViewer
        lesson={lessonData}
        courseTitle={courseTitle}
        progress={currentProgressPct}
        initialTime={initialTime}
        onProgressUpdate={handleProgressUpdate}
        onBack={handleBack}
        onNext={() => {}}
        onPrev={() => {}}
        onComplete={handleComplete}
        hasNext={false}
        hasPrev={false}
      />
    </div>
  );
};

export default LessonPage;
