import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, ArrowRight, GripHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface BlankSentence {
  id: number;
  parts: string[]; // parts between blanks, e.g. ["The ", " is ", " than the ", "."]
  blanks: string[]; // correct answers for each blank
  wordBank: string[]; // all words including distractors
}

/* ---------- sample data ---------- */
const SAMPLE_SENTENCES: BlankSentence[] = [
  {
    id: 1,
    parts: ['The ', ' is the powerhouse of the ', '.'],
    blanks: ['mitochondria', 'cell'],
    wordBank: ['mitochondria', 'cell', 'nucleus', 'atom'],
  },
  {
    id: 2,
    parts: ['Water boils at ', ' degrees ', '.'],
    blanks: ['100', 'Celsius'],
    wordBank: ['100', 'Celsius', '212', 'Fahrenheit'],
  },
  {
    id: 3,
    parts: ['The ', ' of gravity is approximately ', ' m/s².'],
    blanks: ['acceleration', '9.8'],
    wordBank: ['acceleration', '9.8', 'velocity', '10.2'],
  },
  {
    id: 4,
    parts: ['In programming, a ', ' stores data while a ', ' performs actions.'],
    blanks: ['variable', 'function'],
    wordBank: ['variable', 'function', 'keyword', 'compiler'],
  },
];

/* ---------- blank slot ---------- */
const BlankSlot: React.FC<{
  index: number;
  filledWord: string | null;
  isCorrect: boolean | null;
  onRemove: () => void;
  onDrop: (word: string) => void;
}> = ({ index, filledWord, isCorrect, onRemove, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[80px] h-9 mx-1 px-3 rounded-lg border-2 border-dashed transition-all text-sm font-medium align-middle',
        filledWord
          ? isCorrect === true
            ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-solid'
            : isCorrect === false
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-solid'
              : 'border-primary bg-primary/5 text-primary border-solid cursor-pointer'
          : isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 dark:border-gray-600',
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const word = e.dataTransfer.getData('text/plain');
        if (word) onDrop(word);
      }}
      onClick={() => filledWord && isCorrect === null && onRemove()}
      role="textbox"
      aria-label={filledWord ?? `Blank ${index + 1}`}
    >
      {filledWord ? (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={
            isCorrect === false
              ? { scale: 1, opacity: 1, x: [0, -4, 4, -4, 4, 0] }
              : { scale: 1, opacity: 1 }
          }
        >
          {filledWord}
        </motion.span>
      ) : (
        <span className="text-gray-400">___</span>
      )}
    </span>
  );
};

/* ---------- word bank item ---------- */
const WordBankItem: React.FC<{
  word: string;
  used: boolean;
  onClick: () => void;
}> = ({ word, used, onClick }) => (
  <motion.button
    layout
    onClick={onClick}
    disabled={used}
    draggable={!used}
    onDragStart={(e: React.DragEvent) => {
      (e as unknown as DragEvent).dataTransfer?.setData('text/plain', word);
    }}
    className={cn(
      'px-4 py-2 rounded-lg text-sm font-medium transition-all select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      used
        ? 'opacity-30 cursor-default bg-gray-100 dark:bg-gray-800 text-gray-400'
        : 'bg-primary/10 text-primary hover:bg-primary/20 cursor-grab active:cursor-grabbing dark:bg-primary/20 dark:hover:bg-primary/30',
    )}
    whileHover={!used ? { scale: 1.05 } : {}}
    whileTap={!used ? { scale: 0.95 } : {}}
    aria-label={`Word: ${word}`}
  >
    <span className="flex items-center gap-1.5">
      {!used && <GripHorizontal className="h-3 w-3 opacity-50" />}
      {word}
    </span>
  </motion.button>
);

