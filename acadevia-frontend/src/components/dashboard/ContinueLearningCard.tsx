import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueLearningItem {
  id: string;
  courseTitle: string;
  lessonTitle: string;
  progress: number;
  thumbnail?: string;
  timeLeft: string;
  courseId: string;
  lessonId: string;
  category?: string;
  color?: string;
}

interface ContinueLearningCardProps {
  items: ContinueLearningItem[];
}

const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = 300 * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: distance, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Continue Learning</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pick up where you left off</p>
        </div>
        {items.length > 2 && (
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No courses in progress. Start learning!</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 snap-x snap-mandatory"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="w-[260px] sm:w-[280px] flex-shrink-0 snap-start"
            >
              <Link
                to={`/courses/${item.courseId}/lessons/${item.lessonId}`}
                className="block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group bg-white dark:bg-gray-800/50"
              >
                {/* Thumbnail */}
                <div className={cn(
                  'relative h-40 w-full bg-gradient-to-br flex items-center justify-center overflow-hidden',
                  item.color || 'from-primary/80 to-[#3A1B47]'
                )}>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full" />
                    <div className="absolute bottom-4 right-4 w-32 h-32 border-2 border-white rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-lg rotate-45" />
                  </div>

                  {/* Play button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors"
                  >
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                  </motion.div>

                  {/* Category badge */}
                  {item.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      {item.category}
                    </span>
                  )}

                  {/* Time badge */}
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeLeft}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.courseTitle}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {item.lessonTitle}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                      <span>{item.progress}% complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full bg-gradient-to-r',
                          item.color || 'from-primary to-secondary'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export { ContinueLearningCard };
