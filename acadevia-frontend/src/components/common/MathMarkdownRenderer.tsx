import React, { useMemo } from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils';

interface MathMarkdownRendererProps {
  content?: string | null;
  className?: string;
}

/**
 * Sanitizes text/HTML to ensure no malicious tags or event handlers can execute.
 * Strips script, iframe, object, embed, img tags with handlers, javascript: protocols and on* attributes.
 */
function sanitizeInput(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

function sanitizeHtml(html: string): string {
  return sanitizeInput(html);
}

/**
 * Parses a string into tokens representing LaTeX math ($$...$$ or $...$) and standard text.
 */
function parseMathAndText(input: string): Array<{ type: 'text' | 'math'; display?: boolean; value: string }> {
  if (!input || typeof input !== 'string') return [];

  // Match $$...$$ or $...$ (ensuring opening/closing $ are not purely whitespace)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$(?:\S|(?:\S[\s\S]*?\S))\$)/g;
  const tokens: Array<{ type: 'text' | 'math'; display?: boolean; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: input.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    const isDisplay = raw.startsWith('$$') && raw.endsWith('$$') && raw.length >= 4;
    const formula = isDisplay ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim();

    tokens.push({
      type: 'math',
      display: isDisplay,
      value: formula,
    });

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: 'text', value: input.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Parses markdown inline styles (bold, italic, inline code, line breaks) into native React nodes.
 */
function parseMarkdownInline(text: string, baseKey: string): React.ReactNode[] {
  // Matches **bold**, __bold__, `code`, *italic*, _italic_, or \n
  const mdRegex = /(\*\*(?:[^*]|\*(?!\*))+?\*\*|__(?:[^_]|_(?!_))+?__|`[^`\n]+`|\*(?:[^*\s]|[^*\s][^*\n]*?[^*\s])\*|_(?:[^_\s]|[^_\s][^_\n]*?[^_\s])_|\n)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let counter = 0;

  while ((match = mdRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const raw = match[0];
    const key = `${baseKey}-md-${counter++}`;

    if ((raw.startsWith('**') && raw.endsWith('**')) || (raw.startsWith('__') && raw.endsWith('__'))) {
      nodes.push(
        <strong key={key} className="font-bold text-gray-900 dark:text-white">
          {raw.slice(2, -2)}
        </strong>
      );
    } else if ((raw.startsWith('*') && raw.endsWith('*')) || (raw.startsWith('_') && raw.endsWith('_'))) {
      nodes.push(
        <em key={key} className="italic">
          {raw.slice(1, -1)}
        </em>
      );
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      nodes.push(
        <code key={key} className="bg-gray-100 dark:bg-gray-800 text-primary px-1.5 py-0.5 rounded text-xs font-mono">
          {raw.slice(1, -1)}
        </code>
      );
    } else if (raw === '\n') {
      nodes.push(<br key={key} />);
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * Renders a single math token using KaTeX into safe HTML.
 */
function renderKaTeXToken(math: string, display: boolean, key: string): React.ReactNode {
  try {
    const rawHtml = katex.renderToString(math, {
      displayMode: display,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });

    const safeHtml = sanitizeHtml(rawHtml);

    return (
      <span
        key={key}
        className={cn(
          'inline-katex-wrapper inline-flex items-center align-middle max-w-full overflow-x-auto py-0.5',
          display && 'block my-3 text-center overflow-x-auto w-full'
        )}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  } catch (err) {
    // Robust fallback: render the mathematical expression safely in monospace if KaTeX threw
    return (
      <span key={key} className="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        {math}
      </span>
    );
  }
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({ content, className }) => {
  const renderedElements = useMemo(() => {
    if (!content || typeof content !== 'string') return null;

    const sanitized = sanitizeInput(content);

    // Fast-path for plain text containing no markdown or math delimiters
    if (!sanitized.includes('$') && !sanitized.includes('*') && !sanitized.includes('_') && !sanitized.includes('`') && !sanitized.includes('\n')) {
      return sanitized;
    }

    try {
      const tokens = parseMathAndText(sanitized);
      const result: React.ReactNode[] = [];

      tokens.forEach((token, index) => {
        const key = `token-${index}`;
        if (token.type === 'math') {
          result.push(renderKaTeXToken(token.value, !!token.display, key));
        } else {
          result.push(...parseMarkdownInline(token.value, key));
        }
      });

      return result;
    } catch (err) {
      console.warn('[MathMarkdownRenderer] Fallback to raw text:', err);
      return sanitized;
    }
  }, [content]);

  if (!renderedElements) return null;

  return (
    <span className={cn('math-markdown-content leading-relaxed', className)}>
      {renderedElements}
    </span>
  );
};
