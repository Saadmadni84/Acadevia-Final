import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Zap, Check, X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { MiniGameProps } from '../GamePlayer';

/* ---------- types ---------- */
interface WheelCategory {
  label: string;
  color: string;
  question: string;
  options: string[];
  correctIndex: number;
  xpReward: number;
}

/* ---------- categories ---------- */
const CATEGORIES: WheelCategory[] = [
  { label: 'Science', color: '#7B3F95', question: 'What gas do plants absorb?', options: ['Oxygen', 'CO₂', 'Nitrogen', 'Helium'], correctIndex: 1, xpReward: 50 },
  { label: 'Math', color: '#E74C3C', question: 'What is π rounded to 2 decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctIndex: 1, xpReward: 50 },
  { label: 'History', color: '#5B2C6F', question: 'In which year did WW2 end?', options: ['1943', '1944', '1945', '1946'], correctIndex: 2, xpReward: 50 },
  { label: 'Geography', color: '#D4A843', question: 'Which is the largest continent?', options: ['Africa', 'Europe', 'Asia', 'N. America'], correctIndex: 2, xpReward: 50 },
  { label: 'Language', color: '#F39C12', question: "'Bonjour' means hello in which language?", options: ['Spanish', 'French', 'Italian', 'German'], correctIndex: 1, xpReward: 50 },
  { label: 'Tech', color: '#B98FD1', question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech ML', 'Hyper Transfer ML', 'Home Tool ML'], correctIndex: 0, xpReward: 50 },
  { label: 'Music', color: '#B08B2E', question: 'How many keys on a standard piano?', options: ['76', '84', '88', '92'], correctIndex: 2, xpReward: 50 },
  { label: 'Sports', color: '#4A2359', question: 'How many players in a soccer team?', options: ['9', '10', '11', '12'], correctIndex: 2, xpReward: 50 },
];

const SEGMENT_ANGLE = 360 / CATEGORIES.length;

/* ---------- SVG wheel ---------- */
const WheelSVG: React.FC<{ rotation: number; spinning: boolean }> = ({ rotation, spinning }) => {
  const size = 280;
  const center = size / 2;
  const radius = center - 10;

  const segments = CATEGORIES.map((cat, i) => {
    const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
    const path = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;

    // Text position
    const midAngle = ((i + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    const tx = center + textRadius * Math.cos(midAngle);
    const ty = center + textRadius * Math.sin(midAngle);
    const textRotation = (i + 0.5) * SEGMENT_ANGLE;

    return { path, color: cat.color, label: cat.label, tx, ty, textRotation };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: rotation }}
        transition={
          spinning
            ? { duration: 4 + Math.random() * 2, ease: [0.2, 0.8, 0.3, 1] }
            : { duration: 0 }
        }
        className="drop-shadow-lg"
        role="img"
        aria-label="Spinning wheel"
      >
        {/* segments */}
        {segments.map((seg, i) => (
          <g key={i}>
            <path d={seg.path} fill={seg.color} stroke="white" strokeWidth="2" />
            <text
              x={seg.tx}
              y={seg.ty}
              fill="white"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${seg.textRotation}, ${seg.tx}, ${seg.ty})`}
              className="select-none pointer-events-none"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              {seg.label}
            </text>
          </g>
        ))}

        {/* center circle */}
        <circle cx={center} cy={center} r="20" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        <circle cx={center} cy={center} r="6" fill="#5B2C6F" />
      </motion.svg>

      {/* pointer (top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
      </div>
    </div>
  );
};

/* ---------- main component ---------- */
const SpinTheWheel: React.FC<MiniGameProps> = ({ isPaused, onScoreChange, onComplete }) => {
  const { t } = useTranslation();

  const [score, setScore] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WheelCategory | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(5);
  const spinCountRef = useRef(0);

  /* spin the wheel */
  const spin = useCallback(() => {
    if (spinning || isPaused || spinsLeft <= 0) return;

    setSelectedCategory(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setSpinning(true);

    const extraRotations = 1440 + Math.random() * 720; // 4-6 full rotations
    const finalAngle = rotation + extraRotations;
    setRotation(finalAngle);

    // Determine which segment the pointer lands on
    setTimeout(() => {
      const normalizedAngle = (360 - (finalAngle % 360)) % 360;
      const index = Math.floor(normalizedAngle / SEGMENT_ANGLE) % CATEGORIES.length;
      setSelectedCategory(CATEGORIES[index]);
      setSpinning(false);
      setSpinsLeft((s) => s - 1);
    }, 5000);
  }, [spinning, isPaused, spinsLeft, rotation]);

  /* answer question */
  const answerQuestion = useCallback(
    (optionIndex: number) => {
      if (selectedAnswer !== null || !selectedCategory || isPaused) return;
      setSelectedAnswer(optionIndex);
      setShowResult(true);

      const isCorrect = optionIndex === selectedCategory.correctIndex;
      if (isCorrect) {
        const newScore = score + selectedCategory.xpReward;
        setScore(newScore);
        onScoreChange(newScore);
      }
    },
    [selectedAnswer, selectedCategory, isPaused, score, onScoreChange],
  );

  /* continue / finish */
  const handleContinue = useCallback(() => {
    if (spinsLeft <= 0) {
      onComplete(score);
      return;
    }
    setSelectedCategory(null);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [spinsLeft, score, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 gap-6">
      {/* header */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">
          {t('game.spinsLeft', 'Spins left')}: <strong>{spinsLeft}</strong>
        </span>
        <span className="text-primary font-bold tabular-nums flex items-center gap-1">
          <Zap className="h-4 w-4" />
          {score} XP
        </span>
      </div>

      {/* wheel or question */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div key="wheel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <WheelSVG rotation={rotation} spinning={spinning} />
            <Button
              variant="gradient"
              size="lg"
              onClick={spin}
              disabled={spinning || isPaused || spinsLeft <= 0}
              leftIcon={<Hand className="h-5 w-5" />}
            >
              {spinning ? t('game.spinning', 'Spinning...') : t('game.tapToSpin', 'Tap to Spin!')}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            {/* category badge */}
            <div className="text-center mb-6">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold"
                style={{ backgroundColor: selectedCategory.color }}
              >
                {selectedCategory.label}
              </span>
            </div>

            {/* question */}
            <p className="text-lg font-semibold text-center mb-6">{selectedCategory.question}</p>

            {/* options */}
            <div className="space-y-3">
              {selectedCategory.options.map((option, i) => {
                const isCorrect = i === selectedCategory.correctIndex;
                const isSelected = i === selectedAnswer;
                return (
                  <motion.button
                    key={i}
                    onClick={() => answerQuestion(i)}
                    disabled={selectedAnswer !== null || isPaused}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      !showResult && 'border-gray-200 dark:border-gray-700 hover:border-primary',
                      showResult && isCorrect && 'border-green-400 bg-green-50 dark:bg-green-900/20',
                      showResult && isSelected && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-900/20',
                    )}
                  >
                    <span>{option}</span>
                    {showResult && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                  </motion.button>
                );
              })}
            </div>

            {/* result + continue */}
            {showResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6 space-y-4">
                <p className={cn('font-bold', selectedAnswer === selectedCategory.correctIndex ? 'text-green-500' : 'text-red-500')}>
                  {selectedAnswer === selectedCategory.correctIndex
                    ? t('game.correctXP', `+${selectedCategory.xpReward} XP!`)
                    : t('game.wrong', 'Wrong answer!')}
                </p>
                <Button variant="primary" onClick={handleContinue}>
                  {spinsLeft > 0 ? t('game.spinAgain', 'Spin Again') : t('game.finish', 'Finish')}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinTheWheel;
