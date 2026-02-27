import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Shuffle,
  CheckCircle2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface FlashCard {
  id: number;
  question: string;
  answer: string;
  status: 'unseen' | 'learning' | 'known';
}

/* ---------- sample cards ---------- */
const SAMPLE_CARDS: Omit<FlashCard, 'status'>[] = [
  { id: 1, question: 'What is the derivative of x²?', answer: '2x' },
  { id: 2, question: 'What does DNA stand for?', answer: 'Deoxyribonucleic Acid' },
  { id: 3, question: "Newton's 2nd Law", answer: 'F = ma (Force = mass × acceleration)' },
  { id: 4, question: 'What is photosynthesis?', answer: 'Process by which plants convert light energy into chemical energy' },
  { id: 5, question: 'Chemical symbol for Gold', answer: 'Au (Aurum)' },
  { id: 6, question: 'What is the Pythagorean theorem?', answer: 'a² + b² = c²' },
  { id: 7, question: 'What is osmosis?', answer: 'Movement of water through a semi-permeable membrane' },
  { id: 8, question: 'Speed of light', answer: '≈ 3 × 10⁸ m/s (299,792,458 m/s)' },
  { id: 9, question: 'What is pH 7?', answer: 'Neutral (neither acidic nor basic)' },
  { id: 10, question: 'Largest organ of the human body', answer: 'Skin' },
];

