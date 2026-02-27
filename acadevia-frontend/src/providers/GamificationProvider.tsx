import React, { useEffect, useState, useCallback } from 'react';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { XPGainAnimation } from '@/components/gamification/XPGainAnimation';
import { BadgeUnlockModal } from '@/components/gamification/BadgeUnlockModal';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import type { GamificationEvent } from '@/types/gamification.types';

const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const animationQueue = useGamificationStore((s) => s.animationQueue);
  const dequeueAnimation = useGamificationStore((s) => s.dequeueAnimation);

  const [currentEvent, setCurrentEvent] = useState<GamificationEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process the next animation in the queue
  useEffect(() => {
    if (isProcessing || animationQueue.length === 0) return;

    const next = dequeueAnimation();
    if (next) {
      setCurrentEvent(next);
      setIsProcessing(true);
    }
  }, [animationQueue, isProcessing, dequeueAnimation]);

  const handleComplete = useCallback(() => {
    setCurrentEvent(null);
    setIsProcessing(false);
  }, []);

  return (
    <>
      {children}

      {/* XP Gain animation */}
      <XPGainAnimation
        show={currentEvent?.type === 'XP_GAINED'}
        amount={(currentEvent?.data?.amount as number) ?? 0}
        onComplete={handleComplete}
      />

      {/* Badge unlock modal */}
      <BadgeUnlockModal
        open={currentEvent?.type === 'BADGE_UNLOCKED'}
        onClose={handleComplete}
        badge={
          currentEvent?.type === 'BADGE_UNLOCKED' && currentEvent.data.badge
            ? {
                name: (currentEvent.data.badge as { name?: string }).name ?? '',
                icon: (currentEvent.data.badge as { iconUrl?: string }).iconUrl ?? '🏆',
                description: (currentEvent.data.badge as { description?: string }).description ?? '',
                rarity: (currentEvent.data.badge as { category?: string }).category ?? 'common',
              }
            : undefined
        }
      />

      {/* Level-up modal */}
      <LevelUpModal
        open={currentEvent?.type === 'LEVEL_UP'}
        onClose={handleComplete}
        newLevel={(currentEvent?.data?.newLevel as number) ?? 1}
        levelName={(currentEvent?.data?.levelName as string) ?? ''}
        rewards={currentEvent?.data?.rewards as string[] | undefined}
      />
    </>
  );
};

export { GamificationProvider };
