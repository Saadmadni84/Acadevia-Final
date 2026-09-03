import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import type { GameDefinition } from './gameCatalog';

export const GameThumbnail: React.FC<{ game: GameDefinition; className?: string }> = ({ game, className = '' }) => {
  const Icon = game.icon;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${game.colors} ${className}`} aria-label={`${game.title} artwork`}>
      <div className="absolute -right-4 -top-6 h-28 w-28 rounded-full bg-white/20" />
      <div className="absolute -bottom-8 left-4 h-24 w-24 rounded-full bg-black/10" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0 2px, transparent 3px)' }} />
      <Icon className="absolute bottom-4 left-5 h-16 w-16 text-white drop-shadow-lg" strokeWidth={1.4} />
      <Sparkles className="absolute right-7 top-5 h-6 w-6 text-white/90" />
      <Star className="absolute bottom-6 right-8 h-5 w-5 fill-white text-white/80" />
      <span className="absolute bottom-3 right-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/90">Acadevia</span>
    </div>
  );
};
