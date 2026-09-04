import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';
import { queryClient } from '@/providers/QueryProvider';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthParams {
  user: AuthUser;
  tokens?: AuthTokens;
  accessTokenOrTokens?: string | AuthTokens;
  accessToken?: string;
  refreshToken?: string;
}

export interface SetTokensParams {
  tokens?: AuthTokens;
  accessTokenOrTokens?: string | AuthTokens;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: {
    (params: AuthParams): void;
    (user: AuthUser, tokens?: AuthTokens): void;
    (user: AuthUser, accessToken?: string, refreshToken?: string): void;
    (firstParam: AuthUser | AuthParams, secondParam?: string | AuthTokens, thirdParam?: string): void;
  };
  setUser: (user: AuthUser) => void;
  setTokens: {
    (params: SetTokensParams | AuthTokens): void;
    (accessToken: string, refreshToken?: string): void;
    (firstParam: string | AuthTokens | SetTokensParams, secondParam?: string): void;
  };
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

      setAuth: (
        firstParam: AuthUser | AuthParams,
        secondParam?: string | AuthTokens,
        thirdParam?: string
      ) => {
        let user: AuthUser | null = null;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (firstParam && typeof firstParam === 'object' && 'user' in firstParam) {
          // Object-based call: setAuth({ user, ... })
          const p = firstParam as AuthParams;
          user = p.user;
          if (p.tokens) {
            accessToken = p.tokens.accessToken ?? null;
            refreshToken = p.tokens.refreshToken ?? null;
          } else if (p.accessTokenOrTokens && typeof p.accessTokenOrTokens === 'object') {
            accessToken = p.accessTokenOrTokens.accessToken ?? null;
            refreshToken = p.accessTokenOrTokens.refreshToken ?? null;
          } else if (typeof p.accessTokenOrTokens === 'string') {
            accessToken = p.accessTokenOrTokens;
            refreshToken = p.refreshToken ?? null;
          } else {
            accessToken = p.accessToken ?? null;
            refreshToken = p.refreshToken ?? null;
          }
        } else {
          // Positional call: setAuth(user, ...)
          user = (firstParam as AuthUser) ?? null;
          if (secondParam && typeof secondParam === 'object') {
            accessToken = secondParam.accessToken ?? null;
            refreshToken = secondParam.refreshToken ?? null;
          } else {
            accessToken = (secondParam as string) ?? null;
            refreshToken = thirdParam ?? null;
          }
        }

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: Boolean(user),
          isLoading: false,
        });
      },

      setUser: (user) => set({ user }),

      setTokens: (
        firstParam: string | AuthTokens | SetTokensParams,
        secondParam?: string
      ) => {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (firstParam && typeof firstParam === 'object') {
          if ('accessTokenOrTokens' in firstParam) {
            const p = firstParam as SetTokensParams;
            if (p.accessTokenOrTokens && typeof p.accessTokenOrTokens === 'object') {
              accessToken = p.accessTokenOrTokens.accessToken ?? null;
              refreshToken = p.accessTokenOrTokens.refreshToken ?? null;
            } else if (typeof p.accessTokenOrTokens === 'string') {
              accessToken = p.accessTokenOrTokens;
              refreshToken = p.refreshToken ?? null;
            } else {
              accessToken = p.accessToken ?? null;
              refreshToken = p.refreshToken ?? null;
            }
          } else {
            const t = firstParam as AuthTokens;
            accessToken = t.accessToken ?? null;
            refreshToken = t.refreshToken ?? null;
          }
        } else {
          accessToken = (firstParam as string) ?? null;
          refreshToken = secondParam ?? null;
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
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
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
      onRehydrateStorage: () => (state) => {
        // Compatibility: check legacy 'acadevia-auth' if 'auth-storage' was empty
        if (!state?.user && typeof localStorage !== 'undefined') {
          try {
            const legacy = localStorage.getItem('acadevia-auth');
            if (legacy) {
              const parsed = JSON.parse(legacy);
              if (parsed?.state?.user) {
                useAuthStore.setState({
                  user: parsed.state.user,
                  accessToken: parsed.state.accessToken ?? null,
                  refreshToken: parsed.state.refreshToken ?? null,
                  isAuthenticated: parsed.state.isAuthenticated ?? true,
                  isLoading: false,
                });
              }
            }
          } catch (err) {
            console.warn('[useAuthStore] Failed to rehydrate legacy auth storage:', err);
          }
        }
      },
    }
  )
);
