import React from 'react';
import { GameCard } from './GameCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Game {
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
}

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  className?: string;
}

const GameGrid: React.FC<GameGridProps> = ({ games, loading, className }) => {
  if (loading) return (
    <div className={cn('grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden"><Skeleton className="h-36 rounded-none" /><div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /></div></div>
      ))}
    </div>
  );

  if (games.length === 0) return <EmptyState icon={<Gamepad2 />} title="No games available" description="Check back soon for new games!" />;

  return (
    <div className={cn('grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {games.map(g => <GameCard key={g.id} {...g} />)}
    </div>
  );
};

export { GameGrid };
