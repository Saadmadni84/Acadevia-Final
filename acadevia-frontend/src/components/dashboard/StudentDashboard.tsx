import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  Flame,
  Trophy,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  GraduationCap,
  Gamepad2,
  CheckCircle2,
  Circle,
  Compass,
  ChevronRight,
  Download,
  Zap,
  Star,
  Check,
  Award,
  Layers,
  BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { getXPForNextLevel, LEVEL_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { xp, level, streak } = useGamificationStore();
  const dailyGoalSetting = useSettingsStore((s) => s.settings.dailyGoalMinutes) || 45;

  const xpInfo = getXPForNextLevel(xp);
  const studentName = user?.fullName?.split(' ')[0] || 'Gaurav';
  const studentClass = user?.className || 'Class 10';
  const schoolName = user?.schoolName || 'Delhi Public School';

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's Learning Activity Target (Minutes)
  const todayMinutes = 20;
  const dailyGoalPct = Math.min(100, Math.round((todayMinutes / dailyGoalSetting) * 100));
  const minutesRemaining = Math.max(0, dailyGoalSetting - todayMinutes);

  // A. In-Progress Lessons for "Continue Learning" (Large Visual Cards with Artwork)
  const continueLessons = [
    {
      id: 'less_math_10_quad',
      subject: 'MATHEMATICS',
      meta: `${studentClass} • Chapter 5`,
      title: 'Quadratic Equations',
      subtitle: 'Nature of Roots, Discriminant & Parabolic Graphs',
      progressPct: 65,
      timeLeft: '12 min left',
      lessonId: 'less_math_10_quad',
      accentColor: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'hover:border-blue-500/50',
      barColor: 'bg-blue-600',
      themeBg: 'from-blue-900 via-indigo-950 to-slate-900',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      icon: '📐',
      svgArtwork: (
        <svg viewBox="0 0 200 120" className="w-full h-full opacity-60 text-blue-300 fill-current">
          <path d="M 10 100 Q 100 -20 190 100" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 2" />
          <line x1="20" y1="90" x2="180" y2="90" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <line x1="100" y1="10" x2="100" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <circle cx="100" cy="40" r="5" fill="#60A5FA" />
          <text x="110" y="42" fill="#93C5FD" fontSize="10" fontWeight="bold">V(h, k)</text>
          <text x="30" y="30" fill="#BFDBFE" fontSize="11" fontFamily="monospace">ax² + bx + c = 0</text>
        </svg>
      ),
    },
    {
      id: 'less_sci_10_light',
      subject: 'SCIENCE',
      meta: `${studentClass} • Chapter 3`,
      title: 'Light & Reflection',
      subtitle: 'Spherical Mirrors, Ray Diagrams & Sign Convention',
      progressPct: 35,
      timeLeft: '18 min left',
      lessonId: 'less_sci_10_light',
      accentColor: 'text-teal-600 dark:text-teal-400',
      accentBorder: 'hover:border-teal-500/50',
      barColor: 'bg-teal-600',
      themeBg: 'from-teal-950 via-emerald-950 to-slate-900',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      icon: '🔬',
      svgArtwork: (
        <svg viewBox="0 0 200 120" className="w-full h-full opacity-60 text-teal-300 fill-current">
          <ellipse cx="100" cy="60" rx="80" ry="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
          <circle cx="100" cy="60" r="14" fill="#14B8A6" opacity="0.8" />
          <circle cx="60" cy="45" r="4" fill="#5EEAD4" />
          <circle cx="140" cy="75" r="4" fill="#5EEAD4" />
          <path d="M 20 60 L 180 60 M 100 20 L 100 100" stroke="#2DD4BF" strokeWidth="1.5" opacity="0.5" />
          <text x="30" y="25" fill="#99F6E4" fontSize="10" fontWeight="bold">1/f = 1/v + 1/u</text>
        </svg>
      ),
    },
  ];

  // B. Subject Progress (4 Rich Subject Cards with Themed Visuals)
  const subjectsProgress = [
    {
      name: 'Mathematics',
      icon: '📐',
      completed: 8,
      total: 12,
      progressPct: 67,
      courseId: 'c_math',
      cardStyle: 'bg-gradient-to-br from-blue-500/10 via-blue-50/50 to-indigo-50/40 dark:from-blue-950/40 dark:via-gray-900/50 dark:to-indigo-950/20 border-blue-200/80 dark:border-blue-900/50',
      accentBar: 'bg-blue-600',
      textColor: 'text-blue-900 dark:text-blue-200',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/30',
      badge: 'Algebra & Geo',
    },
    {
      name: 'Science',
      icon: '🔬',
      completed: 4,
      total: 10,
      progressPct: 40,
      courseId: 'c_sci',
      cardStyle: 'bg-gradient-to-br from-teal-500/10 via-teal-50/50 to-emerald-50/40 dark:from-teal-950/40 dark:via-gray-900/50 dark:to-emerald-950/20 border-teal-200/80 dark:border-teal-900/50',
      accentBar: 'bg-teal-600',
      textColor: 'text-teal-900 dark:text-teal-200',
      iconBg: 'bg-teal-600 text-white shadow-teal-500/30',
      badge: 'Physics & Chem',
    },
    {
      name: 'English Literature',
      icon: '📖',
      completed: 5,
      total: 8,
      progressPct: 62,
      courseId: 'c_eng',
      cardStyle: 'bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-pink-50/40 dark:from-rose-950/40 dark:via-gray-900/50 dark:to-pink-950/20 border-rose-200/80 dark:border-rose-900/50',
      accentBar: 'bg-rose-500',
      textColor: 'text-rose-900 dark:text-rose-200',
      iconBg: 'bg-rose-500 text-white shadow-rose-500/30',
      badge: 'Grammar & Prose',
    },
    {
      name: 'Social Science',
      icon: '🌍',
      completed: 3,
      total: 9,
      progressPct: 33,
      courseId: 'c_soc',
      cardStyle: 'bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50/40 dark:from-amber-950/40 dark:via-gray-900/50 dark:to-orange-950/20 border-amber-200/80 dark:border-amber-900/50',
      accentBar: 'bg-amber-500',
      textColor: 'text-amber-900 dark:text-amber-200',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
      badge: 'History & Civics',
    },
  ];

  // C. Daily Missions / Goals
  const dailyMissions = [
    { id: 'm1', title: 'Complete 2 video lectures', completed: false, current: 1, target: 2, xp: '+40 XP', link: ROUTES.COURSES },
    { id: 'm2', title: 'Play 1 curriculum game quest', completed: true, current: 1, target: 1, xp: '+50 XP', link: ROUTES.GAMES },
    { id: 'm3', title: 'Score 80%+ on concept quiz', completed: false, current: 75, target: 100, xp: '+60 XP', link: ROUTES.QUIZ },
  ];
  const completedMissionsCount = dailyMissions.filter((m) => m.completed).length;

  // D. Personalized Recommendations (Discovery Cards)
  const recommendations = [
    {
      id: 'rec_1',
      subject: 'MATHEMATICS',
      title: 'Graphs of Quadratic Functions & Parabola Vertex',
      meta: 'Class 10 • Coordinate Geometry',
      reason: 'Because you completed Quadratic Equations (Part 1)',
      xpReward: '+60 XP',
      duration: '15 mins',
      lessonId: 'less_math_10_quad',
      bgGradient: 'from-blue-600 to-indigo-700',
      icon: '📊',
    },
    {
      id: 'rec_2',
      subject: 'SCIENCE',
      title: 'Refraction through Glass Prism & Light Dispersion',
      meta: 'Class 10 • Light & Optics',
      reason: 'Next recommended chapter in Ray Optics curriculum',
      xpReward: '+80 XP',
      duration: '20 mins',
      lessonId: 'less_sci_10_light',
      bgGradient: 'from-teal-600 to-emerald-700',
      icon: '🌈',
    },
  ];

  // E. Topics to Practice (Skill Health Assistant)
  const practiceTopics = [
    { name: 'Trigonometric Ratios (Tan & Cos values)', status: 'Needs Practice', mastery: 42, dotColor: 'bg-rose-500', badgeStyle: 'text-rose-700 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300' },
    { name: 'Ray Diagrams for Concave Lenses', status: 'Improving', mastery: 58, dotColor: 'bg-amber-500', badgeStyle: 'text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300' },
    { name: 'Subject-Verb Agreement & Syntax', status: 'Strong', mastery: 64, dotColor: 'bg-blue-500', badgeStyle: 'text-blue-700 bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300' },
  ];

  // F. Learn Through Play (Game Adventure Cards)
  const gameQuests = [
    {
      id: 'number-kingdom',
      title: 'Number Kingdom',
      genre: 'Rescue Math Adventure',
      grade: 'Class 1–4',
      reward: '+150 XP',
      icon: '👑',
      link: '/games/number-kingdom',
      bannerBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white',
      cardBorder: 'border-amber-300/80 dark:border-amber-700/60',
    },
    {
      id: 'trigonometry-quest',
      title: 'Trigonometry Quest',
      genre: 'Sin/Cos Titan Battle',
      grade: 'Class 9–12',
      reward: '+200 XP',
      icon: '⚔️',
      link: '/games/trigonometry-quest',
      bannerBg: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white',
      cardBorder: 'border-indigo-300/80 dark:border-indigo-700/60',
    },
  ];

  // G. Recent Activity (Connected Timeline)
  const activityTimeline = [
    { id: '1', title: 'Completed Quadratic Equations (Part 1)', xp: '+50 XP', time: '2 hours ago', icon: '✓', dotColor: 'bg-emerald-500' },
    { id: '2', title: 'Passed Light & Reflection Concept Quiz', xp: '+80 XP', time: 'Yesterday', icon: '🏆', dotColor: 'bg-amber-500' },
    { id: '3', title: 'Earned Math Explorer Badge', xp: '+100 XP', time: '2 days ago', icon: '⭐', dotColor: 'bg-indigo-500' },
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-14 select-none">
      {/* ==================================================== */}
      {/* 1. HERO SECTION: VISUALLY RICH LEARNING BANNER       */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-7 sm:p-9 shadow-lg border border-slate-800">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Greeting & Daily Goal Progress */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <span>{studentClass}</span>
              <span>•</span>
              <span className="truncate">{schoolName}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {greeting}, {studentName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                You've completed <span className="font-bold text-blue-300">{todayMinutes} minutes</span> of focused study today.
                {minutesRemaining > 0
                  ? ` ${minutesRemaining} mins to reach your daily goal!`
                  : ` 🎉 Daily goal accomplished!`}
              </p>
            </div>

            {/* Daily Goal Visual Bar */}
            <div className="space-y-2 pt-1 max-w-md bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
              <div className="flex justify-between text-xs font-extrabold">
                <span className="text-slate-300">Today's Focus Goal</span>
                <span className="text-blue-300">{todayMinutes} / {dailyGoalSetting} mins ({dailyGoalPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Educational Stats & Primary CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            {/* Badges Bar */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-extrabold shadow-xs">
                <Flame className="h-4 w-4 fill-orange-400 text-orange-400" />
                <span>{streak || 5} Day Streak</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold shadow-xs">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>Level {level}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-extrabold shadow-xs">
                <Zap className="h-4 w-4 fill-blue-400 text-blue-400" />
                <span>{xp} XP</span>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate(ROUTES.COURSES)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="cursor-pointer font-bold shadow-lg shadow-blue-900/40 w-full sm:w-auto text-sm py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              Continue Learning →
            </Button>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. CONTINUE LEARNING: LARGE VISUAL COURSE CARDS      */}
      {/* ==================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Continue Learning
            </h2>
            <p className="text-xs text-gray-500 font-medium">Pick up right where you left off</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.COURSES)}
            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Browse All Courses</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {continueLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/lesson/${lesson.lessonId}`)}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-card-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between'
              )}
            >
              {/* Top 35% Visual Artwork Banner */}
              <div className={cn('relative h-32 w-full p-5 overflow-hidden flex items-center justify-between bg-gradient-to-r text-white', lesson.themeBg)}>
                <div className="relative z-10 space-y-1">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border', lesson.tagColor)}>
                    {lesson.icon} {lesson.subject}
                  </span>
                  <p className="text-xs text-slate-300 font-semibold">{lesson.meta}</p>
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pointer-events-none pr-4">
                  {lesson.svgArtwork}
                </div>

                <span className="relative z-10 text-[11px] font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full text-white flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.timeLeft}
                </span>
              </div>

              {/* Card Body & Action Controls */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">
                    {lesson.subtitle}
                  </p>
                </div>

                {/* Progress Bar & CTA */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                    <span>Lesson Progress</span>
                    <span className="text-blue-600 dark:text-blue-400">{lesson.progressPct}% complete</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', lesson.barColor)}
                      style={{ width: `${lesson.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                    <Play className="h-4 w-4 fill-current" />
                    Resume Video Lecture →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. YOUR SUBJECTS: 4 COLOR-THEMED CURRICULUM CARDS    */}
      {/* ==================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Subjects
          </h2>
          <p className="text-xs text-gray-500 font-medium">Class {studentClass} core syllabus coverage</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectsProgress.map((sub) => (
            <div
              key={sub.name}
              onClick={() => navigate(ROUTES.COURSES)}
              className={cn(
                'rounded-3xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between h-36',
                sub.cardStyle
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-md', sub.iconBg)}>
                  {sub.icon}
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 shadow-2xs">
                  {sub.progressPct}%
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className={cn('font-extrabold text-sm', sub.textColor)}>
                    {sub.name}
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {sub.completed} of {sub.total} chapters completed
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-200/80 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', sub.accentBar)}
                    style={{ width: `${sub.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. BALANCED 2-COLUMN MAIN + SIDEBAR LAYOUT           */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================================================== */}
        {/* LEFT COLUMN (70% ~ 8 Cols): Recommendations, Play, */}
        {/* and Timeline Feed                                  */}
        {/* ================================================== */}
        <div className="lg:col-span-8 space-y-8">
          {/* A. RECOMMENDED FOR YOU (Visual Discovery Cards) */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recommended for You
              </h2>
              <p className="text-xs text-gray-500 font-medium">Personalized next chapters based on your active progress</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/lesson/${rec.lessonId}`)}
                  className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rec.icon}</span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {rec.meta}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                        {rec.xpReward}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-medium">
                        "{rec.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-400">
                      Duration: {rec.duration}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      Start Lesson →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. LEARN THROUGH PLAY: QUEST BANNERS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Learn Through Play</span>
                  <span className="text-base">🎮</span>
                </h2>
                <p className="text-xs text-gray-500 font-medium">Prodigy-inspired learning adventure quests and boss challenges</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Game Library</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameQuests.map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate(g.link)}
                  className={cn(
                    'rounded-3xl border p-5 transition-all cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 group flex items-center justify-between gap-4 bg-white dark:bg-card-dark',
                    g.cardBorder
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {g.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {g.grade}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                          {g.reward}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate mt-0.5">
                        {g.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate font-medium">
                        {g.genre}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    size="sm"
                    className="cursor-pointer text-xs font-bold shrink-0 shadow-md"
                  >
                    PLAY QUEST
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* C. RECENT ACTIVITY (CONNECTED TIMELINE) */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-gray-500 font-medium">Your latest study milestones and rewards</p>
            </div>

            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 shadow-xs space-y-4">
              {activityTimeline.map((act, idx) => (
                <div key={act.id} className="flex items-start gap-4 relative">
                  {/* Vertical Line */}
                  {idx !== activityTimeline.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -mb-4" />
                  )}

                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm z-10', act.dotColor)}>
                    {act.icon}
                  </div>

                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {act.title}
                      </h4>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        {act.xp}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ================================================== */}
        {/* RIGHT COLUMN (30% ~ 4 Cols): Missions Widget,      */}
        {/* Streak, Topics to Practice, and Quick Actions      */}
        {/* ================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. DAILY MISSIONS MOTIVATION WIDGET */}
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Today's Missions
                </h3>
              </div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40">
                {completedMissionsCount} / {dailyMissions.length} Complete
              </span>
            </div>

            <div className="space-y-3">
              {dailyMissions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate(m.link)}
                  className={cn(
                    'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs',
                    m.completed
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/60 hover:border-blue-400'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 shrink-0" />
                    )}
                    <span className={cn('text-xs font-bold truncate', m.completed && 'line-through text-gray-500')}>
                      {m.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-gray-700 shadow-2xs text-amber-600 shrink-0">
                    {m.xp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. STREAK MOTIVATION WIDGET */}
          <div className="rounded-3xl border border-orange-200 dark:border-orange-900/40 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-white dark:from-orange-950/30 dark:to-gray-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <Flame className="h-7 w-7 fill-current" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-gray-900 dark:text-white block">
                  {streak || 5} Day Streak 🔥
                </span>
                <span className="text-xs text-orange-900/80 dark:text-orange-200/80 font-medium">
                  You're on a roll! Keep learning daily.
                </span>
              </div>
            </div>

            {/* Week Dots */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {weekDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400">{d}</span>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs',
                      i < (streak || 5)
                        ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/30'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                    )}
                  >
                    {i < (streak || 5) ? <Check className="h-4 w-4" /> : '•'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TOPICS TO PRACTICE (SKILL HEALTH ASSISTANT) */}
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-rose-500" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Topics to Practice
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400">Quiz Analytics</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Concept health radar based on your recent quiz attempts:
            </p>

            <div className="space-y-3.5">
              {practiceTopics.map((topic) => (
                <div key={topic.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                      {topic.name}
                    </span>
                    <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full', topic.badgeStyle)}>
                      {topic.status} ({topic.mastery}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', topic.dotColor)}
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.QUIZ)}
              className="w-full mt-2 cursor-pointer text-xs font-bold border-rose-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
            >
              Practice Weak Topics →
            </Button>
          </div>

          {/* 4. COMPACT QUICK ACTIONS */}
          <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 shadow-xs space-y-3">
            <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => navigate(ROUTES.COURSES)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>Courses</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.QUIZ)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-teal-500 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <GraduationCap className="h-4 w-4 text-teal-600" />
                <span>Quizzes</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <Gamepad2 className="h-4 w-4 text-indigo-600" />
                <span>Play Games</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DOWNLOADS)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-amber-500 text-gray-700 dark:text-gray-300 hover:text-amber-600 transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <Download className="h-4 w-4 text-amber-600" />
                <span>Offline</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
