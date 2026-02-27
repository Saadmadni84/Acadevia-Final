import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';

interface DayData {
  date: string; // ISO date string (YYYY-MM-DD)
  xp: number;
  active: boolean;
}

interface StreakCalendarProps {
  days: DayData[];
  className?: string;
}

const getIntensityClass = (xp: number, maxXP: number): string => {
  if (xp === 0) return 'bg-gray-200 dark:bg-gray-700';
  const ratio = xp / maxXP;
  if (ratio < 0.25) return 'bg-primary/25';
  if (ratio < 0.5) return 'bg-primary/50';
  if (ratio < 0.75) return 'bg-primary/75';
  return 'bg-primary';
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const StreakCalendar: React.FC<StreakCalendarProps> = ({ days, className }) => {
  const { t } = useTranslation();

  const last30 = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: DayData[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const match = days.find((day) => day.date === iso);
      result.push(match ?? { date: iso, xp: 0, active: false });
    }
    return result;
  }, [days]);

  const maxXP = useMemo(() => Math.max(...last30.map((d) => d.xp), 1), [last30]);

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  return (
    <div className={cn('glass-card p-4', className)} role="img" aria-label={t('gamification.streakCalendar', 'Activity over the last 30 days')}>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">{t('gamification.last30Days', 'Last 30 Days')}</h3>
      </div>

      <div className="grid grid-cols-10 sm:grid-cols-10 gap-1.5 sm:gap-2">
        {last30.map((day, i) => {
          const isToday = day.date === todayISO;
          return (
            <motion.div
              key={day.date}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02, type: 'spring', stiffness: 300, damping: 20 }}
              className="relative group flex items-center justify-center"
            >
              <div
                className={cn(
                  'w-5 h-5 sm:w-7 sm:h-7 rounded-full transition-transform',
                  getIntensityClass(day.xp, maxXP),
                  isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-900',
                  day.active && 'shadow-sm'
                )}
                aria-label={`${formatDate(day.date)}: ${day.xp} XP`}
              />

              {/* Tooltip */}
              <div
                role="tooltip"
                className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex
                  bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                  text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-10
                  pointer-events-none"
              >
                {formatDate(day.date)} · {day.xp} XP
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-gray-400">{t('gamification.less', 'Less')}</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className={cn(
              'w-3 h-3 rounded-full',
              ratio === 0
                ? 'bg-gray-200 dark:bg-gray-700'
                : ratio < 0.5
                  ? 'bg-primary/25'
                  : ratio < 0.75
                    ? 'bg-primary/50'
                    : ratio < 1
                      ? 'bg-primary/75'
                      : 'bg-primary'
            )}
          />
        ))}
        <span className="text-[10px] text-gray-400">{t('gamification.more', 'More')}</span>
      </div>
    </div>
  );
};

export { StreakCalendar };
