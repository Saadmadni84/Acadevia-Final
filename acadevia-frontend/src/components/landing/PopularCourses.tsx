import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Users,
  BookOpen,
  Eye,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Course {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  students: number;
  rating: number;
  progress: number;
}

type SortKey = 'name' | 'category' | 'students' | 'rating' | 'progress';
type SortDir = 'asc' | 'desc';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const courses: Course[] = [
  { id: '1', name: 'Mathematics – Algebra', category: 'Mathematics', categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', students: 24500, rating: 4.8, progress: 78 },
  { id: '2', name: 'Science – Physics Basics', category: 'Science', categoryColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', students: 18300, rating: 4.7, progress: 65 },
  { id: '3', name: 'English Grammar Mastery', category: 'Language', categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', students: 32100, rating: 4.9, progress: 82 },
  { id: '4', name: 'Hindi Literature', category: 'Language', categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', students: 15600, rating: 4.5, progress: 54 },
  { id: '5', name: 'Computer Science – Python', category: 'Technology', categoryColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', students: 28700, rating: 4.9, progress: 71 },
  { id: '6', name: 'History – Modern India', category: 'Social Studies', categoryColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', students: 12400, rating: 4.6, progress: 60 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtStudents = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

const ratingStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3.5 w-3.5 ${
        i < Math.round(rating)
          ? 'text-warning fill-warning'
          : 'text-gray-300 dark:text-gray-600'
      }`}
      aria-hidden="true"
    />
  ));

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}

const SortHeader: React.FC<SortHeaderProps> = ({ label, sortKey, current, dir, onSort }) => {
  const active = current === sortKey;
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div
    className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={`${value}% complete`}
  >
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
      initial={{ width: 0 }}
      whileInView={{ width: `${value}%` }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

/* Card view for very small screens */
const CourseCard: React.FC<{ course: Course; index: number }> = ({ course, index }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{course.name}</h3>
        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${course.categoryColor}`}>
          {course.category}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {fmtStudents(course.students)} {t('popularCourses.students', 'students')}
        </span>
        <span className="inline-flex items-center gap-0.5">
          {ratingStars(course.rating)}
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{course.rating}</span>
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{t('popularCourses.progress', 'Progress')}</span>
          <span className="font-medium">{course.progress}%</span>
        </div>
        <ProgressBar value={course.progress} />
      </div>

      <Link to={ROUTES.COURSES} className="block">
        <Button variant="outline" size="sm" className="w-full" rightIcon={<Eye className="h-3.5 w-3.5" />}>
          {t('popularCourses.view', 'View')}
        </Button>
      </Link>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const PopularCourses: React.FC = () => {
  const { t } = useTranslation();
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const [sortKey, setSortKey] = useState<SortKey>('students');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const copy = [...courses];
    copy.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      const cmp = typeof valA === 'string' ? valA.localeCompare(valB as string) : (valA as number) - (valB as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [sortKey, sortDir]);

  return (
    <section
      id="courses"
      className="py-20 bg-white dark:bg-card-dark/30"
      aria-labelledby="popular-courses-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            id="popular-courses-heading"
            className="text-3xl sm:text-4xl font-bold"
          >
            {t('popularCourses.heading', 'Popular')}{' '}
            <span className="gradient-text">
              {t('popularCourses.headingHighlight', 'Courses')}
            </span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            {t(
              'popularCourses.subheading',
              'Explore the courses loved by thousands of students across the country.',
            )}
          </p>
        </motion.div>

        {/* ---- Card view (very small screens) ---- */}
        <div ref={ref} className="sm:hidden grid gap-4">
          <AnimatePresence>
            {sorted.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* ---- Table view (sm+) ---- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="hidden sm:block overflow-x-auto rounded-2xl glass-card"
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-5 py-4">
                  <SortHeader label={t('popularCourses.colCourse', 'Course')} sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-4">
                  <SortHeader label={t('popularCourses.colCategory', 'Category')} sortKey="category" current={sortKey} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-4 text-right">
                  <SortHeader label={t('popularCourses.colStudents', 'Students')} sortKey="students" current={sortKey} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-4">
                  <SortHeader label={t('popularCourses.colRating', 'Rating')} sortKey="rating" current={sortKey} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-4 min-w-[140px]">
                  <SortHeader label={t('popularCourses.colProgress', 'Progress')} sortKey="progress" current={sortKey} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-5 py-4">
                  <span className="sr-only">{t('popularCourses.actions', 'Actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.map((course, i) => (
                  <motion.tr
                    key={course.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-primary/5 dark:hover:bg-primary/10 ${
                      i % 2 === 0
                        ? 'bg-white dark:bg-transparent'
                        : 'bg-gray-50/60 dark:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-5 py-4 font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                      {course.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${course.categoryColor}`}>
                        {course.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        {fmtStudents(course.students)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1">
                        {ratingStars(course.rating)}
                        <span className="ml-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {course.rating}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={course.progress} />
                        <span className="text-xs font-medium text-gray-500 w-9 text-right tabular-nums">
                          {course.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={ROUTES.COURSES}>
                        <Button variant="ghost" size="sm" rightIcon={<Eye className="h-3.5 w-3.5" />}>
                          {t('popularCourses.view', 'View')}
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link to={ROUTES.COURSES}>
            <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              {t('popularCourses.viewAll', 'View All Courses')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export { PopularCourses };
