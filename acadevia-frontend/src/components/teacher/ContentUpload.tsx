import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadVideoToCloudinary, type CloudinaryUploadResult } from '@/services/cloudinary.service';
import { uploadedContentStore } from '@/stores/uploadedContentStore';
import {
  Upload,
  X,
  Film,
  Image,
  FileVideo,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Beaker,
  Plus,
  Video,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Static data – Science chapters per class                           */
/* ------------------------------------------------------------------ */

const CLASSES = [6, 7, 8, 9, 10, 11, 12] as const;

const SCIENCE_CHAPTERS: Record<number, string[]> = {
  6: [
    'Food: Where Does it Come From?',
    'Components of Food',
    'Fibre to Fabric',
    'Sorting Materials into Groups',
    'Separation of Substances',
    'Changes Around Us',
    'Getting to Know Plants',
    'Body Movements',
    'The Living Organisms and Their Surroundings',
    'Motion and Measurement of Distances',
    'Light, Shadows and Reflections',
    'Electricity and Circuits',
    'Fun with Magnets',
    'Water',
    'Air Around Us',
    'Garbage In, Garbage Out',
  ],
  7: [
    'Nutrition in Plants',
    'Nutrition in Animals',
    'Fibre to Fabric',
    'Heat',
    'Acids, Bases and Salts',
    'Physical and Chemical Changes',
    'Weather, Climate and Adaptations',
    'Winds, Storms and Cyclones',
    'Soil',
    'Respiration in Organisms',
    'Transportation in Animals and Plants',
    'Reproduction in Plants',
    'Motion and Time',
    'Electric Current and its Effects',
    'Light',
    'Water: A Precious Resource',
    'Forests: Our Lifeline',
    'Wastewater Story',
  ],
  8: [
    'Crop Production and Management',
    'Microorganisms: Friend and Foe',
    'Synthetic Fibres and Plastics',
    'Materials: Metals and Non-Metals',
    'Coal and Petroleum',
    'Combustion and Flame',
    'Conservation of Plants and Animals',
    'Cell — Structure and Functions',
    'Reproduction in Animals',
    'Reaching the Age of Adolescence',
    'Force and Pressure',
    'Friction',
    'Sound',
    'Chemical Effects of Electric Current',
    'Some Natural Phenomena',
    'Light',
    'Stars and the Solar System',
    'Pollution of Air and Water',
  ],
  9: [
    'Matter in Our Surroundings',
    'Is Matter Around Us Pure?',
    'Atoms and Molecules',
    'Structure of the Atom',
    'The Fundamental Unit of Life',
    'Tissues',
    'Diversity in Living Organisms',
    'Motion',
    'Force and Laws of Motion',
    'Gravitation',
    'Work and Energy',
    'Sound',
    'Why Do We Fall Ill?',
    'Natural Resources',
    'Improvement in Food Resources',
  ],
  10: [
    'Chemical Reactions and Equations',
    'Acids, Bases and Salts',
    'Metals and Non-metals',
    'Carbon and its Compounds',
    'Periodic Classification of Elements',
    'Life Processes',
    'Control and Coordination',
    'How Do Organisms Reproduce?',
    'Heredity and Evolution',
    'Light – Reflection and Refraction',
    'The Human Eye and the Colourful World',
    'Electricity',
    'Magnetic Effects of Electric Current',
    'Sources of Energy',
    'Our Environment',
    'Management of Natural Resources',
  ],
  11: [
    'Physical World',
    'Units and Measurements',
    'Motion in a Straight Line',
    'Motion in a Plane',
    'Laws of Motion',
    'Work, Energy and Power',
    'System of Particles and Rotational Motion',
    'Gravitation',
    'Mechanical Properties of Solids',
    'Mechanical Properties of Fluids',
    'Thermal Properties of Matter',
    'Thermodynamics',
    'Kinetic Theory',
    'Oscillations',
    'Waves',
  ],
  12: [
    'Electric Charges and Fields',
    'Electrostatic Potential and Capacitance',
    'Current Electricity',
    'Moving Charges and Magnetism',
    'Magnetism and Matter',
    'Electromagnetic Induction',
    'Alternating Current',
    'Electromagnetic Waves',
    'Ray Optics and Optical Instruments',
    'Wave Optics',
    'Dual Nature of Radiation and Matter',
    'Atoms',
    'Nuclei',
    'Semiconductor Electronics',
  ],
};

/* ------------------------------------------------------------------ */
/*  Upload types                                                        */
/* ------------------------------------------------------------------ */

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'complete' | 'error';
  thumbnail?: string;
  error?: string;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  cloudinaryResult?: CloudinaryUploadResult;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const ContentUpload: React.FC = () => {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selection state
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject] = useState<string>('Science');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [customChapter, setCustomChapter] = useState<string>('');
  const [isCustomChapter, setIsCustomChapter] = useState(false);

  // Upload state
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const chapterName = isCustomChapter ? customChapter : selectedChapter;
  const chapters = selectedClass ? SCIENCE_CHAPTERS[selectedClass] || [] : [];

  /* ---- helpers ---- */

  const generateThumbnail = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => { video.currentTime = 1; };
      video.onseeked = () => {
        const c = document.createElement('canvas');
        c.width = 320; c.height = 180;
        c.getContext('2d')?.drawImage(video, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg'));
        URL.revokeObjectURL(video.src);
      };
    });

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) return 'Only MP4 and WebM files are allowed';
    if (file.size > MAX_FILE_SIZE) return 'File size exceeds 500MB limit';
    return null;
  };

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const uploads: UploadFile[] = [];
    for (const file of arr) {
      const error = validateFile(file);
      const thumbnail = error ? undefined : await generateThumbnail(file);
      uploads.push({ id: crypto.randomUUID(), file, progress: 0, status: error ? 'error' : 'queued', thumbnail, error: error ?? undefined });
    }
    setFiles((prev) => [...prev, ...uploads]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const uploadToCloudinary = async (uploadFile: UploadFile) => {
    // Mark as uploading
    setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f)));

    try {
      const metadata = {
        class: String(selectedClass || ''),
        subject: selectedSubject,
        chapter: chapterName,
        title: videoTitle,
        language,
      };

      const result = await uploadVideoToCloudinary(
        uploadFile.file,
        (progress) => {
          setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)));
        },
        metadata,
      );

      // Mark as complete with Cloudinary data
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
              ...f,
              progress: 100,
              status: 'complete' as const,
              cloudinaryUrl: result.secure_url,
              cloudinaryPublicId: result.public_id,
              cloudinaryResult: result,
            }
            : f,
        ),
      );
      setUploadedUrls((prev) => [...prev, result.secure_url]);

      // Save to content store so students can browse it
      uploadedContentStore.add({
        id: uploadFile.id,
        title: videoTitle || uploadFile.file.name,
        description: videoDescription,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        thumbnailUrl: result.thumbnail_url || '',
        subject: selectedSubject,
        classGrade: selectedClass || 6,
        chapter: chapterName,
        language,
        duration: result.duration,
        uploadedBy: 'Teacher',
        uploadedAt: new Date().toISOString(),
        fileSize: uploadFile.file.size,
      });

      console.log('✅ Upload complete:', result.secure_url);
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'error' as const, error: err?.message || 'Upload failed' }
            : f,
        ),
      );
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onload = () => setCustomThumbnail(r.result as string); r.readAsDataURL(file); }
  };

  const handleUploadSubmit = () => {
    const queued = files.filter((f) => f.status === 'queued');
    if (queued.length === 0) return;

    console.log('🚀 Starting Cloudinary upload:', {
      class: selectedClass,
      subject: selectedSubject,
      chapter: chapterName,
      title: videoTitle,
      description: videoDescription,
      language,
      fileCount: queued.length,
    });

    // Upload files sequentially to avoid overwhelming the network
    queued.reduce(
      (chain, f) => chain.then(() => uploadToCloudinary(f)),
      Promise.resolve(),
    );
  };

  const formatSize = (bytes: number): string => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  /* ================================================================== */
  /*  STEP 1 — Select Class                                              */
  /* ================================================================== */

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Class</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose which class you want to upload content for</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
        {CLASSES.map((cls) => (
          <motion.button
            key={cls}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedClass(cls); setStep(2); }}
            className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-5 transition-all ${selectedClass === cls
              ? 'border-primary bg-primary/10 text-primary shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-sm'
              }`}
          >
            <span className="text-2xl font-bold">{cls}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Class</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  /* ================================================================== */
  /*  STEP 2 — Subject (Science pre-selected for this teacher)           */
  /* ================================================================== */

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Beaker className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subject</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Class {selectedClass} • Your assigned subject</p>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-4 rounded-xl border-2 border-primary bg-primary/10 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Beaker className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Science</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Class {selectedClass} Science</p>
          </div>
          <CheckCircle className="ml-auto h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Change Class
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors shadow-sm"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );

  /* ================================================================== */
  /*  STEP 3 — Select / Add Chapter                                      */
  /* ================================================================== */

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Chapter</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Class {selectedClass} • Science • {chapters.length} chapters
        </p>
      </div>

      {/* Existing chapters */}
      <div className="max-w-2xl mx-auto space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
        {chapters.map((ch, idx) => (
          <button
            key={ch}
            type="button"
            onClick={() => { setSelectedChapter(ch); setIsCustomChapter(false); }}
            className={`w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all text-sm ${selectedChapter === ch && !isCustomChapter
              ? 'border-primary bg-primary/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
              }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500">
              {idx + 1}
            </span>
            <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">{ch}</span>
            {selectedChapter === ch && !isCustomChapter && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
          </button>
        ))}
      </div>

      {/* Add custom chapter */}
      <div className="max-w-2xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          type="button"
          onClick={() => { setIsCustomChapter(true); setSelectedChapter(''); }}
          className={`w-full flex items-center gap-3 rounded-lg border-2 border-dashed p-3 text-left transition-all text-sm ${isCustomChapter
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/40'
            }`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">Add New Chapter</span>
        </button>

        {isCustomChapter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
            <input
              type="text"
              value={customChapter}
              onChange={(e) => setCustomChapter(e.target.value)}
              placeholder="Enter chapter name..."
              autoFocus
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          disabled={!chapterName.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );

  /* ================================================================== */
  /*  STEP 4 — Upload Video                                              */
  /* ================================================================== */

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          <GraduationCap className="h-3.5 w-3.5" /> Class {selectedClass}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          <Beaker className="h-3.5 w-3.5" /> {selectedSubject}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          <BookOpen className="h-3.5 w-3.5" /> {chapterName}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop video files here or click to browse"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer ${isDragging
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 bg-gray-50 dark:bg-gray-800/50'
          }`}
      >
        <motion.div animate={{ scale: isDragging ? 1.1 : 1 }} className="rounded-full bg-primary/10 p-4">
          <Video className="h-8 w-8 text-primary" />
        </motion.div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Drag & drop video files here</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">MP4, WebM • Max 500MB per file</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          aria-hidden="true"
        />
      </div>

      {/* File Queue */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Upload Queue ({files.length})
            </h3>
            {files.map((uf) => (
              <motion.div
                key={uf.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {uf.thumbnail ? (
                  <img src={uf.thumbnail} alt="" className="h-14 w-24 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="flex h-14 w-24 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <FileVideo className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white text-sm">{uf.file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatSize(uf.file.size)}</p>
                  {uf.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading to Cloudinary...</span>
                        <span className="font-medium text-primary">{Math.round(uf.progress)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${uf.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {uf.status === 'complete' && uf.cloudinaryUrl && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Uploaded to Cloudinary</span>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(uf.cloudinaryUrl!); }}
                        className="text-xs text-primary hover:underline"
                      >
                        Copy URL
                      </button>
                    </div>
                  )}
                  {uf.status === 'error' && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {uf.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {uf.status === 'uploading' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  {uf.status === 'complete' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  <button type="button" onClick={() => removeFile(uf.id)} className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Details Form */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Details</h3>

        <div>
          <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video Title</label>
          <input
            id="videoTitle"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="e.g. Chapter 3 — Light and Reflection (Part 1)"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="videoDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
          <textarea
            id="videoDesc"
            rows={3}
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            placeholder="Brief description of the video content..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail</label>
            <div className="flex items-center gap-3">
              {customThumbnail ? (
                <img src={customThumbnail} alt="Thumbnail" className="h-10 w-18 rounded object-cover" />
              ) : files[0]?.thumbnail ? (
                <img src={files[0].thumbnail} alt="Auto" className="h-10 w-18 rounded object-cover" />
              ) : (
                <div className="flex h-10 w-18 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Film className="mr-1 inline-block h-3.5 w-3.5" /> Upload
              </button>
              <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setFiles([]); setCustomThumbnail(null); setVideoTitle(''); setVideoDescription(''); }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={files.filter((f) => f.status === 'queued').length === 0 || !videoTitle.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" /> Upload Video
          </button>
        </div>
      </div>
    </motion.div>
  );

  /* ================================================================== */
  /*  Progress Indicator                                                 */
  /* ================================================================== */

  const steps = [
    { num: 1, label: 'Class' },
    { num: 2, label: 'Subject' },
    { num: 3, label: 'Chapter' },
    { num: 4, label: 'Upload' },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Step progress bar */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <button
              type="button"
              onClick={() => {
                // Allow going back to completed steps
                if (s.num < step) setStep(s.num as 1 | 2 | 3 | 4);
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${s.num === step
                ? 'bg-primary text-white shadow-md'
                : s.num < step
                  ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${s.num === step ? 'bg-white/20' : s.num < step ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                {s.num < step ? <CheckCircle className="h-4 w-4" /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 ${s.num < step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && <React.Fragment key="s1">{renderStep1()}</React.Fragment>}
        {step === 2 && <React.Fragment key="s2">{renderStep2()}</React.Fragment>}
        {step === 3 && <React.Fragment key="s3">{renderStep3()}</React.Fragment>}
        {step === 4 && <React.Fragment key="s4">{renderStep4()}</React.Fragment>}
      </AnimatePresence>
    </div>
  );
};

export { ContentUpload };
export default ContentUpload;
