import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  HelpCircle,
  Star,
  Trophy,
  Zap,
  Brain,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Quiz } from '@/types/quiz.types';

interface QuizStartProps {
  quiz: Quiz;
  bestScore?: number | null;
  onStart: () => void;
}

const difficultyConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  easy: { icon: Brain, color: 'text-green-500', bg: 'bg-green-500/10' },
  medium: { icon: Flame, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  hard: { icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const QuizStart: React.FC<QuizStartProps> = ({ quiz, bestScore, onStart }) => {
  const { t } = useTranslation();

  const diff = difficultyConfig[quiz.difficulty] ?? difficultyConfig.medium;
  const DiffIcon = diff.icon;

  const stats = [
    {
      icon: HelpCircle,
      label: t('quiz.questions', 'Questions'),
      value: quiz.questionsCount,
    },
    {
      icon: Clock,
      label: t('quiz.timeLimit', 'Time Limit'),
      value: quiz.timeLimit > 0 ? `${quiz.timeLimit}m` : t('quiz.unlimited', 'Unlimited'),
    },
    {
      icon: Star,
      label: t('quiz.xpReward', 'XP Reward'),
      value: `+${quiz.xpReward}`,
    },
  ];

  return (
    <motion.div
      className="max-w-lg mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {quiz.title}
          </motion.h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Difficulty badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                diff.bg,
                diff.color,
              )}
            >
              <DiffIcon className="h-4 w-4" aria-hidden="true" />
              {t(`quiz.difficulty.${quiz.difficulty}`, quiz.difficulty)}
            </span>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-3"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center"
              >
                <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {s.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Previous best score */}
          {bestScore != null && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3"
            >
              <Trophy className="h-5 w-5 text-yellow-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  {t('quiz.previousBest', 'Previous Best')}
                </p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-200">
                  {bestScore}%
                </p>
              </div>
            </motion.div>
          )}

          {/* Start button */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5',
                'bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-base',
                'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
                'transition-shadow duration-300',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              )}
              aria-label={t('quiz.startQuiz', 'Start Quiz')}
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <Zap className="h-5 w-5" aria-hidden="true" />
              </motion.span>
              {t('quiz.startQuiz', 'Start Quiz')}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizStart;
