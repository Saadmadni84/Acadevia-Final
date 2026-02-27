import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isRevealed: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  onSelect,
  disabled = false,
}) => {
  const letter = LETTERS[index] ?? String(index + 1);

  // Keyboard shortcut: press 1-4 to select
  useEffect(() => {
    if (disabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === String(index + 1)) {
        onSelect(index);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, onSelect, disabled]);

  // Determine visual state
  const isCorrectRevealed = isRevealed && isCorrect === true;
  const isWrongRevealed = isRevealed && isSelected && isCorrect === false;
  const showCorrectHighlight = isRevealed && isCorrect === true;

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      animate={
        isWrongRevealed
          ? { x: [0, -8, 8, -6, 6, 0] }
          : isCorrectRevealed
            ? { scale: [1, 1.04, 1] }
            : {}
      }
      transition={
        isWrongRevealed
          ? { duration: 0.4 }
          : isCorrectRevealed
            ? { duration: 0.3 }
            : { type: 'spring', stiffness: 400, damping: 20 }
      }
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        // Default
        !isSelected &&
          !isRevealed &&
          'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600',
        // Selected (before reveal)
        isSelected &&
          !isRevealed &&
          'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm',
        // Correct revealed
        showCorrectHighlight &&
          'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
        // Wrong revealed
        isWrongRevealed &&
          'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
        // Disabled non-relevant
        disabled && !showCorrectHighlight && !isWrongRevealed && 'opacity-60 cursor-not-allowed',
      )}
      aria-pressed={isSelected}
      aria-label={`${letter}: ${option}`}
      role="option"
      aria-selected={isSelected}
    >
      {/* Letter badge */}
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors',
          !isSelected && !isRevealed && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
          isSelected && !isRevealed && 'bg-primary text-white',
          showCorrectHighlight && 'bg-green-500 text-white',
          isWrongRevealed && 'bg-red-500 text-white',
        )}
        aria-hidden="true"
      >
        {isCorrectRevealed ? (
          <Check className="h-4 w-4" />
        ) : isWrongRevealed ? (
          <X className="h-4 w-4" />
        ) : (
          letter
        )}
      </span>

      {/* Option text */}
      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
        {option}
      </span>

      {/* Keyboard hint */}
      {!disabled && !isRevealed && (
        <kbd
          className="hidden sm:inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-400 font-mono"
          aria-hidden="true"
        >
          {index + 1}
        </kbd>
      )}
    </motion.button>
  );
};

export default QuizOption;
