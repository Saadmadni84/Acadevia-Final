import { useCallback } from 'react';
import { useSoundStore } from '@/stores/useSoundStore';

type SoundName = 'xp-gain' | 'level-up' | 'badge-unlock' | 'correct-answer' | 'wrong-answer' | 'streak-bonus';

export function useSound() {
  const enabled = useSoundStore((s) => s.enabled);

  const play = useCallback((name: SoundName) => {
    if (!enabled) return;
    try {
      const audio = new Audio(`/assets/sounds/${name}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch { /* ignore */ }
  }, [enabled]);

  return { play, enabled };
}
