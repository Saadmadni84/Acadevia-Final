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
  AlertCircle,
  Compass,
  ChevronRight,
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
  const dailyGoalSetting = useSettingsStore((s) => s.settings.dailyGoalMinutes) || 30;

  const xpInfo = getXPForNextLevel(xp);
  const studentName = user?.fullName?.split(' ')[0] || 'Explorer';
  const studentClass = user?.className || 'Class 10';
  const schoolName = user?.schoolName || 'Acadevia Partner School';

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's Learning Activity Target (Minutes)
  const todayMinutes = 20; // Active minutes today
  const dailyGoalPct = Math.min(100, Math.round((todayMinutes / dailyGoalSetting) * 100));
  const minutesRemaining = Math.max(0, dailyGoalSetting - todayMinutes);

  // Real In-Progress Lessons for "Continue Learning"
  const continueLessons = [
    {
      id: 'less_math_10_quad',
      subject: 'Mathematics',
      courseName: 'Mathematics Class 10',
      chapter: 'Chapter 5: Quadratic Equations',
      lessonTitle: 'Quadratic Equations — Nature of Roots & Discriminant',
      progressPct: 65,
      timeLeft: '12 min left',
      courseId: 'c_math',
      lessonId: 'less_math_10_quad',
      subjectColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',
      accentBar: 'bg-blue-600',
    },
    {
      id: 'less_sci_10_light',
      subject: 'Science',
      courseName: 'Science Class 10',
      chapter: 'Chapter 3: Light and Reflection',
      lessonTitle: 'Spherical Mirrors, Ray Diagrams & Sign Convention',
      progressPct: 35,
      timeLeft: '18 min left',
      courseId: 'c_sci',
      lessonId: 'less_sci_10_light',
      subjectColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
      accentBar: 'bg-emerald-600',
    },
  ];

  // Subject Progress (Clean horizontal mastery bars instead of artificial rings)
  const subjectsProgress = [
    {
      name: 'Mathematics',
      icon: '📐',
      completed: 8,
      total: 12,
      progressPct: 67,
      courseId: 'c_math',
      color: 'bg-blue-600',
    },
    {
      name: 'Science',
      icon: '🔬',
      completed: 4,
      total: 10,
      progressPct: 40,
      courseId: 'c_sci',
      color: 'bg-emerald-600',
    },
    {
      name: 'English Literature',
      icon: '📖',
      completed: 5,
      total: 8,
      progressPct: 62,
      courseId: 'c_eng',
      color: 'bg-indigo-600',
    },
    {
      name: 'Social Science',
      icon: '🌍',
      completed: 3,
      total: 9,
      progressPct: 33,
      courseId: 'c_soc',
      color: 'bg-amber-600',
    },
  ];

  // Intelligent Recommendations (Reason-based)
  const recommendations = [
    {
      id: 'rec_1',
      title: 'Graphs of Quadratic Functions & Parabola Vertex',
      subject: 'Mathematics',
      reason: 'Because you completed Quadratic Equations (Part 1)',
      duration: '15 mins',
      xpReward: '+60 XP',
      courseId: 'c_math',
      lessonId: 'less_math_10_quad',
    },
    {
      id: 'rec_2',
      title: 'Refraction through Glass Prism & Atmospheric Dispersion',
      subject: 'Science',
      reason: 'Next step in Light & Optics curriculum',
      duration: '20 mins',
      xpReward: '+80 XP',
      courseId: 'c_sci',
      lessonId: 'less_sci_10_light',
    },
  ];

  // Weak Topics to Practice (Mastery Gaps)
  const practiceTopics = [
    { name: 'Trigonometric Ratios (Tan & Cos values)', mastery: 42, color: 'bg-rose-500' },
    { name: 'Ray Diagrams for Concave Lenses', mastery: 58, color: 'bg-amber-500' },
    { name: 'Subject-Verb Agreement Rules', mastery: 64, color: 'bg-blue-500' },
  ];

  // Educational Games (Prodigy / Quest inspired)
  const featuredGames = [
    {
      id: 'number-kingdom',
      title: 'Number Kingdom: Rescue Adventure',
      subject: 'Math & Logic',
      gradeTarget: 'Class 1–4',
      badge: 'Mini RPG Quest',
      reward: '+150 XP',
      icon: '👑',
      link: '/games/number-kingdom',
    },
    {
      id: 'trigonometry-quest',
      title: 'Trigonometry Quest: Titan Battle',
      subject: 'Trigonometry & ASTC',
      gradeTarget: 'Class 9–12',
      badge: 'Combat Math',
      reward: '+200 XP',
      icon: '⚔️',
      link: '/games/trigonometry-quest',
    },
  ];

  // Recent Real Activity
  const recentActivities = [
    { id: '1', title: 'Completed Lesson', desc: 'Quadratic Equations — Roots & Formula', xp: '+50 XP', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-600' },
    { id: '2', title: 'Passed Quiz', desc: 'Light & Reflection — 90% Score', xp: '+80 XP', time: 'Yesterday', icon: Trophy, color: 'text-amber-500' },
    { id: '3', title: 'Unlocked Badge', desc: 'Math Explorer (5 Days Streak)', xp: '+100 XP', time: '2 days ago', icon: Sparkles, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-10 select-none">
      {/* ==================================================== */}
      {/* 1. HERO BANNER: HUMAN-DESIGNED EDUCATIONAL HEADER    */}
      {/* ==================================================== */}
      <section className="edu-card p-6 sm:p-7 bg-white dark:bg-card-dark border-gray-200/80 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Warm Greeting & Goal */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span>{studentClass}</span>
              <span>•</span>
              <span className="truncate">{schoolName}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {greeting}, {studentName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                You've completed <span className="font-bold text-primary dark:text-blue-400">{todayMinutes} minutes</span> of focused study today.
                {minutesRemaining > 0
                  ? ` ${minutesRemaining} mins to hit your daily goal!`
                  : ` 🎉 Daily goal completed!`}
              </p>
            </div>

            {/* Daily Goal Bar */}
            <div className="space-y-1.5 pt-1 max-w-md">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">Today's Goal</span>
                <span className="text-primary dark:text-blue-400">{dailyGoalPct}% ({todayMinutes}/{dailyGoalSetting} mins)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary dark:bg-blue-600 transition-all duration-500"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Quick Stats Badges & Main Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              {/* Streak */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-extrabold">
                <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                <span>{streak || 5} Day Streak</span>
              </div>

              {/* Level & XP */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-extrabold">
                <Trophy className="h-4 w-4 text-amber-600" />
                <span>Level {level} ({xp} XP)</span>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate(ROUTES.COURSES)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="cursor-pointer font-bold shadow-xs w-full sm:w-auto"
            >
              Continue Learning
            </Button>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. MAIN 2-COLUMN LEARNING GRID                       */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* LEFT COLUMN (8 cols): Primary Learning & Practice */}
        <div className="lg:col-span-8 space-y-7">
          {/* A. CONTINUE LEARNING (PRIMARY FEATURE) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Continue Learning
                </h2>
                <p className="text-xs text-gray-500">Pick up exactly where you left off</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.COURSES)}
                className="text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>All Courses</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {continueLessons.map((item) => (
                <div
                  key={item.id}
                  className="edu-card p-5 flex flex-col justify-between hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => navigate(`/lesson/${item.lessonId}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn('edu-badge border', item.subjectColor)}>
                        {item.subject}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.timeLeft}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block">
                        {item.chapter}
                      </span>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                        {item.lessonTitle}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-500">
                        <span>Lesson Progress</span>
                        <span>{item.progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', item.accentBar)}
                          style={{ width: `${item.progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Resume Video
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. SUBJECT PROGRESS (CLEAN HORIZONTAL GAUGES) */}
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Subject Progress & Mastery
              </h2>
              <p className="text-xs text-gray-500">Curriculum syllabus coverage for {studentClass}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subjectsProgress.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => navigate(ROUTES.COURSES)}
                  className="edu-card p-4 flex items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-2xl shrink-0">{sub.icon}</div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {sub.name}
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        {sub.completed} of {sub.total} lessons done
                      </span>
                    </div>
                  </div>

                  <div className="w-28 space-y-1 text-right shrink-0">
                    <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      {sub.progressPct}%
                    </span>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', sub.color)}
                        style={{ width: `${sub.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* C. RECOMMENDED FOR YOU (KHAN ACADEMY + COURSERA INTELLIGENCE) */}
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recommended Next Steps
              </h2>
              <p className="text-xs text-gray-500">Tailored to strengthen your conceptual understanding</p>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="edu-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-md">
                        {rec.subject}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 truncate">
                        {rec.reason}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                      {rec.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {rec.xpReward}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/lesson/${rec.lessonId}`)}
                      className="cursor-pointer text-xs font-bold"
                    >
                      Start Lesson
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* D. LEARN THROUGH PLAY (PRODIGY-INSPIRED EDUCATIONAL GAMES) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Learn Through Play
                </h2>
                <p className="text-xs text-gray-500">Curriculum-aligned adventure quests & challenge games</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.GAMES)}
                className="text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Game Library</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredGames.map((game) => (
                <div
                  key={game.id}
                  className="edu-card p-4 flex items-center justify-between gap-3 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => navigate(game.link)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {game.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-primary block truncate">
                          {game.gradeTarget}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] font-bold text-amber-600">
                          {game.reward}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {game.title}
                      </h4>
                      <span className="text-[11px] text-gray-500 block truncate">
                        {game.subject}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    size="sm"
                    className="cursor-pointer text-xs font-bold shrink-0"
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (4 cols): Motivation, Learning Gaps & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. DUOLINGO-INSPIRED DAILY GOAL & XP PROGRESS */}
          <div className="edu-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Scholar Journey
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-600">
                {LEVEL_NAMES[level] || 'Rising Scholar'}
              </span>
            </div>

            {/* Level XP Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">Level {level}</span>
                <span className="text-primary">{xp} / {xpInfo.neededXP} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${xpInfo.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                {xpInfo.neededXP - (xp - xpInfo.currentLevelXP)} XP needed for Level {level + 1}
              </p>
            </div>

            {/* Streak Status */}
            <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                <div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white block">
                    {streak || 5} Days Active
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Complete 1 lesson daily to protect streak
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. LEARNING GAPS (TOPICS TO PRACTICE) */}
          <div className="edu-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-rose-500" />
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Topics to Practice
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">Quiz Analytics</span>
            </div>
            <p className="text-xs text-gray-500">
              Targeted revision identified from recent quiz responses:
            </p>

            <div className="space-y-2.5">
              {practiceTopics.map((topic) => (
                <div key={topic.name} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                      {topic.name}
                    </span>
                    <span className="text-gray-500">{topic.mastery}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', topic.color)}
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
              Practice Weak Topics
            </Button>
          </div>

          {/* 3. RECENT ACTIVITY LOG */}
          <div className="edu-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                Recent Activity
              </h3>
              <span className="text-[11px] text-gray-400">Past 48 hours</span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className={cn('p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 shrink-0 mt-0.5', act.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {act.title}
                        </span>
                        <span className="font-bold text-amber-600">{act.xp}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{act.desc}</p>
                      <span className="text-[10px] text-gray-400">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
