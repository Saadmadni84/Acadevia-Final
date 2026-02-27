import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { ROUTES, getDashboardRoute } from '@/config/routes.config';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout: clearAuth, isAuthenticated, user, isLoading } = useAuthStore();

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    // Backend returns flat response, handle both wrapped and unwrapped
    const d: any = (response.data as any)?.data ? (response.data as any).data : response.data;
    const u = d.user ?? {
      id: String(d.userId ?? d.id ?? ''),
      email: d.email ?? '',
      fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.fullName || '',
      role: d.role ?? 'STUDENT',
      languagePreference: d.preferredLanguage ?? d.languagePreference ?? 'en',
    };
    setAuth(u, d.accessToken, d.refreshToken);
    navigate(getDashboardRoute(u.role));
  }, [setAuth, navigate]);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authService.register(data);
    const d: any = (response.data as any)?.data ? (response.data as any).data : response.data;
    const u = d.user ?? {
      id: String(d.userId ?? d.id ?? ''),
      email: d.email ?? '',
      fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.fullName || '',
      role: d.role ?? 'STUDENT',
      languagePreference: d.preferredLanguage ?? d.languagePreference ?? 'en',
    };
    setAuth(u, d.accessToken, d.refreshToken);
    navigate(getDashboardRoute(u.role));
  }, [setAuth, navigate]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    navigate(ROUTES.LOGIN);
  }, [clearAuth, navigate]);

  return { login, register, logout, isAuthenticated, user, isLoading };
}
