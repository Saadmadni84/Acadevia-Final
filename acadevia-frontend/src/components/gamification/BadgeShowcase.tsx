import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface BadgeItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  category?: string;
  earnedAt?: string;
  isEarned?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeShowcaseProps {
  badges: BadgeItem[];
  className?: string;
  onBadgeClick?: (badge: BadgeItem) => void;
}

const rarityConfig: Record<string, { gradient: string; ring: string; glow: string; label: string }> = {
  common: {
    gradient: 'from-slate-400 to-slate-600',
    ring: 'ring-slate-300 dark:ring-slate-600',
    glow: 'from-slate-400/20 to-slate-600/20',
    label: 'Common',
  },
  rare: {
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-300 dark:ring-blue-600',
    glow: 'from-blue-400/20 to-indigo-500/20',
    label: 'Rare',
  },
  epic: {
    gradient: 'from-purple-500 to-pink-600',
    ring: 'ring-purple-300 dark:ring-purple-600',
    glow: 'from-purple-400/20 to-pink-500/20',
    label: 'Epic',
  },
  legendary: {
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-300 dark:ring-orange-500',
    glow: 'from-amber-400/25 to-orange-500/25',
    label: 'Legendary',
  },
};

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges, className, onBadgeClick }) => {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4', className)}>
      {badges.map((badge, i) => {
        const earned = badge.isEarned ?? Boolean(badge.earnedAt);
        const rarity = badge.rarity && rarityConfig[badge.rarity] ? badge.rarity : 'common';
        const config = rarityConfig[rarity];

        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileHover={earned ? { y: -4, scale: 1.02 } : {}}
            onClick={() => earned && onBadgeClick?.(badge)}
            className={cn(
              'group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-200 text-center',
              earned
                ? 'bg-gradient-to-b from-gray-50/90 to-white dark:from-gray-800/80 dark:to-card-dark border-gray-100 dark:border-gray-700/80 shadow-sm hover:shadow-md cursor-pointer'
                : 'bg-gray-50/50 dark:bg-gray-800/30 border-dashed border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
            )}
          >
            {/* Badge Icon / Lock Indicator */}
            <div className="relative mb-3">
              <div
                className={cn(
                  'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-200 group-hover:scale-105',
                  earned
                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-md ring-2 ring-white dark:ring-gray-800`
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                )}
              >
                {earned ? (
                  badge.iconUrl ? (
                    <img src={badge.iconUrl} alt={badge.name} className="h-9 w-9 object-contain" />
                  ) : (
                    <span>{badge.icon || '🏅'}</span>
                  )
                ) : (
                  <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Status Badge Overlays */}
              {earned && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-gray-900 shadow-sm">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}

              {earned && rarity === 'legendary' && (
                <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white ring-2 ring-white dark:ring-gray-900 shadow-sm animate-pulse">
                  <Sparkles className="h-3 w-3" />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="w-full flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {badge.name}
                </h4>
                {badge.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                    {badge.description}
                  </p>
                )}
              </div>

              {/* Footer / Status Label */}
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/60 w-full">
                {earned ? (
                  <span className="text-[10px] font-semibold text-primary dark:text-primary-light uppercase tracking-wider">
                    {badge.earnedAt
                      ? new Date(badge.earnedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : config.label}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    Locked
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export { BadgeShowcase };
