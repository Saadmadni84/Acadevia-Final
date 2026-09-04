import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  contentService,
  type AcademicClass,
  type AcademicSubject,
  type AcademicChapter,
  type ContentType,
  type ContentItemRecord,
} from '@/services/content.service';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Upload,
  X,
  Film,
  Image as ImageIcon,
  FileText,
  FileVideo,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Plus,
  Eye,
  Layers,
  ExternalLink,
  Edit,
  MessageSquare,
  Check,
  MessageCircle,
  HelpCircle,
  Send,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Accepted types & constraints                                      */
/* ------------------------------------------------------------------ */

const ACCEPTED_TYPES_MAP: Record<ContentType, string[]> = {
  VIDEO: ['video/mp4', 'video/webm'],
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

const MAX_SIZE_MAP: Record<ContentType, number> = {
  VIDEO: 500 * 1024 * 1024, // 500MB
  PDF: 50 * 1024 * 1024,    // 50MB
  IMAGE: 25 * 1024 * 1024,  // 25MB
};

interface SelectedFileDetails {
  file: File;
  previewUrl?: string;
  error?: string;
}

export const ContentUpload: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  // Stepper state (1: Class, 2: Subject, 3: Chapter, 4: Upload)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selection state
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [chapters, setChapters] = useState<AcademicChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Custom Chapter inline state
  const [isCustomChapter, setIsCustomChapter] = useState(false);
  const [customChapterName, setCustomChapterName] = useState('');

  // Upload Form details
  const [contentType, setContentType] = useState<ContentType>('VIDEO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');

  // File state
  const [selectedFile, setSelectedFile] = useState<SelectedFileDetails | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<ContentItemRecord | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Existing uploaded items list
  const [uploadedItems, setUploadedItems] = useState<ContentItemRecord[]>([]);
  const [previewModalItem, setPreviewModalItem] = useState<ContentItemRecord | null>(null);

  // Navigation tab: 'upload' | 'published' | 'comments'
  const [activeTab, setActiveTab] = useState<'upload' | 'published' | 'comments'>('upload');

  // Edit modal state
  const [editingItem, setEditingItem] = useState<ContentItemRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editChapter, setEditChapter] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState<ContentItemRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Teacher Comments Inbox state
  const [teacherComments, setTeacherComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Dedicated Video Doubts Modal State
  const [selectedVideoForDoubts, setSelectedVideoForDoubts] = useState<ContentItemRecord | null>(null);
  const [videoDoubts, setVideoDoubts] = useState<any[]>([]);
  const [loadingVideoDoubts, setLoadingVideoDoubts] = useState(false);
  const [teacherReplyText, setTeacherReplyText] = useState<Record<number, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Classes & Published Content on Mount
  useEffect(() => {
    contentService.getClasses().then((cls) => setClasses(cls));
    refreshUploadedList();
    refreshTeacherComments();
  }, []);

  useEffect(() => {
    if (activeTab === 'comments') {
      refreshTeacherComments();
    } else if (activeTab === 'published') {
      refreshUploadedList();
    }
  }, [activeTab]);

  const refreshUploadedList = async () => {
    try {
      const serverItems = await contentService.getTeacherPublishedContent();
      if (serverItems && serverItems.length > 0) {
        setUploadedItems(serverItems);
        return;
      }
    } catch (e) {
      console.warn('Failed to load server items, falling back to local store:', e);
    }
    const items = contentService.getContentItems();
    setUploadedItems(items);
  };

  const refreshTeacherComments = async () => {
    try {
      setLoadingComments(true);
      const comments = await contentService.getTeacherCommentsInbox();
      setTeacherComments(comments);
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'comments') {
      refreshTeacherComments();
    } else if (activeTab === 'published') {
      refreshUploadedList();
    }
  }, [activeTab]);

  // 2. Load Subjects when Class changes
  useEffect(() => {
    if (!selectedClass) return;
    setLoadingSubjects(true);
    contentService
      .getSubjectsForClass(selectedClass)
      .then((subs) => {
        setSubjects(subs);
        setSelectedSubject(null);
        setSelectedChapter('');
      })
      .finally(() => setLoadingSubjects(false));
  }, [selectedClass]);

  // 3. Load Chapters when Subject changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;
    setLoadingChapters(true);
    contentService
      .getChapters(selectedClass, selectedSubject.name)
      .then((chaps) => {
        setChapters(chaps);
        setSelectedChapter('');
        setIsCustomChapter(false);
        setCustomChapterName('');
      })
      .finally(() => setLoadingChapters(false));
  }, [selectedClass, selectedSubject]);

  // File Validation
  const validateFile = (file: File, type: ContentType): string | null => {
    const allowed = ACCEPTED_TYPES_MAP[type];
    const mime = file.type.toLowerCase();
    if (!allowed.includes(mime)) {
      if (type === 'VIDEO') return 'Only MP4 and WebM video files are supported';
      if (type === 'PDF') return 'Only PDF documents (.pdf) are supported';
      if (type === 'IMAGE') return 'Only JPG, PNG, and WebM images are supported';
    }
    const max = MAX_SIZE_MAP[type];
    if (file.size > max) {
      return `File size exceeds the ${Math.round(max / (1024 * 1024))}MB limit`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const err = validateFile(file, contentType);
    let previewUrl: string | undefined;

    if (!err) {
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        previewUrl = URL.createObjectURL(file);
      }
    }

    setSelectedFile({
      file,
      previewUrl,
      error: err ?? undefined,
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [contentType],
  );

  const formatSize = (bytes: number): string => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  // Submit Handler
  const handleUploadSubmit = async () => {
    if (!selectedClass || !selectedSubject) {
      setUploadError('Please select both Class and Subject');
      return;
    }
    const finalChapter = isCustomChapter ? customChapterName.trim() : selectedChapter;
    if (!finalChapter) {
      setUploadError('Please select or specify a Chapter');
      return;
    }
    if (!title.trim()) {
      setUploadError('Please enter a Content Title');
      return;
    }
    if (!selectedFile || selectedFile.error) {
      setUploadError('Please select a valid file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    const matchedChapObj = !isCustomChapter ? chapters.find((c) => c.title === selectedChapter) : undefined;

    try {
      const createdItem = await contentService.uploadContentItem({
        file: selectedFile.file,
        title: title.trim(),
        description: description.trim(),
        contentType,
        classNumber: selectedClass,
        subjectName: selectedSubject.name,
        chapterName: finalChapter,
        courseId: selectedClass,
        moduleId: matchedChapObj?.id,
        language,
        teacherId: user?.id || '10',
        teacherName: user?.fullName || 'Rahul Verma',
        schoolId: (user as any)?.schoolId || 1,
        onProgress: (p) => setUploadProgress(p),
      });

      setUploadSuccess(createdItem);
      refreshUploadedList();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setUploadSuccess(null);
    setUploadError(null);
    setStep(1);
  };

  const handleStartEdit = (item: ContentItemRecord) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditSubject(item.subjectName || '');
    setEditChapter(item.chapterName || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setIsSavingEdit(true);
      await contentService.updateVideoContent(editingItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        subject: editSubject.trim(),
        chapter: editChapter.trim(),
      });
      setEditingItem(null);
      await refreshUploadedList();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update video');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteItem = (id: string, itemTitle?: string) => {
    const item = uploadedItems.find((i) => i.id === id);
    setDeletingItem(item || ({ id, title: itemTitle || 'Video' } as any));
  };

  const confirmDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await contentService.deleteVideoContent(deletingItem.id);
      setDeletingItem(null);
      await refreshUploadedList();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete video');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkRead = async (commentId: number) => {
    try {
      await contentService.markCommentRead(commentId);
      await refreshTeacherComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkResolved = async (commentId: number) => {
    try {
      await contentService.markCommentResolved(commentId);
      await refreshTeacherComments();
    } catch (err) {
      console.error(err);
    }
  };

  const getCommentCountForVideo = (itemId: string) => {
    const rawId = itemId.startsWith('vid-') ? itemId.replace('vid-', '') : itemId;
    const matches = teacherComments.filter(
      (c) => String(c.videoId) === String(itemId) || String(c.videoId) === rawId
    );
    return matches.length;
  };

  const handleOpenVideoDoubts = async (item: ContentItemRecord) => {
    setSelectedVideoForDoubts(item);
    setLoadingVideoDoubts(true);
    try {
      const doubts = await contentService.getVideoComments(item.id);
      setVideoDoubts(doubts || []);
    } catch (err) {
      console.error('Failed to fetch video doubts:', err);
    } finally {
      setLoadingVideoDoubts(false);
    }
  };

  const handleSendTeacherReply = async (commentId: number) => {
    const text = teacherReplyText[commentId]?.trim();
    if (!text) return;
    setSubmittingReplyId(commentId);
    try {
      const updated = await contentService.replyToComment(commentId, text);
      const teacherDisplayName = (user as any)?.name || (user as any)?.fullName || (user as any)?.firstName || 'Teacher';

      // Update videoDoubts if modal is open
      setVideoDoubts((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                ...updated,
                reply: text,
                isResolved: true,
                isRead: true,
                repliedByName: teacherDisplayName,
                repliedAt: new Date().toISOString(),
              }
            : c
        )
      );

      // Also update teacherComments inbox list
      setTeacherComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                ...updated,
                reply: text,
                isResolved: true,
                isRead: true,
                repliedByName: teacherDisplayName,
                repliedAt: new Date().toISOString(),
              }
            : c
        )
      );

      setTeacherReplyText((prev) => ({ ...prev, [commentId]: '' }));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to submit reply');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  /* ================================================================== */
  /*  Step 1: Class Selection (1 to 12)                                 */
  /* ================================================================== */

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Step 1: Select Target Class
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose the student grade level for this learning content (Classes 1 through 12).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {classes.map((cls) => {
          const isSelected = selectedClass === cls.classNumber;
          return (
            <motion.button
              key={cls.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedClass(cls.classNumber);
                setStep(2);
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              <GraduationCap
                className={`h-7 w-7 ${isSelected ? 'text-primary' : 'text-gray-400'}`}
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {cls.classNumber}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {cls.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  /* ================================================================== */
  /*  Step 2: Subject Selection                                         */
  /* ================================================================== */

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Step 2: Select Subject for Class {selectedClass}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Real curriculum subjects loaded dynamically for this grade level.
          </p>
        </div>
      </div>

      {loadingSubjects ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {subjects.map((sub) => {
            const isSelected = selectedSubject?.id === sub.id;
            return (
              <motion.button
                key={sub.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedSubject(sub);
                  setStep(3);
                }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {sub.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {sub.name}
                  </p>
                  <p className="text-xs text-gray-400">Class {selectedClass}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  /* ================================================================== */
  /*  Step 3: Chapter Selection                                         */
  /* ================================================================== */

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Step 3: Select Chapter — Class {selectedClass} {selectedSubject?.name}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Choose an existing syllabus chapter or create a new one.
          </p>
        </div>
      </div>

      {loadingChapters ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 max-h-96 overflow-y-auto pr-1">
            {chapters.map((ch, idx) => {
              const isSelected = !isCustomChapter && selectedChapter === ch.title;
              return (
                <button
                  key={ch.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedChapter(ch.title);
                    setIsCustomChapter(false);
                    setStep(4);
                  }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {ch.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              );
            })}
          </div>

          {/* Custom Chapter Option */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {!isCustomChapter ? (
              <button
                type="button"
                onClick={() => setIsCustomChapter(true)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Add or enter a custom chapter name
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter chapter title (e.g., Metals and Non-metals)"
                  value={customChapterName}
                  onChange={(e) => setCustomChapterName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customChapterName.trim()) {
                      setSelectedChapter(customChapterName.trim());
                      setStep(4);
                    }
                  }}
                  disabled={!customChapterName.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomChapter(false);
                    setCustomChapterName('');
                  }}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  /* ================================================================== */
  /*  Step 4: Upload Content (Video, PDF, Image)                        */
  /* ================================================================== */

  const activeChapter = isCustomChapter ? customChapterName : selectedChapter;

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header with back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Step 4: Upload Learning Content
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Class {selectedClass} &bull; {selectedSubject?.name} &bull; {activeChapter}
            </p>
          </div>
        </div>

        {/* Content Type Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['VIDEO', 'PDF', 'IMAGE'] as ContentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setContentType(type);
                setSelectedFile(null);
                setUploadError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                contentType === type
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {type === 'VIDEO' && <Film className="h-3.5 w-3.5" />}
              {type === 'PDF' && <FileText className="h-3.5 w-3.5" />}
              {type === 'IMAGE' && <ImageIcon className="h-3.5 w-3.5" />}
              {type === 'VIDEO' ? 'Video' : type === 'PDF' ? 'PDF Document' : 'Image'}
            </button>
          ))}
        </div>
      </div>

      {/* Success Banner */}
      {uploadSuccess && (
        <div className="rounded-xl border border-green-300 bg-green-50 dark:bg-green-950/40 p-4 text-green-900 dark:text-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-base">Content Published Successfully!</h3>
              <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                "{uploadSuccess.title}" is now available in the Student Portal for Class {uploadSuccess.classNumber} ({uploadSuccess.subjectName} &bull; {uploadSuccess.chapterName}).
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalItem(uploadSuccess)}
                  className="rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-green-700 transition"
                >
                  Preview Uploaded File
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-green-400 px-3 py-1.5 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!uploadSuccess && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Content Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  contentType === 'VIDEO'
                    ? 'e.g., Understanding Reaction Rates with Examples'
                    : contentType === 'PDF'
                    ? 'e.g., Chapter Notes & Formula Sheet'
                    : 'e.g., Periodic Table Chart'
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Description / Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief summary or instructions for students..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bilingual">Bilingual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Class & Subject
                </label>
                <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  Class {selectedClass} &bull; {selectedSubject?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: File Dropzone & Preview */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Select {contentType === 'VIDEO' ? 'Video File' : contentType === 'PDF' ? 'PDF File' : 'Image File'} *
              </label>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary/60'
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    {contentType === 'VIDEO' && <FileVideo className="h-6 w-6" />}
                    {contentType === 'PDF' && <FileText className="h-6 w-6" />}
                    {contentType === 'IMAGE' && <ImageIcon className="h-6 w-6" />}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Click to browse or drag &amp; drop file here
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {contentType === 'VIDEO' && 'MP4 or WebM (Max 500MB)'}
                    {contentType === 'PDF' && 'Adobe PDF document (Max 50MB)'}
                    {contentType === 'IMAGE' && 'JPEG, PNG, or WebP (Max 25MB)'}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES_MAP[contentType].join(',')}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {contentType === 'VIDEO' && <Film className="h-5 w-5" />}
                        {contentType === 'PDF' && <FileText className="h-5 w-5" />}
                        {contentType === 'IMAGE' && <ImageIcon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {selectedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatSize(selectedFile.file.size)} &bull; {selectedFile.file.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* File preview thumbnail */}
                  {selectedFile.previewUrl && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-48 flex justify-center bg-black/5">
                      {contentType === 'IMAGE' && (
                        <img
                          src={selectedFile.previewUrl}
                          alt="Preview"
                          className="max-h-48 object-contain"
                        />
                      )}
                      {contentType === 'VIDEO' && (
                        <video
                          src={selectedFile.previewUrl}
                          controls
                          className="max-h-48 w-full object-contain"
                        />
                      )}
                    </div>
                  )}

                  {selectedFile.error && (
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle className="h-4 w-4" /> {selectedFile.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {uploadError}
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Uploading to real persistent storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={isUploading || !title.trim() || !selectedFile || !!selectedFile.error}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Publish Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Published Content Table directly inside Step 4 as well */}
      {renderPublishedContentTable()}

      {/* ================================================================== */}
      {/*  Preview Modal (PDF, Image, Video Player)                          */}
      {/* ================================================================== */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {previewModalItem.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Class {previewModalItem.classNumber} &bull; {previewModalItem.subjectName} &bull; {previewModalItem.chapterName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/5 dark:bg-black/20">
              {previewModalItem.contentType === 'VIDEO' && (
                <video
                  src={previewModalItem.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full object-contain rounded-lg shadow"
                />
              )}

              {previewModalItem.contentType === 'IMAGE' && (
                <img
                  src={previewModalItem.fileUrl}
                  alt={previewModalItem.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow"
                />
              )}

              {previewModalItem.contentType === 'PDF' && (
                <iframe
                  src={previewModalItem.fileUrl}
                  title={previewModalItem.title}
                  className="w-full h-[70vh] rounded-lg border border-gray-300 dark:border-gray-700"
                />
              )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <span>{previewModalItem.fileName} &bull; {formatSize(previewModalItem.fileSize)}</span>
              <a
                href={previewModalItem.fileUrl}
                download={previewModalItem.fileName}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open / Download
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  /* ================================================================== */
  /*  Stepper Progress Bar Header                                       */
  /* ================================================================== */

  /* ================================================================== */
  /*  Published Academic Content Table Component                        */
  /* ================================================================== */

  const renderPublishedContentTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Published Academic Content ({uploadedItems.length})
          </h3>
          <p className="text-xs text-gray-500">
            Real persisted content items across all classes and subjects from database.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshUploadedList}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Refresh List
        </button>
      </div>

      {uploadedItems.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-400">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No uploaded content yet.</p>
          <p className="text-xs mt-1">
            Select a class and subject to upload your first real lecture or resource.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/70 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title &amp; Description</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Chapter</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {uploadedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    <div className="truncate max-w-xs font-semibold">{item.title}</div>
                    {item.description ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs mt-0.5">
                        {item.description}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 italic">No description</div>
                    )}
                    <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">{item.fileName}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    Class {item.classNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.subjectName}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                    {item.chapterName}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.contentType === 'VIDEO'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : item.contentType === 'PDF'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.contentType === 'VIDEO' && <Film className="h-3 w-3" />}
                      {item.contentType === 'PDF' && <FileText className="h-3 w-3" />}
                      {item.contentType === 'IMAGE' && <ImageIcon className="h-3 w-3" />}
                      {item.contentType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {item.fileSize ? formatSize(item.fileSize) : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" /> Published
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenVideoDoubts(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-1 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition cursor-pointer shadow-2xs"
                      title="View Student Doubts & Questions for this video"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Doubts ({getCommentCountForVideo(item.id)})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewModalItem(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                      title="View / Play"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 text-primary px-2 py-1 text-xs font-medium hover:bg-primary/10 transition cursor-pointer"
                      title="Edit Metadata"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2 py-1 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
                      title="Delete Content"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ================================================================== */
  /*  Student Comments & Questions Inbox                                */
  /* ================================================================== */

  const renderCommentsInbox = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Student Questions &amp; Comments Inbox ({teacherComments.length})
          </h3>
          <p className="text-xs text-gray-500">
            Questions submitted by students on your published video lessons.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshTeacherComments}
          disabled={loadingComments}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          {loadingComments ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>Refresh</span>}
        </button>
      </div>

      {teacherComments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400 space-y-2">
          <MessageCircle className="h-10 w-10 mx-auto opacity-40 text-primary" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No student questions yet</p>
          <p className="text-xs text-gray-500">
            When students ask questions or comment on your video lessons, they will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          {teacherComments.map((c) => (
            <div key={c.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {c.userName}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {c.userRole}
                    </span>
                    <span className="text-xs text-gray-400">
                      on <span className="font-semibold text-gray-700 dark:text-gray-300">{c.videoTitle}</span>
                      {c.chapter && ` (${c.chapter})`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                    "{c.comment}"
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.isResolved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Check className="h-3 w-3" /> Resolved
                    </span>
                  ) : c.isRead ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                      New Question
                    </span>
                  )}

                  {!c.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(c.id)}
                      className="text-xs font-semibold text-gray-600 hover:text-primary px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 transition cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}

                  {!c.isResolved && (
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(c.id)}
                      className="text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Teacher Reply Display */}
              {c.reply && (
                <div className="mt-3 pl-3 border-l-2 border-primary/40 py-1.5 bg-primary/5 rounded-r-xl space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Check className="h-3 w-3" /> Teacher Answer by {c.repliedByName || 'Teacher'}:
                  </div>
                  <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{c.reply}</p>
                  {c.repliedAt && (
                    <p className="text-[10px] text-gray-400">{new Date(c.repliedAt).toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Teacher Reply Input */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={c.reply ? "Update your reply to this student..." : "Write a reply or answer for this student..."}
                  value={teacherReplyText[c.id] || ''}
                  onChange={(e) => setTeacherReplyText({ ...teacherReplyText, [c.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendTeacherReply(c.id);
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  disabled={submittingReplyId === c.id || !teacherReplyText[c.id]?.trim()}
                  onClick={() => handleSendTeacherReply(c.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
                >
                  {submittingReplyId === c.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  <span>{c.reply ? 'Update Reply' : 'Reply to Student'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ================================================================== */
  /*  Stepper Progress Bar Header                                       */
  /* ================================================================== */

  const steps = [
    { num: 1, label: 'Class' },
    { num: 2, label: 'Subject' },
    { num: 3, label: 'Chapter' },
    { num: 4, label: 'Upload' },
  ] as const;

  return (
    <div className="space-y-6 p-1">
      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Content</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('published');
            refreshUploadedList();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'published'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Published Academic Content ({uploadedItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('comments');
            refreshTeacherComments();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Student Doubts &amp; Comments ({teacherComments.filter((c) => !c.isRead).length > 0 ? `${teacherComments.filter((c) => !c.isRead).length} new` : teacherComments.length})</span>
        </button>
      </div>

      {activeTab === 'published' && renderPublishedContentTable()}
      {activeTab === 'comments' && renderCommentsInbox()}

      {activeTab === 'upload' && (
        <div className="space-y-8">
          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-0 overflow-x-auto py-2">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step) setStep(s.num as 1 | 2 | 3 | 4);
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                    s.num === step
                      ? 'bg-primary text-white shadow-md'
                      : s.num < step
                      ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      s.num === step
                        ? 'bg-white/20'
                        : s.num < step
                        ? 'bg-primary/20'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {s.num < step ? <CheckCircle className="h-3.5 w-3.5" /> : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-16 ${
                      s.num < step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Views */}
          <AnimatePresence mode="wait">
            {step === 1 && <React.Fragment key="s1">{renderStep1()}</React.Fragment>}
            {step === 2 && <React.Fragment key="s2">{renderStep2()}</React.Fragment>}
            {step === 3 && <React.Fragment key="s3">{renderStep3()}</React.Fragment>}
            {step === 4 && <React.Fragment key="s4">{renderStep4()}</React.Fragment>}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Edit className="h-4 w-4 text-primary" /> Edit Content Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                  placeholder="Content title..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                  placeholder="Key concepts, formula notes, or chapter description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Chapter
                  </label>
                  <input
                    type="text"
                    value={editChapter}
                    onChange={(e) => setEditChapter(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-sm text-gray-900 dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingEdit || !editTitle.trim()}
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-4"
          >
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Video Content?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-300">"{deletingItem.title}"</span>?
              </p>
              <p className="text-[11px] text-red-500 mt-2">
                This will permanently delete the database record, purge the video file from MinIO storage, and remove it from student courses.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteItem}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Video Doubts & Discussion Modal */}
      {selectedVideoForDoubts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Student Doubts &amp; Questions
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {videoDoubts.length} {videoDoubts.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedVideoForDoubts.title}</span> • Class {selectedVideoForDoubts.classNumber} • {selectedVideoForDoubts.subjectName} • {selectedVideoForDoubts.chapterName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideoForDoubts(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Doubts List Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {loadingVideoDoubts ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-xs">Loading video doubts...</span>
                </div>
              ) : videoDoubts.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400 space-y-2">
                  <HelpCircle className="h-10 w-10 mx-auto opacity-30 text-primary" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No questions asked yet on this video</p>
                  <p className="text-xs text-gray-500">
                    When students studying this chapter ask questions, they will appear here so you can answer them.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {videoDoubts.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-4 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {(c.userName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                {c.userName || 'Student'}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                {c.userRole || 'STUDENT'}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {c.isResolved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <Check className="h-2.5 w-2.5" /> Answered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                              Pending Doubt
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student Question Text */}
                      <p className="text-xs text-gray-800 dark:text-gray-200 pl-10 leading-relaxed font-medium whitespace-pre-wrap">
                        "{c.comment}"
                      </p>

                      {/* Existing Teacher Reply */}
                      {c.reply && (
                        <div className="ml-10 pl-3 border-l-2 border-primary/40 py-1.5 bg-primary/5 dark:bg-primary/10 rounded-r-xl space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                            <Check className="h-3 w-3" /> Teacher Answer by {c.repliedByName || 'Teacher'}:
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{c.reply}</p>
                          {c.repliedAt && (
                            <p className="text-[10px] text-gray-400">{new Date(c.repliedAt).toLocaleString()}</p>
                          )}
                        </div>
                      )}

                      {/* Teacher Reply Input */}
                      <div className="ml-10 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={c.reply ? "Update your reply to this student..." : "Write your explanation/answer to this student..."}
                          value={teacherReplyText[c.id] || ''}
                          onChange={(e) => setTeacherReplyText({ ...teacherReplyText, [c.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendTeacherReply(c.id);
                            }
                          }}
                          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={submittingReplyId === c.id || !teacherReplyText[c.id]?.trim()}
                          onClick={() => handleSendTeacherReply(c.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
                        >
                          {submittingReplyId === c.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          <span>{c.reply ? 'Update Reply' : 'Send Reply'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex justify-end bg-gray-50/50 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={() => setSelectedVideoForDoubts(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

