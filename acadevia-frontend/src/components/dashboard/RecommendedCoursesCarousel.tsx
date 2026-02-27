import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Clock, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface RecommendedCourse {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  duration: string;
  lessonsCount: number;
  category?: string;
  color?: string;
  thumbnail?: string;
}

interface RecommendedCoursesCarouselProps {
  courses: RecommendedCourse[];
  className?: string;
}

const RecommendedCoursesCarousel: React.FC<RecommendedCoursesCarouselProps> = ({ courses, className }) => {
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
    <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended For You</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-6">Based on your learning interests</p>
        </div>
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
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 snap-x snap-mandatory"
      >
        {courses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.06 }}
            className="w-[240px] sm:w-[260px] flex-shrink-0 snap-start"
          >
            <Link
              to={`/courses/${course.id}`}
              className="block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group bg-white dark:bg-gray-800/50"
            >
              {/* Thumbnail */}
              <div className={cn(
                'relative h-36 w-full bg-gradient-to-br overflow-hidden',
                course.color || 'from-primary to-[#3A1B47]'
              )}>
                {/* Pattern */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-white rounded-full" />
                  <div className="absolute bottom-2 left-2 w-16 h-16 border-4 border-white rounded-full" />
                  <div className="absolute top-1/3 left-1/3 w-8 h-8 border-2 border-white rounded-lg rotate-45" />
                  <svg className="absolute bottom-0 left-0 w-full opacity-30" viewBox="0 0 400 60" fill="none">
                    <path d="M0 60V30C100 0 200 60 300 30C350 15 380 20 400 30V60H0Z" fill="white"/>
                  </svg>
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Category badge */}
                {course.category && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    {course.category}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {course.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{course.instructor}</p>

                {/* Rating + Meta */}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{course.rating}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.lessonsCount}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { RecommendedCoursesCarousel };
