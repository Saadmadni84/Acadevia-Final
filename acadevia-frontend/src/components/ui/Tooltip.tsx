import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className }) => {
  const [show, setShow] = useState(false);
  const posMap = { top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full', bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full', left: 'top-1/2 -left-2 -translate-y-1/2 -translate-x-full', right: 'top-1/2 -right-2 -translate-y-1/2 translate-x-full' };

  return (
    <div className={cn('relative inline-flex', className)} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn('absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg whitespace-nowrap pointer-events-none', posMap[position])}>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Tooltip };
