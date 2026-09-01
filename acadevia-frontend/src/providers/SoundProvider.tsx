import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Howl, Howler } from 'howler';
import { useSoundStore } from '@/stores/useSoundStore';

type SoundName =
  | 'xpGain'
  | 'levelUp'
  | 'badgeUnlock'
  | 'notification'
  | 'click'
  | 'success'
  | 'error'
  | 'streak';

interface SoundContextValue {
  play: (name: SoundName) => void;
}

const SoundContext = React.createContext<SoundContextValue | null>(null);

const SOUND_FILES: Record<SoundName, string> = {
  xpGain: '/assets/sounds/xp-gain.mp3',
  levelUp: '/assets/sounds/level-up.mp3',
  badgeUnlock: '/assets/sounds/badge-unlock.mp3',
  notification: '/assets/sounds/notification.mp3',
  click: '/assets/sounds/click.mp3',
  success: '/assets/sounds/success.mp3',
  error: '/assets/sounds/error.mp3',
  streak: '/assets/sounds/streak.mp3',
};

const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const enabled = useSoundStore((s) => s.enabled);
  const soundsRef = useRef<Map<SoundName, Howl>>(new Map());
  const isBackgroundRef = useRef(false);

  // Initialize Howler sounds
  useEffect(() => {
    const sounds = soundsRef.current;

    (Object.entries(SOUND_FILES) as [SoundName, string][]).forEach(([name, src]) => {
      if (!sounds.has(name)) {
        sounds.set(
          name,
          new Howl({
            src: [src],
            preload: true,
            volume: 0.5,
            html5: true,
          }),
        );
      }
    });

    return () => {
      sounds.forEach((howl) => howl.unload());
      sounds.clear();
    };
  }, []);

  // Track background/foreground
  useEffect(() => {
    const handleVisibility = () => {
      isBackgroundRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Mute/unmute based on preference
  useEffect(() => {
    Howler.mute(!enabled);
  }, [enabled]);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled || isBackgroundRef.current) return;
      const sound = soundsRef.current.get(name);
      sound?.play();
    },
    [enabled],
  );

  const value = useMemo(() => ({ play }), [play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

function useSound(): SoundContextValue {
  const ctx = React.useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
}

export { SoundProvider, useSound };
export type { SoundName, SoundContextValue };
