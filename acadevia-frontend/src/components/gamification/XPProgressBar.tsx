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

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP, requiredXP, level, levelName, showLabel = true, size = 'md', className,
}) => {
  const pct = Math.min((currentXP / requiredXP) * 100, 100);
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Lv.{level}</span>
            {levelName && <span className="text-xs text-gray-500">{levelName}</span>}
          </div>
          <span className="text-xs text-gray-500">{currentXP} / {requiredXP} XP</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary via-[#7B3F95] to-secondary rounded-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
};

export { XPProgressBar };
