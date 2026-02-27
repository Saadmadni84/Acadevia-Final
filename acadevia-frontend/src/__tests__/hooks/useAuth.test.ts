import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRegister = vi.fn();

vi.mock('@/services/authService', () => ({
  authService: {
    login: (...args: unknown[]) => mockLogin(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

const mockSetAuth = vi.fn();
const mockClearAuth = vi.fn();

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => ({
    setAuth: mockSetAuth,
    clearAuth: mockClearAuth,
    user: null,
    accessToken: null,
  }),
}));

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
    mockLogin.mockResolvedValue({ user: mockUser, tokens: mockTokens });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@acadevia.in', 'password123');
    });

    expect(mockLogin).toHaveBeenCalledWith('test@acadevia.in', 'password123');
    expect(mockSetAuth).toHaveBeenCalledWith(
      expect.objectContaining({ user: mockUser }),
      expect.anything()
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
    const newUser = { email: 'new@acadevia.in', password: 'Pass123!', name: 'New User' };
    mockRegister.mockResolvedValue({ user: { id: 'u2', ...newUser }, tokens: {} });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(newUser.email, newUser.password, newUser.name);
    });

    expect(mockRegister).toHaveBeenCalledWith(newUser.email, newUser.password, newUser.name);
  });

  it('handles auth errors', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login('bad@acadevia.in', 'wrong');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid credentials');
      }
    });

    expect(mockSetAuth).not.toHaveBeenCalled();
  });
});
