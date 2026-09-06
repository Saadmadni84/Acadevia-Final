import React, { useMemo } from 'react';
import { CheckCircle2, Trophy, Star, ArrowRight, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { dataService, type ActivityRecord } from '@/services/data.service';

import { useAuthStore } from '@/stores/useAuthStore';

interface RecentActivityTimelineProps {
  studentId?: string;
  onOpenXPHistory: () => void;
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return 'Recently';
  }
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  studentId: propStudentId,
  onOpenXPHistory,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeStudentId = propStudentId || (user?.id ? String(user.id) : '');

  const activities = useMemo(() => {
    if (!activeStudentId) return [];
    const real = dataService.getRecentActivities(activeStudentId, 'STUDENT');
    return real.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type === 'QUIZ_COMPLETED' ? 'quiz' : r.type === 'LESSON_COMPLETED' ? 'lesson' : 'streak',
      xp: r.badgeText || '+50 XP',
      time: formatRelativeTime(r.timestamp),
      route: r.type === 'QUIZ_COMPLETED' ? ROUTES.QUIZZES : ROUTES.COURSES,
    })).slice(0, 5);
  }, [activeStudentId]);

  return (
    <div className="surface-card surface-card-hover p-6 space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Your latest milestones & rewards</p>
        </div>

        <button
          onClick={onOpenXPHistory}
          className="text-xs font-bold text-primary dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>XP History</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-2.5">
        {activities.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Clock className="h-4 w-4 opacity-70" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No recent activity</p>
            <p className="text-[11px] text-slate-400 max-w-[220px]">
              Your completed quizzes and watched lessons will appear here.
            </p>
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/40 dark:bg-slate-900/30 hover:border-primary/40 hover:bg-white dark:hover:bg-card-dark transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-900/40 shadow-2xs">
                  {item.type === 'lesson' && <CheckCircle2 className="h-4 w-4" />}
                  {item.type === 'quiz' && <Trophy className="h-4 w-4 text-amber-500" />}
                  {item.type === 'streak' && <Star className="h-4 w-4 text-orange-500" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-purple-300 transition-colors truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 tabular-nums">
                {item.xp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default RecentActivityTimeline;
