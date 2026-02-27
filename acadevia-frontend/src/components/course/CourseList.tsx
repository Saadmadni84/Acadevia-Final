import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { formatDuration, formatNumber } from '@/lib/utils';
import type { Course } from '@/types/course.types';

interface CourseListProps {
  courses: Course[];
  className?: string;
}

const CourseList: React.FC<CourseListProps> = ({ courses, className }) => {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col gap-2', className)} role="list" aria-label={t('course.list')}>
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ scale: 1.005, backgroundColor: 'rgba(var(--color-primary-rgb), 0.04)' }}
          className={cn(
            'rounded-xl transition-colors',
            index % 2 === 0
              ? 'bg-white/50 dark:bg-white/[0.03]'
              : 'bg-gray-50/80 dark:bg-white/[0.06]',
          )}
          role="listitem"
        >
          <Link
            to={`/courses/${course.id}`}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4"
          >
            {/* Thumbnail */}
            <div className="w-full sm:w-32 h-24 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('course.by')} {course.teacherName}
                  </p>
                </div>
                <Badge variant="default" className="shrink-0 text-[10px]">
                  {course.subject}
                </Badge>
              </div>

              {/* Progress bar */}
              {course.progress != null && (
                <div className="max-w-xs">
                  <Progress value={course.progress} size="sm" />
                  <p className="text-[10px] text-gray-400 mt-0.5">{course.progress}% {t('course.complete')}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 flex-wrap">
              <span className="flex items-center gap-1" aria-label={t('course.rating')}>
                <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                <span className="font-medium text-foreground">{course.rating.toFixed(1)}</span>
                <span>({formatNumber(course.ratingsCount)})</span>
              </span>
              <span className="flex items-center gap-1" aria-label={t('course.students')}>
                <Users className="h-3.5 w-3.5" />
                {formatNumber(course.enrolledCount)}
              </span>
              <span className="flex items-center gap-1" aria-label={t('course.lessons')}>
                <BookOpen className="h-3.5 w-3.5" />
                {course.lessonsCount} {t('course.lessons')}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export { CourseList };
