import React, { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';

const TOKEN_REFRESH_MARGIN_MS = 60 * 1000; // refresh 1 min before expiry

function parseTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const doRefresh = useCallback(async () => {
    const { refreshToken: currentRefreshToken, user: currentUser } = useAuthStore.getState();
    if (!currentRefreshToken) {
      logout();
      return;
    }

    try {
      const { data } = await authService.refreshToken(currentRefreshToken);
      const result = (data as any).data ?? data;
      if (result) {
        const newUser = result.user ?? currentUser;
        if (newUser) {
          // Use setAuth to maintain isAuthenticated flag
          useAuthStore.getState().setAuth(newUser, result.accessToken, result.refreshToken);
        } else {
          setTokens(result.accessToken, result.refreshToken);
        }
      }
    } catch (e) {
      // Don't aggressively logout — let ProtectedRoute handle redirect if needed
      console.warn('Token refresh failed:', e);
    }
  }, [setTokens, logout]);

  const scheduleRefresh = useCallback(
    (token: string) => {
      clearRefreshTimer();
      const expiry = parseTokenExpiry(token);
      if (!expiry) return;

      const delay = Math.max(expiry - Date.now() - TOKEN_REFRESH_MARGIN_MS, 0);
      refreshTimerRef.current = setTimeout(doRefresh, delay);
    },
    [clearRefreshTimer, doRefresh],
  );

  // Initial verification on mount
  useEffect(() => {
    const verify = async () => {
      const { accessToken: token, refreshToken: rt } = useAuthStore.getState();
      if (!token || !rt) {
        setLoading(false);
        return;
      }

      const expiry = parseTokenExpiry(token);
      if (expiry && expiry > Date.now()) {
        // Token is still valid — ensure isAuthenticated is true
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, token, rt);
        }
        scheduleRefresh(token);
        setLoading(false);
      } else if (rt) {
        // Token expired but we have a refresh token — try to refresh
        try {
          await doRefresh();
        } catch {
          // Refresh failed — just clear loading, don't force logout
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    verify();

    return () => {
      clearRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-schedule refresh whenever accessToken changes
  useEffect(() => {
    if (accessToken) {
      scheduleRefresh(accessToken);
    } else {
      clearRefreshTimer();
    }
  }, [accessToken, scheduleRefresh, clearRefreshTimer]);

  // Clean up on logout (token becomes null)
  useEffect(() => {
    if (!accessToken && !refreshToken) {
      clearRefreshTimer();
    }
  }, [accessToken, refreshToken, clearRefreshTimer]);

  return <>{children}</>;
};

export { AuthProvider };
