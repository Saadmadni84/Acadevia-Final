import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  levelName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getDefaultLevelTitle(level: number): string {
  if (level >= 50) return 'Grandmaster';
  if (level >= 25) return 'Master Scholar';
  if (level >= 10) return 'Rising Scholar';
  if (level >= 5) return 'Knowledge Explorer';
  if (level >= 2) return 'Dedicated Learner';
  return 'Beginner';
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  requiredXP,
  level,
  levelName,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const safeRequiredXP = Math.max(requiredXP, 1);
  const pct = Math.min(Math.max((currentXP / safeRequiredXP) * 100, 0), 100);
  const heights = { sm: 'h-2', md: 'h-2.5', lg: 'h-3.5' };

  const displayTitle = levelName && !levelName.toLowerCase().startsWith('level')
    ? levelName
    : getDefaultLevelTitle(level);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
            <span className="font-bold text-gray-900 dark:text-white">Level {level}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 dark:text-gray-400">{displayTitle}</span>
          </div>
          <span className="font-semibold text-gray-600 dark:text-gray-400 text-xs">
            {currentXP.toLocaleString()} / {safeRequiredXP.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className={cn('w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
};

export { XPProgressBar };
