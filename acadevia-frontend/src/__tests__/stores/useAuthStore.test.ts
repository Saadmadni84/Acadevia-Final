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

  it('supports positional 3-argument setAuth(user, access, refresh)', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth(mockUser, 'access-pos', 'refresh-pos');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-pos');
    expect(state.refreshToken).toBe('refresh-pos');
    expect(state.isAuthenticated).toBe(true);
  });

  it('supports object-based setAuth({ user, accessTokenOrTokens, refreshToken })', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth({
      user: mockUser,
      accessTokenOrTokens: 'access-obj',
      refreshToken: 'refresh-obj',
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-obj');
    expect(state.refreshToken).toBe('refresh-obj');
    expect(state.isAuthenticated).toBe(true);
  });

  it('supports positional setTokens(accessToken, refreshToken) and object setTokens', () => {
    const { setTokens } = useAuthStore.getState();

    setTokens('access-arg1', 'refresh-arg2');
    expect(useAuthStore.getState().accessToken).toBe('access-arg1');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-arg2');

    setTokens({ accessToken: 'access-obj1', refreshToken: 'refresh-obj2' });
    expect(useAuthStore.getState().accessToken).toBe('access-obj1');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-obj2');

    setTokens({ accessTokenOrTokens: 'access-alt', refreshToken: 'refresh-alt' });
    expect(useAuthStore.getState().accessToken).toBe('access-alt');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-alt');
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
