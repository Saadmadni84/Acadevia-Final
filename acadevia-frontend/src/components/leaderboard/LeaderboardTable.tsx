import React from 'react';
import { motion } from 'framer-motion';
import { Medal, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-gray-400">{rank}</span>;
};

const changeIcon = (change: string) => {
  if (change === 'up') return <TrendingUp className="h-3.5 w-3.5 text-secondary" />;
  if (change === 'down') return <TrendingDown className="h-3.5 w-3.5 text-accent" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, className }) => (
  <div className={cn('space-y-2', className)}>
    {entries.map((entry, i) => (
      <motion.div
        key={entry.userId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.05 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl transition-colors',
          entry.isCurrentUser ? 'bg-primary/5 border-2 border-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          entry.rank <= 3 && 'glass-card'
        )}
      >
        <div className="w-8 text-center flex-shrink-0">{rankIcon(entry.rank)}</div>
        <Avatar name={entry.name} src={entry.avatar} size="sm" levelRing />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium truncate', entry.isCurrentUser && 'text-primary')}>{entry.name} {entry.isCurrentUser && '(You)'}</p>
          <p className="text-xs text-gray-500">Level {entry.level} · 🔥 {entry.streak}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {changeIcon(entry.change)}
          <span className="text-sm font-bold">{entry.xp.toLocaleString()} XP</span>
        </div>
      </motion.div>
    ))}
  </div>
);

export { LeaderboardTable };
