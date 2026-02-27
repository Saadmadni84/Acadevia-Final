import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/LoginForm';

const mockOnSubmit = vi.fn();
const mockOnSocialLogin = vi.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onSocialLogin: mockOnSocialLogin,
  isLoading: false,
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with email and password fields', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in|log in|submit/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm {...defaultProps} />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: /sign in|log in|submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required|please enter.*email/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required|please enter.*password/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with credentials', async () => {
    render(<LoginForm {...defaultProps} />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@acadevia.in');
    await user.type(passwordInput, 'SecurePass123!');

    const submitButton = screen.getByRole('button', { name: /sign in|log in|submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@acadevia.in',
        password: 'SecurePass123!',
      });
    });
  });

  it('shows loading state during submission', () => {
    render(<LoginForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /sign in|log in|loading|submit/i });
    expect(submitButton).toBeDisabled();
    expect(
      screen.getByText(/loading|signing in|please wait/i) ||
        submitButton.querySelector('[class*="spinner"]')
    ).toBeTruthy();
  });

  it('renders social login button', () => {
    render(<LoginForm {...defaultProps} />);

    const socialButton = screen.getByRole('button', { name: /google|github|social/i });
    expect(socialButton).toBeInTheDocument();

    fireEvent.click(socialButton);
    expect(mockOnSocialLogin).toHaveBeenCalled();
  });
});
