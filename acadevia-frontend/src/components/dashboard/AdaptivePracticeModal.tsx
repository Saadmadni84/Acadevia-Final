import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import { useGamificationStore } from '@/stores/useGamificationStore';

interface AdaptivePracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
  initialMastery?: number;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const practiceQuestions: Record<string, Question[]> = {
  trig: [
    {
      id: 1,
      text: 'What is the exact value of tan(45°)?',
      options: ['1/2', '1', '√3', '1/√3'],
      correctIndex: 1,
      explanation: 'tan(45°) = sin(45°) / cos(45°) = (1/√2) / (1/√2) = 1.',
    },
    {
      id: 2,
      text: 'In a right-angled triangle, if sin(θ) = 3/5, what is cos(θ)?',
      options: ['4/5', '5/3', '3/4', '2/5'],
      correctIndex: 0,
      explanation: 'Using the identity sin²(θ) + cos²(θ) = 1: cos²(θ) = 1 - (9/25) = 16/25, so cos(θ) = 4/5.',
    },
    {
      id: 3,
      text: 'Which trigonometric ratio corresponds to Adjacent / Hypotenuse?',
      options: ['Sine', 'Tangent', 'Cosine', 'Secant'],
      correctIndex: 2,
      explanation: 'Cosine (cos θ) is defined as the length of the adjacent side divided by the hypotenuse.',
    },
    {
      id: 4,
      text: 'What is the relationship between tan(θ) and cot(θ)?',
      options: ['tan(θ) = 1 + cot(θ)', 'cot(θ) = 1 / tan(θ)', 'cot(θ) = -tan(θ)', 'tan²(θ) = cot²(θ)'],
      correctIndex: 1,
      explanation: 'Cotangent is the reciprocal of tangent: cot(θ) = 1 / tan(θ).',
    },
    {
      id: 5,
      text: 'What is the value of sin²(30°) + cos²(30°)?',
      options: ['0', '1/2', '1', '2'],
      correctIndex: 2,
      explanation: 'For any angle θ, the fundamental Pythagorean trigonometric identity is sin²(θ) + cos²(θ) = 1.',
    },
  ],
  optics: [
    {
      id: 1,
      text: 'A concave lens always produces an image that is:',
      options: ['Real and inverted', 'Virtual, erect, and diminished', 'Virtual and magnified', 'Real and magnified'],
      correctIndex: 1,
      explanation: 'A concave (diverging) lens always forms a virtual, erect, and diminished image regardless of object position.',
    },
    {
      id: 2,
      text: 'Where is the image formed when an object is placed at infinity in front of a concave lens?',
      options: ['At 2F1', 'At focus F1', 'Between F1 and optical center O', 'At optical center O'],
      correctIndex: 1,
      explanation: 'Parallel incident rays from infinity diverge, and their backward extensions meet at focus F1.',
    },
    {
      id: 3,
      text: 'The power of a concave lens having a focal length of -20 cm (-0.2 m) is:',
      options: ['+5 D', '-5 D', '-2 D', '+2 D'],
      correctIndex: 1,
      explanation: 'Power P = 1 / f (in meters) = 1 / (-0.2) = -5 Dioptres.',
    },
    {
      id: 4,
      text: 'What is the nature of the focal length of a concave lens according to sign conventions?',
      options: ['Always positive', 'Always negative', 'Zero', 'Can be positive or negative'],
      correctIndex: 1,
      explanation: 'By Cartesian sign convention, the focal length of a concave lens is always negative.',
    },
    {
      id: 5,
      text: 'If magnification m = +0.6, what does this indicate about the image?',
      options: ['Real and magnified', 'Virtual, erect, and diminished', 'Inverted and diminished', 'Virtual and enlarged'],
      correctIndex: 1,
      explanation: 'A positive magnification implies an erect and virtual image, and |m| < 1 indicates it is diminished.',
    },
  ],
  grammar: [
    {
      id: 1,
      text: 'Select the correct verb: "Neither the teacher nor the students ______ present."',
      options: ['was', 'were', 'is', 'are being'],
      correctIndex: 1,
      explanation: 'When subjects are joined by "neither... nor", the verb agrees with the subject closer to it ("students" -> were).',
    },
    {
      id: 2,
      text: 'Select the correct option: "Each of the participants ______ a certificate."',
      options: ['receive', 'receives', 'are receiving', 'have received'],
      correctIndex: 1,
      explanation: '"Each" is an indefinite pronoun that takes a singular verb ("receives").',
    },
    {
      id: 3,
      text: '"The team of researchers ______ publishing their findings today."',
      options: ['is', 'are', 'were', 'have been'],
      correctIndex: 0,
      explanation: '"Team" is a collective noun acting as a single unit here, taking the singular verb "is".',
    },
    {
      id: 4,
      text: '"Bread and butter ______ our daily breakfast."',
      options: ['are', 'is', 'were', 'have been'],
      correctIndex: 1,
      explanation: 'When two nouns express a single compound idea or item (bread and butter as a meal), a singular verb ("is") is used.',
    },
    {
      id: 5,
      text: '"Ten kilometers ______ a long distance to walk."',
      options: ['are', 'is', 'were', 'seem'],
      correctIndex: 1,
      explanation: 'A quantity or distance treated as a whole unit takes a singular verb ("is").',
    },
  ],
};

export const AdaptivePracticeModal: React.FC<AdaptivePracticeModalProps> = ({
  isOpen,
  onClose,
  topicTitle = 'Trigonometric Ratios',
  initialMastery = 42,
}) => {
  const { addXP } = useGamificationStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const norm = topicTitle.toLowerCase();
  const questions = norm.includes('ray') || norm.includes('lens')
    ? practiceQuestions.optics
    : norm.includes('verb') || norm.includes('agreement') || norm.includes('syntax')
    ? practiceQuestions.grammar
    : practiceQuestions.trig;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed practice
      setIsCompleted(true);
      addXP(50, `Adaptive Practice: ${topicTitle}`);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  const masteryImprovement = Math.round(score * 8);
  const newMastery = Math.min(100, initialMastery + masteryImprovement);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-[#E8E2D8] dark:border-[#382447] shadow-2xl z-10 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  Adaptive Practice
                </span>
                <span className="text-xs text-gray-500 font-semibold">{topicTitle}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                5-Question Diagnostic Micro-Quiz
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isCompleted ? (
            <div className="p-6 space-y-5">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span className="text-primary dark:text-purple-300 font-extrabold">{score} Correct</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                <p className="text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                  {currentQ.text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let optStyle = 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-purple-50/50 dark:hover:bg-purple-950/20';

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = 'border-success bg-success/10 text-success font-bold';
                    } else if (idx === selectedOption) {
                      optStyle = 'border-accent bg-accent/10 text-accent font-bold';
                    } else {
                      optStyle = 'border-gray-200 dark:border-gray-800 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 rounded-xl border text-sm font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <AlertCircle className="h-4 w-4 text-accent" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-primary/20 text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-primary dark:text-purple-300 block mb-0.5">Explanation:</span>
                    {currentQ.explanation}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Practice'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            /* Completed Screen */
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Practice Session Completed!
                </h3>
                <p className="text-xs text-gray-500">
                  You scored {score} / {questions.length} on {topicTitle}.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-primary dark:text-purple-300 font-extrabold text-sm flex items-center gap-1.5">
                  <Zap className="h-4 w-4 fill-current" />
                  <span>+50 XP Earned</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-success font-extrabold text-sm">
                  Mastery: {initialMastery}% → {newMastery}%
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default AdaptivePracticeModal;