/* ---------- main component ---------- */
const FillInBlanks: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>([]);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [checked, setChecked] = useState(false);

  const sentence = SAMPLE_SENTENCES[currentIndex];
  const totalSentences = SAMPLE_SENTENCES.length;

  /* init blanks for current sentence */
  React.useEffect(() => {
    setFilledBlanks(new Array(sentence.blanks.length).fill(null));
    setResults(new Array(sentence.blanks.length).fill(null));
    setChecked(false);
  }, [currentIndex, sentence.blanks.length]);

  const usedWords = new Set(filledBlanks.filter(Boolean));

  /* fill a blank */
  const fillBlank = useCallback(
    (blankIndex: number, word: string) => {
      if (checked || isPaused) return;
      setFilledBlanks((prev) => {
        const next = [...prev];
        next[blankIndex] = word;
        return next;
      });
    },
    [checked, isPaused],
  );

  /* remove from blank */
  const removeFromBlank = useCallback(
    (blankIndex: number) => {
      if (checked || isPaused) return;
      setFilledBlanks((prev) => {
        const next = [...prev];
        next[blankIndex] = null;
        return next;
      });
    },
    [checked, isPaused],
  );

  /* tap word from bank → fill first empty blank */
  const handleWordBankClick = useCallback(
    (word: string) => {
      if (checked || isPaused) return;
      const emptyIndex = filledBlanks.findIndex((b) => b === null);
      if (emptyIndex !== -1) fillBlank(emptyIndex, word);
    },
    [checked, isPaused, filledBlanks, fillBlank],
  );

  /* check answers */
  const checkAnswers = useCallback(() => {
    const res = sentence.blanks.map((correct, i) => filledBlanks[i] === correct);
    setResults(res);
    setChecked(true);
    const correctCount = res.filter(Boolean).length;
    const pointsEarned = correctCount * 100;
    const newScore = score + pointsEarned;
    setScore(newScore);
    onScoreChange(newScore);
  }, [sentence, filledBlanks, score, onScoreChange]);

  /* next sentence */
  const nextSentence = useCallback(() => {
    if (currentIndex + 1 >= totalSentences) {
      onComplete(score);
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, totalSentences, score, onComplete]);

  /* reset */
  const reset = useCallback(() => {
    setFilledBlanks(new Array(sentence.blanks.length).fill(null));
    setResults(new Array(sentence.blanks.length).fill(null));
    setChecked(false);
  }, [sentence.blanks.length]);

  /* render sentence with blanks */
  const renderedSentence = sentence.parts.map((part, i) => (
    <React.Fragment key={i}>
      <span>{part}</span>
      {i < sentence.blanks.length && (
        <BlankSlot
          index={i}
          filledWord={filledBlanks[i]}
          isCorrect={results[i]}
          onRemove={() => removeFromBlank(i)}
          onDrop={(word) => fillBlank(i, word)}
        />
      )}
    </React.Fragment>
  ));

  const allFilled = filledBlanks.every((b) => b !== null);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 gap-8">
      {/* progress */}
      <div className="text-sm text-gray-500">
        {t('game.sentence', 'Sentence')} {currentIndex + 1}/{totalSentences}
      </div>

      {/* score */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-wide text-gray-400">{t('game.score', 'Score')}</p>
        <p className="text-2xl font-bold text-primary tabular-nums">{score}</p>
      </div>

      {/* sentence */}
      <motion.div
        key={sentence.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg sm:text-xl leading-relaxed text-center max-w-xl flex flex-wrap items-center justify-center"
      >
        {renderedSentence}
      </motion.div>

      {/* word bank */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-md" role="region" aria-label={t('game.wordBank', 'Word Bank')}>
        {sentence.wordBank.map((word) => (
          <WordBankItem key={word} word={word} used={usedWords.has(word)} onClick={() => handleWordBankClick(word)} />
        ))}
      </div>

      {/* actions */}
      <div className="flex items-center gap-3">
        {!checked ? (
          <>
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={reset} disabled={isPaused}>
              {t('game.reset', 'Reset')}
            </Button>
            <Button variant="primary" size="lg" leftIcon={<Check className="h-4 w-4" />} onClick={checkAnswers} disabled={!allFilled || isPaused}>
              {t('game.checkAnswers', 'Check Answers')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={nextSentence}>
            {currentIndex + 1 >= totalSentences ? t('game.finish', 'Finish') : t('game.next', 'Next')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FillInBlanks;
