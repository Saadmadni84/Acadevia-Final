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
  TrendingUp,
  Clock,
  GraduationCap,
  Gamepad2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Compass,
  ChevronRight,
  Download,
  Zap,
  Star,
  Check,
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

  // A. Real In-Progress Lessons for "Continue Learning" (Large Visual Cards)
  const continueLessons = [
    {
      id: 'less_math_10_quad',
      subject: 'MATHEMATICS',
      meta: `${studentClass} • Chapter 5`,
      title: 'Quadratic Equations',
      subtitle: 'Nature of Roots & Discriminant Analysis',
      progressPct: 65,
      timeLeft: '12 min left',
      courseId: 'c_math',
      lessonId: 'less_math_10_quad',
      accentColor: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'border-blue-500/20 hover:border-blue-500/50',
      barColor: 'bg-blue-600',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
      icon: '📐',
      pattern: 'bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5',
    },
    {
      id: 'less_sci_10_light',
      subject: 'SCIENCE',
      meta: `${studentClass} • Chapter 3`,
      title: 'Light & Optics',
      subtitle: 'Spherical Mirrors, Ray Diagrams & Sign Convention',
      progressPct: 35,
      timeLeft: '18 min left',
      courseId: 'c_sci',
      lessonId: 'less_sci_10_light',
      accentColor: 'text-teal-600 dark:text-teal-400',
      accentBorder: 'border-teal-500/20 hover:border-teal-500/50',
      barColor: 'bg-teal-600',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
      icon: '🔬',
      pattern: 'bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5',
    },
  ];

  // B. Subject Progress (4 Compact Visual Subject Cards)
  const subjectsProgress = [
    {
      name: 'Mathematics',
      icon: '📐',
      completed: 8,
      total: 12,
      progressPct: 67,
      courseId: 'c_math',
      themeColor: 'border-l-blue-600 text-blue-600',
      barColor: 'bg-blue-600',
      bgGlow: 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20',
    },
    {
      name: 'Science',
      icon: '🔬',
      completed: 4,
      total: 10,
      progressPct: 40,
      courseId: 'c_sci',
      themeColor: 'border-l-teal-600 text-teal-600',
      barColor: 'bg-teal-600',
      bgGlow: 'hover:bg-teal-50/40 dark:hover:bg-teal-950/20',
    },
    {
      name: 'English Literature',
      icon: '📖',
      completed: 5,
      total: 8,
      progressPct: 62,
      courseId: 'c_eng',
      themeColor: 'border-l-rose-500 text-rose-500',
      barColor: 'bg-rose-500',
      bgGlow: 'hover:bg-rose-50/40 dark:hover:bg-rose-950/20',
    },
    {
      name: 'Social Science',
      icon: '🌍',
      completed: 3,
      total: 9,
      progressPct: 33,
      courseId: 'c_soc',
      themeColor: 'border-l-amber-500 text-amber-600',
      barColor: 'bg-amber-500',
      bgGlow: 'hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
    },
  ];

  // C. Daily Goals Motivation Widget Items
  const dailyGoals = [
    { id: 'g1', title: 'Complete 2 video lessons', completed: false, current: 1, target: 2, link: ROUTES.COURSES },
    { id: 'g2', title: 'Play 1 learning quest game', completed: true, current: 1, target: 1, link: ROUTES.GAMES },
    { id: 'g3', title: 'Earn 100 XP from quizzes', completed: false, current: 75, target: 100, link: ROUTES.QUIZ },
  ];
  const completedGoalsCount = dailyGoals.filter((g) => g.completed).length;

  // D. Intelligent Recommendation Cards (Distinct Thumbnail Style)
  const recommendations = [
    {
      id: 'rec_1',
      subject: 'Mathematics',
      title: 'Graphs of Quadratic Functions & Parabola Vertex',
      meta: 'Mathematics • Class 10',
      reason: 'Because you completed Quadratic Equations (Part 1)',
      xpReward: '+60 XP',
      duration: '15 mins',
      lessonId: 'less_math_10_quad',
      tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      icon: '📊',
    },
    {
      id: 'rec_2',
      subject: 'Science',
      title: 'Refraction through Glass Prism & Light Dispersion',
      meta: 'Science • Class 10',
      reason: 'Next recommended chapter in Light & Optics',
      xpReward: '+80 XP',
      duration: '20 mins',
      lessonId: 'less_sci_10_light',
      tagColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      icon: '🌈',
    },
  ];

  // E. Topics to Practice (Skill Gaps Widget)
  const practiceTopics = [
    { name: 'Trigonometric Ratios (Tan & Cos values)', status: 'Needs Practice', mastery: 42, color: 'bg-rose-500', statusColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
    { name: 'Ray Diagrams for Concave Lenses', status: 'Improving', mastery: 58, color: 'bg-amber-500', statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { name: 'Subject-Verb Agreement & Syntax', status: 'Proficient', mastery: 64, color: 'bg-blue-500', statusColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  ];

  // F. Learn Through Play (Game Cards)
  const games = [
    {
      id: 'number-kingdom',
      title: 'Number Kingdom',
      genre: 'Rescue Math Adventure',
      grade: 'Class 1–4',
      reward: '+150 XP',
      icon: '👑',
      link: '/games/number-kingdom',
      themeBg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40',
      btnVariant: 'gradient' as const,
    },
    {
      id: 'trigonometry-quest',
      title: 'Trigonometry Quest',
      genre: 'Sin/Cos Titan Battle',
      grade: 'Class 9–12',
      reward: '+200 XP',
      icon: '⚔️',
      link: '/games/trigonometry-quest',
      themeBg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40',
      btnVariant: 'gradient' as const,
    },
  ];

  // G. Recent Activity (Timeline Style)
  const activities = [
    { id: '1', title: 'Completed Quadratic Equations (Part 1)', xp: '+50 XP', time: '2 hours ago', icon: '✓', iconBg: 'bg-emerald-100 text-emerald-700' },
    { id: '2', title: 'Passed Light & Reflection Concept Quiz', xp: '+80 XP', time: 'Yesterday', icon: '🏆', iconBg: 'bg-amber-100 text-amber-700' },
    { id: '3', title: 'Earned Math Explorer Badge', xp: '+100 XP', time: '2 days ago', icon: '⭐', iconBg: 'bg-blue-100 text-blue-700' },
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
      {/* ==================================================== */}
      {/* SECTION 1: HERO (ATTRACTIVE, RESTRAINED, PURPOSEFUL) */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Greeting & Focus Status */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="text-primary dark:text-blue-400 font-extrabold">{studentClass}</span>
              <span>•</span>
              <span className="truncate">{schoolName}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {greeting}, {studentName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                You've completed <span className="font-extrabold text-primary dark:text-blue-400">{todayMinutes} minutes</span> of study today.
                {minutesRemaining > 0
                  ? ` ${minutesRemaining} mins remaining to reach your goal.`
                  : ` 🎉 Great work, daily goal achieved!`}
              </p>
            </div>

            {/* Daily Goal Bar */}
            <div className="space-y-1.5 pt-1 max-w-md">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">Today's Goal</span>
                <span className="text-primary dark:text-blue-400 font-extrabold">
                  {todayMinutes} / {dailyGoalSetting} min ({dailyGoalPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary dark:bg-blue-600 transition-all duration-500"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Streak, Level, and Primary Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Flame Streak */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-extrabold shadow-2xs">
                <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                <span>{streak || 5} Day Streak</span>
              </div>

              {/* Scholar Level */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-extrabold shadow-2xs">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>Level {level}</span>
              </div>

              {/* XP Today */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-extrabold shadow-2xs">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>{xp} XP</span>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate(ROUTES.COURSES)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="cursor-pointer font-bold shadow-xs w-full sm:w-auto"
            >
              Continue Learning →
            </Button>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION 2: CONTINUE LEARNING (LARGE VISUAL CARDS)    */}
      {/* ==================================================== */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Continue Learning
            </h2>
            <p className="text-xs text-gray-500">Pick up exactly where you left off</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.COURSES)}
            className="text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Browse All Courses</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {continueLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/lesson/${lesson.lessonId}`)}
              className={cn(
                'relative overflow-hidden rounded-3xl border bg-white dark:bg-card-dark p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between',
                lesson.accentBorder
              )}
            >
              <div className={cn('absolute inset-0 pointer-events-none opacity-40', lesson.pattern)} />

              <div className="relative space-y-3">
                {/* Header Typography: Subject + Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{lesson.icon}</span>
                    <span className="text-xs font-extrabold tracking-wider text-gray-900 dark:text-white">
                      {lesson.subject}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-gray-500">
                      {lesson.meta}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.timeLeft}
                  </span>
                </div>

                {/* Lesson Title & Subtitle */}
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 font-medium">
                    {lesson.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress & Action */}
              <div className="relative space-y-3 pt-5 mt-4 border-t border-gray-100 dark:border-gray-800/80">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-gray-700 dark:text-gray-300">{lesson.progressPct}% complete</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', lesson.barColor)}
                      style={{ width: `${lesson.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-extrabold text-primary dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Resume Video →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION 3: YOUR SUBJECTS (4 COMPACT SUBJECT CARDS)   */}
      {/* ==================================================== */}
      <section className="space-y-3.5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Subjects
          </h2>
          <p className="text-xs text-gray-500">Track your syllabus progress across your {studentClass} curriculum</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {subjectsProgress.map((sub) => (
            <div
              key={sub.name}
              onClick={() => navigate(ROUTES.COURSES)}
              className={cn(
                'rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-4.5 transition-all duration-200 cursor-pointer shadow-2xs border-l-4 hover:border-gray-300 dark:hover:border-gray-700 flex flex-col justify-between h-32',
                sub.themeColor,
                sub.bgGlow
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sub.icon}</span>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  {sub.progressPct}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                    {sub.name}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {sub.completed} / {sub.total} lessons completed
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', sub.barColor)}
                    style={{ width: `${sub.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION 4: BALANCED MAIN & SIDEBAR GRID              */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* ================================================== */}
        {/* LEFT COLUMN (70% ~ 8 Cols): Recommendations, Play, */}
        {/* and Recent Activity Timeline                       */}
        {/* ================================================== */}
        <div className="lg:col-span-8 space-y-7">
          {/* A. RECOMMENDED FOR YOU (Distinct Thumbnail Cards) */}
          <section className="space-y-3.5">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recommended for You
              </h2>
              <p className="text-xs text-gray-500">Intelligent next steps based on your recent activity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => navigate(`/lesson/${rec.lessonId}`)}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{rec.icon}</span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {rec.meta}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {rec.xpReward}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">
                        "{rec.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-400">
                      Duration: {rec.duration}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs font-bold"
                    >
                      Start Lesson →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. LEARN THROUGH PLAY (Playful Game Cards) */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Learn Through Play
                </h2>
                <p className="text-xs text-gray-500">Prodigy-inspired curriculum quests and skill battles</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>All Games</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate(g.link)}
                  className={cn(
                    'rounded-2xl border p-5 transition-all cursor-pointer shadow-2xs hover:shadow-md group flex items-center justify-between gap-4',
                    g.themeBg
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-card-dark shadow-2xs flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {g.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                          {g.grade}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] font-bold text-amber-600">
                          {g.reward}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                        {g.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {g.genre}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={g.btnVariant}
                    size="sm"
                    className="cursor-pointer text-xs font-bold shrink-0 shadow-xs"
                  >
                    Play Quest
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* C. RECENT ACTIVITY (TIMELINE DESIGN) */}
          <section className="space-y-3.5">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-gray-500">Your latest verified milestones and quiz achievements</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-2xs space-y-4">
              {activities.map((act, idx) => (
                <div key={act.id} className="flex items-start gap-3.5 relative">
                  {/* Connecting Timeline Line */}
                  {idx !== activities.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 -mb-4" />
                  )}

                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs z-10', act.iconBg)}>
                    {act.icon}
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {act.title}
                      </h4>
                      <span className="text-xs font-bold text-amber-600 shrink-0">
                        {act.xp}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ================================================== */}
        {/* RIGHT COLUMN (30% ~ 4 Cols): Daily Goals Widget,  */}
        {/* Streak, Topics to Practice, and Quick Actions      */}
        {/* ================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. DAILY GOALS MOTIVATION WIDGET */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Today's Goals
                </h3>
              </div>
              <span className="text-xs font-extrabold text-primary">
                {completedGoalsCount} / {dailyGoals.length} done
              </span>
            </div>

            <div className="space-y-2.5">
              {dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => navigate(goal.link)}
                  className={cn(
                    'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                    goal.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/60 hover:border-primary/40'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {goal.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span className={cn('text-xs font-bold truncate', goal.completed && 'line-through text-gray-500')}>
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-gray-500 shrink-0">
                    {goal.current}/{goal.target}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. STREAK MOTIVATIONAL WIDGET */}
          <div className="rounded-2xl border border-orange-200/80 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="h-6 w-6 fill-current" />
              </div>
              <div>
                <span className="text-base font-extrabold text-gray-900 dark:text-white block">
                  {streak || 5} Day Streak 🔥
                </span>
                <span className="text-[11px] text-gray-600 dark:text-gray-300">
                  Complete 1 lesson today to keep your streak!
                </span>
              </div>
            </div>

            {/* Week Activity Dots */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {weekDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400">{d}</span>
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold',
                      i < (streak || 5)
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                    )}
                  >
                    {i < (streak || 5) ? <Check className="h-3.5 w-3.5" /> : '•'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TOPICS TO PRACTICE (SKILL GAPS WIDGET) */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-rose-500" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Topics to Practice
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400">Quiz Analytics</span>
            </div>
            <p className="text-xs text-gray-500">
              Personalized concept revision derived from your recent quiz scores:
            </p>

            <div className="space-y-3">
              {practiceTopics.map((topic) => (
                <div key={topic.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                      {topic.name}
                    </span>
                    <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-md', topic.statusColor)}>
                      {topic.status} ({topic.mastery}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', topic.color)}
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
              className="w-full mt-2 cursor-pointer text-xs font-bold"
            >
              Practice Weak Topics →
            </Button>
          </div>

          {/* 4. COMPACT QUICK ACTIONS */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => navigate(ROUTES.COURSES)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>Courses</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.QUIZ)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4 text-teal-600" />
                <span>Quiz Practice</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left flex items-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="h-4 w-4 text-indigo-600" />
                <span>Play Games</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DOWNLOADS)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4 text-amber-600" />
                <span>Downloads</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
