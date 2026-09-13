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
        whileHover={hoverable ? { y: -4 } : undefined}
        className={cn(
          'rounded-2xl p-6',
          glass
            ? 'bg-white/70 dark:bg-[#050505] backdrop-blur-xl border border-white/20 dark:border-[#242424] shadow-lg dark:shadow-none'
            : 'bg-white dark:bg-[#050505] shadow-md dark:shadow-none border border-gray-100 dark:border-[#242424]',
          hoverable && 'cursor-pointer transition-all dark:hover:border-[#333333]',
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
