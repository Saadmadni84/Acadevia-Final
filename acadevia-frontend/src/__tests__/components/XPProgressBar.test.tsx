import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import XPProgressBar from '@/components/XPProgressBar';

describe('XPProgressBar', () => {
  it('renders with correct XP values', () => {
    render(<XPProgressBar currentXP={750} maxXP={1000} level={5} />);

    expect(screen.getByText(/750/)).toBeInTheDocument();
    expect(screen.getByText(/1000|1,000/)).toBeInTheDocument();
  });

  it('shows level badge', () => {
    render(<XPProgressBar currentXP={750} maxXP={1000} level={5} />);

    const levelBadge = screen.getByText(/level\s*5|lv\.?\s*5/i);
    expect(levelBadge).toBeInTheDocument();
  });

  it('progress bar width matches XP percentage', () => {
    const { container } = render(<XPProgressBar currentXP={750} maxXP={1000} level={5} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '750');
    expect(progressBar).toHaveAttribute('aria-valuemax', '1000');

    const fillElement = container.querySelector('[class*="fill"], [class*="progress"], [style]');
    if (fillElement) {
      const style = window.getComputedStyle(fillElement);
      expect(
        fillElement.getAttribute('style')?.includes('75') || style.width === '75%'
      ).toBeTruthy();
    }
  });

  it('has accessible aria attributes', () => {
    render(<XPProgressBar currentXP={300} maxXP={500} level={3} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '300');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '500');
    expect(progressBar).toHaveAttribute('aria-label');
  });
});
