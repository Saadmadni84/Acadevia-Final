import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Play, Lock, BookOpen, Clock, ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

export interface SubjectChapter {
  id: string;
  number: number;
  title: string;
  duration: string;
  status: 'completed' | 'in_progress' | 'locked';
  score?: string;
  lessonId?: string;
}

export interface SubjectData {
  id: string;
  name: string;
  icon: string;
  classGrade: number;
  completedChapters: number;
  totalChapters: number;
  progressPercent: number;
  description: string;
  chapters: SubjectChapter[];
}

interface SubjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectData | null;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !subject) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-[#E8E2D8] dark:border-[#382447] shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-2xl shadow-xs">
                  {subject.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary dark:text-purple-300">
                      Class {subject.classGrade} Core Syllabus
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-bold text-gray-500">
                      {subject.completedChapters} / {subject.totalChapters} Chapters Done
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {subject.name}
                  </h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
              {subject.description}
            </p>

            {/* Subject Mastery Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                <span>Subject Mastery</span>
                <span className="text-primary dark:text-purple-300 font-black">
                  {subject.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${subject.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider pb-1">
              <span>Chapter Track ({subject.chapters.length})</span>
              <span>Status</span>
            </div>

            {subject.chapters.map((ch) => {
              const isCompleted = ch.status === 'completed';
              const isInProgress = ch.status === 'in_progress';
              const isLocked = ch.status === 'locked';

              return (
                <div
                  key={ch.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isInProgress
                      ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs'
                      : isCompleted
                      ? 'border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark'
                      : 'border-gray-200/50 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold ${
                        isCompleted
                          ? 'bg-success/15 text-success'
                          : isInProgress
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : isInProgress ? '→' : <Lock className="h-3.5 w-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isCompleted
                            ? 'text-gray-800 dark:text-gray-200'
                            : isInProgress
                            ? 'text-primary dark:text-purple-300 font-extrabold'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Chapter {ch.number} · {ch.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ch.duration}
                        </span>
                        {ch.score && (
                          <>
                            <span>•</span>
                            <span className="text-success font-semibold flex items-center gap-1">
                              <Award className="h-3 w-3" /> Score {ch.score}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isInProgress ? (
                      <button
                        onClick={() => {
                          onClose();
                          navigate(ch.lessonId ? `/lesson/${ch.lessonId}` : ROUTES.COURSES);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Resume</span>
                      </button>
                    ) : isCompleted ? (
                      <button
                        onClick={() => {
                          onClose();
                          navigate(ch.lessonId ? `/lesson/${ch.lessonId}` : ROUTES.COURSES);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226] flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                navigate(ROUTES.COURSES);
              }}
              className="text-xs font-bold text-primary dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All {subject.name} Courses</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default SubjectDetailModal;
