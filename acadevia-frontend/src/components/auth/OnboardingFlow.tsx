import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  SkipForward,
  BookOpen,
  Trophy,
  Gamepad2,
  BarChart3,
  Bell,
  BellOff,
  Check,
  PartyPopper,
  Target,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ROUTES, getDashboardRoute } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';

/* ------------------------------------------------------------------ */
/*  Constants & Types                                                  */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 5;
const MIN_SUBJECTS = 2;

interface Subject {
  id: string;
  label: string;
  emoji: string;
}

const SUBJECTS: Subject[] = [
  { id: 'math', label: 'Mathematics', emoji: '📐' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'english', label: 'English', emoji: '📝' },
  { id: 'hindi', label: 'Hindi', emoji: '🕉️' },
  { id: 'cs', label: 'Computer Science', emoji: '💻' },
  { id: 'history', label: 'History', emoji: '📜' },
  { id: 'geography', label: 'Geography', emoji: '🌍' },
  { id: 'arts', label: 'Arts & Music', emoji: '🎨' },
  { id: 'physics', label: 'Physics', emoji: '⚛️' },
  { id: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { id: 'biology', label: 'Biology', emoji: '🧬' },
  { id: 'economics', label: 'Economics', emoji: '📊' },
];

interface FeatureSlide {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    description:
      'Bite-sized, engaging lessons with videos, animations, and popup quizzes that make learning fun and effective.',
  },
  {
    icon: Gamepad2,
    title: 'Learn Through Games',
    description:
      'Master concepts through interactive games designed by expert educators. Compete with friends and earn points.',
  },
  {
    icon: Trophy,
    title: 'Achievements & Badges',
    description:
      'Earn badges and trophies as you progress. Showcase your achievements and climb the leaderboard.',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    description:
      'Detailed analytics show your strengths and areas for improvement. Personalised learning path adapts to you.',
  },
];

const GOAL_LABELS: Record<number, string> = {
  1: 'Casual',
  2: 'Casual',
  3: 'Light',
  4: 'Light',
  5: 'Regular',
  6: 'Regular',
  7: 'Serious',
  8: 'Serious',
  9: 'Intense',
  10: 'Intense',
};

const GOAL_COLORS: Record<string, string> = {
  Casual: 'text-green-500',
  Light: 'text-blue-500',
  Regular: 'text-primary',
  Serious: 'text-amber-500',
  Intense: 'text-accent',
};

/* ------------------------------------------------------------------ */
/*  Slide animation variants                                           */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

/* ------------------------------------------------------------------ */
/*  Confetti burst (simple CSS-based)                                  */
/* ------------------------------------------------------------------ */

const ConfettiBurst: React.FC = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        color: ['#5B2C6F', '#E74C3C', '#D4A843', '#F39C12', '#7B3F95'][i % 5],
        rotation: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '-10%', x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rotation + 720, opacity: 0 }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Progress Dots                                                      */
/* ------------------------------------------------------------------ */

const ProgressDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
    {Array.from({ length: total }, (_, i) => (
      <motion.div
        key={i}
        className={`h-2 rounded-full transition-colors ${i === current
            ? 'bg-primary w-6'
            : i < current
              ? 'bg-primary/40 w-2'
              : 'bg-gray-300 dark:bg-gray-600 w-2'
          }`}
        layout
      />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Step 1 – Welcome                                                   */
/* ------------------------------------------------------------------ */

const StepWelcome: React.FC<{ userName: string }> = ({ userName }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 180 }}
        className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl shadow-lg mb-6"
        aria-hidden="true"
      >
        🎓
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold"
      >
        {t('onboarding.welcome', 'Welcome to')}{' '}
        <span className="gradient-text">Acadevia</span>
        {userName ? `, ${userName}` : ''}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-gray-500 dark:text-gray-400 max-w-md"
      >
        {t(
          'onboarding.welcomeDesc',
          "India's most engaging learning platform. Let's set things up so you get the best experience.",
        )}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 flex items-center gap-2 text-primary"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">
          {t('onboarding.takesMinute', 'This takes less than a minute')}
        </span>
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Step 2 – Feature Carousel                                          */
/* ------------------------------------------------------------------ */

const StepFeatures: React.FC = () => {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  const goTo = (idx: number) => {
    setSlideDir(idx > activeSlide ? 1 : -1);
    setActiveSlide(idx);
  };

  const slide = FEATURE_SLIDES[activeSlide];

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">
        {t('onboarding.howItWorks', 'How Acadevia Works')}
      </h2>

      <div className="relative w-full max-w-sm h-56 overflow-hidden">
        <AnimatePresence custom={slideDir} mode="wait">
          <motion.div
            key={activeSlide}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <slide.icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">{slide.title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-4">
        {FEATURE_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${i === activeSlide ? 'w-6 bg-primary' : 'w-2.5 bg-gray-300 dark:bg-gray-600'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Step 3 – Choose Subjects                                           */
/* ------------------------------------------------------------------ */

interface StepSubjectsProps {
  selected: Set<string>;
  onToggle: (id: string) => void;
}

const StepSubjects: React.FC<StepSubjectsProps> = ({ selected, onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-1 text-center">
        {t('onboarding.chooseSubjects', 'Choose Your Subjects')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 text-center">
        {t('onboarding.minSubjects', `Select at least ${MIN_SUBJECTS} subjects you're interested in.`)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {SUBJECTS.map((s) => {
          const active = selected.has(s.id);
          return (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(s.id)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium border-2 transition-colors ${active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
                }`}
            >
              <span className="text-lg" aria-hidden="true">
                {s.emoji}
              </span>
              <span className="truncate">{s.label}</span>
              {active && <Check className="h-4 w-4 ml-auto shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {selected.size} / {MIN_SUBJECTS}{' '}
        {t('onboarding.selected', 'selected')}
        {selected.size < MIN_SUBJECTS && (
          <span className="text-accent ml-1">
            ({MIN_SUBJECTS - selected.size} {t('onboarding.more', 'more needed')})
          </span>
        )}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Step 4 – Daily Learning Goal                                       */
/* ------------------------------------------------------------------ */

interface StepGoalProps {
  goal: number;
  onChange: (g: number) => void;
}

const StepGoal: React.FC<StepGoalProps> = ({ goal, onChange }) => {
  const { t } = useTranslation();
  const label = GOAL_LABELS[goal] ?? 'Regular';
  const color = GOAL_COLORS[label] ?? 'text-primary';

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-1">
        {t('onboarding.setGoal', 'Set Your Daily Goal')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {t('onboarding.goalDesc', 'How many lessons do you want to complete each day?')}
      </p>

      {/* Large goal number */}
      <motion.div
        key={goal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center mb-6"
      >
        <span className="text-6xl font-extrabold gradient-text">{goal}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('onboarding.lessonsDay', 'lessons / day')}
        </span>
      </motion.div>

      {/* Slider */}
      <div className="w-full max-w-xs">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={goal}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
          aria-label={t('onboarding.goalSlider', 'Lessons per day')}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Commitment label */}
      <div className="mt-4 flex items-center gap-2">
        <Target className={`h-5 w-5 ${color}`} />
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Step 5 – Notifications                                             */
/* ------------------------------------------------------------------ */

interface StepNotificationsProps {
  enabled: boolean;
  onToggle: () => void;
}

const StepNotifications: React.FC<StepNotificationsProps> = ({ enabled, onToggle }) => {
  const { t } = useTranslation();

  const handleToggle = useCallback(() => {
    if (!enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { });
    }
    onToggle();
  }, [enabled, onToggle]);

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-1">
        {t('onboarding.notifications', 'Stay on Track')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        {t(
          'onboarding.notifDesc',
          'Enable notifications so we can remind you about your daily goals and new content.',
        )}
      </p>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        aria-pressed={enabled}
        className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-colors ${enabled
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
          }`}
      >
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${enabled ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}
        >
          {enabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
        </div>
        <div className="text-left">
          <p className="font-semibold">
            {enabled
              ? t('onboarding.notifEnabled', 'Notifications Enabled')
              : t('onboarding.notifDisabled', 'Enable Notifications')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('onboarding.tapToggle', 'Tap to toggle')}
          </p>
        </div>
        {enabled && (
          <Check className="h-5 w-5 text-primary ml-2" />
        )}
      </motion.button>

      <p className="mt-6 text-xs text-gray-400 italic">
        {t('onboarding.changeLater', 'You can change this later in Settings.')}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const OnboardingFlow: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [dailyGoal, setDailyGoal] = useState(3);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  /* ---- Navigation helpers ---- */

  const canProceed = useMemo(() => {
    if (step === 2) return selectedSubjects.size >= MIN_SUBJECTS;
    return true;
  }, [step, selectedSubjects.size]);

  const next = useCallback(() => {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, canProceed]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const skip = useCallback(() => {
    navigate(getDashboardRoute(user?.role));
  }, [navigate, user?.role]);

  const complete = useCallback(async () => {
    setCompleting(true);
    // Simulate saving preferences
    await new Promise((r) => setTimeout(r, 600));
    setShowConfetti(true);
    // Allow confetti to play briefly then redirect
    setTimeout(() => {
      navigate(getDashboardRoute(user?.role));
    }, 2200);
  }, [navigate, user?.role]);

  const toggleSubject = useCallback((id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---- Render current step ---- */

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepWelcome userName={user?.name ?? ''} />;
      case 1:
        return <StepFeatures />;
      case 2:
        return <StepSubjects selected={selectedSubjects} onToggle={toggleSubject} />;
      case 3:
        return <StepGoal goal={dailyGoal} onChange={setDailyGoal} />;
      case 4:
        return (
          <StepNotifications
            enabled={notificationsEnabled}
            onToggle={() => setNotificationsEnabled((e) => !e)}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <>
      {showConfetti && <ConfettiBurst />}

      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl glass-card p-6 sm:p-8"
          role="region"
          aria-label={t('onboarding.ariaLabel', 'Onboarding wizard')}
        >
          {/* Progress dots */}
          <div className="mb-8">
            <ProgressDots current={step} total={TOTAL_STEPS} />
          </div>

          {/* Step content with animated transitions */}
          <div className="relative min-h-[320px] flex items-center justify-center overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <div>
              {step > 0 && (
                <Button
                  variant="ghost"
                  onClick={prev}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  {t('onboarding.back', 'Back')}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isLastStep && (
                <Button variant="ghost" onClick={skip} className="text-gray-400">
                  <SkipForward className="h-4 w-4 mr-1" />
                  {t('onboarding.skip', 'Skip')}
                </Button>
              )}

              {isLastStep ? (
                <Button
                  variant="gradient"
                  onClick={complete}
                  isLoading={completing}
                  rightIcon={<PartyPopper className="h-4 w-4" />}
                >
                  {t('onboarding.finish', "Let's Go!")}
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={next}
                  disabled={!canProceed}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {t('onboarding.next', 'Next')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OnboardingFlow;
