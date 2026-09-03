import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Star, Clock, GraduationCap, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { getGameById } from '@/components/games/gameCatalog';
import { GameThumbnail } from '@/components/games/GameThumbnail';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playersCount: number;
  rating: number;
  xpReward: number;
  estimatedTime: string;
  classes?: string;
  className?: string;
}

const diffColors = { easy: 'success', medium: 'warning', hard: 'accent' } as const;

const GameCard: React.FC<GameCardProps> = ({ id, title, description, thumbnail, category, difficulty, playersCount, rating, xpReward, estimatedTime, classes, className }) => {
  const game = getGameById(id);
  return (
  <motion.div whileHover={{ y: -4, scale: 1.02 }} className={cn('glass-card overflow-hidden group cursor-pointer', className)}>
    <Link to={`/games/${id}`}>
      <div className="relative h-36 bg-gradient-to-br from-[#5B2C6F]/20 to-[#D4A843]/20 overflow-hidden">
        {game ? <GameThumbnail game={game} className="h-full w-full transition-transform duration-300 group-hover:scale-105" /> : thumbnail ? <img src={thumbnail} alt={title} className="w-full h-full object-cover" /> : null}
        <Badge variant={diffColors[difficulty]} className="absolute top-3 left-3 capitalize">{difficulty}</Badge>
        <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">+{xpReward} XP</div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium text-primary uppercase mb-1">{category}</p>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
        <p className="mb-3 flex items-center gap-1 text-xs font-bold text-primary"><GraduationCap className="h-3.5 w-3.5" />Designed for Classes {classes ?? game?.classes}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{playersCount}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{estimatedTime}</span>
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">Play now <Play className="h-3 w-3 fill-current" /></p>
      </div>
    </Link>
  </motion.div>
  );
};

export { GameCard };
