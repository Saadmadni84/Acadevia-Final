import React from 'react';
import { Play, Clock, ArrowRight, BookOpen, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import type { ContinueLearningItem } from '@/services/learningProgress.service';

interface ContinueLearningHeroProps {
  activeLesson?: ContinueLearningItem | null;
  isLoading?: boolean;
}

export const ContinueLearningHero: React.FC<ContinueLearningHeroProps> = ({
  activeLesson,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const subject = activeLesson?.subject || 'Mathematics';
  const title = activeLesson?.title || 'Quadratic Functions & Equations';
  const chapter = activeLesson?.chapter
    ? `Chapter ${activeLesson.chapter}`
    : 'Chapter 4 · Finding the Vertex & Roots';
  const progressPercent = activeLesson?.progressPercent ?? 68;
  const timeLeft = activeLesson?.timeLeft || '12 min remaining';
  const destination = activeLesson?.contentId
    ? `/lesson/${activeLesson.contentId}`
    : '/lesson/less_math_10_quad';

  if (isLoading) {
    return (
      <div className="surface-card p-7 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
      </div>
    );
  }

  return (
    <div className="surface-card surface-card-hover p-6 sm:p-7 relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Metadata, Title, Progress & Actions */}
        <div className="space-y-4 max-w-xl flex-1">
          {/* Top Metadata Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-primary dark:text-purple-300 text-[11px] font-bold border border-primary/20 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {subject}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Continue where you left off
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
              Lesson 4 of 12
            </span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 dark:text-white tracking-[-0.025em] leading-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {chapter}
            </p>
          </div>

          {/* Progress Bar & ETA */}
          <div className="space-y-2 pt-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {timeLeft}
              </span>
              <span className="text-primary dark:text-purple-300 font-bold tabular-nums">
                {progressPercent}% completed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-purple-600 to-[#9C5DBB] transition-all duration-700 ease-out shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate(destination)}
              className="btn-primary-tactile px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 group/btn"
            >
              <Play className="h-3.5 w-3.5 fill-current group-hover/btn:scale-110 transition-transform" />
              <span>Continue Learning</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate(ROUTES.COURSES)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Browse Syllabus
            </button>
          </div>
        </div>

        {/* Right: Immersive Interactive Vector Lesson Canvas */}
        <div
          onClick={() => navigate(destination)}
          className="relative w-full lg:w-60 h-36 rounded-xl bg-gradient-to-br from-[#1E112A] via-[#2D163F] to-[#432052] p-4 text-white overflow-hidden shadow-md flex flex-col justify-between cursor-pointer group/canvas hover:shadow-lg transition-all duration-300 shrink-0 border border-white/10"
        >
          {/* Subtle graph lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 160 100" className="w-full h-full stroke-purple-300 fill-none">
              <line x1="10" y1="80" x2="150" y2="80" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="80" y1="10" x2="80" y2="90" strokeWidth="0.8" strokeDasharray="3 3" />
              <path d="M 20 85 Q 80 15 140 85" strokeWidth="2" />
              <circle cx="80" cy="50" r="3.5" className="fill-purple-300" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs border border-white/15">
              Interactive Video
            </span>
            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              +60 XP
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-mono text-purple-200/80">y = ax² + bx + c</p>
              <p className="text-xs font-bold text-white line-clamp-1">Parabola Vertex</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/canvas:scale-110 group-hover/canvas:bg-white group-hover/canvas:text-primary transition-all duration-300 shadow-sm">
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContinueLearningHero;
