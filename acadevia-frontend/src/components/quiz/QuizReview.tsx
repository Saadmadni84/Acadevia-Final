import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizResult } from '@/types/quiz.types';
import { MathMarkdownRenderer } from '@/components/common/MathMarkdownRenderer';

interface QuizReviewProps {
  questions: QuizQuestion[];
  result: QuizResult;
  onBackToCourse: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const QuizReview: React.FC<QuizReviewProps> = ({ questions, result, onBackToCourse }) => {
  const { t } = useTranslation();

  const total = result.correctCount + result.wrongCount + result.skippedCount;
  const scorePercent = total > 0 ? Math.round((result.correctCount / total) * 100) : 0;

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Score summary header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('quiz.reviewTitle', 'Answer Review')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {result.correctCount}/{total} {t('quiz.correct', 'correct')} &middot; {scorePercent}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            {result.correctCount}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {result.wrongCount}
          </span>
        </div>
      </motion.div>

      {/* Questions list */}
      <div className="space-y-4" role="list" aria-label={t('quiz.questionsList', 'Questions list')}>
        {questions.map((q, qi) => {
          const answer = result.answers.find((a) => a.questionId === q.id);
          const isCorrect = answer?.isCorrect ?? false;
          const selectedIdx = answer?.selectedIndex ?? -1;
          const correctIdx = answer?.correctIndex ?? q.correctIndex;

          return (
            <motion.div
              key={q.id}
              variants={itemVariants}
              className={cn(
                'rounded-xl border-2 p-4 space-y-3',
                isCorrect
                  ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                  : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10',
              )}
              role="listitem"
            >
              {/* Question header */}
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                    isCorrect ? 'bg-green-500' : 'bg-red-500',
                  )}
                  aria-hidden="true"
                >
                  {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('quiz.questionN', 'Question {{n}}', { n: qi + 1 })}
                  </p>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                    <MathMarkdownRenderer content={q.text} />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-1.5 pl-10">
                {q.options.map((opt, oi) => {
                  const isThisCorrect = oi === correctIdx;
                  const isThisSelected = oi === selectedIdx;

                  return (
                    <div
                      key={oi}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                        isThisCorrect && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium',
                        isThisSelected && !isThisCorrect && 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 line-through',
                        !isThisCorrect && !isThisSelected && 'text-gray-600 dark:text-gray-400',
                      )}
                    >
                      <span className="font-mono text-xs w-5 flex-shrink-0" aria-hidden="true">
                        {LETTERS[oi] ?? oi + 1}.
                      </span>
                      <span className="flex-1 min-w-0 break-words leading-relaxed">
                        <MathMarkdownRenderer content={opt} />
                      </span>
                      {isThisCorrect && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" aria-hidden="true" />}
                      {isThisSelected && !isThisCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="ml-10 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 p-3">
                  <p className="text-xs font-semibold text-primary dark:text-purple-300 mb-0.5">
                    {t('quiz.explanation', 'Explanation')}
                  </p>
                  <div className="text-xs text-[#172033] dark:text-gray-300 leading-relaxed">
                    <MathMarkdownRenderer content={q.explanation} />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Back button */}
      <motion.div variants={itemVariants} className="pt-2">
        <button
          onClick={onBackToCourse}
          className={cn(
            'flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-5 py-3',
            'text-sm font-semibold text-gray-700 dark:text-gray-200',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('quiz.backToCourse', 'Back to Course')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QuizReview;
