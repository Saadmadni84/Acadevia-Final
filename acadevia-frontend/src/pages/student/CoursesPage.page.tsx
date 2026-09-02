import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Beaker,
  BookOpen,
  ArrowLeft,
  Play,
  Clock,
  School,
  ChevronRight,
  FileVideo,
  FileText,
  Image as ImageIcon,
  Download,
  ChevronDown,
  Brain,
  ExternalLink,
  Eye,
  CheckCircle,
  Film,
} from 'lucide-react';
import { uploadedContentStore, type UploadedContentItem } from '@/stores/uploadedContentStore';
import { dataService } from '@/services/data.service';
import { contentService, type AcademicSubject, type AcademicChapter } from '@/services/content.service';
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

  // Load chapters when class and subject change
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;
    contentService.getChapters(selectedClass, selectedSubject).then((chaps) => {
      setChapters(chaps);
    });
  }, [selectedClass, selectedSubject]);

  // Filter content items strictly by class, subject, and chapter
  const chapterItems = useMemo(() => {
    if (!selectedClass || !selectedChapter || !selectedSubject) return [];
    return allItems.filter(
      (v) =>
        v.classGrade === selectedClass &&
        v.subject.toLowerCase() === selectedSubject.toLowerCase() &&
        v.chapter.toLowerCase() === selectedChapter.toLowerCase(),
    );
  }, [selectedClass, selectedChapter, selectedSubject, allItems]);

  // Chapter content counts
  const chapterContentCount = useMemo(() => {
    if (!selectedClass || !selectedSubject) return {};
    const counts: Record<string, number> = {};
    allItems
      .filter(
        (v) =>
          v.classGrade === selectedClass &&
          v.subject.toLowerCase() === selectedSubject.toLowerCase(),
      )
      .forEach((v) => {
        counts[v.chapter] = (counts[v.chapter] || 0) + 1;
      });
    return counts;
  }, [selectedClass, selectedSubject, allItems]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
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
              className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                count > 0
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
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    activeItem.contentType === 'VIDEO' || !activeItem.contentType
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

            <div className="flex items-center gap-2">
              <a
                href={activeItem.cloudinaryUrl}
                target="_blank"
                rel="noreferrer"
                download={activeItem.fileName || activeItem.title}
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 text-xs font-semibold transition"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open / Download
              </a>
            </div>
          </div>

          {/* Video Player */}
          {(activeItem.contentType === 'VIDEO' || !activeItem.contentType) && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-xl">
              <video
                key={activeItem.cloudinaryUrl}
                controls
                autoPlay
                className="w-full h-full"
                poster={activeItem.thumbnailUrl}
              >
                <source src={activeItem.cloudinaryUrl} type="video/mp4" />
                <source src={activeItem.cloudinaryUrl} type="video/webm" />
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
              />
            </div>
          )}
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
                  onClick={() => setActiveItem(item)}
                  className={`w-full flex items-center gap-4 rounded-xl border-2 p-3.5 text-left transition-all hover:shadow-sm ${
                    isSelected
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
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.contentType === 'VIDEO' || !item.contentType
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
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>By {item.uploadedBy}</span>
                      {item.fileSize > 0 && <span>{formatSize(item.fileSize)}</span>}
                      <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Eye className="h-4 w-4" />
                    <span>Open</span>
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
