import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRegister = vi.fn();

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: (...args: unknown[]) => mockLogin(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

const mockSetAuth = vi.fn();
const mockClearAuth = vi.fn();

vi.mock('@/stores/useAuthStore', () => {
  const storeFn = Object.assign(
    () => ({
      setAuth: mockSetAuth,
      logout: mockClearAuth,
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),
    {
      getState: () => ({
        user: null,
        accessToken: null,
        setAuth: mockSetAuth,
        logout: mockClearAuth,
      }),
    }
  );
  return { useAuthStore: storeFn };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login() calls auth service and updates store', async () => {
    const mockUser = { id: 'u1', email: 'test@acadevia.in', name: 'Test User' };
    const mockTokens = { accessToken: 'token-123', refreshToken: 'refresh-456' };
    mockLogin.mockResolvedValue({ data: { user: mockUser, accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken } });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@acadevia.in', password: 'password123' });
    });

    expect(mockLogin).toHaveBeenCalledWith({ email: 'test@acadevia.in', password: 'password123' });
    expect(mockSetAuth).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', email: 'test@acadevia.in' }),
      'token-123',
      'refresh-456'
    );
  });

  it('logout() clears store and redirects', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('register() creates account', async () => {
    const newUser = { email: 'new@acadevia.in', password: 'Pass123!', fullName: 'New User', role: 'STUDENT' as const };
    mockRegister.mockResolvedValue({ data: { user: { id: 'u2', ...newUser }, accessToken: 'token-reg', refreshToken: 'refresh-reg' } });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(newUser as any);
    });

    expect(mockRegister).toHaveBeenCalledWith(newUser);
  });

  it('handles auth errors', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({ email: 'bad@acadevia.in', password: 'wrong' });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid credentials');
      }
    });

    expect(mockSetAuth).not.toHaveBeenCalled();
  });
});
