import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Zap } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  className?: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, longestStreak, todayCompleted, className }) => (
  <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm', className)}>
    <div className="flex items-center gap-4">
      <motion.div
        animate={currentStreak > 0 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center',
          currentStreak > 0 ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gray-100 dark:bg-gray-800'
        )}>
          <Flame className={cn('h-7 w-7', currentStreak > 0 ? 'text-white' : 'text-gray-400')} />
        </div>
        {currentStreak >= 7 && (
          <div className="absolute -top-1 -right-1">
            <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </motion.div>
      <div className="flex-1">
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{currentStreak}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Day Streak</p>
      </div>
      <div className={cn(
        'px-3 py-1.5 rounded-xl text-xs font-bold',
        todayCompleted ? 'bg-secondary/10 text-secondary' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'
      )}>
        {todayCompleted ? '✓ Done' : 'Not yet'}
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
      <span className="text-gray-500">Best: <span className="font-bold text-gray-700 dark:text-gray-300">{longestStreak} days</span></span>
      <span className="text-gray-500">Keep it going! 💪</span>
    </div>
  </div>
);

export { StreakDisplay };
