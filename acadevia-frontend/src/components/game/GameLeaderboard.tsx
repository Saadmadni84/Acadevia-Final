import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/* ---------- types ---------- */
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  timeTaken: number; // seconds
  isCurrentUser?: boolean;
}

interface GameLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

/* ---------- podium medal colors ---------- */
const podiumStyles: Record<number, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  1: {
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    text: 'text-yellow-900',
    border: 'ring-4 ring-yellow-300',
    icon: <Crown className="h-6 w-6 text-yellow-300" />,
  },
  2: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
    text: 'text-gray-800',
    border: 'ring-4 ring-gray-200',
    icon: <Medal className="h-5 w-5 text-gray-300" />,
  },
  3: {
    bg: 'bg-gradient-to-br from-[#D4A843] to-[#B08B2E]',
    text: 'text-orange-900',
    border: 'ring-4 ring-orange-200',
    icon: <Medal className="h-5 w-5 text-orange-300" />,
  },
};

/* ---------- format time ---------- */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/* ---------- avatar ---------- */
const PodiumAvatar: React.FC<{ entry: LeaderboardEntry; size: 'sm' | 'lg' }> = ({ entry, size }) => {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-base';
  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold', sizeClass, podiumStyles[entry.rank]?.bg ?? 'bg-primary', podiumStyles[entry.rank]?.border)}>
      {entry.avatarUrl ? (
        <img src={entry.avatarUrl} alt={entry.username} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className={podiumStyles[entry.rank]?.text ?? 'text-white'}>
          {entry.username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

/* ---------- podium ---------- */
const Podium: React.FC<{ top3: LeaderboardEntry[] }> = ({ top3 }) => {
  const { t } = useTranslation();
  // Reorder: 2nd, 1st, 3rd for visual podium
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = ['h-20', 'h-28', 'h-14'];

  return (
    <div className="flex items-end justify-center gap-3 mb-8" role="list" aria-label={t('game.topPlayers', 'Top 3 Players')}>
      {ordered.map((entry, i) => (
        <motion.div
          key={entry.userId}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 120 }}
          className="flex flex-col items-center"
          role="listitem"
        >
          <div className="relative mb-2">
            {entry.rank === 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="absolute -top-4 left-1/2 -translate-x-1/2"
              >
                <Crown className="h-6 w-6 text-yellow-400 drop-shadow" />
              </motion.div>
            )}
            <PodiumAvatar entry={entry} size={entry.rank === 1 ? 'lg' : 'sm'} />
          </div>
          <p className="text-xs font-semibold truncate max-w-[80px] text-center">{entry.username}</p>
          <p className="text-[10px] text-gray-500 tabular-nums">{entry.score.toLocaleString()}</p>
          <div className={cn('w-20 rounded-t-lg mt-2', heights[i], podiumStyles[entry.rank]?.bg ?? 'bg-primary/20')} />
        </motion.div>
      ))}
    </div>
  );
};

/* ---------- table row ---------- */
const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; index: number; isCurrentUser: boolean }> = ({
  entry,
  index,
  isCurrentUser,
}) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.4 + index * 0.05 }}
    className={cn(
      'border-b border-gray-100 dark:border-gray-800 transition-colors',
      isCurrentUser && 'bg-primary/5 dark:bg-primary/10 font-semibold',
    )}
  >
    <td className="py-3 px-4 text-center">
      <span className={cn('inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold', entry.rank <= 3 ? podiumStyles[entry.rank].bg + ' ' + podiumStyles[entry.rank].text : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
        {entry.rank}
      </span>
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {entry.avatarUrl ? (
            <img src={entry.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            entry.username.charAt(0).toUpperCase()
          )}
        </div>
        <span className="truncate">{entry.username}</span>
        {isCurrentUser && (
          <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full shrink-0">You</span>
        )}
      </div>
    </td>
    <td className="py-3 px-4 text-right tabular-nums font-medium">{entry.score.toLocaleString()}</td>
    <td className="py-3 px-4 text-right tabular-nums text-gray-500 text-sm">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatTime(entry.timeTaken)}
      </span>
    </td>
  </motion.tr>
);

/* ---------- main component ---------- */
const GameLeaderboard: React.FC<GameLeaderboardProps> = ({ entries, currentUserId, className }) => {
  const { t } = useTranslation();
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)} role="region" aria-label={t('game.leaderboard', 'Leaderboard')}>
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-6"
      >
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-bold">{t('game.leaderboard', 'Leaderboard')}</h2>
      </motion.div>

      {/* podium */}
      {top3.length >= 3 && <Podium top3={top3} />}

      {/* table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-16">{t('game.rankShort', '#')}</th>
              <th className="py-3 px-4 text-left">{t('game.playerColumn', 'Player')}</th>
              <th className="py-3 px-4 text-right">{t('game.scoreColumn', 'Score')}</th>
              <th className="py-3 px-4 text-right">{t('game.timeColumn', 'Time')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 10).map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                index={i}
                isCurrentUser={entry.isCurrentUser ?? entry.userId === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameLeaderboard;
export { GameLeaderboard };
export type { LeaderboardEntry, GameLeaderboardProps };