/* ---------- shuffle utility ---------- */
const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- flip card ---------- */
const FlipCard: React.FC<{
  card: FlashCard;
  isFlipped: boolean;
  onFlip: () => void;
}> = ({ card, isFlipped, onFlip }) => (
  <motion.div
    onClick={onFlip}
    className="w-full max-w-md aspect-[3/2] cursor-pointer select-none"
    style={{ perspective: 1000 }}
    role="button"
    aria-label={isFlipped ? `Answer: ${card.answer}` : `Question: ${card.question}. Tap to reveal answer.`}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onFlip();
      }
    }}
  >
    <motion.div
      className="w-full h-full relative"
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 150, damping: 20 }}
    >
      {/* front - question */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/90 to-secondary/90 flex flex-col items-center justify-center p-6 shadow-xl text-white"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <Eye className="h-5 w-5 opacity-50 mb-3" />
        <p className="text-xl sm:text-2xl font-bold text-center">{card.question}</p>
        <p className="text-xs opacity-60 mt-4">{`Tap to flip`}</p>
      </div>

      {/* back - answer */}
      <div
        className="absolute inset-0 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 shadow-xl"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <BookOpen className="h-5 w-5 text-primary opacity-50 mb-3" />
        <p className="text-lg sm:text-xl font-semibold text-center">{card.answer}</p>
        <p className="text-xs text-gray-400 mt-4">{`Tap to flip back`}</p>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------- stack indicator ---------- */
const StackIndicator: React.FC<{
  known: number;
  learning: number;
  remaining: number;
}> = ({ known, learning, remaining }) => {
  const { t } = useTranslation();
  const total = known + learning + remaining;
  return (
    <div className="flex items-center gap-4 text-xs" role="status">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span>{t('game.known', 'Known')}: {known}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <span>{t('game.learning', 'Learning')}: {learning}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-gray-400" />
        <span>{t('game.remaining', 'Remaining')}: {remaining}</span>
      </div>
    </div>
  );
};

/* ---------- main component ---------- */
const FlashCards: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [cards, setCards] = useState<FlashCard[]>(() =>
    SAMPLE_CARDS.map((c) => ({ ...c, status: 'unseen' as const })),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);

  const stats = useMemo(() => {
    const known = cards.filter((c) => c.status === 'known').length;
    const learning = cards.filter((c) => c.status === 'learning').length;
    const remaining = cards.filter((c) => c.status === 'unseen').length;
    return { known, learning, remaining };
  }, [cards]);

  const currentCard = cards[currentIndex];
  const isFinished = stats.known === cards.length;

  /* flip */
  const handleFlip = useCallback(() => {
    if (isPaused) return;
    setIsFlipped((f) => !f);
  }, [isPaused]);

  /* mark card */
  const markCard = useCallback(
    (status: 'known' | 'learning') => {
      if (isPaused) return;
      setCards((prev) =>
        prev.map((c, i) => (i === currentIndex ? { ...c, status } : c)),
      );

      if (status === 'known') {
        const newScore = score + 50;
        setScore(newScore);
        onScoreChange(newScore);
      }

      // Check if all cards are known
      const futureKnown = cards.filter((c, i) => (i === currentIndex ? status === 'known' : c.status === 'known')).length;
      if (futureKnown === cards.length) {
        onComplete(score + (status === 'known' ? 50 : 0));
        return;
      }

      // Move to next card
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % cards.length);
      }, 200);
    },
    [isPaused, currentIndex, score, cards, onScoreChange, onComplete],
  );

  /* navigate */
  const goTo = useCallback(
    (direction: 'prev' | 'next') => {
      if (isPaused) return;
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((i) =>
          direction === 'next' ? (i + 1) % cards.length : (i - 1 + cards.length) % cards.length,
        );
      }, 150);
    },
    [isPaused, cards.length],
  );

  /* shuffle */
  const handleShuffle = useCallback(() => {
    if (isPaused) return;
    setIsFlipped(false);
    setCards((prev) => shuffleArray(prev));
    setCurrentIndex(0);
  }, [isPaused]);

  /* reset */
  const handleReset = useCallback(() => {
    setCards(SAMPLE_CARDS.map((c) => ({ ...c, status: 'unseen' as const })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    onScoreChange(0);
  }, [onScoreChange]);

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </motion.div>
        <h3 className="text-2xl font-bold">{t('game.allCardsKnown', 'All Cards Mastered!')}</h3>
        <p className="text-gray-500">{t('game.flashCardsComplete', `You scored ${score} XP`)}</p>
        <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={handleReset}>
          {t('game.startOver', 'Start Over')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 gap-6">
      {/* progress */}
      <div className="w-full max-w-md">
        <Progress value={stats.known} max={cards.length} size="sm" gradient />
      </div>

      {/* stats */}
      <StackIndicator known={stats.known} learning={stats.learning} remaining={stats.remaining} />

      {/* card counter */}
      <p className="text-sm text-gray-500">
        {currentIndex + 1} / {cards.length}
      </p>

      {/* card stack visualization */}
      <div className="relative w-full max-w-md">
        {/* background cards for depth */}
        {[2, 1].map((offset) => (
          <div
            key={offset}
            className="absolute inset-0 rounded-2xl bg-gray-200 dark:bg-gray-800 opacity-30"
            style={{ transform: `translateY(${offset * 4}px) scale(${1 - offset * 0.03})`, zIndex: -offset }}
          />
        ))}

        {/* main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <FlipCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* status badge */}
      {currentCard.status !== 'unseen' && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-xs font-medium px-3 py-1 rounded-full',
            currentCard.status === 'known' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
          )}
        >
          {currentCard.status === 'known' ? t('game.known', 'Known') : t('game.learning', 'Learning')}
        </motion.span>
      )}

      {/* action buttons */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => goTo('prev')} aria-label={t('game.previous', 'Previous')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {isFlipped && (
          <>
            <Button
              variant="outline"
              size="md"
              leftIcon={<BookOpen className="h-4 w-4" />}
              onClick={() => markCard('learning')}
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              {t('game.stillLearning', 'Still Learning')}
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => markCard('known')}
            >
              {t('game.knowIt', 'Know It!')}
            </Button>
          </>
        )}

        <Button variant="ghost" size="icon" onClick={() => goTo('next')} aria-label={t('game.next', 'Next')}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" leftIcon={<Shuffle className="h-4 w-4" />} onClick={handleShuffle}>
          {t('game.shuffle', 'Shuffle')}
        </Button>
        <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={handleReset}>
          {t('game.reset', 'Reset')}
        </Button>
      </div>
    </div>
  );
};

export default FlashCards;
