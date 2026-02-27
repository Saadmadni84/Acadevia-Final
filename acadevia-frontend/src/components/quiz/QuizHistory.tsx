import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Trophy,
  Calendar,
  TrendingUp,
  Inbox,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { QuizResult } from '@/types/quiz.types';

interface QuizHistoryProps {
  attempts: QuizResult[];
  onReviewAttempt: (attempt: QuizResult) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const QuizHistory: React.FC<QuizHistoryProps> = ({ attempts, onReviewAttempt }) => {
  const { t } = useTranslation();

  if (attempts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Inbox className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {t('quiz.noHistory', 'No Attempts Yet')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
          {t('quiz.noHistoryDesc', 'Complete a quiz to see your attempt history and track your progress.')}
        </p>
      </motion.div>
    );
  }

  const bestScore = Math.max(...attempts.map((a) => a.score));
  const bestAttempt = attempts.find((a) => a.score === bestScore);

  // Chart data – sorted oldest first
  const chartData = [...attempts]
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .map((a, i) => {
      const total = a.correctCount + a.wrongCount + a.skippedCount;
      return {
        attempt: i + 1,
        score: total > 0 ? Math.round((a.correctCount / total) * 100) : 0,
      };
    });

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getScorePercent = (a: QuizResult): number => {
    const total = a.correctCount + a.wrongCount + a.skippedCount;
    return total > 0 ? Math.round((a.correctCount / total) * 100) : 0;
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Trend chart */}
      {attempts.length >= 2 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('quiz.scoreTrend', 'Score Trend')}
            </h3>
          </div>

          <div className="h-48" role="img" aria-label={t('quiz.scoreTrendChart', 'Score trend line chart')}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="attempt"
                  tick={{ fontSize: 12 }}
                  className="fill-gray-500"
                  label={{ value: t('quiz.attempt', 'Attempt'), position: 'insideBottom', offset: -2, fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className="fill-gray-500"
                  label={{ value: '%', position: 'insideLeft', offset: 20, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value}%`, t('quiz.score', 'Score')]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#5B2C6F"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#5B2C6F' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Attempts list */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {t('quiz.pastAttempts', 'Past Attempts')} ({attempts.length})
        </h3>
      </motion.div>

      <div className="space-y-2" role="list" aria-label={t('quiz.attemptsList', 'Quiz attempts list')}>
        {[...attempts]
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .map((attempt) => {
            const pct = getScorePercent(attempt);
            const isBest = attempt.id === bestAttempt?.id;

            return (
              <motion.button
                key={attempt.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onReviewAttempt(attempt)}
                className={cn(
                  'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isBest
                    ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800',
                )}
                role="listitem"
                aria-label={`${t('quiz.attempt', 'Attempt')} #${attempt.attemptNumber}: ${pct}%`}
              >
                {/* Score badge */}
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                    pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500',
                  )}
                >
                  {pct}%
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('quiz.attemptN', 'Attempt #{{n}}', { n: attempt.attemptNumber })}
                    </span>
                    {isBest && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        <Trophy className="h-3 w-3" aria-hidden="true" />
                        {t('quiz.best', 'Best')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatDate(attempt.completedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatTime(attempt.timeTaken)}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
              </motion.button>
            );
          })}
      </div>
    </motion.div>
  );
};

export default QuizHistory;
