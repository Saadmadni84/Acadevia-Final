import React from 'react';
import { CheckCircle2, Trophy, Star, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface RecentActivityTimelineProps {
  onOpenXPHistory: () => void;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  onOpenXPHistory,
}) => {
  const navigate = useNavigate();

  const activities = [
    {
      id: '1',
      title: 'Completed Quadratic Equations (Part 1)',
      type: 'lesson',
      xp: '+50 XP',
      time: '2 hours ago',
      route: '/courses',
    },
    {
      id: '2',
      title: 'Passed Light & Optics Concept Quiz (8/10)',
      type: 'quiz',
      xp: '+80 XP',
      time: 'Yesterday',
      route: ROUTES.QUIZZES,
    },
    {
      id: '3',
      title: 'Achieved 5-Day Learning Streak Milestone',
      type: 'streak',
      xp: '+25 XP',
      time: '2 days ago',
      route: ROUTES.LEADERBOARD,
    },
  ];

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
        {activities.map((item) => (
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
        ))}
      </div>
    </div>
  );
};
export default RecentActivityTimeline;
