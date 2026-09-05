import React from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Brain, TrendingUp, ArrowUpRight } from 'lucide-react';

interface TeacherStatsGridProps {
  totalStudents: number;
  activeCourses: number;
  quizzesCreated: number;
  averageScore: number;
  totalSubmissions: number;
  classLabel?: string;
  onViewStudents?: () => void;
  onViewCourses?: () => void;
  onViewQuizzes?: () => void;
  onViewAnalytics?: () => void;
}

export const TeacherStatsGrid: React.FC<TeacherStatsGridProps> = ({
  totalStudents,
  activeCourses,
  quizzesCreated,
  averageScore,
  totalSubmissions,
  classLabel,
  onViewStudents,
  onViewCourses,
  onViewQuizzes,
  onViewAnalytics,
}) => {
  const getPerformanceBadge = (score: number) => {
    if (totalSubmissions === 0) {
      return { label: 'Awaiting Tests', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' };
    }
    if (score >= 85) {
      return { label: 'Top Tier', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' };
    }
    if (score >= 70) {
      return { label: 'Proficient', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' };
    }
    if (score >= 50) {
      return { label: 'Average', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' };
    }
    return { label: 'Needs Support', color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' };
  };

  const perf = getPerformanceBadge(averageScore);

  const cards = [
    {
      id: 'students',
      label: 'Enrolled Students',
      value: totalStudents,
      subtext: classLabel ? `In ${classLabel}` : 'Active roster',
      icon: Users,
      iconBg: 'from-[#5B2C6F] to-[#7B3F95]',
      badge: `${totalStudents} Active`,
      badgeColor: 'text-[#5B2C6F] dark:text-[#C084FC] bg-[#5B2C6F]/10 dark:bg-[#C084FC]/15',
      onClick: onViewStudents,
    },
    {
      id: 'courses',
      label: 'Curriculum & Lectures',
      value: activeCourses,
      subtext: 'Published chapters & videos',
      icon: Video,
      iconBg: 'from-[#3A1B47] to-[#5B2C6F]',
      badge: 'Live Content',
      badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-500/10',
      onClick: onViewCourses,
    },
    {
      id: 'quizzes',
      label: 'Quizzes & Assessments',
      value: quizzesCreated,
      subtext: totalSubmissions > 0 ? `${totalSubmissions} submissions recorded` : 'Ready to assign',
      icon: Brain,
      iconBg: 'from-[#D4A843] to-[#B08B2E]',
      badge: `${totalSubmissions} Tests`,
      badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-500/10',
      onClick: onViewQuizzes,
    },
    {
      id: 'performance',
      label: 'Class Average Mastery',
      value: totalSubmissions > 0 ? `${averageScore}%` : '--',
      subtext: totalSubmissions > 0 ? `Across ${totalSubmissions} student attempts` : 'No submissions yet',
      icon: TrendingUp,
      iconBg: 'from-[#27AE60] to-[#1E8449]',
      badge: perf.label,
      badgeColor: perf.color,
      onClick: onViewAnalytics,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          onClick={card.onClick}
          className="group relative rounded-2xl bg-white dark:bg-[#1A1222] border border-[#E8E4DA] dark:border-[#2D1B36] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#5B2C6F]/40 dark:hover:border-[#C084FC]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Card Header: Icon + Badge + Arrow */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.iconBg} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300`}>
              <card.icon className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#5B2C6F] dark:group-hover:text-[#C084FC] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card Metric */}
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {card.label}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {card.value}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium pt-0.5">
              {card.subtext}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
