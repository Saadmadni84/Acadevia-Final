import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  BookOpen,
  Gamepad2,
  Trophy,
  Sparkles,
  ArrowRight,
  Flame,
  Shield,
  Download,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  GraduationCap,
  Layers,
  Laptop,
  Globe,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/utils';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState<'all' | 'math' | 'science' | 'english'>('all');

  // Hero Video Deck
  const heroVideos = [
    {
      id: 'h_math',
      subject: 'MATHEMATICS',
      title: 'Quadratic Equations & Roots',
      classGrade: 'Class 10',
      duration: '14 min',
      rating: '4.9 ★',
      gradient: 'from-blue-900 via-indigo-950 to-slate-900',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      svgArt: (
        <svg viewBox="0 0 160 90" className="w-full h-full opacity-60 text-blue-300 fill-current">
          <path d="M 10 75 Q 80 -10 150 75" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 2" />
          <circle cx="80" cy="32" r="4" fill="#60A5FA" />
          <text x="20" y="25" fill="#BFDBFE" fontSize="9" fontFamily="monospace">ax² + bx + c = 0</text>
        </svg>
      ),
    },
    {
      id: 'h_sci',
      subject: 'SCIENCE',
      title: 'Light: Reflection & Spherical Mirrors',
      classGrade: 'Class 10',
      duration: '18 min',
      rating: '4.8 ★',
      gradient: 'from-teal-950 via-emerald-950 to-slate-900',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      svgArt: (
        <svg viewBox="0 0 160 90" className="w-full h-full opacity-60 text-teal-300 fill-current">
          <circle cx="80" cy="45" r="10" fill="#14B8A6" />
          <ellipse cx="80" cy="45" rx="60" ry="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
          <text x="25" y="22" fill="#99F6E4" fontSize="9" fontWeight="bold">1/f = 1/v + 1/u</text>
        </svg>
      ),
    },
    {
      id: 'h_game',
      subject: 'MATH QUEST',
      title: 'Number Kingdom: Rescue Star Campaign',
      classGrade: 'Class 1–4',
      duration: 'Adventure RPG',
      rating: '5.0 ★',
      gradient: 'from-amber-950 via-orange-950 to-slate-900',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      svgArt: (
        <svg viewBox="0 0 160 90" className="w-full h-full opacity-60 text-amber-300 fill-current">
          <path d="M 30 65 L 30 35 L 55 50 L 80 30 L 105 50 L 130 35 L 130 65 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="80" cy="20" r="4" fill="#FBBF24" />
        </svg>
      ),
    },
  ];

  // Subject Visual Tiles
  const subjects = [
    {
      name: 'Mathematics',
      grades: 'Class 1–12',
      desc: 'Algebra, Geometry, Trigonometry, Calculus & NCERT Solutions',
      icon: '📐',
      border: 'border-blue-500/30 hover:border-blue-500',
      bgGlow: 'bg-gradient-to-b from-blue-950/40 to-slate-900',
      accentText: 'text-blue-400',
    },
    {
      name: 'Science',
      grades: 'Class 1–12',
      desc: 'Physics, Chemistry, Biology, Optics & Experimental Labs',
      icon: '🔬',
      border: 'border-teal-500/30 hover:border-teal-500',
      bgGlow: 'bg-gradient-to-b from-teal-950/40 to-slate-900',
      accentText: 'text-teal-400',
    },
    {
      name: 'English Literature',
      grades: 'Class 1–12',
      desc: 'Grammar Essentials, Creative Writing & Classic Prose Analysis',
      icon: '📖',
      border: 'border-rose-500/30 hover:border-rose-500',
      bgGlow: 'bg-gradient-to-b from-rose-950/40 to-slate-900',
      accentText: 'text-rose-400',
    },
    {
      name: 'Social Science',
      grades: 'Class 1–12',
      desc: 'Indian & World History, Geography, Civics & Economics',
      icon: '🌍',
      border: 'border-amber-500/30 hover:border-amber-500',
      bgGlow: 'bg-gradient-to-b from-amber-950/40 to-slate-900',
      accentText: 'text-amber-400',
    },
    {
      name: 'Hindi Vyakaran',
      grades: 'Class 1–12',
      desc: 'Sahitya, Nibandh Rachna & Comprehensive Grammar Guide',
      icon: '🏛️',
      border: 'border-orange-500/30 hover:border-orange-500',
      bgGlow: 'bg-gradient-to-b from-orange-950/40 to-slate-900',
      accentText: 'text-orange-400',
    },
    {
      name: 'Computer Science',
      grades: 'Class 6–12',
      desc: 'Python Programming, Logic Building & Web Foundations',
      icon: '💻',
      border: 'border-cyan-500/30 hover:border-cyan-500',
      bgGlow: 'bg-gradient-to-b from-cyan-950/40 to-slate-900',
      accentText: 'text-cyan-400',
    },
  ];

  // Video Streaming Rails
  const streamingLessons = [
    {
      id: 'str_1',
      subject: 'MATHEMATICS',
      title: 'Quadratic Equations: Complete Discriminant Analysis',
      classGrade: 'Class 10 • Chapter 5',
      duration: '14 min',
      instructor: 'Dr. R. K. Sharma',
      views: '18.4K students',
      gradient: 'from-blue-900 to-indigo-950',
    },
    {
      id: 'str_2',
      subject: 'SCIENCE',
      title: 'Light & Optics: Ray Diagrams for Concave & Convex Mirrors',
      classGrade: 'Class 10 • Chapter 3',
      duration: '18 min',
      instructor: 'Prof. A. Verma',
      views: '14.2K students',
      gradient: 'from-teal-950 to-emerald-950',
    },
    {
      id: 'str_3',
      subject: 'ENGLISH',
      title: 'Complete English Grammar & Sentence Composition Masterclass',
      classGrade: 'Class 10 • Grammar',
      duration: '22 min',
      instructor: 'Mrs. S. Sen',
      views: '9.8K students',
      gradient: 'from-rose-950 to-pink-950',
    },
  ];

  return (
    <div className="w-full bg-[#080B10] text-[#F8FAFC] selection:bg-blue-500/30 selection:text-blue-200">
      {/* ==================================================== */}
      {/* 1. CINEMATIC HERO SECTION                            */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#1E293B]">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151E2B] border border-blue-500/30 text-blue-400 text-xs font-extrabold shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Next-Generation Student Learning Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Learn.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
                Play.
              </span>{' '}
              Achieve.
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] font-medium leading-relaxed max-w-xl">
              Immerse yourself in cinematic video lessons, interactive problem-solving, curriculum quest games, and personalized mastery for Classes 1 to 12.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => navigate(ROUTES.REGISTER)}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="w-full sm:w-auto py-3.5 px-8 font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/30 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Start Learning Free
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(ROUTES.COURSES)}
                leftIcon={<Play className="h-4 w-4 text-cyan-400 fill-current" />}
                className="w-full sm:w-auto py-3.5 px-6 font-bold text-sm rounded-2xl border-[#2A374A] hover:border-blue-400/60 bg-[#0E141E] hover:bg-[#151E2B] text-white cursor-pointer"
              >
                Explore Courses
              </Button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 border-t border-[#1E293B]/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-xl font-extrabold text-white block">100K+</span>
                <span className="text-xs text-[#94A3B8]">Active Students</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-blue-400 block">Class 1–12</span>
                <span className="text-xs text-[#94A3B8]">CBSE & State Board</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-cyan-400 block">Offline Ready</span>
                <span className="text-xs text-[#94A3B8]">360p / 480p / 720p</span>
              </div>
            </div>
          </div>

          {/* Right: Floating Video Hero Composition */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative space-y-3">
              {heroVideos.map((vid, idx) => (
                <motion.div
                  key={vid.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => navigate(ROUTES.COURSES)}
                  className={cn(
                    'rounded-3xl border border-[#1E293B] bg-[#0E141E] overflow-hidden shadow-2xl transition-all cursor-pointer group flex flex-col sm:flex-row items-center justify-between',
                    idx === 0 ? 'ring-1 ring-blue-500/40 bg-[#121926]' : 'opacity-90'
                  )}
                >
                  <div className={cn('h-28 sm:h-32 w-full sm:w-48 p-4 flex flex-col justify-between bg-gradient-to-r text-white relative shrink-0', vid.gradient)}>
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-extrabold border', vid.tagColor)}>
                        {vid.subject}
                      </span>
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-end pointer-events-none pr-2">
                      {vid.svgArt}
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-[11px] font-bold">
                      <span>{vid.classGrade}</span>
                      <span>{vid.duration}</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 min-w-0 flex items-center justify-between gap-4 w-full">
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors truncate">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{vid.rating} Student Rating</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all shadow-md">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. POPULAR SUBJECTS SECTION                          */}
      {/* ==================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-blue-400 uppercase block">
              Curriculum Discovery
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Explore Popular Subjects
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md">
            Comprehensive chapter-by-chapter coverage engineered for conceptual depth and exam excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub.name}
              onClick={() => navigate(ROUTES.COURSES)}
              className={cn(
                'rounded-3xl border p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-56 bg-[#0E141E] group',
                sub.border,
                sub.bgGlow
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 rounded-2xl bg-[#151E2B] border border-white/10 shadow-sm">
                  {sub.icon}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/10">
                  {sub.grades}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className={cn('text-lg font-extrabold text-white group-hover:text-blue-400 transition-colors')}>
                  {sub.name}
                </h3>
                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed font-medium">
                  {sub.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Browse Syllabus</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. VIDEO LEARNING: STREAMING COURSE RAILS            */}
      {/* ==================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-[#1E293B] bg-[#0A0E15]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase block">
                Cinematic Video Library
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Master Difficult Concepts Visually
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.COURSES)}
              className="border-[#2A374A] hover:border-cyan-400 text-white cursor-pointer font-bold"
            >
              View All Video Lessons →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {streamingLessons.map((l) => (
              <div
                key={l.id}
                onClick={() => navigate(ROUTES.COURSES)}
                className="rounded-3xl border border-[#1E293B] bg-[#0E141E] overflow-hidden shadow-xl hover:shadow-2xl hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className={cn('h-40 w-full p-5 flex flex-col justify-between bg-gradient-to-br text-white relative', l.gradient)}>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-extrabold self-start border border-white/10">
                    {l.subject}
                  </span>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>{l.classGrade}</span>
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                      <Clock className="h-3 w-3" />
                      {l.duration}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h4 className="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {l.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#1E293B]">
                    <span>{l.instructor}</span>
                    <span>{l.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. LEARN THROUGH PLAY: QUEST GAMES SHOWCASE          */}
      {/* ==================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-amber-400 uppercase block">
              Prodigy-Inspired Quests
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Learn Through Play 🎮
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md">
            Transform rote homework into immersive adventure campaigns and mathematical boss battles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game 1: Number Kingdom */}
          <div
            onClick={() => navigate('/games/number-kingdom')}
            className="rounded-3xl border border-amber-500/30 bg-[#0E141E] overflow-hidden shadow-2xl hover:border-amber-500 transition-all cursor-pointer group"
          >
            <div className="h-44 p-6 bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 text-white flex flex-col justify-between relative">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold self-start">
                Class 1–4 Mini RPG Adventure
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl">👑</span>
                <div>
                  <h3 className="text-2xl font-black text-white">Number Kingdom</h3>
                  <p className="text-xs text-amber-200">Rescue the Magical Stars Campaign</p>
                </div>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between gap-4">
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Explore villages, board magical trains, repair bridges, and unlock the King's Royal Castle through physical drag/click math challenges.
              </p>
              <Button variant="gradient" size="md" className="shrink-0 font-extrabold text-xs shadow-lg">
                PLAY QUEST ⚔️
              </Button>
            </div>
          </div>

          {/* Game 2: Trigonometry Quest */}
          <div
            onClick={() => navigate('/games/trigonometry-quest')}
            className="rounded-3xl border border-indigo-500/30 bg-[#0E141E] overflow-hidden shadow-2xl hover:border-indigo-500 transition-all cursor-pointer group"
          >
            <div className="h-44 p-6 bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 text-white flex flex-col justify-between relative">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-extrabold self-start">
                Class 9–12 Battle Simulator
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚔️</span>
                <div>
                  <h3 className="text-2xl font-black text-white">Trigonometry Quest</h3>
                  <p className="text-xs text-indigo-200">Sin, Cos & ASTC Titan Arena</p>
                </div>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between gap-4">
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Master unit circle coordinates, angle conversions, and quadrant signs to deal critical combo damage and defeat the Trigonometric Titan.
              </p>
              <Button variant="gradient" size="md" className="shrink-0 font-extrabold text-xs shadow-lg">
                PLAY QUEST ⚔️
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 5. OFFLINE LEARNING SPOTLIGHT                        */}
      {/* ==================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#1E293B] bg-[#0A0E15]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-extrabold">
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Offline Learning Center</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Study Anywhere. No Wi-Fi Needed.
            </h2>

            <p className="text-sm sm:text-base text-[#94A3B8] font-medium leading-relaxed">
              Download complete course chapters in compressed <span className="text-white font-bold">360p Low Data</span>, <span className="text-white font-bold">480p Recommended</span>, or <span className="text-white font-bold">720p HD</span> formats. Watch videos offline with instant progress synchronization.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0E141E] border border-[#1E293B] text-center">
                <span className="text-lg font-black text-cyan-400 block">360p</span>
                <span className="text-[11px] text-[#94A3B8]">~25 MB / Video</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0E141E] border border-[#1E293B] text-center">
                <span className="text-lg font-black text-blue-400 block">480p</span>
                <span className="text-[11px] text-[#94A3B8]">Recommended</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0E141E] border border-[#1E293B] text-center">
                <span className="text-lg font-black text-white block">720p</span>
                <span className="text-[11px] text-[#94A3B8]">Full HD Clarity</span>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate(ROUTES.DOWNLOADS)}
              className="mt-4 font-bold cursor-pointer"
            >
              Explore Offline Center →
            </Button>
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0E141E] border border-[#1E293B] shadow-2xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Offline Storage Engine (IndexedDB)
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#151E2B] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    📐
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[180px]">Quadratic Equations (50 MB)</span>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Available Offline</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-white">480p</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#151E2B] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    🔬
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[180px]">Spherical Mirrors (70 MB)</span>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Available Offline</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-white">480p</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 6. FINAL CINEMATIC CALL TO ACTION                    */}
      {/* ==================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#080B10] via-blue-950/20 to-[#080B10]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Start Your Learning Journey Today
          </h2>
          <p className="text-base text-[#94A3B8] font-medium leading-relaxed">
            Join thousands of school students excelling in mathematics, science, and languages through Acadevia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="py-4 px-10 text-base font-extrabold rounded-2xl shadow-xl shadow-blue-600/30 cursor-pointer"
            >
              Create Free Account →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="py-4 px-8 text-base font-bold rounded-2xl border-[#2A374A] hover:border-white text-white cursor-pointer"
            >
              Sign In to Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
export { LandingPage };
