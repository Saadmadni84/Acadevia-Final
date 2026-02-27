import React from 'react';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  glass?: boolean;
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, hoverable, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : undefined}
        className={cn(
          'rounded-2xl p-6',
          glass
            ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg'
            : 'bg-white dark:bg-card-dark shadow-md border border-gray-100 dark:border-gray-800',
          hoverable && 'cursor-pointer transition-shadow',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

export { Card };
