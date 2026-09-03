// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/useAuthStore';

const mockUser = {
  id: 'u1',
  email: 'test@acadevia.in',
  name: 'Test User',
  role: 'STUDENT' as const,
};

const mockTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout?.();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('setAuth stores user and tokens', () => {
    const { setAuth } = useAuthStore.getState();

    setAuth(mockUser, mockTokens);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-token-123');
    expect(state.refreshToken).toBe('refresh-token-456');
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout clears all state', () => {
    const { setAuth, logout } = useAuthStore.getState();

    setAuth(mockUser, mockTokens);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setTokens updates tokens only', () => {
    const { setAuth, setTokens } = useAuthStore.getState();

    setAuth(mockUser, mockTokens);

    const newTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };
    setTokens(newTokens);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access-token');
    expect(state.refreshToken).toBe('new-refresh-token');
    expect(state.user).toEqual(mockUser);
  });

  it('persistence works with localStorage', () => {
    const { setAuth } = useAuthStore.getState();

    setAuth(mockUser, mockTokens);

    const storedData = localStorage.getItem('auth-storage');
    expect(storedData).toBeTruthy();

    const parsed = JSON.parse(storedData!);
    expect(parsed.state?.user?.email || parsed.user?.email).toBe('test@acadevia.in');
  });
});
