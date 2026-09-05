import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Star,
  Users,
  BookOpen,
  Clock,
} from 'lucide-react';
import { ROUTES } from '@/config/routes.config';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/* ------------------------------------------------------------------ */
/*  Course data                                                        */
/* ------------------------------------------------------------------ */

interface Course {
  id: string;
  name: string;
  subject: string;
  description: string;
  students: number;
  rating: number;
  reviews: number;
  lessons: number;
  duration: string;
  level: string;
}

const courses: Course[] = [
  {
    id: '1',
    name: 'Algebra & Equations',
    subject: 'Mathematics',
    description: 'Master linear equations, quadratic expressions and polynomial factoring with step-by-step visual proofs.',
    students: 24500,
    rating: 4.8,
    reviews: 1240,
    lessons: 42,
    duration: '18h 30m',
    level: 'Class 9–10',
  },
  {
    id: '2',
    name: 'Physics Fundamentals',
    subject: 'Science',
    description: 'Build intuition for motion, forces and energy through interactive simulations and real-world problems.',
    students: 18300,
    rating: 4.7,
    reviews: 980,
    lessons: 38,
    duration: '22h 15m',
    level: 'Class 9–10',
  },
  {
    id: '3',
    name: 'English Grammar Mastery',
    subject: 'English',
    description: 'Gain confidence in tenses, voice, narration and advanced writing through contextual practice exercises.',
    students: 32100,
    rating: 4.9,
    reviews: 2100,
    lessons: 56,
    duration: '14h 45m',
    level: 'Class 6–12',
  },
  {
    id: '4',
    name: 'Python Programming',
    subject: 'Computer Science',
    description: 'Learn to code from scratch with project-based modules covering fundamentals through data structures.',
    students: 28700,
    rating: 4.9,
    reviews: 1870,
    lessons: 64,
    duration: '32h',
    level: 'Class 8–12',
  },
  {
    id: '5',
    name: 'Modern Indian History',
    subject: 'Social Studies',
    description: 'Understand the freedom movement, constitutional development and post-independence India with timeline maps.',
    students: 12400,
    rating: 4.6,
    reviews: 640,
    lessons: 34,
    duration: '16h 20m',
    level: 'Class 8–10',
  },
  {
    id: '6',
    name: 'Hindi Sahitya & Vyakaran',
    subject: 'Hindi',
    description: 'Strengthen comprehension, grammar and literary analysis with NCERT-aligned content and practice sets.',
    students: 15600,
    rating: 4.5,
    reviews: 520,
    lessons: 30,
    duration: '12h 10m',
    level: 'Class 6–10',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

/* ------------------------------------------------------------------ */
/*  Course Card                                                        */
/* ------------------------------------------------------------------ */

const CourseCard: React.FC<{ course: Course; index: number; visible: boolean }> = ({
  course,
  index,
  visible,
}) => {
  const navigate = useNavigate();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={() => navigate(ROUTES.COURSES)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(ROUTES.COURSES);
        }
      }}
      role="link"
      tabIndex={0}
      className="group relative flex flex-col bg-white dark:bg-[#1C1226] rounded-2xl border border-[#E8E5DF] dark:border-[#2E1B3D] hover:border-[#5B2C6F]/30 dark:hover:border-[#A855F7]/30 hover:shadow-[0_12px_40px_-12px_rgba(91,44,111,0.12)] transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#5B2C6F] focus-visible:ring-offset-2 overflow-hidden"
    >
      {/* ---- Top: Subject & Level ---- */}
      <div className="px-6 pt-5 pb-0 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-[#64748B] dark:text-[#94A3B8]">
          {course.subject}
        </span>
        <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
          {course.level}
        </span>
      </div>

      {/* ---- Body ---- */}
      <div className="flex-1 px-6 pt-3 pb-5 flex flex-col">
        <h3 className="text-[17px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug mb-2 group-hover:text-[#5B2C6F] dark:group-hover:text-[#C084FC] transition-colors">
          {course.name}
        </h3>

        <p className="text-[13px] leading-[1.6] text-[#64748B] dark:text-[#94A3B8] mb-5 line-clamp-2">
          {course.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-5">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessons} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {fmtCount(course.students)}
          </span>
        </div>

        <div className="flex-1" />

        {/* ---- Footer ---- */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E5DF] dark:border-[#2E1B3D]">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 text-[#D4A843] fill-[#D4A843]" />
              <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                {course.rating}
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              ({fmtCount(course.reviews)} reviews)
            </span>
          </div>

          {/* Arrow */}
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F8F5EF] dark:bg-[#2E1B3D] group-hover:bg-[#5B2C6F] group-hover:text-white text-[#5B2C6F] dark:text-[#C084FC] transition-all duration-200">
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.article>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const PopularCourses: React.FC = () => {
  const navigate = useNavigate();
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.08 });

  return (
    <section
      id="courses"
      className="py-24 bg-[#F8F5EF] dark:bg-[#0F0914] transition-colors duration-300"
      aria-labelledby="popular-courses-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---- Header ---- */}
        <div className="max-w-2xl mb-14">
          <p className="text-[13px] font-semibold tracking-wide uppercase text-[#5B2C6F] dark:text-[#C084FC] mb-3">
            Courses
          </p>
          <h2
            id="popular-courses-heading"
            className="text-[32px] sm:text-[38px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-[1.15] tracking-tight"
          >
            Popular courses loved by students
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#64748B] dark:text-[#94A3B8]">
            Board-aligned curriculum across Mathematics, Science, Languages and more.
            Each course is structured for deep understanding — not rote memorisation.
          </p>
        </div>

        {/* ---- Grid ---- */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              visible={isIntersecting}
            />
          ))}
        </div>

        {/* ---- Footer ---- */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
            Showing 6 of 200+ courses across all subjects and grade levels.
          </p>
          <Link
            to={ROUTES.COURSES}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B2C6F] hover:bg-[#4A2359] text-white text-[14px] font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            View all courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export { PopularCourses };
