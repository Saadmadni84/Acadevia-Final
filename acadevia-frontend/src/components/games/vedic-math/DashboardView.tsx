import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Target,
  Zap,
  Flame,
  Trophy,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  VedicGradeBand,
  VedicGameMode,
  UserProgressState,
  VedicTopicId,
  DifficultyLevel,
} from './types';
import { VEDIC_TECHNIQUES, VEDIC_CHALLENGES } from './vedicTechniquesData';

interface DashboardViewProps {
  progress: UserProgressState;
  gradeBand: VedicGradeBand;
  onSelectGradeBand: (band: VedicGradeBand) => void;
  onStartMode: (
    mode: VedicGameMode,
    opts?: { topicId?: VedicTopicId; difficulty?: DifficultyLevel }
  ) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  gradeBand,
  onSelectGradeBand,
  onStartMode,
}) => {
  const selectedPracticeTopic: VedicTopicId = 'mult-11';
  const selectedDifficulty: DifficultyLevel = 'medium';

  const gradeTopics = Object.values(VEDIC_TECHNIQUES).filter((t) =>
    t.gradeBand.includes(gradeBand)
  );

  // Recommended next technique (first one not mastered)
  const nextTechnique =
    gradeTopics.find((t) => progress.mastery[t.id] !== 'mastered') ||
    gradeTopics[0];

  const masteredCount = Object.values(progress.mastery).filter(
    (m) => m === 'mastered'
  ).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Card with Vedic Branding */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-amber-300/80 dark:border-slate-700 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-slate-900 dark:to-slate-900 p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-6"
      >
        {/* Background Mandala / Sanskrit glyph watermark */}
        <div className="absolute right-4 top-2 text-9xl font-serif text-amber-500/5 select-none pointer-events-none">
          ॐ
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Ancient Mathematics Supercharged</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Vedic Math Master
            </h1>
            <p className="text-sm sm:text-base font-semibold text-amber-800/80 dark:text-amber-300/80">
              Think Faster. Calculate Smarter.
            </p>
          </div>

          {/* Grade Band Filter Pill */}
          <div className="space-y-1.5 self-stretch sm:self-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Curriculum Class Band
            </span>
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-xs">
              {(['5-6', '7-8', '9-10', '11-12'] as VedicGradeBand[]).map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => onSelectGradeBand(band)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    gradeBand === band
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                  }`}
                >
                  Class {band}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Progress Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Vedic Level
            </span>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              Level {progress.level}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total XP
            </span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">
              {progress.totalXP} XP
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Best Streak
            </span>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">
              {progress.bestStreak}🔥
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Mastered Techniques
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {masteredCount} / {gradeTopics.length}
            </p>
          </div>
        </div>

        {/* Continue Learning Callout */}
        {nextTechnique && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Recommended Shortcut
              </span>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                {nextTechnique.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {nextTechnique.shortDesc}
              </p>
            </div>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => onStartMode('learn', { topicId: nextTechnique.id })}
              className="rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white cursor-pointer self-end sm:self-auto"
            >
              <span>Learn Shortcut</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>

      {/* Primary Game Mode Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
          Select Game Mode
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Learn Mode */}
          <div
            onClick={() => onStartMode('learn')}
            className="p-6 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:bg-slate-900 hover:border-emerald-500 transition-all hover:shadow-lg cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              🧠 Learn Mode
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Step-by-step visual lessons for all Vedic Sutras, worked examples, and instant mental tests.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition">
              Explore Techniques &rarr;
            </span>
          </div>

          {/* 2. Practice Mode */}
          <div
            onClick={() =>
              onStartMode('practice', {
                topicId: selectedPracticeTopic,
                difficulty: selectedDifficulty,
              })
            }
            className="p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:bg-slate-900 hover:border-amber-500 transition-all hover:shadow-lg cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              🎯 Practice Mode
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Targeted drills on multiplication, squaring, roots, percentages, and fractions at custom difficulties.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition">
              Start Practice &rarr;
            </span>
          </div>

          {/* 3. Time Attack */}
          <div
            onClick={() =>
              onStartMode('time-attack', { topicId: 'mixed-speed', difficulty: 'medium' })
            }
            className="p-6 rounded-3xl border-2 border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent dark:bg-slate-900 hover:border-sky-500 transition-all hover:shadow-lg cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              ⚡ Time Attack
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              60-second adrenaline rush! Solve dynamic problem streams with speed bonuses and combo streaks.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-1 transition">
              Start 60s Rush &rarr;
            </span>
          </div>

          {/* 4. Streak Mode */}
          <div
            onClick={() =>
              onStartMode('streak', { topicId: 'mixed-speed', difficulty: 'easy' })
            }
            className="p-6 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent dark:bg-slate-900 hover:border-rose-500 transition-all hover:shadow-lg cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              🔥 Streak Mode
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              3 lives. Scaling 5x multipliers and increasing difficulty as your consecutive score grows.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition">
              Survive the Streak &rarr;
            </span>
          </div>

          {/* 5. Special Challenges */}
          <div
            onClick={() => onStartMode('challenge')}
            className="p-6 rounded-3xl border-2 border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent dark:bg-slate-900 hover:border-purple-500 transition-all hover:shadow-lg cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              🏆 Master Challenges
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Specialized grandmaster trials: 95², 98×97, √144, ∛125, and 75×48 under strict time limits.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition">
              View Challenges &rarr;
            </span>
          </div>

          {/* 6. Daily Math */}
          <div
            onClick={() =>
              onStartMode('daily', { topicId: 'mixed-speed', difficulty: 'medium' })
            }
            className="p-6 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent dark:bg-slate-900 hover:border-indigo-500 transition-all hover:shadow-lg cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              📅 Daily Vedic Math
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              10 curated daily mental arithmetic problems to build daily streaks and maintain sharp calculation habits.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition">
              Today&apos;s Workout &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Challenges Preview List */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
          Featured Grandmaster Trials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VEDIC_CHALLENGES.map((ch) => (
            <div
              key={ch.id}
              onClick={() =>
                onStartMode('challenge', { topicId: ch.topicId, difficulty: 'hard' })
              }
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition cursor-pointer shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{ch.badgeIcon}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  +{ch.rewardXP} XP
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                {ch.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {ch.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
