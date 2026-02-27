import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Clock, MousePointerClick, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface Card {
  id: number;
  content: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

type GridSize = '4x4' | '6x6';

/* ---------- emoji sets ---------- */
const EMOJI_SETS: Record<GridSize, string[]> = {
  '4x4': ['🌟', '🎯', '🚀', '🎨', '🎵', '🌈', '🔥', '💎'],
  '6x6': ['🌟', '🎯', '🚀', '🎨', '🎵', '🌈', '🔥', '💎', '🎭', '🏆', '⚡', '🍀', '🦋', '🌺', '🎪', '🎲', '🧩', '🎸'],
};

/* ---------- shuffle ---------- */
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- create board ---------- */
const createBoard = (size: GridSize): Card[] => {
  const emojis = EMOJI_SETS[size];
  const pairs = size === '4x4' ? 8 : 18;
  const selected = emojis.slice(0, pairs);
  const cards = selected.flatMap((emoji, i) => [
    { id: i * 2, content: emoji, pairId: i, isFlipped: false, isMatched: false },
    { id: i * 2 + 1, content: emoji, pairId: i, isFlipped: false, isMatched: false },
  ]);
  return shuffle(cards);
};

/* ---------- card component ---------- */
const GameCard: React.FC<{
  card: Card;
  onClick: () => void;
  disabled: boolean;
  showCelebration: boolean;
  showShake: boolean;
}> = ({ card, onClick, disabled, showCelebration, showShake }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled || card.isFlipped || card.isMatched}
    className={cn(
      'relative aspect-square rounded-xl text-3xl sm:text-4xl cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'transition-shadow',
      card.isMatched && 'opacity-70',
    )}
    style={{ perspective: 600 }}
    animate={showShake ? { x: [0, -6, 6, -6, 6, 0] } : {}}
    transition={{ duration: 0.4 }}
    whileTap={{ scale: 0.95 }}
    aria-label={card.isFlipped || card.isMatched ? card.content : 'Hidden card'}
    role="button"
  >
    <motion.div
      className="w-full h-full relative"
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      {/* front (hidden) */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span className="text-white text-2xl font-bold">?</span>
      </div>

      {/* back (revealed) */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl flex items-center justify-center shadow-md',
          card.isMatched
            ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-400'
            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
        )}
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <span>{card.content}</span>
      </div>
    </motion.div>

    {/* celebration effect */}
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 rounded-xl border-4 border-green-400 pointer-events-none"
        />
      )}
    </AnimatePresence>
  </motion.button>
);

/* ---------- main component ---------- */
const MatchThePairs: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();
  const [gridSize] = useState<GridSize>('4x4');
  const [cards, setCards] = useState<Card[]>(() => createBoard('4x4'));
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [celebratingIds, setCelebratingIds] = useState<Set<number>>(new Set());
  const [shakingIds, setShakingIds] = useState<Set<number>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const totalPairs = gridSize === '4x4' ? 8 : 18;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* timer */
  useEffect(() => {
    if (isPaused || matchedPairs >= totalPairs) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, matchedPairs, totalPairs]);

  /* handle card click */
  const handleCardClick = useCallback(
    (cardId: number) => {
      if (isPaused || isChecking) return;
      if (flippedIds.length >= 2) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));

      if (newFlipped.length === 2) {
        setIsChecking(true);
        setMoves((m) => m + 1);

        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.pairId === second.pairId) {
          // Match!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c,
              ),
            );
            setCelebratingIds(new Set([firstId, secondId]));
            setTimeout(() => setCelebratingIds(new Set()), 800);

            const newMatched = matchedPairs + 1;
            setMatchedPairs(newMatched);
            const newScore = newMatched * 100;
            onScoreChange(newScore);

            if (newMatched >= totalPairs) {
              const timeBonus = Math.max(0, 300 - timer * 2);
              const moveBonus = Math.max(0, 200 - moves * 5);
              onComplete(newScore + timeBonus + moveBonus);
            }

            setFlippedIds([]);
            setIsChecking(false);
          }, 500);
        } else {
          // Mismatch
          setTimeout(() => {
            setShakingIds(new Set([firstId, secondId]));
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c,
                ),
              );
              setShakingIds(new Set());
              setFlippedIds([]);
              setIsChecking(false);
            }, 500);
          }, 800);
        }
      }
    },
    [isPaused, isChecking, flippedIds, cards, matchedPairs, totalPairs, timer, moves, onScoreChange, onComplete],
  );

  /* reset */
  const resetGame = useCallback(() => {
    setCards(createBoard(gridSize));
    setFlippedIds([]);
    setMoves(0);
    setTimer(0);
    setMatchedPairs(0);
    setCelebratingIds(new Set());
    setShakingIds(new Set());
    setIsChecking(false);
    onScoreChange(0);
  }, [gridSize, onScoreChange]);

  const cols = gridSize === '4x4' ? 'grid-cols-4' : 'grid-cols-6';

  return (
    <div className="flex flex-col items-center h-full p-4 sm:p-6">
      {/* stats bar */}
      <div className="flex items-center justify-between w-full max-w-lg mb-4 text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <MousePointerClick className="h-4 w-4" />
            {t('game.moves', 'Moves')}: <strong className="tabular-nums">{moves}</strong>
          </span>
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <strong className="tabular-nums">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-primary font-medium">
            <Sparkles className="h-4 w-4" />
            {matchedPairs}/{totalPairs}
          </span>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('game.reset', 'Reset')}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* card grid */}
      <div className={cn('grid gap-2 sm:gap-3 w-full max-w-lg', cols)} role="grid" aria-label={t('game.matchPairs', 'Match the Pairs')}>
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={isPaused || isChecking}
            showCelebration={celebratingIds.has(card.id)}
            showShake={shakingIds.has(card.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchThePairs;
