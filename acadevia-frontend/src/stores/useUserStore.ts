import { create } from 'zustand';
import type { UserProfile, UserPreferences } from '@/types/user.types';

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  setProfile: (profile: UserProfile) => void;
  setPreferences: (prefs: UserPreferences) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  profile: null,
  preferences: null,
  setProfile: (profile) => set({ profile }),
  setPreferences: (preferences) => set({ preferences }),
}));
