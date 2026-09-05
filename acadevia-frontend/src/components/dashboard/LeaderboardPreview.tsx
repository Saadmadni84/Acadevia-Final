import React, { useMemo } from 'react';
import { Trophy, Swords, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { dataService, type LeaderboardEntry } from '@/services/data.service';

interface LeaderboardPreviewProps {
  currentXP?: number;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userRank?: number;
}

export const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({
  currentXP = 720,
  userId,
  userName = 'Aarav',
  userAvatar,
  userRank = 1,
}) => {
  const navigate = useNavigate();

  const leaders = useMemo(() => {
    const raw = dataService.getLeaderboard('weekly');
    const sorted = raw.length > 0 ? raw : dataService.getLeaderboard('alltime');

    // Default fallback if no users in dataService yet
    if (!sorted || sorted.length === 0) {
      return [
        { rank: 1, name: 'Priya Patel', xp: 1250, badge: '🥇', avatar: '👩‍🎓', isCurrentUser: false },
        { rank: 2, name: 'Rohan Verma', xp: 980, badge: '🥈', avatar: '👨‍🎓', isCurrentUser: false },
        { rank: 3, name: 'Ananya Sen', xp: 860, badge: '🥉', avatar: '👩‍💻', isCurrentUser: false },
        { rank: userRank, name: `${userName} (You)`, xp: currentXP, isCurrentUser: true, badge: `#${userRank}`, avatar: userAvatar || '⚡' },
      ];
    }

    // Assign badges
    const getBadge = (r: number) => {
      if (r === 1) return '🥇';
      if (r === 2) return '🥈';
      if (r === 3) return '🥉';
      return `#${r}`;
    };

    // Find current user's actual index
    const userIndex = sorted.findIndex((u) => (userId && String(u.userId) === String(userId)) || u.name.toLowerCase().includes(userName.toLowerCase()));
    
    const top3 = sorted.slice(0, 3).map((u, i) => ({
      rank: i + 1,
      name: userIndex === i ? `${u.name} (You)` : u.name,
      xp: userIndex === i ? Math.max(u.xp, currentXP) : u.xp,
      badge: getBadge(i + 1),
      avatar: (userIndex === i && userAvatar) ? userAvatar : (u.avatar || '🎓'),
      isCurrentUser: userIndex === i,
    }));

    if (userIndex >= 3) {
      const u = sorted[userIndex];
      top3.push({
        rank: userIndex + 1,
        name: `${u.name} (You)`,
        xp: Math.max(u.xp, currentXP),
        badge: getBadge(userIndex + 1),
        avatar: userAvatar || u.avatar || '⚡',
        isCurrentUser: true,
      });
    } else if (top3.length < 4 && sorted[3]) {
      top3.push({
        rank: 4,
        name: sorted[3].name,
        xp: sorted[3].xp,
        badge: getBadge(4),
        avatar: sorted[3].avatar || '👨‍🎓',
        isCurrentUser: userIndex === 3,
      });
    }

    return top3;
  }, [userId, userName, currentXP, userRank, userAvatar]);

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
              
              {/* Avatar: image or emoji */}
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                {student.avatar && (student.avatar.startsWith('http') || student.avatar.startsWith('/') || student.avatar.startsWith('data:')) ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className={`w-full h-full flex items-center justify-center text-xs ${
                    student.avatar && (student.avatar.startsWith('http') || student.avatar.startsWith('/') || student.avatar.startsWith('data:')) ? 'hidden' : ''
                  }`}
                >
                  {student.avatar && !student.avatar.startsWith('http') && !student.avatar.startsWith('/') ? student.avatar : '🎓'}
                </span>
              </div>

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
