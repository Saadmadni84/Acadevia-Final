import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  total: number;
  completed: number;
  color: string;
  icon: string;
}

interface EnrolledCoursesOverviewProps {
  courses: EnrolledCourse[];
  className?: string;
}

const EnrolledCoursesOverview: React.FC<EnrolledCoursesOverviewProps> = ({ courses, className }) => (
  <div className={cn('', className)}>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {courses.map((course, i) => {
        const circumference = 2 * Math.PI * 32;
        const dashOffset = circumference - (course.progress / 100) * circumference;

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={ROUTES.COURSES}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm hover:shadow-md transition-all group"
            >
              {/* Circular progress */}
              <div className="relative w-[76px] h-[76px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className={cn('stroke-current')}
                    style={{ color: `var(--course-color-${i})` }}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 }}
                  />
                </svg>
                {/* Icon center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{course.icon}</span>
                </div>

                {/* Inject CSS custom property for the stroke color */}
                <style>{`
                  [style*="--course-color-${i}"] {
                    color: ${
                      i === 0 ? '#5B2C6F' :
                      i === 1 ? '#D4A843' :
                      i === 2 ? '#E74C3C' :
                      '#7B3F95'
                    };
                  }
                `}</style>
              </div>

              {/* Info */}
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                  {course.completed}/{course.total} Lessons
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 group-hover:text-primary transition-colors">
                  {course.title}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export { EnrolledCoursesOverview };
