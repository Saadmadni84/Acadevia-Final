import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => (
  <div
    className={cn(
      'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%]',
      variant === 'circular' && 'rounded-full',
      variant === 'text' && 'rounded h-4',
      variant === 'rectangular' && 'rounded-xl',
      className
    )}
  />
);

export { Skeleton };
