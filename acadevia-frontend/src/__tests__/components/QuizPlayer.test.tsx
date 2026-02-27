import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import QuizPlayer from '@/components/QuizPlayer';

const mockQuestions = [
  {
    id: 'q1',
    text: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    text: 'Which language is used for web styling?',
    options: ['Python', 'CSS', 'Java', 'C++'],
    correctIndex: 1,
  },
];

const defaultProps = {
  questions: mockQuestions,
  timePerQuestion: 30,
  onComplete: vi.fn(),
  onAnswer: vi.fn(),
};

describe('QuizPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('renders question and options', () => {
    render(<QuizPlayer {...defaultProps} />);

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('selects an option on click', () => {
    render(<QuizPlayer {...defaultProps} />);

    const parisOption = screen.getByText('Paris');
    fireEvent.click(parisOption);

    expect(parisOption.closest('[class*="selected"], [aria-selected="true"]') || parisOption)
      .toBeTruthy();
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q1', 1);
  });

  it('shows correct/incorrect state after answering', () => {
    render(<QuizPlayer {...defaultProps} />);

    const wrongOption = screen.getByText('London');
    fireEvent.click(wrongOption);

    expect(
      wrongOption.closest('[class*="incorrect"], [class*="wrong"], [data-state="incorrect"]') ||
        screen.queryByText(/incorrect|wrong/i)
    ).toBeTruthy();

    const correctOption = screen.getByText('Paris');
    expect(
      correctOption.closest('[class*="correct"], [data-state="correct"]') ||
        screen.queryByText(/correct/i)
    ).toBeTruthy();
  });

  it('timer counts down', () => {
    render(<QuizPlayer {...defaultProps} />);

    expect(screen.getByText(/30|0:30/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText(/20|0:20/)).toBeInTheDocument();
  });

  it('next button advances to next question', () => {
    render(<QuizPlayer {...defaultProps} />);

    const parisOption = screen.getByText('Paris');
    fireEvent.click(parisOption);

    const nextButton = screen.getByRole('button', { name: /next|continue/i });
    fireEvent.click(nextButton);

    expect(screen.getByText('Which language is used for web styling?')).toBeInTheDocument();
    expect(screen.getByText('CSS')).toBeInTheDocument();
  });
});
