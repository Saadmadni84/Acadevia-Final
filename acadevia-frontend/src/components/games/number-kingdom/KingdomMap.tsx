import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import type { WorldId, PetType } from './types';
import { KINGDOM_WORLDS, PET_COMPANIONS } from './missionGenerator';
import { cn } from '@/lib/utils';

interface KingdomMapProps {
  unlockedWorlds: WorldId[];
  completedWorlds: WorldId[];
  worldStars: Record<WorldId, number>;
  selectedWorld: WorldId;
  selectedPet: PetType;
  onSelectWorld: (worldId: WorldId) => void;
}

export const KingdomMap: React.FC<KingdomMapProps> = ({
  unlockedWorlds,
  completedWorlds,
  worldStars,
  selectedWorld,
  selectedPet,
  onSelectWorld,
}) => {
  const currentPetConfig =
    PET_COMPANIONS.find((p) => p.id === selectedPet) || PET_COMPANIONS[0];

  return (
    <div className="space-y-6 select-none">
      {/* Map Header Card */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="text-4xl sm:text-5xl animate-bounce">🏰</div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Number Kingdom Map
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              Select an unlocked world to begin your math adventure with{' '}
              <span className="font-bold text-primary dark:text-primary-light">
                {currentPetConfig.avatar} {currentPetConfig.name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-card-dark px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs text-xs font-bold text-gray-700 dark:text-gray-300">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span>
            {completedWorlds.length} / {KINGDOM_WORLDS.length} Realms Mastered
          </span>
        </div>
      </div>

      {/* 9-World Adventure Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KINGDOM_WORLDS.map((world, idx) => {
          const isUnlocked = unlockedWorlds.includes(world.id);
          const isCompleted = completedWorlds.includes(world.id);
          const isCurrent = selectedWorld === world.id;
          const stars = worldStars[world.id] || 0;

          return (
            <motion.button
              key={world.id}
              type="button"
              whileHover={isUnlocked ? { y: -4, scale: 1.02 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelectWorld(world.id)}
              className={cn(
                'relative p-5 sm:p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group min-h-[170px]',
                isCurrent
                  ? 'border-primary ring-4 ring-primary/20 shadow-md bg-white dark:bg-card-dark'
                  : isUnlocked
                  ? 'border-gray-200/90 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-primary/50 shadow-xs'
                  : 'border-gray-200/50 dark:border-gray-800/50 bg-gray-50/60 dark:bg-gray-900/40 opacity-70 cursor-not-allowed'
              )}
            >
              {/* Top Row: Icon + Stars / Lock */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xs"
                    style={{ backgroundColor: world.bgColor, color: world.color }}
                  >
                    {world.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      World {idx + 1}
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                      {world.name}
                    </h3>
                  </div>
                </div>

                {/* Status Indicator */}
                <div>
                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5" aria-label={`${stars} stars`}>
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'h-3.5 w-3.5',
                            s <= stars
                              ? 'text-secondary fill-secondary'
                              : 'text-gray-300 dark:text-gray-700'
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                      <Lock className="h-3 w-3" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle & Description */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {world.description}
                </p>
              </div>

              {/* Bottom State Bar */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs">
                <span
                  className="font-bold text-[11px]"
                  style={{ color: world.color }}
                >
                  {world.subtitle}
                </span>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </span>
                ) : isUnlocked ? (
                  <span className="text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Enter World →
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400">
                    Need {world.requiredStarsToUnlock} Stars
                  </span>
                )}
              </div>

              {/* Active Explorer Avatar Pin */}
              {isCurrent && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  <span>{currentPetConfig.avatar}</span>
                  <span>Here</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
