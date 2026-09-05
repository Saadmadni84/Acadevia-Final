import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Trophy,
  CheckCircle2,
  Gamepad2,
  Info,
  Clock,
  Gauge,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GameThumbnail } from './GameThumbnail';
import type { GameMetadata } from './gameCatalog';

interface GameBriefingViewProps {
  game: GameMetadata;
  onStartGame: () => void;
  onBack: () => void;
}

export const GameBriefingView: React.FC<GameBriefingViewProps> = ({
  game,
  onStartGame,
  onBack,
}) => {
  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    hard: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60"
        >
          Back to Games Library
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 bg-primary/10 border-primary/20 text-primary">
            {game.category}
          </Badge>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${diffColors[game.difficulty] || diffColors.medium}`}>
            {game.difficulty}
          </span>
        </div>
      </div>

      {/* Hero Banner with Visual Preview */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 dark:border-gray-800/80 shadow-xl bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
          {/* Visual Preview Side */}
          <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-purple-900/30 flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-gray-800/80">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative group">
              <GameThumbnail game={game} preferRaster={true} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-white/90">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                  <span>Interactive {game.genre}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Metadata Side */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10 backdrop-blur-sm">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  Classes {game.classes}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  +{game.xpReward} XP Reward
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {game.estimatedTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {game.title}
              </h1>
              {game.tagline && (
                <p className="text-base text-primary/90 font-medium italic">
                  "{game.tagline}"
                </p>
              )}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Launch CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="gradient"
                size="lg"
                onClick={onStartGame}
                leftIcon={<Play className="w-5 h-5 fill-white" />}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
              >
                Launch & Play Now
              </Button>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Real simulation mechanics • No multiple choice quizzes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Learning Objectives & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Objectives */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-bold text-lg">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3>Curriculum & Learning Objectives</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Aligned with CBSE/ICSE curriculum for Classes {game.classes}:
          </p>
          <ul className="space-y-2.5">
            {game.learning && game.learning.length > 0 ? (
              game.learning.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Master fundamental principles through real-time exploratory mechanics.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Controls & Interaction */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-bold text-lg">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3>Controls & Keybindings</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hardware controls and input scheme:
          </p>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
            {game.controlsDescription || 'Use mouse click and drag to interact with simulation parameters, sliders, and canvas elements. Keyboard shortcuts displayed on-screen.'}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Mouse Drag & Click
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Keyboard Numbers 1–8
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Space / Enter
            </span>
          </div>
        </div>
      </div>

      {/* How to Play Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-bold text-lg">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Info className="w-5 h-5" />
          </div>
          <h3>How to Play & Scoring Guide</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {game.howToPlay && game.howToPlay.length > 0 ? (
            game.howToPlay.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 flex flex-col space-y-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {step}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 flex flex-col space-y-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">1</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">Inspect the academic parameters and target research challenge.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 flex flex-col space-y-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">2</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">Adjust dynamic controls, calibrate inputs, and run test cycles.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800 flex flex-col space-y-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">3</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">Achieve target tolerance to unlock XP rewards and advance levels.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
