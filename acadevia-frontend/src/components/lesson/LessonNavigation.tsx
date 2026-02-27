import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface LessonNavigationProps {
  prevTitle?: string;
  nextTitle?: string;
  currentIndex: number;
  totalLessons: number;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  prevTitle,
  nextTitle,
  currentIndex,
  totalLessons,
  onPrev,
  onNext,
  className,
}) => {
  const { t } = useTranslation();
  const hasPrev = !!prevTitle && !!onPrev;
  const hasNext = !!nextTitle && !!onNext;

  // Keyboard navigation (left / right arrows)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;
      if (e.key === 'ArrowLeft' && hasPrev) onPrev?.();
      if (e.key === 'ArrowRight' && hasNext) onNext?.();
    },
    [hasPrev, hasNext, onPrev, onNext],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav
      className={cn(
        'flex items-center justify-between gap-4 py-4 border-t border-gray-100 dark:border-white/10',
        className,
      )}
      aria-label={t('lesson.navigation')}
    >
      {/* Previous */}
      <motion.div whileHover={hasPrev ? { x: -3 } : undefined} className="flex-1 min-w-0">
        <Button
          variant="ghost"
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-2 max-w-full"
          aria-label={hasPrev ? `${t('lesson.previous')}: ${prevTitle}` : t('lesson.previous')}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
          <div className="text-left min-w-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              {t('lesson.previous')}
            </p>
            {prevTitle && (
              <p className="text-sm font-medium truncate">{prevTitle}</p>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Progress indicator */}
      <div className="shrink-0 text-center" aria-live="polite">
        <p className="text-xs text-gray-400">
          {t('lesson.lessonOf', {
            current: currentIndex + 1,
            total: totalLessons,
          })}
        </p>
        {/* Dots */}
        <div className="flex items-center gap-1 mt-1 justify-center">
          {Array.from({ length: totalLessons }, (_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-gray-300 dark:bg-white/20',
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>

      {/* Next */}
      <motion.div whileHover={hasNext ? { x: 3 } : undefined} className="flex-1 min-w-0 flex justify-end">
        <Button
          variant="ghost"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2 max-w-full"
          aria-label={hasNext ? `${t('lesson.next')}: ${nextTitle}` : t('lesson.next')}
        >
          <div className="text-right min-w-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              {t('lesson.next')}
            </p>
            {nextTitle && (
              <p className="text-sm font-medium truncate">{nextTitle}</p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </Button>
      </motion.div>
    </nav>
  );
};

export { LessonNavigation };
