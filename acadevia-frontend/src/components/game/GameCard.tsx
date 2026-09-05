import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGameById, type GameGenre } from '@/components/games/gameCatalog';
import { GameThumbnail } from '@/components/games/GameThumbnail';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playersCount?: number;
  rating?: number;
  xpReward: number;
  estimatedTime?: string;
  classes?: string;
  genre?: GameGenre;
  className?: string;
}

const diffColors = {
  easy: 'bg-emerald-500/90 text-white border-emerald-400',
  medium: 'bg-amber-500/90 text-white border-amber-400',
  hard: 'bg-rose-500/90 text-white border-rose-400',
} as const;

// Compact recognizable genre tags with emoji
const GENRE_EMOJIS: Record<string, string> = {
  'Arcade & Racing': '🏃 Racing',
  'Simulation & Lab': '🔬 Simulation',
  'Strategy & Building': '🏗️ Strategy',
  'Puzzle & Logic': '🧩 Puzzle',
  'Adventure & Quest': '🗺️ Adventure',
};

export const GameCard: React.FC<GameCardProps> = ({
  id,
  title,
  difficulty,
  xpReward,
  classes,
  genre,
  className,
}) => {
  const game = getGameById(id);
  const resolvedGenre = genre || game?.genre || 'Arcade & Racing';
  const resolvedClasses = classes ?? game?.classes ?? '5–12';
  const genreLabel = GENRE_EMOJIS[resolvedGenre] || `🎮 ${resolvedGenre}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-300 flex flex-col overflow-hidden',
        className
      )}
    >
      <Link to={`/games/${id}`} className="flex flex-col h-full">
        {/* 1. Large Thematic Artwork Area (~70% of card) */}
        <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-gray-950">
          {game ? (
            <GameThumbnail
              game={game}
              preferRaster={true}
              className="h-full w-full transform group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Sparkles className="h-10 w-10 text-amber-500/40 animate-pulse" />
            </div>
          )}

          {/* Overlay ONLY: Difficulty badge (Top Right) */}
          <span
            className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-md ${
              diffColors[difficulty] || diffColors.medium
            }`}
          >
            {difficulty}
          </span>

          {/* Overlay ONLY: +XP Reward Chip (Bottom Left) */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-amber-400/50 text-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <span>+{xpReward} XP</span>
          </div>
        </div>

        {/* 2. Clean Information Area (~30% of card) */}
        <div className="p-4 flex flex-col justify-between flex-1 space-y-2.5 bg-white dark:bg-gray-900">
          <div>
            {/* Game Title */}
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 tracking-tight">
              {title}
            </h3>

            {/* Genre & Class Row */}
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
              <span className="text-amber-600 dark:text-amber-400 truncate font-bold">
                {genreLabel}
              </span>
              <span className="flex items-center gap-1 shrink-0 font-medium">
                <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                <span>Cl. {resolvedClasses}</span>
              </span>
            </div>
          </div>

          {/* Prominent Play CTA Button */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {resolvedGenre.split(' ')[0]}
            </span>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-orange-500 group-hover:to-rose-500 text-white text-xs font-black transition-all shadow-sm group-hover:shadow-md group-hover:shadow-orange-500/30">
              <span>PLAY</span>
              <Play className="h-3 w-3 fill-current transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
