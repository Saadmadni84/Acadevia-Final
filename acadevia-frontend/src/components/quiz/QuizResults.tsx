import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  Star,
  RotateCcw,
  ListChecks,
  PartyPopper,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { QuizResult } from '@/types/quiz.types';

interface QuizResultsProps {
  result: QuizResult;
  onReviewAnswers: () => void;
  onRetry: () => void;
}

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Confetti particle ─── */
const ConfettiPiece: React.FC<{ delay: number }> = ({ delay }) => {
  const x = Math.random() * 300 - 150;
  const rotate = Math.random() * 720 - 360;
  const colors = ['#D4A843', '#5B2C6F', '#F39C12', '#E74C3C', '#7B3F95'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute top-0 left-1/2 h-2 w-2 rounded-sm"
      style={{ backgroundColor: color }}
      initial={{ y: -10, x: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 400, x, opacity: 0, rotate }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeOut' }}
      aria-hidden="true"
    />
  );
};

const QuizResults: React.FC<QuizResultsProps> = ({ result, onReviewAnswers, onRetry }) => {
  const { t } = useTranslation();
  const [displayScore, setDisplayScore] = useState(0);
  const [displayXp, setDisplayXp] = useState(0);

  const total = result.correctCount + result.wrongCount + result.skippedCount;
  const scorePercent = total > 0 ? Math.round((result.correctCount / total) * 100) : 0;
  const showConfetti = scorePercent > 80;

  // Animated count-up
  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayScore(Math.round(ease * scorePercent));
      setDisplayXp(Math.round(ease * result.xpEarned));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scorePercent, result.xpEarned]);

  const scoreColor =
    scorePercent >= 80
      ? 'text-green-500'
      : scorePercent >= 50
        ? 'text-yellow-500'
        : 'text-red-500';

  const scoreStroke =
    scorePercent >= 80
      ? '#22c55e'
      : scorePercent >= 50
        ? '#eab308'
        : '#ef4444';

  const offset = CIRCUMFERENCE * (1 - displayScore / 100);

  const formatTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const statsRow = [
    { icon: CheckCircle, label: t('quiz.correct', 'Correct'), value: result.correctCount, color: 'text-green-500' },
    { icon: XCircle, label: t('quiz.wrong', 'Wrong'), value: result.wrongCount, color: 'text-red-500' },
    { icon: MinusCircle, label: t('quiz.skipped', 'Skipped'), value: result.skippedCount, color: 'text-gray-400' },
  ];

  return (
    <motion.div
      className="relative max-w-lg mx-auto overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece key={i} delay={i * 0.05} />
          ))}
        </div>
      )}

      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          {showConfetti && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
              className="mb-2 inline-flex"
            >
              <PartyPopper className="h-8 w-8 text-yellow-500" aria-hidden="true" />
            </motion.div>
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('quiz.resultsTitle', 'Quiz Complete!')}
          </h2>
        </motion.div>

        {/* Score circle */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="relative inline-flex items-center justify-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90" aria-hidden="true">
              <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
              <motion.circle
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke={scoreStroke}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={cn('text-3xl font-bold', scoreColor)}>{displayScore}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('quiz.score', 'Score')}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          {statsRow.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <s.icon className={cn('h-5 w-5', s.color)} aria-hidden="true" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{s.value}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* XP earned */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3"
        >
          <Star className="h-5 w-5 text-yellow-500" aria-hidden="true" />
          <span className="font-bold text-yellow-700 dark:text-yellow-300 text-lg">
            +{displayXp} XP
          </span>
        </motion.div>

        {/* Time taken */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>{t('quiz.timeTaken', 'Time taken')}: {formatTime(result.timeTaken)}</span>
        </motion.div>

        {/* Class average comparison */}
        {result.classAverage > 0 && (
          <motion.div variants={itemVariants} className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
              {t('quiz.classComparison', 'Class Comparison')}
            </p>
            <div className="space-y-1">
              {/* Your score bar */}
              <div className="flex items-center gap-2">
                <span className="w-12 text-xs text-right text-gray-500 dark:text-gray-400">{t('quiz.you', 'You')}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', scorePercent >= 80 ? 'bg-green-500' : scorePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercent}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="w-10 text-xs font-medium text-gray-700 dark:text-gray-300">{scorePercent}%</span>
              </div>
              {/* Class average bar */}
              <div className="flex items-center gap-2">
                <span className="w-12 text-xs text-right text-gray-500 dark:text-gray-400">{t('quiz.avg', 'Avg')}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.classAverage}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <span className="w-10 text-xs font-medium text-gray-700 dark:text-gray-300">{result.classAverage}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <button
            onClick={onReviewAnswers}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-3',
              'text-sm font-semibold text-gray-700 dark:text-gray-200',
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            {t('quiz.reviewAnswers', 'Review Answers')}
          </button>
          <button
            onClick={onRetry}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3',
              'bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold',
              'shadow-lg shadow-primary/25 hover:shadow-xl transition-shadow',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('quiz.retryQuiz', 'Retry Quiz')}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default QuizResults;
