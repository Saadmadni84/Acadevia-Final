import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';

type TimePeriod = 'today' | 'week' | 'month' | 'all';

interface LeaderboardFiltersProps {
  selectedClass: string;
  selectedSubject: string;
  selectedPeriod: TimePeriod;
  searchQuery: string;
  classes?: string[];
  subjects?: string[];
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onPeriodChange: (value: TimePeriod) => void;
  onSearchChange: (value: string) => void;
  className?: string;
}

const defaultClasses = ['All', '6', '7', '8', '9', '10', '11', '12'];

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  selectedClass,
  selectedSubject,
  selectedPeriod,
  searchQuery,
  classes = defaultClasses,
  subjects = [],
  onClassChange,
  onSubjectChange,
  onPeriodChange,
  onSearchChange,
  className,
}) => {
  const { t } = useTranslation();

  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'today', label: t('leaderboard.today', 'Today') },
    { key: 'week', label: t('leaderboard.thisWeek', 'This Week') },
    { key: 'month', label: t('leaderboard.thisMonth', 'This Month') },
    { key: 'all', label: t('leaderboard.allTime', 'All Time') },
  ];

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearch}
          placeholder={t('leaderboard.searchStudent', 'Search by student name...')}
          aria-label={t('leaderboard.searchStudent', 'Search by student name')}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-sm placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            transition-colors"
        />
      </div>

      {/* Filters row — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label={t('leaderboard.filters', 'Filters')}>
        <SlidersHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0" />

        {/* Class filter */}
        <select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          aria-label={t('leaderboard.classFilter', 'Filter by class')}
          className="flex-shrink-0 text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-primary/50
            cursor-pointer"
        >
          {classes.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? t('leaderboard.allClasses', 'All Classes') : `${t('leaderboard.class', 'Class')} ${c}`}
            </option>
          ))}
        </select>

        {/* Subject filter */}
        {subjects.length > 0 && (
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            aria-label={t('leaderboard.subjectFilter', 'Filter by subject')}
            className="flex-shrink-0 text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-primary/50
              cursor-pointer"
          >
            <option value="">{t('leaderboard.allSubjects', 'All Subjects')}</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* Time period pills */}
        {periods.map((p) => (
          <motion.button
            key={p.key}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onPeriodChange(p.key)}
            aria-pressed={selectedPeriod === p.key}
            className={cn(
              'flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selectedPeriod === p.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {p.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export { LeaderboardFilters };
export type { TimePeriod };
