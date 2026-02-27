import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type EnrollState = 'idle' | 'loading' | 'enrolled' | 'continue';

interface EnrollButtonProps {
  state?: EnrollState;
  onEnroll: () => Promise<void> | void;
  onContinue?: () => void;
  className?: string;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
  state: controlledState,
  onEnroll,
  onContinue,
  className,
}) => {
  const { t } = useTranslation();
  const [internalState, setInternalState] = useState<EnrollState>('idle');
  const state = controlledState ?? internalState;

  const handleClick = useCallback(async () => {
    if (state === 'continue') {
      onContinue?.();
      return;
    }
    if (state !== 'idle') return;

    setInternalState('loading');
    try {
      await onEnroll();
      setInternalState('enrolled');
      // Transition to "continue" after showing enrolled state
      setTimeout(() => setInternalState('continue'), 1500);
    } catch {
      setInternalState('idle');
    }
  }, [state, onEnroll, onContinue]);

  const label: Record<EnrollState, string> = {
    idle: t('enroll.enrollNow'),
    loading: t('enroll.enrolling'),
    enrolled: t('enroll.enrolled'),
    continue: t('enroll.continueLearning'),
  };

  const isDisabled = state === 'loading';

  return (
    <motion.button
      onClick={handleClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.96 } : undefined}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        state === 'enrolled' && 'bg-success',
        state !== 'enrolled' &&
          'bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient-x',
        isDisabled && 'cursor-not-allowed opacity-80',
        className,
      )}
      aria-busy={state === 'loading'}
      aria-label={label[state]}
    >
      {/* Shimmer overlay */}
      {state === 'idle' && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          aria-hidden
        />
      )}

      {/* Icon */}
      {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {state === 'enrolled' && <CheckCircle2 className="h-4 w-4" aria-hidden />}
      {state === 'continue' && <ArrowRight className="h-4 w-4" aria-hidden />}

      <span className="relative z-10">{label[state]}</span>
    </motion.button>
  );
};

export { EnrollButton };
