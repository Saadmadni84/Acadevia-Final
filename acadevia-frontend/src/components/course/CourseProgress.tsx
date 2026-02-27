import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Module } from '@/types/course.types';

interface CourseProgressProps {
  overallPercent: number;
  modules: Module[];
  xpEarned: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  className?: string;
}

/* Circular progress ring */
const CircularRing: React.FC<{ percent: number; size?: number; stroke?: number }> = ({
  percent,
  size = 120,
  stroke = 10,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-gray-200 dark:text-white/10"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary, #5B2C6F)" />
          <stop offset="100%" stopColor="var(--color-secondary, #7B3F95)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const CourseProgress: React.FC<CourseProgressProps> = ({
  overallPercent,
  modules,
  xpEarned,
  lessonsCompleted,
  quizzesPassed,
  className,
}) => {
  const { t } = useTranslation();

  const stats = [
    { icon: Trophy, label: t('progress.xpEarned'), value: `${xpEarned} XP` },
    { icon: BookOpen, label: t('progress.lessonsCompleted'), value: String(lessonsCompleted) },
    { icon: Brain, label: t('progress.quizzesPassed'), value: String(quizzesPassed) },
  ];

  return (
    <div className={cn('glass-card p-6 space-y-6', className)} aria-label={t('progress.title')}>
      {/* Overall ring */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <CircularRing percent={overallPercent} />
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            {overallPercent}%
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('progress.overall')}</p>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center space-y-1">
            <Icon className="h-5 w-5 mx-auto text-primary" aria-hidden />
            <p className="text-lg font-semibold">{value}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Module bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t('progress.byModule')}
        </h4>
        {modules.map((mod) => {
          const pct =
            mod.lessonsCount > 0
              ? Math.round(((mod.completedCount ?? 0) / mod.lessonsCount) * 100)
              : 0;
          return (
            <div key={mod.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate">{mod.title}</span>
                <span className="text-gray-400 shrink-0 ml-2">{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { CourseProgress };
