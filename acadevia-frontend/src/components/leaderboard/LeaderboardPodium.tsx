import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface PodiumEntry {
  rank: number;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
}

interface LeaderboardPodiumProps {
  top3: PodiumEntry[];
  className?: string;
}

const podiumHeights = ['h-32', 'h-40', 'h-28'];
const podiumOrder = [1, 0, 2];
const podiumColors = ['bg-gradient-to-t from-gray-300 to-gray-400', 'bg-gradient-to-t from-yellow-400 to-yellow-500', 'bg-gradient-to-t from-amber-600 to-amber-700'];

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ top3, className }) => {
  if (top3.length < 3) return null;

  return (
    <div className={cn('flex items-end justify-center gap-2 py-6', className)}>
      {podiumOrder.map((idx, i) => {
        const entry = top3[idx];
        return (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }} className="flex flex-col items-center w-28">
            <div className="relative mb-2">
              {idx === 0 && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-500" />}
              <Avatar name={entry.name} src={entry.avatar} size="lg" levelRing />
            </div>
            <p className="text-xs font-semibold text-center truncate w-full">{entry.name}</p>
            <p className="text-[10px] text-gray-500 mb-1">{entry.xp.toLocaleString()} XP</p>
            <div className={cn('w-full rounded-t-xl flex items-start justify-center pt-2', podiumHeights[i], podiumColors[idx])}>
              <span className="text-2xl font-extrabold text-white">{idx + 1}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export { LeaderboardPodium };
