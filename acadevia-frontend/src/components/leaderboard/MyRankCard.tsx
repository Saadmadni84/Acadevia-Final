import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface MyRankCardProps {
  rank: number;
  name: string;
  avatar?: string;
  xp: number;
  xpToNextRank: number;
  rankChange: number; // positive = moved up, negative = moved down, 0 = same
  className?: string;
}

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const MyRankCard: React.FC<MyRankCardProps> = ({
  rank,
  name,
  avatar,
  xp,
  xpToNextRank,
  rankChange,
  className,
}) => {
  const { t } = useTranslation();

  // Progress towards next rank (assume xp is progress within current band)
  const progressPct = xpToNextRank > 0 ? Math.min((xp / (xp + xpToNextRank)) * 100, 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={cn('glass-card p-4', className)}
      role="region"
      aria-label={t('leaderboard.myRank', 'Your ranking')}
    >
      <div className="flex items-center gap-4">
        {/* Rank badge */}
        <div className="flex flex-col items-center flex-shrink-0">
          <Trophy className={cn('h-5 w-5 mb-0.5', rank <= 3 ? 'text-yellow-500' : 'text-gray-400')} />
          <span className="text-2xl font-extrabold">{ordinal(rank)}</span>

          {/* Rank change */}
          {rankChange !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: rankChange > 0 ? 5 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-center gap-0.5 text-[10px] font-semibold mt-0.5',
                rankChange > 0 ? 'text-secondary' : 'text-accent'
              )}
            >
              {rankChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  <span>↑{rankChange}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  <span>↓{Math.abs(rankChange)}</span>
                </>
              )}
            </motion.span>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={name} src={avatar} size="md" levelRing />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className="text-xs text-gray-500">{xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Progress to next rank */}
      {xpToNextRank > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              {t('leaderboard.nextRank', 'Next Rank')}
            </span>
            <span className="text-[10px] text-gray-500">
              {xpToNextRank.toLocaleString()} XP {t('leaderboard.toGo', 'to go')}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export { MyRankCard };
