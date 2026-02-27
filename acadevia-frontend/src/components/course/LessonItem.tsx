import React from 'react';
import { motion } from 'framer-motion';
import { Play, Brain, Gamepad2, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import type { LessonSummary } from '@/types/course.types';

interface LessonItemProps {
  lesson: LessonSummary;
  isCurrent?: boolean;
  onClick?: () => void;
  className?: string;
}

const typeIcons: Record<LessonSummary['type'], React.ReactNode> = {
  VIDEO: <Play className="h-4 w-4" aria-hidden />,
  QUIZ: <Brain className="h-4 w-4" aria-hidden />,
  GAME: <Gamepad2 className="h-4 w-4" aria-hidden />,
  TEXT: <FileText className="h-4 w-4" aria-hidden />,
};

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  isCurrent = false,
  onClick,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className={cn(
        'group w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        isCurrent && 'bg-primary/10 dark:bg-primary/20 border-l-2 border-primary',
        !isCurrent && 'hover:bg-gray-50 dark:hover:bg-white/5',
        lesson.isCompleted && !isCurrent && 'text-gray-400 dark:text-gray-500',
        className,
      )}
      aria-current={isCurrent ? 'step' : undefined}
      aria-label={`${lesson.title}${lesson.isCompleted ? ` — ${t('lesson.completed')}` : ''}`}
    >
      {/* Icon */}
      <span
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-lg shrink-0',
          lesson.isCompleted
            ? 'bg-success/10 text-success'
            : isCurrent
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
        )}
      >
        {lesson.isCompleted ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        ) : (
          typeIcons[lesson.type]
        )}
      </span>

      {/* Title + duration */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            isCurrent && 'text-primary',
            lesson.isCompleted && !isCurrent && 'line-through opacity-60',
          )}
        >
          {lesson.title}
        </p>
        {lesson.duration != null && (
          <p className="text-xs text-gray-400">{formatDuration(lesson.duration)}</p>
        )}
      </div>

      {/* Hover CTA */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="sm" tabIndex={-1} aria-hidden>
          {lesson.isCompleted ? t('lesson.review') : t('lesson.start')}
        </Button>
      </span>
    </motion.button>
  );
};

export { LessonItem };
