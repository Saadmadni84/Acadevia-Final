import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { PopupQuestion } from '@/types/lesson.types';

interface VideoPopupQuestionProps {
  question: PopupQuestion;
  onAnswer: (correct: boolean) => void;
  className?: string;
}

type AnswerState = 'idle' | 'correct' | 'wrong';

const optionLabels = ['A', 'B', 'C', 'D'] as const;

const VideoPopupQuestion: React.FC<VideoPopupQuestionProps> = ({
  question,
  onAnswer,
  className,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<AnswerState>('idle');

  const handleSelect = (index: number) => {
    if (state !== 'idle') return;
    setSelected(index);

    const isCorrect = index === question.correctIndex;
    setState(isCorrect ? 'correct' : 'wrong');

    // Notify parent after brief delay so animation plays
    setTimeout(() => onAnswer(isCorrect), isCorrect ? 1200 : 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm',
          className,
        )}
        role="dialog"
        aria-modal
        aria-label={t('quiz.popupQuestion')}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="glass-card w-full max-w-md mx-4 p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5 fill-primary" aria-hidden />
            <h3 className="font-bold text-lg">{t('quiz.quickQuestion')}</h3>
          </div>

          {/* Question text */}
          <p className="text-sm font-medium leading-relaxed">{question.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrectOption = idx === question.correctIndex;
              const showCorrect = state === 'wrong' && isCorrectOption;

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={state !== 'idle'}
                  whileHover={state === 'idle' ? { scale: 1.01 } : undefined}
                  whileTap={state === 'idle' ? { scale: 0.98 } : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all border',
                    state === 'idle' &&
                      'border-gray-200 dark:border-white/10 hover:border-primary hover:bg-primary/5',
                    isSelected && state === 'correct' &&
                      'border-success bg-success/10 text-success',
                    isSelected && state === 'wrong' &&
                      'border-red-500 bg-red-500/10 text-red-500',
                    showCorrect && 'border-success bg-success/10 text-success',
                    state !== 'idle' && !isSelected && !showCorrect && 'opacity-40',
                  )}
                  aria-label={`${optionLabels[idx]}. ${option}`}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold shrink-0',
                      state === 'idle' && 'bg-gray-100 dark:bg-white/10',
                      isSelected && state === 'correct' && 'bg-success text-white',
                      isSelected && state === 'wrong' && 'bg-red-500 text-white',
                      showCorrect && 'bg-success text-white',
                    )}
                  >
                    {optionLabels[idx]}
                  </span>
                  <span className="flex-1">{option}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {state === 'correct' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-success font-bold"
                >
                  ✓ {t('quiz.correct')}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: -12 }}
                  transition={{ duration: 0.6 }}
                  className="text-warning font-bold text-sm"
                >
                  +{question.xpReward} XP
                </motion.span>
              </motion.div>
            )}

            {state === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <p className="text-red-500 font-semibold text-sm">✗ {t('quiz.incorrect')}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export { VideoPopupQuestion };
