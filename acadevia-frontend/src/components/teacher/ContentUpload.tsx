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
  Play,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Classes on Mount
  useEffect(() => {
    contentService.getClasses().then((cls) => setClasses(cls));
    refreshUploadedList();
  }, []);

  const refreshUploadedList = () => {
    const items = contentService.getContentItems();
    setUploadedItems(items);
  };

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

    try {
      const createdItem = await contentService.uploadContentItem({
        file: selectedFile.file,
        title: title.trim(),
        description: description.trim(),
        contentType,
        classNumber: selectedClass,
        subjectName: selectedSubject.name,
        chapterName: finalChapter,
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

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this content item?')) {
      await contentService.deleteContentItem(id);
      refreshUploadedList();
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

      {/* ================================================================== */}
      {/*  Uploaded Content Management Table                                 */}
      {/* ================================================================== */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Published Academic Content ({uploadedItems.length})
            </h3>
            <p className="text-xs text-gray-500">
              Real persisted content items across all classes and subjects.
            </p>
          </div>
        </div>

        {uploadedItems.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No uploaded content yet.</p>
            <p className="text-xs mt-1">
              Select a class and subject above to upload your first real lecture or resource.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/70 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title &amp; File</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
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
                      <div className="truncate max-w-xs">{item.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{item.fileName}</div>
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
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" /> Published
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalItem(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

  const steps = [
    { num: 1, label: 'Class' },
    { num: 2, label: 'Subject' },
    { num: 3, label: 'Chapter' },
    { num: 4, label: 'Upload' },
  ] as const;

  return (
    <div className="space-y-8 p-1">
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
  );
};
