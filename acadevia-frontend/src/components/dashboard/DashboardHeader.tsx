import React, { useMemo } from 'react';
import { Calendar, BookOpen, Flame, Target, Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  studentName: string;
  studentClass?: string;
  schoolName?: string;
  minutesRemaining?: number;
  todayMinutes?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  studentName,
  studentClass = 'Class 10 CBSE',
  schoolName = 'Acadevia Demo School',
  minutesRemaining = 10,
  todayMinutes = 20,
}) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        {/* Academic metadata pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-primary dark:text-purple-300 text-[11px] font-bold border border-primary/20">
            <BookOpen className="h-3 w-3" />
            {studentClass}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[260px]">
            {schoolName}
          </span>
        </div>

        {/* Editorial Greeting */}
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-white tracking-[-0.03em] leading-tight">
          {greeting}, {studentName} <span className="inline-block animate-wave">👋</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {minutesRemaining > 0
            ? `You're ${minutesRemaining} minutes away from achieving today's daily focus goal.`
            : `🎉 Fantastic! You have achieved your daily study focus goal (${todayMinutes} min completed).`}
        </p>
      </div>

      {/* Right Quick Badges */}
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 text-streak text-xs font-bold shadow-2xs">
          <Flame className="h-3.5 w-3.5 fill-current" />
          <span>5-Day Streak Active</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-primary/20 text-primary dark:text-purple-300 text-xs font-bold shadow-2xs">
          <Target className="h-3.5 w-3.5" />
          <span>20 / 30 min Focused</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};
export default DashboardHeader;
