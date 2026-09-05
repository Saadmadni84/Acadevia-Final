import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Beaker,
  BookOpen,
  ArrowLeft,
  Play,
  School,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Brain,
  ExternalLink,
  Eye,
  Film,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Check,
  Loader2,
  MessageCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { uploadedContentStore, type UploadedContentItem } from '@/stores/uploadedContentStore';
import { dataService } from '@/services/data.service';
import { contentService, type AcademicSubject, type AcademicChapter } from '@/services/content.service';
import { learningProgressService } from '@/services/learningProgress.service';
import { useAuthStore } from '@/stores/useAuthStore';

type View = 'subject' | 'chapters' | 'content';

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Derive student's exact class grade from authenticated session or persistent store
  const studentGrade = useMemo(() => {
    if (user?.classGrade) return Number(user.classGrade);
    if (user?.className) {
      const parsed = parseInt(user.className.replace(/\D/g, ''));
      if (!isNaN(parsed)) return parsed;
    }
    if (user?.id) {
      const stored = dataService.getUserById(String(user.id));
      if (stored?.classGrade) return Number(stored.classGrade);
    }
    if (user?.email) {
      const stored = dataService.getUserByEmail(user.email);
      if (stored?.classGrade) return Number(stored.classGrade);
    }
    return null;
  }, [user]);

  const schoolDisplayName =
    user?.schoolName ||
    (user?.id ? dataService.getUserById(String(user.id))?.schoolName : undefined) ||
    (user?.email ? dataService.getUserByEmail(user.email)?.schoolName : undefined) ||
    'School not assigned';

  const [view, setView] = useState<View>('subject');
  const [selectedClass, setSelectedClass] = useState<number | null>(studentGrade);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [chapters, setChapters] = useState<AcademicChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync selectedClass with studentGrade when auth user resolves
  useEffect(() => {
    if (studentGrade) {
      setSelectedClass(studentGrade);
    }
  }, [studentGrade]);

  // Currently active/playing content item
  const [activeItem, setActiveItem] = useState<UploadedContentItem | null>(null);
  const [allItems, setAllItems] = useState<UploadedContentItem[]>([]);
  const [fileLoadError, setFileLoadError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeItemRef = useRef<UploadedContentItem | null>(null);

  // Persistent playback tracker that survives DOM destruction and React unmounts
  const trackerRef = useRef<{
    item: UploadedContentItem | null;
    currentTime: number;
    duration: number;
    lastSavedPos: number;
    lastSavedTimestamp: number;
    initialSaved: boolean;
  }>({
    item: null,
    currentTime: 0,
    duration: 0,
    lastSavedPos: -1,
    lastSavedTimestamp: 0,
    initialSaved: false,
  });

  const flushProgress = useCallback((forcePos?: number, isCompleted?: boolean) => {
    const tracker = trackerRef.current;
    const item = tracker.item || activeItemRef.current;
    if (!item) return;

    const t = typeof forcePos === 'number' ? forcePos : tracker.currentTime;
    const d = tracker.duration > 0 ? tracker.duration : (item.duration || 5);
    if (t <= 0 && d <= 0) return;

    const progressPct = d > 0 ? Math.min(100, Math.round((t / d) * 100)) : 0;
    const completed = isCompleted === true || (d > 0 && t >= d - 0.5) || progressPct >= 90;

    tracker.lastSavedPos = t;
    tracker.lastSavedTimestamp = Date.now();

    learningProgressService.saveProgress({
      contentId: item.id,
      courseId: '',
      subject: item.subject,
      chapter: item.chapter,
      classGrade: item.classGrade || 10,
      title: item.title,
      description: item.description || '',
      contentType: 'VIDEO',
      fileUrl: item.cloudinaryUrl || (item as any).fileUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      lastPositionSeconds: Math.round(t),
      durationSeconds: Math.round(d),
      progressPercent: progressPct,
      completed,
    });
  }, []);

  useEffect(() => {
    // If an item was playing previously, flush its last position before switching
    if (trackerRef.current.item && trackerRef.current.currentTime > 0) {
      flushProgress();
    }

    activeItemRef.current = activeItem;
    trackerRef.current = {
      item: activeItem,
      currentTime: 0,
      duration: activeItem?.duration || 0,
      lastSavedPos: -1,
      lastSavedTimestamp: 0,
      initialSaved: false,
    };
  }, [activeItem, flushProgress]);

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>, force: boolean = false) => {
    const video = e.currentTarget;
    const tracker = trackerRef.current;
    if (!tracker.item || !video) return;

    const t = video.currentTime;
    const d = video.duration || tracker.duration || 5;
    tracker.currentTime = t;
    if (d > 0 && !isNaN(d)) {
      tracker.duration = d;
    }

    const now = Date.now();
    const timeDiff = Math.abs(t - tracker.lastSavedPos);
    const realTimeDiff = now - tracker.lastSavedTimestamp;

    // 1. Initial engagement: save immediately once playback reaches >= 0.5s
    if (!tracker.initialSaved && t >= 0.5) {
      tracker.initialSaved = true;
      flushProgress(t, false);
      return;
    }

    // 2. Periodic updates every 3s of playback, or forced on pause/seek/ended
    if (force || (realTimeDiff >= 3000 && timeDiff >= 1.5)) {
      flushProgress(t, force && t >= d - 0.5);
    }
  };

  // Flush on unmount, pagehide, visibility change, or page navigation
  useEffect(() => {
    const handleLeave = () => {
      flushProgress();
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      // Flush whenever CoursesPage unmounts (navigating to Dashboard, etc.)
      handleLeave();
    };
  }, [flushProgress]);

  // Student comments / questions state
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // YouTube Description & Comments UI state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isPostingReply, setIsPostingReply] = useState<boolean>(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const toggleLikeComment = (id: number) => {
    setLikedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePostReply = async (commentId: number) => {
    if (!replyText.trim()) return;
    setIsPostingReply(true);
    try {
      const updated = await contentService.replyToComment(commentId, replyText.trim());
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
              ...c,
              ...updated,
              reply: replyText.trim(),
              repliedByName: (user as any)?.name || (user as any)?.firstName || 'Teacher',
              isResolved: true,
            }
            : c
        )
      );
      setReplyText('');
      setReplyingCommentId(null);
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsPostingReply(false);
    }
  };
  useEffect(() => {
    setFileLoadError(false);
  }, [activeItem]);

  // Load comments when active item changes
  useEffect(() => {
    if (activeItem?.id) {
      setIsLoadingComments(true);
      setCommentError(null);
      contentService
        .getVideoComments(activeItem.id)
        .then((data) => setComments(data || []))
        .catch((err) => console.warn('Failed to load video comments:', err))
        .finally(() => setIsLoadingComments(false));
    } else {
      setComments([]);
    }
  }, [activeItem?.id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeItem?.id) return;
    setIsPostingComment(true);
    setCommentError(null);
    try {
      const created = await contentService.postVideoComment(activeItem.id, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err: any) {
      setCommentError(err?.response?.data?.message || 'Failed to submit your question. Please try again.');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Load content from store
  useEffect(() => {
    const load = () => setAllItems(uploadedContentStore.getAll());
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAllItems(uploadedContentStore.getAll());
  }, [view]);

  // Load subjects directly for the student's class
  useEffect(() => {
    if (!selectedClass) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    contentService.getSubjectsForClass(selectedClass).then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) {
        setSelectedSubject(subs[0].name);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [selectedClass]);

  // Backend videos state
  const [backendVideos, setBackendVideos] = useState<any[]>([]);
  const [loadingBackendVideos, setLoadingBackendVideos] = useState(false);

  // Load chapters when class and subject change
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;
    contentService.getChapters(selectedClass, selectedSubject).then((chaps) => {
      setChapters(chaps);
    });
  }, [selectedClass, selectedSubject]);

  // Fetch real uploaded videos from backend when class, subject, or chapter changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedChapter) {
      setBackendVideos([]);
      return;
    }
    setLoadingBackendVideos(true);
    contentService
      .getChapterVideos(selectedClass, selectedSubject, selectedChapter)
      .then((videos) => {
        setBackendVideos(videos);
      })
      .catch((err) => {
        console.warn('Failed to fetch videos from backend:', err);
        setBackendVideos([]);
      })
      .finally(() => setLoadingBackendVideos(false));
  }, [selectedClass, selectedSubject, selectedChapter]);

  // Helper: Normalize chapter title for resilient curriculum and database matching
  const normChapter = (name?: string) =>
    (name || '').toLowerCase().replace(/^chapter\s*\d+[\s:.-]*/i, '').trim();

  // Filter content items strictly by class, subject, and chapter (backend primary, local fallback)
  const chapterItems = useMemo(() => {
    if (!selectedClass || !selectedChapter || !selectedSubject) return [];
    const targetNorm = normChapter(selectedChapter);
    const localMatches = allItems.filter(
      (v) =>
        v.classGrade === selectedClass &&
        v.subject.toLowerCase() === selectedSubject.toLowerCase() &&
        (() => {
          const itemNorm = normChapter(v.chapter);
          return itemNorm === targetNorm || itemNorm.includes(targetNorm) || targetNorm.includes(itemNorm);
        })(),
    );
    const map = new Map<string, any>();
    backendVideos.forEach((v) => map.set(v.id, v));
    localMatches.forEach((v) => {
      if (!map.has(v.id)) map.set(v.id, v);
    });
    return Array.from(map.values());
  }, [selectedClass, selectedChapter, selectedSubject, allItems, backendVideos]);

  // Automatically select first item when entering chapter content view
  useEffect(() => {
    if (view === 'content' && !activeItem && chapterItems.length > 0) {
      setActiveItem(chapterItems[0]);
    }
  }, [view, activeItem, chapterItems]);

  // Chapter content counts
  const chapterContentCount = useMemo(() => {
    if (!selectedClass || !selectedSubject) return {};
    const counts: Record<string, number> = {};
    const subItems = allItems.filter(
      (v) =>
        v.classGrade === selectedClass &&
        v.subject.toLowerCase() === selectedSubject.toLowerCase(),
    );
    const allKnown = [...subItems, ...backendVideos];
    const uniqueById = Array.from(new Map(allKnown.map((i) => [i.id, i])).values());

    chapters.forEach((ch) => {
      const chNorm = normChapter(ch.title);
      const count = uniqueById.filter((item) => {
        const itemNorm = normChapter(item.chapter);
        return itemNorm === chNorm || itemNorm.includes(chNorm) || chNorm.includes(itemNorm);
      }).length;
      counts[ch.title] = count;
    });

    return counts;
  }, [selectedClass, selectedSubject, allItems, backendVideos, chapters]);

  const formatSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<boolean>(false);

  const handleDownload = async (
    item: UploadedContentItem,
    option?: { quality: string; label: string; downloadUrl: string },
  ) => {
    const targetUrl =
      option?.downloadUrl ||
      item.downloadUrl ||
      `/api/v1/content/videos/${item.id}/download`;
    try {
      setDownloadingId(item.id);
      await contentService.downloadVideoFile(targetUrl, item.fileName || `${item.title}.mp4`);
    } catch (err) {
      console.error('[CoursesPage] Download error:', err);
    } finally {
      setDownloadingId(null);
      setDownloadMenuOpen(false);
    }
  };

  /* ================================================================== */
  /*  View 1: Direct Subjects Selector for Student                      */
  /* ================================================================== */
  const renderSubject = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Loading your courses...</p>
        </div>
      );
    }

    if (!selectedClass) {
      return (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 text-center max-w-lg mx-auto">
          <GraduationCap className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Academic Class Not Assigned</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Your school or class information is not available. Please contact your school administrator or complete your registration.
          </p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <School className="h-3.5 w-3.5" />
              <span>{schoolDisplayName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Class {selectedClass} Courses
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Select a subject to explore syllabus, video lessons, notes, and interactive quizzes
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Class {selectedClass}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const subItemsCount = allItems.filter(
              (v) =>
                v.classGrade === selectedClass &&
                v.subject.toLowerCase() === sub.name.toLowerCase(),
            ).length;

            return (
              <motion.button
                key={sub.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedSubject(sub.name);
                  setView('chapters');
                }}
                className="flex items-center gap-4 rounded-2xl border-2 border-gray-200/80 dark:border-gray-800 hover:border-primary/50 bg-white dark:bg-card-dark p-5 transition-all hover:shadow-md text-left group cursor-pointer"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Beaker className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {sub.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {subItemsCount > 0
                      ? `${subItemsCount} learning item${subItemsCount > 1 ? 's' : ''}`
                      : 'Full curriculum available'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  /* ================================================================== */
  /*  View 4: Chapters Selector                                         */
  /* ================================================================== */
  const renderChapters = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('subject')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Class {selectedClass} — {selectedSubject}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {chapters.length} syllabus chapter{chapters.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {chapters.map((ch, idx) => {
          const count = chapterContentCount[ch.title] || 0;
          return (
            <button
              key={ch.id || idx}
              type="button"
              onClick={() => {
                setSelectedChapter(ch.title);
                setView('content');
              }}
              className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${count > 0
                  ? 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  : 'border-gray-100 dark:border-gray-800 opacity-70'
                }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {ch.title}
                </p>
                {count > 0 ? (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                    {count} learning item{count > 1 ? 's' : ''} available
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">No uploaded materials yet</p>
                )}
              </div>
              {count > 0 ? (
                <div className="flex items-center gap-1 text-primary">
                  <Play className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              ) : (
                <BookOpen className="h-4 w-4 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Subject Quizzes & Assessments */}
      {selectedClass &&
        (() => {
          const subjectQuizzes = dataService.getQuizzesByClassAndSubject(
            selectedClass,
            selectedSubject,
          );
          if (subjectQuizzes.length === 0) return null;
          return (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {selectedSubject} Quizzes &amp; Assessments ({subjectQuizzes.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {subjectQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark flex items-center justify-between shadow-xs hover:border-primary/40 transition"
                  >
                    <div>
                      {quiz.chapter && (
                        <span className="text-[11px] font-bold text-primary dark:text-[#D4A843] block mb-0.5">
                          {quiz.chapter}
                        </span>
                      )}
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {quiz.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        By {quiz.teacherName} &bull; {quiz.questions.length} questions
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/quizzes?id=${quiz.id}`)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition"
                    >
                      Take Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
    </motion.div>
  );

  /* ================================================================== */
  /*  View 5: Content Viewer (PDF Viewer, Image Lightbox, Video Player)  */
  /* ================================================================== */
  const renderContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            flushProgress();
            setView('chapters');
            setActiveItem(null);
          }}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedChapter}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Class {selectedClass} &bull; {selectedSubject} &bull; {chapterItems.length} content item{chapterItems.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Active Content Viewer */}
      {activeItem && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-lg space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${activeItem.contentType === 'VIDEO' || !activeItem.contentType
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : activeItem.contentType === 'PDF'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                >
                  {(activeItem.contentType === 'VIDEO' || !activeItem.contentType) && (
                    <Film className="h-3 w-3" />
                  )}
                  {activeItem.contentType === 'PDF' && <FileText className="h-3 w-3" />}
                  {activeItem.contentType === 'IMAGE' && <ImageIcon className="h-3 w-3" />}
                  {activeItem.contentType || 'VIDEO'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {activeItem.title}
                </h3>
              </div>
              {activeItem.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {activeItem.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>Uploaded by: {activeItem.uploadedBy}</span>
                {activeItem.fileSize > 0 && <span>{formatSize(activeItem.fileSize)}</span>}
                <span>{new Date(activeItem.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              {(activeItem.contentType === 'VIDEO' || !activeItem.contentType) && (
                <button
                  type="button"
                  onClick={() => navigate(`/lesson/${activeItem.id}`)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Dedicated Player
                </button>
              )}

              {/* Dynamic download menu from main */}
              {(() => {
                const options =
                  activeItem.downloadOptions && activeItem.downloadOptions.length > 0
                    ? activeItem.downloadOptions
                    : [{
                      quality: 'original',
                      label: 'Original Quality',
                      fileSizeMb: activeItem.fileSize
                        ? Math.round((activeItem.fileSize / (1024 * 1024)) * 100) / 100
                        : undefined,
                      downloadUrl:
                        activeItem.downloadUrl ||
                        `/api/v1/content/videos/${activeItem.id}/download`,
                    }];

                const isDownloading = downloadingId === activeItem.id;

                if (options.length > 1) {
                  return (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark px-3 py-1.5 text-xs font-semibold shadow-xs transition"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                        <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                      </button>

                      {downloadMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setDownloadMenuOpen(false)}
                          />
                          <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50 py-1 overflow-hidden animate-in fade-in">
                            <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                              Available Qualities
                            </div>
                            {options.map((opt) => (
                              <button
                                key={opt.quality}
                                type="button"
                                onClick={() => handleDownload(activeItem, opt)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition text-left cursor-pointer"
                              >
                                <span className="font-medium">{opt.label}</span>
                                {opt.fileSizeMb && (
                                  <span className="text-[11px] text-gray-400 font-mono">
                                    {opt.fileSizeMb.toFixed(1)} MB
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                const singleOpt = options[0];

                return (
                  <button
                    type="button"
                    onClick={() => handleDownload(activeItem, singleOpt)}
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark px-3 py-1.5 text-xs font-semibold shadow-xs transition"
                    title={`Download ${singleOpt.label}`}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isDownloading
                        ? 'Downloading...'
                        : singleOpt.fileSizeMb
                          ? `Download (${singleOpt.fileSizeMb.toFixed(1)} MB)`
                          : 'Download'}
                    </span>
                  </button>
                );
              })()}
              <a
                href={activeItem.downloadUrl || activeItem.cloudinaryUrl}
                target="_blank"
                rel="noreferrer"
                download={activeItem.fileName || activeItem.title}
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 text-xs font-semibold transition"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </a>
            </div>
          </div>

          {/* Video / PDF / Image Viewer with Graceful Fallback */}
          {((!activeItem.cloudinaryUrl && !activeItem.id) || (activeItem.cloudinaryUrl?.startsWith('blob:') && !activeItem.id) || fileLoadError) ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-gray-900 dark:text-white">File Unavailable on Server</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                This document cannot be loaded from the server or was uploaded in an older local-only session. Newly uploaded files from your teacher will be available here.
              </p>
            </div>
          ) : (
            <>
              {/* Video Player */}
              {(activeItem.contentType === 'VIDEO' || !activeItem.contentType) && (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-xl">
                  <video
                    ref={videoRef}
                    key={activeItem.cloudinaryUrl || activeItem.id}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={activeItem.thumbnailUrl}
                    onLoadedMetadata={(e) => {
                      learningProgressService
                        .getContentProgress(
                          activeItem.id,
                          user?.id ? String(user.id) : undefined
                        )
                        .then((saved) => {
                          if (
                            saved &&
                            saved.lastPositionSeconds > 0 &&
                            saved.lastPositionSeconds < e.currentTarget.duration
                          ) {
                            e.currentTarget.currentTime = saved.lastPositionSeconds;
                            trackerRef.current.lastSavedPos = saved.lastPositionSeconds;
                            trackerRef.current.currentTime = saved.lastPositionSeconds;
                          }
                        })
                        .catch(() => {});
                    }}
                    onPlay={(e) => handleVideoProgress(e, false)}
                    onSeeked={(e) => handleVideoProgress(e, true)}
                    onTimeUpdate={(e) => handleVideoProgress(e, false)}
                    onPause={(e) => handleVideoProgress(e, true)}
                    onEnded={(e) => handleVideoProgress(e, true)}
                    onError={(e) => {
                      console.warn('Video failed to play source:', e);
                      // Only set error if no valid id fallback is present
                      if (!activeItem.id) {
                        setFileLoadError(true);
                      }
                    }}
                  >
                    {activeItem.cloudinaryUrl && (
                      <source src={activeItem.cloudinaryUrl} type="video/mp4" />
                    )}
                    {activeItem.id && (
                      <source src={`/api/v1/content/videos/${activeItem.id}/stream`} type="video/mp4" />
                    )}
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* PDF Viewer */}
              {activeItem.contentType === 'PDF' && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <iframe
                    src={activeItem.cloudinaryUrl}
                    title={activeItem.title}
                    className="w-full h-[650px] rounded-xl border-0"
                    onError={() => setFileLoadError(true)}
                  />
                </div>
              )}

              {/* Image Viewer */}
              {activeItem.contentType === 'IMAGE' && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/5 flex items-center justify-center p-4">
                  <img
                    src={activeItem.cloudinaryUrl}
                    alt={activeItem.title}
                    className="max-h-[600px] max-w-full object-contain rounded-lg shadow-md"
                    onError={() => setFileLoadError(true)}
                  />
                </div>
              )}
            </>
          )}

          {/* YouTube-Style Description Box */}
          <div
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="group rounded-2xl bg-gray-100/90 dark:bg-gray-800/60 p-4 transition-all hover:bg-gray-200/70 dark:hover:bg-gray-800/90 cursor-pointer select-none space-y-2 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="font-bold text-gray-900 dark:text-white">
                  {(activeItem as any).totalViews ? `${(activeItem as any).totalViews.toLocaleString()} views` : '1,240 views'}
                </span>
                <span>•</span>
                <span>
                  {(activeItem as any).createdAt
                    ? new Date((activeItem as any).createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    : 'Recently updated'}
                </span>
                <span>•</span>
                <span className="text-primary font-medium">
                  #{activeItem.subject.replace(/\s+/g, '')} #{activeItem.chapter.replace(/\s+/g, '')}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-600 transition cursor-pointer"
              >
                <span>{isDescriptionExpanded ? 'Show less' : '...more'}</span>
                {isDescriptionExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            </div>

            <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {isDescriptionExpanded ? (
                <div className="space-y-3 pt-1">
                  <p className="whitespace-pre-wrap font-normal text-gray-700 dark:text-gray-300">
                    {activeItem.description || "No specific notes provided for this lesson."}
                  </p>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <School className="h-3.5 w-3.5 text-primary" /> Class {activeItem.classGrade || selectedClass}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> {activeItem.subject}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" /> {activeItem.chapter}
                    </span>
                  </div>
                  <div className="flex justify-end pt-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                      Show less <ChevronUp className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-2 text-gray-600 dark:text-gray-400 font-normal">
                    {activeItem.description || "Click to expand full lesson overview and notes..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* YouTube-Style Comments & Doubts Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {comments.length} {comments.length === 1 ? 'Comment & Doubt' : 'Comments & Doubts'}
                </h3>
              </div>
            </div>

            {/* YouTube-style comment form */}
            <form onSubmit={handlePostComment} className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                {((user as any)?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or ask a doubt to the teacher..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition resize-none shadow-xs"
                />
                {commentError && (
                  <p className="text-xs text-rose-500">{commentError}</p>
                )}
                <div className="flex items-center justify-end gap-2">
                  {newComment.trim() && (
                    <button
                      type="button"
                      onClick={() => setNewComment('')}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isPostingComment || !newComment.trim()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                  >
                    {isPostingComment ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>{isPostingComment ? 'Posting...' : 'Comment'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* YouTube-style comments list */}
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-xs">Loading discussion...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-400 space-y-1">
                <MessageCircle className="h-8 w-8 mx-auto opacity-30 text-primary" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No comments yet</p>
                <p className="text-xs text-gray-400">Be the first to ask a question or share your thought!</p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {comments.map((c) => {
                  const isTeacher = c.userRole?.toUpperCase()?.includes('TEACHER') || c.userRole?.toUpperCase()?.includes('ADMIN');
                  const isLiked = !!likedComments[c.id];
                  const hasReply = !!c.reply;
                  const isReplying = replyingCommentId === c.id;
                  const areRepliesVisible = expandedReplies[c.id] !== false; // default open if exists

                  return (
                    <div key={c.id} className="flex items-start gap-3 group">
                      {/* Avatar */}
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isTeacher
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                          : 'bg-primary/10 text-primary'
                        }`}>
                        {c.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      {/* Content & Actions */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {c.userName || 'Anonymous Student'}
                          </span>
                          {isTeacher ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-200">
                              <Check className="h-2.5 w-2.5" /> Teacher
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                              Student
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            {formatRelativeTime(c.createdAt)}
                          </span>
                          {c.isResolved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Answered
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {c.comment}
                        </p>

                        {/* YouTube comment action buttons */}
                        <div className="flex items-center gap-3 pt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <button
                            type="button"
                            onClick={() => toggleLikeComment(c.id)}
                            className={`inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition cursor-pointer ${isLiked ? 'text-primary font-bold' : ''
                              }`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                            <span>{isLiked ? 1 : ''}</span>
                          </button>

                          <button
                            type="button"
                            className="hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (isReplying) {
                                setReplyingCommentId(null);
                              } else {
                                setReplyingCommentId(c.id);
                                setReplyText('');
                              }
                            }}
                            className="font-semibold hover:text-primary transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <CornerDownRight className="h-3 w-3" /> Reply
                          </button>
                        </div>

                        {/* Inline Reply Form */}
                        {isReplying && (
                          <div className="mt-2 pl-2 border-l-2 border-primary/30 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {((user as any)?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 space-y-1.5">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to @${c.userName || 'student'}...`}
                                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handlePostReply(c.id);
                                    }
                                  }}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingCommentId(null)}
                                    className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isPostingReply || !replyText.trim()}
                                    onClick={() => handlePostReply(c.id)}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                                  >
                                    {isPostingReply ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>Reply</span>}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* YouTube-style Nested Teacher Reply */}
                        {hasReply && (
                          <div className="mt-2 space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [c.id]: !areRepliesVisible,
                                }))
                              }
                              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded-full transition cursor-pointer"
                            >
                              {areRepliesVisible ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" /> Hide 1 reply
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" /> 1 reply from Teacher
                                </>
                              )}
                            </button>

                            {areRepliesVisible && (
                              <div className="pl-3 border-l-2 border-primary/20 mt-1.5 space-y-2">
                                <div className="flex items-start gap-2.5 bg-primary/5 dark:bg-primary/10 rounded-xl p-3 border border-primary/15">
                                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                    {(c.repliedByName || 'T').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {c.repliedByName || 'Teacher'}
                                      </span>
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-primary text-white">
                                        <Check className="h-2 w-2" /> Teacher Answer
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {formatRelativeTime(c.repliedAt || c.updatedAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                      {c.reply}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chapter Content Items List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {activeItem ? 'All Content In This Chapter' : 'Learning Resources'}
        </h3>

        {chapterItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <BookOpen className="h-10 w-10 mb-2 opacity-40" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              No content items uploaded yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your teacher will publish videos, notes, or worksheets here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {chapterItems.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    flushProgress();
                    setActiveItem(item);
                  }}
                  className={`w-full flex items-center gap-4 rounded-xl border-2 p-3.5 text-left transition-all hover:shadow-sm ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
                    }`}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {item.contentType === 'VIDEO' || !item.contentType ? (
                      <Film className="h-6 w-6" />
                    ) : item.contentType === 'PDF' ? (
                      <FileText className="h-6 w-6" />
                    ) : (
                      <ImageIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.contentType === 'VIDEO' || !item.contentType
                            ? 'bg-purple-100 text-purple-700'
                            : item.contentType === 'PDF'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                      >
                        {item.contentType || 'VIDEO'}
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.title}
                      </p>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-normal">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>By {item.uploadedBy}</span>
                      {item.fileSize > 0 && <span>{formatSize(item.fileSize)}</span>}
                      <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      disabled={downloadingId === item.id}
                      className="flex items-center gap-1 rounded-lg bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary px-2.5 py-1 text-xs font-semibold transition"
                      title="Download Video"
                    >
                      {downloadingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>Download</span>
                    </button>
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <Eye className="h-4 w-4" />
                      <span>Open</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 p-1">
      <AnimatePresence mode="wait">
        {view === 'subject' && <React.Fragment key="subject">{renderSubject()}</React.Fragment>}
        {view === 'chapters' && <React.Fragment key="chapters">{renderChapters()}</React.Fragment>}
        {view === 'content' && <React.Fragment key="content">{renderContent()}</React.Fragment>}
      </AnimatePresence>
    </div>
  );
};

export default CoursesPage;
