import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';
import { queryClient } from '@/providers/QueryProvider';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (
    user: AuthUser,
    accessTokenOrTokens: string | { accessToken?: string; refreshToken?: string },
    refreshToken?: string
  ) => void;
  setUser: (user: AuthUser) => void;
  setTokens: (
    accessTokenOrTokens: string | { accessToken?: string; refreshToken?: string },
    refreshToken?: string
  ) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user, accessTokenOrTokens, refreshTokenParam) => {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;
        if (typeof accessTokenOrTokens === 'object' && accessTokenOrTokens !== null) {
          accessToken = accessTokenOrTokens.accessToken ?? null;
          refreshToken = accessTokenOrTokens.refreshToken ?? null;
        } else {
          accessToken = accessTokenOrTokens ?? null;
          refreshToken = refreshTokenParam ?? null;
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      },
      setUser: (user) => set({ user }),
      setTokens: (accessTokenOrTokens, refreshTokenParam) => {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;
        if (typeof accessTokenOrTokens === 'object' && accessTokenOrTokens !== null) {
          accessToken = accessTokenOrTokens.accessToken ?? null;
          refreshToken = accessTokenOrTokens.refreshToken ?? null;
        } else {
          accessToken = accessTokenOrTokens ?? null;
          refreshToken = refreshTokenParam ?? null;
        }
        set({ accessToken, refreshToken });
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        try {
          queryClient.clear();
        } catch {
          // ignore if called outside react lifecycle
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
