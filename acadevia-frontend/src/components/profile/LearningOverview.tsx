import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Brain,
  Award,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/course.types';

export interface DayStudyActivity {
  day: string;
  minutes: number;
}

interface LearningOverviewProps {
  enrolledCourses?: (Course | { id: string; title: string; subject: string; progress: number; lessonsCount: number; icon?: string })[];
  coursesCompletedCount?: number;
  quizzesTakenCount?: number;
  hoursLearnedCount?: number;
  studyMinutesCount?: number;
  averageQuizScore?: number;
  weeklyActivity?: { date?: string; day?: string; minutes?: number; minutesSpent?: number }[];
  recentActivities?: {
    id: string;
    type: 'lesson' | 'quiz' | 'badge' | 'game' | 'achievement';
    title: string;
    description: string;
    xpEarned?: number;
    timestamp: string;
  }[];
  className?: string;
}

const defaultEmptyWeek: DayStudyActivity[] = [
  { day: 'Mon', minutes: 0 },
  { day: 'Tue', minutes: 0 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 0 },
  { day: 'Fri', minutes: 0 },
  { day: 'Sat', minutes: 0 },
  { day: 'Sun', minutes: 0 },
];

export const LearningOverview: React.FC<LearningOverviewProps> = ({
  enrolledCourses = [],
  coursesCompletedCount = 0,
  quizzesTakenCount = 0,
  hoursLearnedCount = 0,
  studyMinutesCount,
  averageQuizScore = 0,
  weeklyActivity,
  recentActivities = [],
  className,
}) => {
  // Normalize weekly study data safely (handles real activity records or clean zero state)
  const normalizedWeekly: DayStudyActivity[] = React.useMemo(() => {
    if (!weeklyActivity || weeklyActivity.length === 0) {
      return defaultEmptyWeek;
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mapped = weeklyActivity.map((item, idx) => {
      let dayName = item.day;
      if (!dayName && item.date) {
        try {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            dayName = dayNames[d.getDay()];
          }
        } catch {
          // fallback
        }
      }
      if (!dayName) {
        dayName = defaultEmptyWeek[idx % 7]?.day || `D${idx + 1}`;
      }

      const mins = Number(item.minutesSpent ?? item.minutes ?? 0);
      return {
        day: dayName,
        minutes: isNaN(mins) ? 0 : mins,
      };
    });

    return mapped.length > 0 ? mapped.slice(0, 7) : defaultEmptyWeek;
  }, [weeklyActivity]);

  const totalStudyMinutes = normalizedWeekly.reduce((acc, curr) => acc + curr.minutes, 0);
  const maxMinutes = Math.max(...normalizedWeekly.map((d) => d.minutes), 60);

  // Formatted learning time display
  const learningTimeDisplay = React.useMemo(() => {
    const totalMins = studyMinutesCount !== undefined
      ? studyMinutesCount
      : hoursLearnedCount > 0
      ? Math.round(hoursLearnedCount * 60)
      : totalStudyMinutes;

    if (totalMins <= 0) return '0m';
    if (totalMins < 60) return `${totalMins}m`;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }, [studyMinutesCount, hoursLearnedCount, totalStudyMinutes]);

  // Use real enrolled subjects/courses with their real progress
  const displayCourses = enrolledCourses.map((c, i) => ({
    id: c.id,
    title: c.title,
    subject: (c as any).subject || 'Academic',
    progress: c.progress ?? 0,
    lessonsCount: (c as any).lessonsCount || 1,
    icon: (c as any).icon || (i % 4 === 0 ? '📐' : i % 4 === 1 ? '🔬' : i % 4 === 2 ? '📖' : '🏛️'),
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Academic Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Courses Completed */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-primary dark:bg-purple-950/40 dark:text-purple-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {coursesCompletedCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Courses Completed</p>
          </div>
        </div>

        {/* Quizzes Taken */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-primary dark:bg-purple-950/40 dark:text-purple-300">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {quizzesTakenCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quizzes Taken</p>
          </div>
        </div>

        {/* Learning Time */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {learningTimeDisplay}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Learning Time</p>
          </div>
        </div>

        {/* Quiz Accuracy */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {quizzesTakenCount > 0 ? `${averageQuizScore}%` : '0%'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Quiz Score</p>
          </div>
        </div>
      </div>

      {/* 2. Course Progress Section */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enrolled Subjects & Progress</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track your chapter completion across subjects
            </p>
          </div>
          <Link
            to={ROUTES.COURSES}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Explore Courses <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {displayCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayCourses.map((course, idx) => {
              const completedCount = (course as any).completedLessons !== undefined
                ? (course as any).completedLessons
                : Math.round((course.progress / 100) * course.lessonsCount);

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{course.icon}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                        {course.progress}%
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {completedCount} of {course.lessonsCount} assessments completed
                    </p>
                  </div>

                  {/* Clean solid progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No subjects enrolled yet
            </p>
          </div>
        )}
      </div>

      {/* 3. Two-column layout: Weekly Study Activity & Recent Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weekly Study Time Chart */}
        <div className="lg:col-span-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Study Activity</h3>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m this week
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Daily learning distribution and focus time
            </p>
          </div>

          {/* Bar Chart Visualization with guaranteed rendering */}
          <div className="space-y-3 pt-2">
            <div className="flex items-end gap-2.5 sm:gap-4 h-36 px-2 pb-1 border-b border-gray-100 dark:border-gray-800">
              {normalizedWeekly.map((d) => {
                const heightPct = Math.max(Math.round((d.minutes / maxMinutes) * 100), 4);
                const hasActivity = d.minutes > 0;

                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Time tooltip / label */}
                    <span className="text-[10px] font-semibold text-gray-400 mb-1 opacity-80 group-hover:text-primary transition-colors">
                      {d.minutes > 0 ? `${d.minutes}m` : '0m'}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[36px] bg-gray-100 dark:bg-gray-800 rounded-t-lg h-full flex items-end overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn(
                          'w-full rounded-t-lg transition-colors',
                          hasActivity
                            ? d.minutes >= 60
                              ? 'bg-primary'
                              : 'bg-primary/70 dark:bg-primary/80'
                            : 'bg-transparent'
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Days labels */}
            <div className="flex gap-2.5 sm:gap-4 px-2">
              {normalizedWeekly.map((d) => (
                <div key={d.day} className="flex-1 text-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Learning Activity */}
        <div className="lg:col-span-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Recent Milestones</h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Latest progress</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Recently completed lessons, quizzes, and games
            </p>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.slice(0, 4).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light flex-shrink-0">
                      {activity.type === 'lesson' && <BookOpen className="h-4 w-4" />}
                      {activity.type === 'quiz' && <Brain className="h-4 w-4" />}
                      {activity.type === 'badge' && <Award className="h-4 w-4 text-secondary" />}
                      {activity.type === 'game' && <Sparkles className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {activity.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    {activity.xpEarned && (
                      <span className="inline-block text-xs font-bold text-primary dark:text-primary-light bg-primary/10 px-2 py-0.5 rounded-full mb-0.5">
                        +{activity.xpEarned} XP
                      </span>
                    )}
                    <p className="text-[10px] text-gray-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Clock className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                No recent activity yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Complete a quiz or lesson to see your milestones here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
