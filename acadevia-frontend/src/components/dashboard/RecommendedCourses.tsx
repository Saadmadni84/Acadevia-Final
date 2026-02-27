import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Clock, BookOpen } from 'lucide-react';

interface RecommendedCourse {
  id: string;
  title: string;
  thumbnail?: string;
  instructor: string;
  rating: number;
  duration: string;
  lessonsCount: number;
  category?: string;
}

interface RecommendedCoursesProps {
  courses?: RecommendedCourse[];
  onCourseClick?: (courseId: string) => void;
}

export default function RecommendedCourses({ courses = [], onCourseClick }: RecommendedCoursesProps) {
  const { t } = useTranslation();
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
    const cardWidth = el.querySelector<HTMLElement>('[data-course-card]')?.offsetWidth ?? 280;
    const gap = 16;
    const distance = (cardWidth + gap) * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: distance, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      aria-label={t('dashboard.recommendedCourses', 'Recommended Courses')}
    >
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.recommendedCourses', 'Recommended Courses')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.basedOnInterests', 'Based on your interests')}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label={t('common.scrollLeft', 'Scroll left')}
            className="rounded-lg border border-gray-200 p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label={t('common.scrollRight', 'Scroll right')}
            className="rounded-lg border border-gray-200 p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      {courses.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="scrollbar-hide mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          role="list"
          aria-label={t('dashboard.courseCarousel', 'Course carousel')}
        >
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              data-course-card
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              role="listitem"
              className="w-[260px] shrink-0 snap-start rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-[280px] dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                type="button"
                onClick={() => onCourseClick?.(course.id)}
                className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                aria-label={`${t('common.open', 'Open')} ${course.title}`}
              >
                {/* Thumbnail */}
                <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-[#E8DBF0] to-[#F5F0F7] dark:from-[#2A1335] dark:to-[#1A0C22]">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-indigo-300 dark:text-indigo-700" aria-hidden="true" />
                    </div>
                  )}
                  {course.category && (
                    <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                      {course.category}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{course.instructor}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      {course.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      {course.lessonsCount} {t('common.lessons', 'lessons')}
                    </span>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
          {t('dashboard.noRecommendations', 'No recommendations yet')}
        </p>
      )}
    </motion.section>
  );
}
