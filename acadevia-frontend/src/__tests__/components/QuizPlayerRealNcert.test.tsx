import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

const realNcertQuiz8Question = {
  id: '7',
  question:
    'Consider the point $P(-5, 3)$ plotted in the **Cartesian plane**. Which of the following statements correctly describes its quadrant, its perpendicular distances from the **coordinate axes**, and its relationship with the point $Q(3, -5)$?',
  options: [
    'Point $P$ lies in **Quadrant IV**; its perpendicular distance from the $y$-axis is $-5$ units and from the $x$-axis is $3$ units; it is distinct from $Q(3, -5)$, which lies in **Quadrant II**.',
    'Point $P$ lies in **Quadrant II**; its perpendicular distance from the $y$-axis is $3$ units and from the $x$-axis is $5$ units; it represents the same location as $Q(3, -5)$ because both contain the values $3$ and $-5$.',
    'Point $P$ lies in **Quadrant II**; its perpendicular distance from the $y$-axis is $5$ units and from the $x$-axis is $3$ units; it represents a completely distinct location from $Q(3, -5)$, which lies in **Quadrant IV**.',
    'Point $P$ lies in **Quadrant II**; its perpendicular distance from the $y$-axis is $5$ units and from the $x$-axis is $3$ units; it lies in the same quadrant as $Q(3, -5)$ because each point contains one negative coordinate.',
  ],
  correctIndex: 2,
  explanation:
    '1. identifies x-coordinate of P as -5; 2. identifies y-coordinate of P as 3; 3. associates negative x-coordinate and positive y-coordinate with Quadrant II; 4. defines perpendicular distance from y-axis as the absolute value of the x-coordinate; 5. obtains distance of P from y-axis as 5 units; 6. defines perpendicular distance from x-axis as the absolute value of the y-coordinate; 7. obtains distance of P from x-axis as 3 units; 8. identifies coordinates of Q as positive x-coordinate and negative y-coordinate; 9. associates positive x-coordinate and negative y-coordinate with Quadrant IV; 10. states ordered pairs $(-5, 3) \\neq (3, -5)$ representing distinct locations',
  points: 10,
};

describe('QuizPlayer with Real Generated NCERT Question (Quiz 8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Question 1 without raw $ or ** delimiters', () => {
    const { container } = render(
      <QuizPlayer
        title="NCERT Practice: Coordinate Geometry"
        chapter="Coordinate Geometry"
        questions={[realNcertQuiz8Question]}
        timeLimit={300}
        onComplete={vi.fn()}
      />
    );

    // 1. Verify KaTeX renders the math tags
    const katexNodes = container.querySelectorAll('.katex');
    expect(katexNodes.length).toBeGreaterThan(0);

    // 2. Verify bold markdown is rendered with <strong> tags
    const strongNodes = container.querySelectorAll('strong');
    const strongTexts = Array.from(strongNodes).map((s) => s.textContent);
    expect(strongTexts).toContain('Cartesian plane');
    expect(strongTexts).toContain('coordinate axes');
    expect(strongTexts).toContain('Quadrant IV');
    expect(strongTexts).toContain('Quadrant II');

    // 3. Verify NO raw markdown markers like ** remain in the text
    expect(container.textContent).not.toContain('**Cartesian plane**');
    expect(container.textContent).not.toContain('**coordinate axes**');
    expect(container.textContent).not.toContain('**Quadrant II**');
    expect(container.textContent).not.toContain('**Quadrant IV**');

    // 4. Verify NO raw $ delimiters appear in the question or options
    expect(container.textContent).not.toContain('$P(-5, 3)$');
    expect(container.textContent).not.toContain('$Q(3, -5)$');
    expect(container.textContent).not.toContain('$y$-axis');
    expect(container.textContent).not.toContain('$x$-axis');
    expect(container.textContent).not.toContain('$-5$');
    expect(container.textContent).not.toContain('$3$');
    expect(container.textContent).not.toContain('$5$');
  });

  it('renders all four options using KaTeX and strong tags', () => {
    const { container } = render(
      <QuizPlayer
        title="NCERT Practice: Coordinate Geometry"
        chapter="Coordinate Geometry"
        questions={[realNcertQuiz8Question]}
        timeLimit={300}
        onComplete={vi.fn()}
      />
    );

    const buttons = container.querySelectorAll('button');
    // 4 option buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    // Check each option contains KaTeX rendered elements
    buttons.forEach((btn, idx) => {
      if (idx < 4) {
        expect(btn.querySelectorAll('.katex').length).toBeGreaterThan(0);
        expect(btn.textContent).not.toContain('$');
        expect(btn.textContent).not.toContain('**');
      }
    });
  });

  it('selects option C and renders explanation with mathematical typography', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <QuizPlayer
        title="NCERT Practice: Coordinate Geometry"
        chapter="Coordinate Geometry"
        questions={[realNcertQuiz8Question]}
        timeLimit={300}
        onComplete={onComplete}
      />
    );

    // Click Option C (index 2)
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2]);

    // Explanation should now be visible
    expect(container.textContent).toContain('identifies x-coordinate of P');
    expect(container.textContent).not.toContain('$(-5, 3)$');
    expect(container.textContent).not.toContain('$(3, -5)$');

    // Click Finish Quiz
    const finishBtn = Array.from(buttons).find((b) => b.textContent?.includes('Finish Quiz'));
    expect(finishBtn).toBeTruthy();
    if (finishBtn) {
      fireEvent.click(finishBtn);
    }

    // Results screen should be shown
    expect(container.textContent).toContain('100%');
    expect(container.textContent).toContain('1/1 correct');
    expect(onComplete).toHaveBeenCalled();
  });
});
