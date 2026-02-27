import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LessonItem } from './LessonItem';
import { cn } from '@/lib/utils';
import type { Module } from '@/types/course.types';

interface ModuleAccordionProps {
  modules: Module[];
  currentLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
  lockedModuleIds?: string[];
  className?: string;
}

const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  modules,
  currentLessonId,
  onLessonClick,
  lockedModuleIds = [],
  className,
}) => {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand the module containing the current lesson
    const activeModuleId = modules.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId),
    )?.id;
    return activeModuleId ? new Set([activeModuleId]) : new Set([modules[0]?.id]);
  });

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn('space-y-2', className)} role="tree" aria-label={t('course.modules')}>
      {modules.map((mod) => {
        const isExpanded = expandedIds.has(mod.id);
        const isLocked = lockedModuleIds.includes(mod.id);
        const isCompleted =
          mod.completedCount != null && mod.completedCount >= mod.lessonsCount;

        return (
          <div
            key={mod.id}
            className="glass-card overflow-hidden"
            role="treeitem"
            aria-expanded={isExpanded}
          >
            {/* Header */}
            <button
              onClick={() => !isLocked && toggle(mod.id)}
              disabled={isLocked}
              className={cn(
                'w-full flex items-center justify-between gap-3 p-4 text-left transition-colors',
                isLocked
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer',
              )}
              aria-label={`${mod.title} — ${mod.lessonsCount} ${t('course.lessons')}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden />
                ) : isLocked ? (
                  <Lock className="h-5 w-5 text-gray-400 shrink-0" aria-hidden />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{mod.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {mod.completedCount ?? 0}/{mod.lessonsCount} {t('course.lessonsCompleted')}
                  </p>
                </div>
              </div>

              {!isLocked && (
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden />
                </motion.span>
              )}
            </button>

            {/* Lessons */}
            <AnimatePresence initial={false}>
              {isExpanded && !isLocked && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                  role="group"
                >
                  <div className="border-t border-gray-100 dark:border-white/10">
                    {mod.lessons.map((lesson) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isCurrent={lesson.id === currentLessonId}
                        onClick={() => onLessonClick?.(lesson.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export { ModuleAccordion };
