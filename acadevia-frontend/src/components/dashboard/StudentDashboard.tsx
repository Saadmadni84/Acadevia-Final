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

  // A. Continue Learning (Visual Benchmark with Subject Artwork)
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
      accentColor: 'text-primary dark:text-purple-300',
      barColor: 'bg-primary',
      themeBg: 'from-[#2A1138] via-[#3A1B47] to-[#5B2C6F]',
      tagColor: 'bg-white/20 text-purple-200 border-white/20',
      icon: '📐',
      svgArtwork: (
        <svg viewBox="0 0 200 120" className="w-full h-full opacity-60 text-purple-200 fill-current">
          <path d="M 10 100 Q 100 -20 190 100" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 2" />
          <line x1="20" y1="90" x2="180" y2="90" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <line x1="100" y1="10" x2="100" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <circle cx="100" cy="40" r="5" fill="#DDBFE8" />
          <text x="110" y="42" fill="#E8DBF0" fontSize="10" fontWeight="bold">V(h, k)</text>
          <text x="30" y="30" fill="#F0E8F4" fontSize="11" fontFamily="monospace">ax² + bx + c = 0</text>
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
      barColor: 'bg-secondary',
      themeBg: 'from-[#093530] via-[#0D4D46] to-[#159A8C]',
      tagColor: 'bg-white/20 text-teal-200 border-white/20',
      icon: '🔬',
      svgArtwork: (
        <svg viewBox="0 0 200 120" className="w-full h-full opacity-60 text-teal-200 fill-current">
          <ellipse cx="100" cy="60" rx="80" ry="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
          <circle cx="100" cy="60" r="14" fill="#2DD4BF" opacity="0.8" />
          <circle cx="60" cy="45" r="4" fill="#99F6E4" />
          <circle cx="140" cy="75" r="4" fill="#99F6E4" />
          <path d="M 20 60 L 180 60 M 100 20 L 100 100" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.5" />
          <text x="30" y="25" fill="#CCFBF1" fontSize="10" fontWeight="bold">1/f = 1/v + 1/u</text>
        </svg>
      ),
    },
  ];

  // B. Your Subjects (Distinct 4-Subject Cards with Educational Headers)
  const subjectsProgress = [
    {
      name: 'Mathematics',
      icon: '📐',
      completed: 8,
      total: 12,
      progressPct: 67,
      courseId: 'c_math',
      cardBorder: 'border-[#E8E2D8] dark:border-[#382447] hover:border-primary/60',
      headerGradient: 'from-[#2A1138] via-[#3A1B47] to-[#5B2C6F]',
      barColor: 'bg-primary',
      textColor: 'text-primary dark:text-purple-300',
      svgMini: (
        <svg viewBox="0 0 100 60" className="w-full h-full opacity-50 text-purple-200">
          <path d="M 5 50 Q 50 5 95 50" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="45" x2="90" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="50" cy="27" r="3" fill="#DDBFE8" />
        </svg>
      ),
    },
    {
      name: 'Science',
      icon: '🔬',
      completed: 4,
      total: 10,
      progressPct: 40,
      courseId: 'c_sci',
      cardBorder: 'border-[#E8E2D8] dark:border-[#382447] hover:border-secondary/60',
      headerGradient: 'from-[#093530] via-[#0D4D46] to-[#159A8C]',
      barColor: 'bg-secondary',
      textColor: 'text-secondary dark:text-teal-300',
      svgMini: (
        <svg viewBox="0 0 100 60" className="w-full h-full opacity-50 text-teal-200">
          <circle cx="50" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="30" r="4" fill="#2DD4BF" />
          <ellipse cx="50" cy="30" rx="35" ry="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        </svg>
      ),
    },
    {
      name: 'English Literature',
      icon: '📖',
      completed: 5,
      total: 8,
      progressPct: 62,
      courseId: 'c_eng',
      cardBorder: 'border-[#E8E2D8] dark:border-[#382447] hover:border-accent/60',
      headerGradient: 'from-[#4D1520] via-[#6B1B29] to-[#E85D75]',
      barColor: 'bg-accent',
      textColor: 'text-accent dark:text-rose-300',
      svgMini: (
        <svg viewBox="0 0 100 60" className="w-full h-full opacity-50 text-rose-200">
          <path d="M 20 45 Q 50 35 80 45 L 80 20 Q 50 10 20 20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="12" x2="50" y2="40" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      name: 'Social Science',
      icon: '🌍',
      completed: 3,
      total: 9,
      progressPct: 33,
      courseId: 'c_soc',
      cardBorder: 'border-[#E8E2D8] dark:border-[#382447] hover:border-warning/60',
      headerGradient: 'from-[#422905] via-[#5C3A0A] to-[#E5A11A]',
      barColor: 'bg-warning',
      textColor: 'text-warning dark:text-amber-300',
      svgMini: (
        <svg viewBox="0 0 100 60" className="w-full h-full opacity-50 text-amber-200">
          <circle cx="50" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="50" cy="30" rx="9" ry="18" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="30" x2="68" y2="30" stroke="currentColor" strokeWidth="1" />
        </svg>
      ),
    },
  ];

  // C. Daily Missions / Goals (Gamified Motivation Panel)
  const dailyMissions = [
    { id: 'm1', title: 'Complete 2 video lectures', completed: false, current: 1, target: 2, xp: '+40 XP', link: ROUTES.COURSES },
    { id: 'm2', title: 'Play 1 curriculum game quest', completed: true, current: 1, target: 1, xp: '+50 XP', link: ROUTES.GAMES },
    { id: 'm3', title: 'Score 80%+ on concept quiz', completed: false, current: 75, target: 100, xp: '+60 XP', link: ROUTES.QUIZ },
  ];
  const completedMissionsCount = dailyMissions.filter((m) => m.completed).length;

  // D. Personalized Recommendations (Visual Discovery Cards)
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
      bgGradient: 'from-[#2A1138] via-[#3A1B47] to-[#5B2C6F]',
      icon: '📊',
      svgArtwork: (
        <svg viewBox="0 0 120 70" className="w-full h-full opacity-60 text-purple-200">
          <path d="M 10 60 Q 60 5 110 60" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="60" cy="32" r="3.5" fill="#DDBFE8" />
          <line x1="15" y1="55" x2="105" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </svg>
      ),
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
      bgGradient: 'from-[#093530] via-[#0D4D46] to-[#159A8C]',
      icon: '🌈',
      svgArtwork: (
        <svg viewBox="0 0 120 70" className="w-full h-full opacity-60 text-teal-200">
          <polygon points="60,10 20,60 100,60" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="35" x2="45" y2="35" stroke="#FDE047" strokeWidth="1.5" />
          <line x1="75" y1="40" x2="115" y2="25" stroke="#E85D75" strokeWidth="1.5" />
          <line x1="75" y1="40" x2="115" y2="45" stroke="#60A5FA" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  // E. Topics to Practice (Skill Health Assistant)
  const practiceTopics = [
    { name: 'Trigonometric Ratios (Tan & Cos values)', status: 'Needs Practice', mastery: 42, dotColor: 'bg-accent', badgeStyle: 'text-accent bg-accent/10 dark:bg-accent/20' },
    { name: 'Ray Diagrams for Concave Lenses', status: 'Improving', mastery: 58, dotColor: 'bg-warning', badgeStyle: 'text-warning bg-warning/10 dark:bg-warning/20' },
    { name: 'Subject-Verb Agreement & Syntax', status: 'Strong', mastery: 64, dotColor: 'bg-primary', badgeStyle: 'text-primary dark:text-purple-300 bg-primary/10 dark:bg-primary/20' },
  ];

  // F. Learn Through Play (Game Adventure Cards with Visual Headers)
  const gameQuests = [
    {
      id: 'number-kingdom',
      title: 'Number Kingdom',
      genre: 'Rescue Math Adventure',
      grade: 'Class 1–4',
      reward: '+150 XP',
      icon: '👑',
      link: '/games/number-kingdom',
      headerBg: 'from-[#422905] via-[#5C3A0A] to-[#E5A11A]',
      cardBorder: 'border-[#E8E2D8] dark:border-[#382447] hover:border-warning/60',
      svgArt: (
        <svg viewBox="0 0 120 70" className="w-full h-full opacity-60 text-amber-200">
          <path d="M 30 50 L 30 25 L 45 35 L 60 20 L 75 35 L 90 25 L 90 50 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="60" cy="15" r="2.5" fill="#FDE047" />
          <circle cx="30" cy="20" r="2" fill="#FDE047" />
          <circle cx="90" cy="20" r="2" fill="#FDE047" />
        </svg>
      ),
    },
    {
      id: 'trigonometry-quest',
      title: 'Trigonometry Quest',
      genre: 'Sin/Cos Titan Battle',
      grade: 'Class 9–12',
      reward: '+200 XP',
      icon: '⚔️',
      link: '/games/trigonometry-quest',
      headerBg: 'from-[#2A1138] via-[#3A1B47] to-[#5B2C6F]',
      cardBorder: 'border-[#E8E2D8] dark:border-[#382447] hover:border-primary/60',
      svgArt: (
        <svg viewBox="0 0 120 70" className="w-full h-full opacity-60 text-purple-200">
          <circle cx="60" cy="35" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="60" y1="10" x2="60" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="35" y1="35" x2="85" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="60" y1="35" x2="76" y2="19" stroke="#DDBFE8" strokeWidth="2" />
          <text x="80" y="24" fill="#F0E8F4" fontSize="8" fontWeight="bold">θ</text>
        </svg>
      ),
    },
  ];

  // G. Recent Activity (Connected Timeline)
  const activityTimeline = [
    { id: '1', title: 'Completed Quadratic Equations (Part 1)', xp: '+50 XP', time: '2 hours ago', icon: '✓', dotColor: 'bg-success', badgeColor: 'text-success' },
    { id: '2', title: 'Passed Light & Reflection Concept Quiz', xp: '+80 XP', time: 'Yesterday', icon: '🏆', dotColor: 'bg-warning', badgeColor: 'text-warning' },
    { id: '3', title: 'Earned Math Explorer Badge', xp: '+100 XP', time: '2 days ago', icon: '⭐', dotColor: 'bg-primary', badgeColor: 'text-primary' },
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-14 select-none">
      {/* ==================================================== */}
      {/* 1. HERO SECTION: REFINED ACADEVIA PURPLE BANNER      */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#230E30] via-[#351642] to-[#4D235D] text-white p-7 sm:p-9 shadow-lg border border-[#4D235D]/60">
        {/* Subtle Academic Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#DDBFE8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Greeting & Daily Goal Progress */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-purple-200 text-xs font-bold">
              <span>{studentClass}</span>
              <span>•</span>
              <span className="truncate">{schoolName}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {greeting}, {studentName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-1 font-medium">
                You've completed <span className="font-bold text-white">{todayMinutes} minutes</span> of focused study today.
                {minutesRemaining > 0
                  ? ` ${minutesRemaining} mins to reach your daily goal!`
                  : ` 🎉 Daily goal accomplished!`}
              </p>
            </div>

            {/* Daily Goal Visual Bar */}
            <div className="space-y-2 pt-1 max-w-md bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="flex justify-between text-xs font-extrabold">
                <span className="text-purple-200">Today's Focus Goal</span>
                <span className="text-white">{todayMinutes} / {dailyGoalSetting} mins ({dailyGoalPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C393D7] to-[#D4A843] transition-all duration-500"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Educational Stats & Primary CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            {/* Badges Bar */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-extrabold shadow-xs">
                <Flame className="h-4 w-4 fill-orange-400 text-orange-400" />
                <span>{streak || 5} Day Streak</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-extrabold shadow-xs">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>Level {level}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-extrabold shadow-xs">
                <Zap className="h-4 w-4 fill-purple-300 text-purple-300" />
                <span>{xp} XP</span>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate(ROUTES.COURSES)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="cursor-pointer font-bold shadow-lg shadow-purple-950/40 w-full sm:w-auto text-sm py-3 px-6 bg-gradient-to-r from-[#7B3F95] to-[#5B2C6F] hover:from-[#6A3482] hover:to-[#4A2359]"
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
            className="text-xs font-extrabold text-primary dark:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
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
                'group relative overflow-hidden rounded-3xl border border-[#E8E2D8] dark:border-[#382447] bg-white dark:bg-card-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between'
              )}
            >
              {/* Top 35% Visual Artwork Banner */}
              <div className={cn('relative h-32 w-full p-5 overflow-hidden flex items-center justify-between bg-gradient-to-r text-white', lesson.themeBg)}>
                <div className="relative z-10 space-y-1">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border', lesson.tagColor)}>
                    {lesson.icon} {lesson.subject}
                  </span>
                  <p className="text-xs text-purple-200/90 font-semibold">{lesson.meta}</p>
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
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-purple-300 transition-colors">
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
                    <span className="text-primary dark:text-purple-300 font-extrabold">{lesson.progressPct}% complete</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', lesson.barColor)}
                      style={{ width: `${lesson.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-extrabold text-primary dark:text-purple-300 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
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
      {/* 3. YOUR SUBJECTS: CRAFTSMANSHIP VISUAL CARDS         */}
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
                'group relative overflow-hidden rounded-3xl border bg-white dark:bg-card-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between',
                sub.cardBorder
              )}
            >
              {/* Visual Subject Artwork Header */}
              <div className={cn('relative h-20 w-full p-3.5 overflow-hidden flex items-center justify-between bg-gradient-to-r text-white', sub.headerGradient)}>
                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">{sub.icon}</span>
                  <span className="text-xs font-extrabold tracking-wide uppercase">{sub.name}</span>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end pointer-events-none pr-2">
                  {sub.svgMini}
                </div>
              </div>

              {/* Content & Progress */}
              <div className="p-4.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">{sub.completed} / {sub.total} chapters</span>
                  <span className={cn('font-extrabold', sub.textColor)}>{sub.progressPct}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', sub.barColor)}
                    style={{ width: `${sub.progressPct}%` }}
                  />
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                  <span>Explore Syllabus</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
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
          {/* A. RECOMMENDED FOR YOU (Visual Discovery Cards with Artwork) */}
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
                  className="group relative overflow-hidden rounded-3xl border border-[#E8E2D8] dark:border-[#382447] bg-white dark:bg-card-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
                >
                  {/* Visual Header Artwork */}
                  <div className={cn('relative h-24 w-full p-4 overflow-hidden flex items-center justify-between bg-gradient-to-r text-white', rec.bgGradient)}>
                    <div className="relative z-10 space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-extrabold">
                        {rec.icon} {rec.subject}
                      </span>
                      <p className="text-[11px] text-purple-200/90 font-medium">{rec.meta}</p>
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-28 flex items-center justify-end pointer-events-none pr-3">
                      {rec.svgArtwork}
                    </div>

                    <span className="relative z-10 text-[10px] font-extrabold bg-black/40 px-2 py-0.5 rounded-full text-amber-300">
                      {rec.xpReward}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-medium">
                        "{rec.reason}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-400">
                        {rec.duration}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-xs font-bold hover:bg-purple-50 hover:text-primary hover:border-primary/40"
                      >
                        Start Learning →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. LEARN THROUGH PLAY: QUEST BANNERS WITH GAME ARTWORK */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Learn Through Play</span>
                  <span className="text-base">🎮</span>
                </h2>
                <p className="text-xs text-gray-500 font-medium">Curriculum-aligned adventure quests and boss battles</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="text-xs font-extrabold text-primary dark:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
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
                    'group relative overflow-hidden rounded-3xl border bg-white dark:bg-card-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between',
                    g.cardBorder
                  )}
                >
                  {/* Game Artwork Banner */}
                  <div className={cn('relative h-24 w-full p-4 overflow-hidden flex items-center justify-between bg-gradient-to-r text-white', g.headerBg)}>
                    <div className="relative z-10 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
                        {g.icon}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{g.title}</h4>
                        <span className="text-[10px] text-amber-300 font-extrabold">{g.grade} • {g.reward}</span>
                      </div>
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-28 flex items-center justify-end pointer-events-none pr-3">
                      {g.svgArt}
                    </div>
                  </div>

                  <div className="p-4.5 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 font-semibold truncate">
                      {g.genre}
                    </p>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="cursor-pointer text-xs font-bold shrink-0 shadow-md bg-gradient-to-r from-[#7B3F95] to-[#5B2C6F]"
                    >
                      PLAY QUEST ⚔️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* C. RECENT ACTIVITY: CONNECTED TIMELINE */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-gray-500 font-medium">Your latest study milestones and rewards</p>
            </div>

            <div className="rounded-3xl border border-[#E8E2D8] dark:border-[#382447] bg-white dark:bg-card-dark p-6 shadow-xs space-y-4">
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
                      <span className={cn('text-xs font-bold shrink-0', act.badgeColor)}>
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
          <div className="rounded-3xl border border-[#E8E2D8] dark:border-[#382447] bg-white dark:bg-card-dark p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Today's Missions 🎯
                </h3>
              </div>
              <span className="text-xs font-extrabold text-primary dark:text-purple-300 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {completedMissionsCount} / {dailyMissions.length} Complete
              </span>
            </div>

            <div className="space-y-3">
              {dailyMissions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate(m.link)}
                  className={cn(
                    'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs',
                    m.completed
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/60 hover:border-primary/40'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 shrink-0" />
                    )}
                    <span className={cn('text-xs font-bold truncate', m.completed && 'line-through text-gray-500')}>
                      {m.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/80 dark:bg-gray-700 shadow-2xs text-warning shrink-0">
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
          <div className="rounded-3xl border border-[#E8E2D8] dark:border-[#382447] bg-white dark:bg-card-dark p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-accent" />
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
              className="w-full mt-2 cursor-pointer text-xs font-bold border-accent/30 hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              Practice Weak Topics →
            </Button>
          </div>

          {/* 4. COMPACT QUICK ACTIONS */}
          <div className="rounded-3xl border border-[#E8E2D8] dark:border-[#382447] bg-white dark:bg-card-dark p-6 shadow-xs space-y-3">
            <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => navigate(ROUTES.COURSES)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Courses</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.QUIZ)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-secondary text-gray-700 dark:text-gray-300 hover:text-secondary transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <GraduationCap className="h-4 w-4 text-secondary" />
                <span>Quizzes</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <Gamepad2 className="h-4 w-4 text-primary" />
                <span>Play Games</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DOWNLOADS)}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-warning text-gray-700 dark:text-gray-300 hover:text-warning transition-colors text-left flex items-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <Download className="h-4 w-4 text-warning" />
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
