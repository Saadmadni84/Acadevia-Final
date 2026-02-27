import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  ChevronDown,
} from 'lucide-react';
import { uploadedContentStore, type UploadedVideo } from '@/stores/uploadedContentStore';
import { CLOUD_NAME } from '@/services/cloudinary.service';

/* ------------------------------------------------------------------ */
/*  Science chapters per class                                         */
/* ------------------------------------------------------------------ */

const CLASSES = [6, 7, 8, 9, 10, 11, 12] as const;

const SCIENCE_CHAPTERS: Record<number, string[]> = {
  6: ['Food: Where Does it Come From?', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials into Groups', 'Separation of Substances', 'Changes Around Us', 'Getting to Know Plants', 'Body Movements', 'The Living Organisms and Their Surroundings', 'Motion and Measurement of Distances', 'Light, Shadows and Reflections', 'Electricity and Circuits', 'Fun with Magnets', 'Water', 'Air Around Us', 'Garbage In, Garbage Out'],
  7: ['Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat', 'Acids, Bases and Salts', 'Physical and Chemical Changes', 'Weather, Climate and Adaptations', 'Winds, Storms and Cyclones', 'Soil', 'Respiration in Organisms', 'Transportation in Animals and Plants', 'Reproduction in Plants', 'Motion and Time', 'Electric Current and its Effects', 'Light', 'Water: A Precious Resource', 'Forests: Our Lifeline', 'Wastewater Story'],
  8: ['Crop Production and Management', 'Microorganisms: Friend and Foe', 'Synthetic Fibres and Plastics', 'Materials: Metals and Non-Metals', 'Coal and Petroleum', 'Combustion and Flame', 'Conservation of Plants and Animals', 'Cell — Structure and Functions', 'Reproduction in Animals', 'Reaching the Age of Adolescence', 'Force and Pressure', 'Friction', 'Sound', 'Chemical Effects of Electric Current', 'Some Natural Phenomena', 'Light', 'Stars and the Solar System', 'Pollution of Air and Water'],
  9: ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound', 'Why Do We Fall Ill?', 'Natural Resources', 'Improvement in Food Resources'],
  10: ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Periodic Classification of Elements', 'Life Processes', 'Control and Coordination', 'How Do Organisms Reproduce?', 'Heredity and Evolution', 'Light – Reflection and Refraction', 'The Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Sources of Energy', 'Our Environment', 'Management of Natural Resources'],
  11: ['Physical World', 'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'],
  12: ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics'],
};

/* ------------------------------------------------------------------ */
/*  Download Buttons Component                                         */
/* ------------------------------------------------------------------ */

const QUALITY_OPTIONS = [
  { label: 'Original', quality: null, badge: 'Best' },
  { label: '720p HD', quality: 'c_scale,w_1280,h_720/q_auto', badge: 'HD' },
  { label: '480p', quality: 'c_scale,w_854,h_480/q_auto', badge: 'SD' },
  { label: '360p', quality: 'c_scale,w_640,h_360/q_auto', badge: 'Low' },
];

const DownloadButtons: React.FC<{ video: UploadedVideo }> = ({ video }) => {
  const [open, setOpen] = useState(false);

  const getDownloadUrl = (qualityTransform: string | null) => {
    const pid = video.cloudinaryPublicId;
    if (!qualityTransform) {
      // Original quality — use fl_attachment for download
      return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/fl_attachment/${pid}.mp4`;
    }
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${qualityTransform}/fl_attachment/${pid}.mp4`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors shadow-sm"
      >
        <Download className="h-4 w-4" />
        Download Video
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 top-12 z-20 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
        >
          {QUALITY_OPTIONS.map((opt) => (
            <a
              key={opt.label}
              href={getDownloadUrl(opt.quality)}
              download
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">{opt.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt.badge === 'Best'
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                  : opt.badge === 'HD'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                {opt.badge}
              </span>
            </a>
          ))}
        </motion.div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

type View = 'school' | 'class' | 'subject' | 'chapters' | 'player';

const CoursesPage: React.FC = () => {
  const [view, setView] = useState<View>('school');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject] = useState('Science');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [playingVideo, setPlayingVideo] = useState<UploadedVideo | null>(null);
  const [allVideos, setAllVideos] = useState<UploadedVideo[]>([]);

  // Poll localStorage every 3s so student sees new uploads immediately
  useEffect(() => {
    const load = () => setAllVideos(uploadedContentStore.getAll());
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setAllVideos(uploadedContentStore.getAll()); }, [view]);

  const chapterVideos = useMemo(() => {
    if (!selectedClass || !selectedChapter) return [];
    return allVideos.filter(
      (v) => v.classGrade === selectedClass && v.subject.toLowerCase() === selectedSubject.toLowerCase() && v.chapter.toLowerCase() === selectedChapter.toLowerCase(),
    );
  }, [selectedClass, selectedChapter, selectedSubject, allVideos]);

  const chapters = selectedClass ? SCIENCE_CHAPTERS[selectedClass] || [] : [];

  const chapterVideoCount = useMemo(() => {
    if (!selectedClass) return {};
    const counts: Record<string, number> = {};
    allVideos
      .filter((v) => v.classGrade === selectedClass && v.subject.toLowerCase() === selectedSubject.toLowerCase())
      .forEach((v) => { counts[v.chapter] = (counts[v.chapter] || 0) + 1; });
    return counts;
  }, [selectedClass, selectedSubject, allVideos]);

  const totalVideosForClass = (cls: number) => allVideos.filter((v) => v.classGrade === cls).length;

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  /* ---- School ---- */
  const renderSchool = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your School</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select your school to browse available courses</p>
      </div>
      <button type="button" onClick={() => setView('class')}
        className="w-full flex items-center gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 p-5 transition-all hover:shadow-md group">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <School className="h-7 w-7" />
        </div>
        <div className="text-left flex-1">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Shah Faiz Public School</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Class 6–12 • Science • {allVideos.length} video{allVideos.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
      </button>
    </motion.div>
  );

  /* ---- Class ---- */
  const renderClass = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setView('school')} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shah Faiz Public School</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Select your class</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CLASSES.map((cls) => {
          const count = totalVideosForClass(cls);
          return (
            <motion.button key={cls} type="button" whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedClass(cls); setView('subject'); }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 p-6 transition-all hover:shadow-md">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{cls}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Class</span>
              {count > 0 && (
                <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                  {count} video{count > 1 ? 's' : ''}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  /* ---- Subject ---- */
  const renderSubject = () => {
    const totalVids = Object.values(chapterVideoCount).reduce((a, b) => a + b, 0);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView('class')} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Class {selectedClass}</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Select subject</p>
          </div>
        </div>
        <button type="button" onClick={() => setView('chapters')}
          className="w-full flex items-center gap-4 rounded-xl border-2 border-primary bg-primary/5 p-5 transition-all hover:shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white">
            <Beaker className="h-7 w-7" />
          </div>
          <div className="text-left flex-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Science</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chapters.length} chapters{totalVids > 0 ? ` • ${totalVids} video${totalVids > 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </motion.div>
    );
  };

  /* ---- Chapters ---- */
  const renderChapters = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setView('subject')} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Class {selectedClass} — Science</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{chapters.length} chapters</p>
        </div>
      </div>
      <div className="space-y-3">
        {chapters.map((ch, idx) => {
          const count = chapterVideoCount[ch] || 0;
          return (
            <button key={ch} type="button"
              onClick={() => { setSelectedChapter(ch); setView('player'); }}
              className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${count > 0 ? 'border-gray-200 dark:border-gray-700 hover:border-primary/50' : 'border-gray-100 dark:border-gray-800 opacity-60'
                }`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{ch}</p>
                {count > 0 ? (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">{count} video{count > 1 ? 's' : ''} available</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">No videos yet</p>
                )}
              </div>
              {count > 0 ? (
                <div className="flex items-center gap-1 text-primary"><Play className="h-4 w-4" /><ChevronRight className="h-4 w-4" /></div>
              ) : (
                <BookOpen className="h-4 w-4 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  /* ---- Player ---- */
  const renderPlayer = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => { setView('chapters'); setPlayingVideo(null); }}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chapter: {selectedChapter}</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Class {selectedClass} • Science • {chapterVideos.length} video{chapterVideos.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Video Player */}
      {playingVideo && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-xl">
            <video key={playingVideo.cloudinaryUrl} controls autoPlay className="w-full h-full" poster={playingVideo.thumbnailUrl}>
              <source src={playingVideo.cloudinaryUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{playingVideo.title}</h3>
              {playingVideo.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{playingVideo.description}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                {playingVideo.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(playingVideo.duration)}</span>}
                <span>{formatSize(playingVideo.fileSize)}</span>
                <span>{new Date(playingVideo.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Download dropdown */}
            <DownloadButtons video={playingVideo} />
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          {playingVideo ? 'More Videos' : 'Videos'}
        </h3>
        {chapterVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileVideo className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">No videos uploaded yet</p>
            <p className="text-sm mt-1">Your teacher will upload lessons here</p>
          </div>
        ) : (
          chapterVideos.map((video) => (
            <button key={video.id} type="button" onClick={() => setPlayingVideo(video)}
              className={`w-full flex items-center gap-4 rounded-xl border-2 p-3 text-left transition-all hover:shadow-sm ${playingVideo?.id === video.id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
                }`}>
              <div className="relative h-16 w-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileVideo className="h-6 w-6 text-gray-400" /></div>
                )}
                {playingVideo?.id === video.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
                      <Play className="h-4 w-4 text-primary ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{video.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {video.duration && <span>{formatDuration(video.duration)}</span>}
                  <span>{formatSize(video.fileSize)}</span>
                </div>
              </div>
              {playingVideo?.id !== video.id && <Play className="h-5 w-5 text-gray-400 shrink-0" />}
            </button>
          ))
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 p-1">
      <AnimatePresence mode="wait">
        {view === 'school' && <React.Fragment key="school">{renderSchool()}</React.Fragment>}
        {view === 'class' && <React.Fragment key="class">{renderClass()}</React.Fragment>}
        {view === 'subject' && <React.Fragment key="subject">{renderSubject()}</React.Fragment>}
        {view === 'chapters' && <React.Fragment key="chapters">{renderChapters()}</React.Fragment>}
        {view === 'player' && <React.Fragment key="player">{renderPlayer()}</React.Fragment>}
      </AnimatePresence>
    </div>
  );
};

export default CoursesPage;
