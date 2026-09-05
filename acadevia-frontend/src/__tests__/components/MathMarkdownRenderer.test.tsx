import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MathMarkdownRenderer } from '@/components/common/MathMarkdownRenderer';

describe('MathMarkdownRenderer', () => {
  it('renders plain text as-is without extra markup', () => {
    const { container } = render(<MathMarkdownRenderer content="What is the capital of France?" />);
    expect(container.textContent).toContain('What is the capital of France?');
    expect(container.querySelector('.katex')).toBeNull();
  });

  it('renders inline math with KaTeX without raw dollar signs', () => {
    const { container } = render(<MathMarkdownRenderer content="Find the coordinates of $P(-5, 3)$ on the plane." />);
    expect(container.querySelector('.katex')).not.toBeNull();
    // Raw $ delimiters should not be present in rendered text
    expect(container.textContent).not.toContain('$P(-5, 3)$');
    expect(container.textContent).toContain('P(-5, 3)');
  });

  it('renders bold and italic markdown formatting properly', () => {
    const { container } = render(<MathMarkdownRenderer content="Point lies in the **Cartesian plane** and is *important*." />);
    const strong = container.querySelector('strong');
    const em = container.querySelector('em');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('Cartesian plane');
    expect(em).not.toBeNull();
    expect(em?.textContent).toBe('important');
    expect(container.textContent).not.toContain('**Cartesian plane**');
  });

  it('renders mixed markdown and LaTeX in option text', () => {
    const { container } = render(<MathMarkdownRenderer content="Point P lies on the $y$-axis and has $x=-5,\ y=3$" />);
    expect(container.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).not.toContain('$y$');
  });

  it('sanitizes malicious script tags and event handlers', () => {
    const malicious = 'Normal text <script>alert("xss")</script> <img src="x" onerror="alert(1)" /> $x+1$';
    const { container } = render(<MathMarkdownRenderer content={malicious} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
    expect(container.innerHTML).not.toContain('alert("xss")');
  });

  it('handles unclosed delimiters and malformed LaTeX gracefully without crashing', () => {
    const malformed = 'This has unclosed $ and unclosed **bold and broken \\frac{1}';
    expect(() => {
      render(<MathMarkdownRenderer content={malformed} />);
    }).not.toThrow();
  });

  it('renders fractions and display equations properly', () => {
    const { container } = render(<MathMarkdownRenderer content="Formula: $$\\frac{x_1 + x_2}{2}$$ and $x^2 + y^2 = 25$" />);
    expect(container.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).not.toContain('$$');
  });
});
