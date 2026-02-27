import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      enabled: true,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: 'acadevia-sound' }
  )
);
