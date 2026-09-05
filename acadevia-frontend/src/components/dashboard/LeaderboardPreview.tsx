import React from 'react';
import { Trophy, Swords, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface LeaderboardPreviewProps {
  currentXP?: number;
  userRank?: number;
}

export const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({
  currentXP = 720,
  userRank = 4,
}) => {
  const navigate = useNavigate();

  const leaders = [
    { rank: 1, name: 'Priya Patel', xp: 1250, badge: '🥇', avatar: '👩‍🎓' },
    { rank: 2, name: 'Rohan Verma', xp: 980, badge: '🥈', avatar: '👨‍🎓' },
    { rank: 3, name: 'Ananya Sen', xp: 860, badge: '🥉', avatar: '👩‍💻' },
    { rank: userRank, name: 'Aarav (You)', xp: currentXP, isCurrentUser: true, avatar: '⚡' },
  ];

  return (
    <div className="surface-card surface-card-hover p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-900/40 shadow-2xs">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Leaderboard
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Class 10 State League</p>
          </div>
        </div>

        <button
          onClick={() => navigate(ROUTES.LEADERBOARD)}
          className="text-xs font-bold text-primary dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Roster */}
      <div className="space-y-2">
        {leaders.map((student) => (
          <div
            key={student.rank}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 transition-all ${
              student.isCurrentUser
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-primary/30 text-primary dark:text-purple-300 shadow-2xs'
                : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-100 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 text-center font-bold text-sm">
                {student.badge || `#${student.rank}`}
              </span>
              <span className="text-base">{student.avatar}</span>
              <span className="truncate font-bold text-slate-800 dark:text-slate-100">{student.name}</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
              {student.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>

      {/* Multiplayer Arena Battle Pass Card */}
      <div
        onClick={() => navigate(ROUTES.GAMES)}
        className="group/arena p-3.5 rounded-xl bg-gradient-to-r from-purple-900/10 via-primary/10 to-indigo-900/10 border border-primary/20 hover:border-primary/40 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs group-hover/arena:scale-105 transition-transform">
            <Swords className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Math Arena Live Duel
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Challenge classmates for +150 XP
            </span>
          </div>
        </div>

        <span className="text-xs font-extrabold text-primary dark:text-purple-300 group-hover/arena:translate-x-0.5 transition-transform">
          Play ⚔️
        </span>
      </div>
    </div>
  );
};
export default LeaderboardPreview;
