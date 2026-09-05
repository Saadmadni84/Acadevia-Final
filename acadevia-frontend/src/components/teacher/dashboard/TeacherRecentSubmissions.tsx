import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Clock, FileText, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';
import type { QuizResultRecord } from '@/services/data.service';

interface TeacherRecentSubmissionsProps {
  submissions: QuizResultRecord[];
  onSelectSubmission?: (sub: QuizResultRecord) => void;
  selectedClass?: number;
}

export const TeacherRecentSubmissions: React.FC<TeacherRecentSubmissionsProps> = ({
  submissions,
  onSelectSubmission,
  selectedClass,
}) => {
  const navigate = useNavigate();

  const getScoreBadge = (pct: number) => {
    if (pct >= 80) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (pct >= 60) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (pct >= 40) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const gradebookUrl = `${ROUTES.TEACHER_STUDENTS}${selectedClass ? `?classGrade=${selectedClass}` : ''}`;

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1A1222] border border-[#E8E4DA] dark:border-[#2D1B36] p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8E4DA]/80 dark:border-[#2D1B36]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Recent Submissions
            </h3>
          </div>

          <button
            type="button"
            onClick={() => navigate(gradebookUrl)}
            className="text-xs font-semibold text-[#5B2C6F] dark:text-[#C084FC] hover:underline flex items-center gap-1"
          >
            View All ({submissions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Submissions Stream */}
        <div className="space-y-2.5">
          {submissions.length > 0 ? (
            submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                onClick={() => {
                  if (onSelectSubmission) {
                    onSelectSubmission(sub);
                  } else {
                    navigate(`${ROUTES.TEACHER_STUDENTS}?studentId=${sub.studentId}`);
                  }
                }}
                className="group p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-[#5B2C6F]/40 dark:hover:border-[#C084FC]/40 hover:bg-white dark:hover:bg-[#20152B] transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B2C6F]/20 to-[#8E44AD]/20 text-[#5B2C6F] dark:text-[#C084FC] font-bold text-xs flex items-center justify-center shrink-0">
                    {sub.studentName ? sub.studentName.charAt(0) : 'S'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#5B2C6F] dark:group-hover:text-[#C084FC] transition-colors">
                      {sub.studentName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                      <span>{sub.quizTitle}</span>
                      <span className="opacity-40">&bull;</span>
                      <span className="inline-flex items-center gap-0.5 text-[11px]">
                        <Clock className="w-3 h-3 opacity-60" />
                        {formatRelativeTime(sub.submittedAt)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getScoreBadge(
                      sub.percentage
                    )}`}
                  >
                    {sub.percentage}%
                  </span>
                  <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                    {sub.score}/{sub.totalPoints}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-gray-400 mx-auto opacity-60" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                No quiz submissions recorded yet.
              </p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                Student test submissions will automatically stream in here as quizzes are submitted.
              </p>
            </div>
          )}
        </div>
      </div>

      {submissions.length > 0 && (
        <button
          type="button"
          onClick={() => navigate(gradebookUrl)}
          className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-[#5B2C6F] dark:text-[#C084FC] hover:underline flex items-center justify-center gap-1 w-full"
        >
          Review Full Gradebook
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
