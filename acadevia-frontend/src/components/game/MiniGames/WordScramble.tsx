import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Lightbulb, Check, ArrowRight, Clock, Zap, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface LetterTile {
  id: string;
  letter: string;
}

interface Round {
  word: string;
  hint: string;
}

/* ---------- sample rounds ---------- */
const SAMPLE_ROUNDS: Round[] = [
  { word: 'ALGORITHM', hint: 'A step-by-step procedure' },
  { word: 'FUNCTION', hint: 'A reusable block of code' },
  { word: 'VARIABLE', hint: 'A named data container' },
  { word: 'COMPILER', hint: 'Translates source code' },
  { word: 'DATABASE', hint: 'Organized data storage' },
  { word: 'NETWORK', hint: 'Connected computers' },
  { word: 'ENCRYPT', hint: 'Secure data transformation' },
  { word: 'BOOLEAN', hint: 'True or false type' },
];

/* ---------- scramble ---------- */
const scrambleWord = (word: string): LetterTile[] => {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // Ensure it's actually scrambled
  if (letters.join('') === word) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters.map((l, i) => ({ id: `${l}-${i}`, letter: l }));
};

/* ---------- main component ---------- */
const WordScramble: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [answerTiles, setAnswerTiles] = useState<LetterTile[]>([]);
  const [hintRevealed, setHintRevealed] = useState<Set<number>>(new Set());
  const [hintCost, setHintCost] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const round = SAMPLE_ROUNDS[currentRound];
  const totalRounds = SAMPLE_ROUNDS.length;

  /* initialize round */
  const initRound = useCallback((roundIndex: number) => {
    const r = SAMPLE_ROUNDS[roundIndex];
    if (!r) return;
    setTiles(scrambleWord(r.word));
    setAnswerTiles([]);
    setHintRevealed(new Set());
    setHintCost(0);
    setTimeLeft(30);
    setFeedback(null);
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    initRound(0);
  }, [initRound]);

  /* timer */
  useEffect(() => {
    if (isPaused || feedback || isTransitioning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setFeedback('incorrect');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, feedback, isTransitioning]);

  /* move tile to answer zone */
  const addToAnswer = useCallback((tile: LetterTile) => {
    setTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setAnswerTiles((prev) => [...prev, tile]);
  }, []);

  /* remove tile from answer zone */
  const removeFromAnswer = useCallback((tile: LetterTile) => {
    setAnswerTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setTiles((prev) => [...prev, tile]);
  }, []);

  /* check answer */
  const checkAnswer = useCallback(() => {
    const answer = answerTiles.map((t) => t.letter).join('');
    if (answer === round.word) {
      const timeBonus = timeLeft * 10;
      const roundScore = 100 + timeBonus - hintCost;
      const newScore = score + Math.max(roundScore, 10);
      setScore(newScore);
      onScoreChange(newScore);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  }, [answerTiles, round, timeLeft, hintCost, score, onScoreChange]);

  /* next round or complete */
  const nextRound = useCallback(() => {
    if (currentRound + 1 >= totalRounds) {
      onComplete(score);
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      const next = currentRound + 1;
      setCurrentRound(next);
      initRound(next);
    }, 300);
  }, [currentRound, totalRounds, score, onComplete, initRound]);

  /* hint */
  const useHint = useCallback(() => {
    const word = round.word;
    const unrevealed = word.split('').reduce<number[]>((acc, _, i) => {
      if (!hintRevealed.has(i)) acc.push(i);
      return acc;
    }, []);
    if (unrevealed.length === 0) return;
    const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setHintRevealed((prev) => new Set([...prev, idx]));
    setHintCost((prev) => prev + 25);
  }, [round, hintRevealed]);

  /* tile component */
  const TileButton: React.FC<{ tile: LetterTile; onClick: () => void; zone: 'bank' | 'answer' }> = ({
    tile,
    onClick,
    zone,
  }) => (
    <motion.button
      layout
      onClick={onClick}
      className={cn(
        'h-10 w-10 sm:h-12 sm:w-12 rounded-lg font-bold text-lg flex items-center justify-center select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'active:scale-90 transition-transform',
        zone === 'bank'
          ? 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30'
          : 'bg-primary text-white hover:bg-primary-dark shadow-md',
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Letter ${tile.letter}`}
    >
      {tile.letter}
    </motion.button>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 gap-6">
      {/* header */}
      <div className="flex items-center justify-between w-full max-w-md text-sm">
        <span className="text-gray-500">
          {t('game.round', 'Round')} {currentRound + 1}/{totalRounds}
        </span>
        <span className={cn('flex items-center gap-1 font-mono font-bold tabular-nums', timeLeft <= 10 && 'text-red-500')}>
          <Clock className="h-4 w-4" />
          {timeLeft}s
        </span>
      </div>

      {/* hint line */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{round.hint}</p>
        {hintRevealed.size > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {round.word.split('').map((l, i) => (
              <span
                key={i}
                className={cn(
                  'h-8 w-8 flex items-center justify-center text-sm font-bold rounded',
                  hintRevealed.has(i) ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-transparent',
                )}
              >
                {hintRevealed.has(i) ? l : '_'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* answer zone */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-2 min-h-[56px] px-4 py-3 rounded-xl border-2 border-dashed w-full max-w-md transition-colors',
          feedback === 'correct' && 'border-green-400 bg-green-50 dark:bg-green-900/20',
          feedback === 'incorrect' && 'border-red-400 bg-red-50 dark:bg-red-900/20',
          !feedback && 'border-gray-300 dark:border-gray-700',
        )}
        role="region"
        aria-label={t('game.answerZone', 'Answer zone')}
      >
        <AnimatePresence mode="popLayout">
          {answerTiles.length === 0 ? (
            <motion.p key="placeholder" exit={{ opacity: 0 }} className="text-gray-400 text-sm">
              {t('game.tapToPlace', 'Tap letters to place them here')}
            </motion.p>
          ) : (
            answerTiles.map((tile) => (
              <TileButton key={tile.id} tile={tile} onClick={() => removeFromAnswer(tile)} zone="answer" />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('text-sm font-semibold', feedback === 'correct' ? 'text-green-500' : 'text-red-500')}
          >
            {feedback === 'correct'
              ? t('game.correct', 'Correct! 🎉')
              : t('game.incorrectAnswer', `The answer was: ${round.word}`)}
          </motion.p>
        )}
      </AnimatePresence>

      {/* letter bank */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-md" role="region" aria-label={t('game.letterBank', 'Available letters')}>
        <AnimatePresence mode="popLayout">
          {tiles.map((tile) => (
            <TileButton key={tile.id} tile={tile} onClick={() => addToAnswer(tile)} zone="bank" />
          ))}
        </AnimatePresence>
      </div>

      {/* action buttons */}
      <div className="flex items-center gap-3">
        {!feedback ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Lightbulb className="h-4 w-4" />}
              onClick={useHint}
              disabled={isPaused || hintRevealed.size >= round.word.length / 2}
            >
              {t('game.hint', 'Hint')} (-25 XP)
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Check className="h-4 w-4" />}
              onClick={checkAnswer}
              disabled={isPaused || answerTiles.length !== round.word.length}
            >
              {t('game.check', 'Check')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={nextRound}>
            {currentRound + 1 >= totalRounds ? t('game.finish', 'Finish') : t('game.next', 'Next')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
