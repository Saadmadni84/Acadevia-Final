import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  max?: number;
  gradient?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

const Progress: React.FC<ProgressProps> = ({ value, max = 100, gradient, size = 'md', showLabel, className }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden', sizeMap[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            gradient ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-primary'
          )}
        />
      </div>
    </div>
  );
};

export { Progress };
