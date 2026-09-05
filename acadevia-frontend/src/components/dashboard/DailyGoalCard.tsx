import React from 'react';
import { Flame, CheckCircle2, Circle, Check, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface DailyGoalCardProps {
  todayMinutes?: number;
  goalMinutes?: number;
  streak?: number;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  todayMinutes = 20,
  goalMinutes = 30,
  streak = 5,
}) => {
  const navigate = useNavigate();
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  const weekDays = [
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active: true },
    { day: 'T', active: true },
    { day: 'F', active: true },
    { day: 'S', active: false },
    { day: 'S', active: false },
  ];

  const missions = [
    { id: '1', title: 'Complete 2 video lessons', current: 1, target: 2, completed: false, xp: '+40 XP', route: ROUTES.COURSES },
    { id: '2', title: 'Play 1 curriculum game quest', current: 1, target: 1, completed: true, xp: '+50 XP', route: ROUTES.GAMES },
    { id: '3', title: 'Score 80%+ on concept quiz', current: 0, target: 1, completed: false, xp: '+60 XP', route: ROUTES.QUIZZES },
  ];

  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="surface-card surface-card-hover p-6 space-y-5">
      {/* Top Banner: Daily Goal Minutes & Streak */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/20 dark:from-orange-500/20 dark:to-amber-500/10 text-streak flex items-center justify-center border border-orange-200/60 dark:border-orange-900/40 shadow-2xs">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Focus Goal
            </h3>
            <span className="text-xs text-streak font-semibold flex items-center gap-1">
              🔥 {streak} Day Streak
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
            {todayMinutes} / {goalMinutes} min
          </span>
          <span className="text-[11px] font-bold text-slate-400 block tabular-nums">
            {progressPercent}% Complete
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-streak transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Apple-Style Weekly Streak Activity Dots */}
      <div className="flex items-center justify-between pt-1 pb-1">
        {weekDays.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                d.active
                  ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400'
              }`}
            >
              {d.active ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : '•'}
            </div>
          </div>
        ))}
      </div>

      {/* Today's Missions */}
      <div className="space-y-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Daily Missions
          </span>
          <span className="text-primary dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-primary/20 text-[11px]">
            {completedCount} of {missions.length} done
          </span>
        </div>

        <div className="space-y-2">
          {missions.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.route)}
              className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 transition-all cursor-pointer ${
                m.completed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/70 dark:border-white/[0.06] hover:border-primary/40 hover:bg-white dark:hover:bg-card-dark shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {m.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span className={`truncate ${m.completed ? 'line-through opacity-70' : 'text-slate-800 dark:text-slate-200 font-semibold'}`}>
                  {m.title}
                </span>
              </div>

              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 shadow-2xs text-amber-600 dark:text-amber-400 shrink-0 border border-slate-200/60 dark:border-slate-700">
                {m.xp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DailyGoalCard;
