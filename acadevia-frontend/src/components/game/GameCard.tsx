import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

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
  className?: string;
}

const diffColors = { easy: 'success', medium: 'warning', hard: 'accent' } as const;

const GameCard: React.FC<GameCardProps> = ({ id, title, description, thumbnail, category, difficulty, playersCount, rating, xpReward, estimatedTime, className }) => (
  <motion.div whileHover={{ y: -4, scale: 1.02 }} className={cn('glass-card overflow-hidden group cursor-pointer', className)}>
    <Link to={`/games/${id}`}>
      <div className="relative h-36 bg-gradient-to-br from-[#5B2C6F]/20 to-[#D4A843]/20 overflow-hidden">
        {thumbnail ? <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> :
          <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="h-12 w-12 text-primary/30" /></div>}
        <Badge variant={diffColors[difficulty]} className="absolute top-3 left-3 capitalize">{difficulty}</Badge>
        <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">+{xpReward} XP</div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium text-primary uppercase mb-1">{category}</p>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{playersCount}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{estimatedTime}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export { GameCard };
