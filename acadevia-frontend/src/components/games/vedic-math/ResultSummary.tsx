import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Target,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ResultSummaryProps {
  score: number;
  accuracy: number;
  avgTime: number;
  bestStreak: number;
  solvedCount: number;
  earnedXP: number;
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  score,
  accuracy,
  avgTime,
  bestStreak,
  solvedCount,
  earnedXP,
  onPlayAgain,
  onBackToDashboard,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto rounded-3xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-2xl space-y-6 text-center"
    >
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-3xl flex items-center justify-center mx-auto shadow-lg">
        🏆
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Round Completed!
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Supercharged Vedic mental calculation session
        </p>
      </div>

      {/* Primary XP Gain Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-300 dark:border-amber-800 flex items-center justify-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <span className="text-xl font-black text-amber-700 dark:text-amber-300">
          +{earnedXP} Vedic XP Earned
        </span>
      </div>

      {/* Key Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Final Score</span>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {score}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
            <Target className="h-3.5 w-3.5 text-emerald-500" />
            <span>Accuracy</span>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {accuracy}%
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
            <Clock className="h-3.5 w-3.5 text-sky-500" />
            <span>Avg Speed</span>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {avgTime}s
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span>Best Streak</span>
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400">
            {bestStreak}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 col-span-2 sm:col-span-2">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Problems Solved</span>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {solvedCount} questions solved
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={onBackToDashboard}
          className="w-full sm:w-auto font-bold rounded-2xl border-2 border-slate-300 dark:border-slate-700 cursor-pointer"
        >
          <span>Dashboard</span>
        </Button>

        <Button
          variant="gradient"
          size="md"
          onClick={onPlayAgain}
          className="w-full sm:w-auto font-black rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </Button>
      </div>
    </motion.div>
  );
};
