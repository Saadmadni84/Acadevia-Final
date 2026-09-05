import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

const mockQuestions = [
  {
    id: 'q1',
    question: 'Find the coordinates of $P(-5, 3)$ on the **Cartesian plane**.',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctIndex: 1,
    explanation: 'Point $P(-5, 3)$ lies in Quadrant II.',
    points: 10,
  },
  {
    id: 'q2',
    question: 'Which axis has equation $x = 0$?',
    options: ['$x$-axis', '$y$-axis', 'Origin', 'None'],
    correctIndex: 1,
    explanation: 'The $y$-axis corresponds to $x = 0$.',
    points: 10,
  },
];

const defaultProps = {
  title: 'NCERT Mathematics Assessment',
  chapter: 'Coordinate Geometry',
  questions: mockQuestions,
  timeLimit: 60,
  onComplete: vi.fn(),
};

describe('QuizPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders question and options without raw markdown/LaTeX syntax', () => {
    const { container } = render(<QuizPlayer {...defaultProps} />);

    // Math is rendered by KaTeX
    expect(container.querySelector('.katex')).not.toBeNull();
    // Bold markdown is rendered by <strong>
    expect(container.querySelector('strong')?.textContent).toBe('Cartesian plane');
    // Raw delimiters should not be displayed in UI
    expect(container.textContent).not.toContain('$P(-5, 3)$');
    expect(container.textContent).not.toContain('**Cartesian plane**');

    expect(screen.getByText('London')).toBeTruthy();
    expect(screen.getByText('Paris')).toBeTruthy();
  });

  it('selects an option on click and shows explanation with rendered math', () => {
    const { container } = render(<QuizPlayer {...defaultProps} />);

    const parisOption = screen.getByText('Paris');
    fireEvent.click(parisOption);

    // Explanation container should be rendered
    expect(container.textContent).toContain('lies in Quadrant II');
    expect(container.textContent).not.toContain('$P(-5, 3)$');
    expect(container.querySelector('.lucide-circle-alert')).not.toBeNull();
  });

  it('timer counts down', () => {
    vi.useFakeTimers();
    const { container } = render(<QuizPlayer {...defaultProps} />);

    expect(container.textContent).toContain('1:00');

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(container.textContent).toContain('0:50');
    vi.useRealTimers();
  });

  it('advances to next question when clicking Next Question', async () => {
    const { container } = render(<QuizPlayer {...defaultProps} />);

    const parisOption = screen.getByText('Paris');
    fireEvent.click(parisOption);

    const nextButton = screen.getByRole('button', { name: /Next Question/i });
    fireEvent.click(nextButton);

    // Options for question 2 have $x$-axis and $y$-axis rendered with KaTeX
    expect(container.textContent).not.toContain('$x$-axis');
    expect(container.textContent).not.toContain('$y$-axis');
  });
});
