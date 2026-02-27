import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeShowcaseProps {
  badges: Badge[];
  className?: string;
  onBadgeClick?: (badge: Badge) => void;
}

const rarityColors: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges, className, onBadgeClick }) => (
  <div className={cn('grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3', className)}>
    {badges.map((badge, i) => {
      const earned = !!badge.earnedAt;
      return (
        <motion.button
          key={badge.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={earned ? { scale: 1.15, rotate: 5 } : {}}
          onClick={() => earned && onBadgeClick?.(badge)}
          className={cn(
            'relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
            earned ? 'cursor-pointer hover:bg-primary/5' : 'opacity-40 cursor-default'
          )}
        >
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-2xl', earned ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg` : 'bg-gray-200 dark:bg-gray-700')}>
            {earned ? badge.icon : <Lock className="h-5 w-5 text-gray-400" />}
          </div>
          <span className="text-[10px] text-center font-medium leading-tight mt-1 line-clamp-2">{badge.name}</span>
          {earned && badge.rarity === 'legendary' && <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 animate-pulse-glow pointer-events-none" />}
        </motion.button>
      );
    })}
  </div>
);

export { BadgeShowcase };
