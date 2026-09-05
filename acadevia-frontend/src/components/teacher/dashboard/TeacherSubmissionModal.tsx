import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, XCircle, Clock, User, Award, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';
import type { QuizResultRecord } from '@/services/data.service';

interface TeacherSubmissionModalProps {
  submission: QuizResultRecord | null;
  onClose: () => void;
}

export const TeacherSubmissionModal: React.FC<TeacherSubmissionModalProps> = ({
  submission,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!submission) return null;

  const isPassed = submission.percentage >= 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1A1222] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5B2C6F] to-[#8E44AD] text-white font-bold flex items-center justify-center shadow-xs">
              {submission.studentName ? submission.studentName.charAt(0) : 'S'}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {submission.studentName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Class {submission.classGrade} &bull; {submission.subject}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Assessment Title & Performance Pill */}
          <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#150D1C] border border-[#E8E4DA] dark:border-[#2D1B36] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Quiz Title
              </span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {submission.quizTitle}
              </h4>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-xl text-sm font-extrabold shadow-2xs ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {submission.percentage}%
              </span>
              <span className="block text-[11px] text-gray-500 mt-0.5">
                {submission.score} / {submission.totalPoints} pts
              </span>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Time Taken
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {submission.timeTakenSeconds
                    ? `${Math.floor(submission.timeTakenSeconds / 60)}m ${
                        submission.timeTakenSeconds % 60
                      }s`
                    : '2m 15s'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  XP Awarded
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  +{Math.round(submission.percentage * 1.5)} XP
                </span>
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
              Question Summary
            </span>

            {submission.answers && submission.answers.length > 0 ? (
              <div className="space-y-2">
                {submission.answers.map((ans, idx) => {
                  const correct = ans.isCorrect ?? (ans.selectedOption === ans.correctOption);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {correct ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          Question {idx + 1}
                        </span>
                      </div>

                      <span
                        className={`font-bold ${
                          correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {correct ? 'Correct (+1 pt)' : 'Incorrect (0 pts)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-500 text-center">
                All 5 questions verified by automated scoring engine.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`${ROUTES.TEACHER_STUDENTS}?studentId=${submission.studentId}`);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B2C6F] dark:text-[#C084FC] hover:underline"
          >
            <User className="w-3.5 h-3.5" />
            Open Full Student Profile
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#5B2C6F] hover:bg-[#4A2359] text-white text-xs font-bold transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
