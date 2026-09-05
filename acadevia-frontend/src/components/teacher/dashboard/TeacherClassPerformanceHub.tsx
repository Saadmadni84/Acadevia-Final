import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, Award, ArrowRight, User } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';

interface PerformanceTier {
  label: string;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
}

interface TopPerformer {
  id: string;
  name: string;
  score: number;
  quizzesTaken: number;
}

interface AtRiskStudent {
  id: string;
  name: string;
  score: number;
  weakTopics: string[];
}

interface TeacherClassPerformanceHubProps {
  totalSubmissions: number;
  averageScore: number;
  tiers: PerformanceTier[];
  topPerformers: TopPerformer[];
  atRiskStudents: AtRiskStudent[];
  selectedClass: number;
  selectedSubject: string;
}

export const TeacherClassPerformanceHub: React.FC<TeacherClassPerformanceHubProps> = ({
  totalSubmissions,
  averageScore,
  tiers,
  topPerformers,
  atRiskStudents,
  selectedClass,
  selectedSubject,
}) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1A1222] border border-[#E8E4DA] dark:border-[#2D1B36] p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4DA]/80 dark:border-[#2D1B36]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5B2C6F]/10 dark:bg-[#C084FC]/15 text-[#5B2C6F] dark:text-[#C084FC] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Class Performance & Mastery Hub
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time analytics for Class {selectedClass} &bull; {selectedSubject === 'All' ? 'All Subjects' : selectedSubject}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`${ROUTES.TEACHER_ANALYTICS}?classGrade=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B2C6F] dark:text-[#C084FC] hover:underline self-start sm:self-center"
        >
          Detailed Analytics
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {totalSubmissions === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Awaiting Student Quiz Attempts
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Once students in Class {selectedClass} complete their quizzes or simulations, mastery distribution and intervention alerts will update here dynamically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Mastery Tier Distribution Bar */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Mastery Distribution
              </span>
              <span className="text-xs text-gray-500">
                Class Mean: <strong className="text-gray-900 dark:text-white font-bold">{averageScore}%</strong>
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-4 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex shadow-inner">
              {tiers.map((tier) => (
                <div
                  key={tier.label}
                  style={{ width: `${tier.percentage}%` }}
                  className={`${tier.bgColor} transition-all duration-500 relative group`}
                  title={`${tier.label}: ${tier.count} students (${tier.percentage}%)`}
                />
              ))}
            </div>

            {/* Legend Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {tiers.map((tier) => (
                <div
                  key={tier.label}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${tier.bgColor}`} />
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 truncate">
                      {tier.label}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {tier.count}{' '}
                    <span className="text-[10px] font-normal text-gray-400">
                      ({tier.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Performers Ribbon */}
            {topPerformers.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2.5">
                  Top Performing Students
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {topPerformers.slice(0, 3).map((tp, i) => (
                    <div
                      key={tp.id}
                      onClick={() => navigate(`${ROUTES.TEACHER_STUDENTS}?studentId=${tp.id}`)}
                      className="p-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#150D1C] border border-[#E8E4DA] dark:border-[#2D1B36] hover:border-amber-400/60 dark:hover:border-amber-500/50 hover:shadow-2xs transition-all cursor-pointer flex items-center gap-2.5 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {i === 0 ? <Award className="w-4 h-4 text-amber-500" /> : `#${i + 1}`}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {tp.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {tp.score}% avg &bull; {tp.quizzesTaken} tests
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Intervention Watchlist (Students Needing Support) */}
          <div className="lg:col-span-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-900/40 p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Support Watchlist
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  {atRiskStudents.length} Students
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Students scoring below 60% or showing knowledge gaps that benefit from teacher guidance.
              </p>

              <div className="space-y-2 pt-1">
                {atRiskStudents.length > 0 ? (
                  atRiskStudents.slice(0, 3).map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`${ROUTES.TEACHER_STUDENTS}?studentId=${st.id}`)}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#1A1222] border border-rose-200/60 dark:border-rose-900/30 hover:border-rose-400 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {st.weakTopics.length > 0 ? st.weakTopics.join(', ') : 'Needs reinforcement'}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 shrink-0">
                        {st.score}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center rounded-xl bg-white/60 dark:bg-[#1A1222]/60 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    All students are currently performing at or above grade benchmarks!
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`${ROUTES.TEACHER_STUDENTS}?classGrade=${selectedClass}`)}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1A1222] hover:bg-rose-100/50 dark:hover:bg-rose-900/30 border border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              Open Class Roster & Review
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
