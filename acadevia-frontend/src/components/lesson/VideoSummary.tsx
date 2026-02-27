import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface VideoSummaryProps {
  content: string;
  collapsedHeight?: number;
  className?: string;
}

/** Very lightweight Markdown → HTML for lesson summaries. */
function renderMarkdown(md: string): string {
  let html = md
    // Code blocks ``` ... ```
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      const id = `code-${Math.random().toString(36).slice(2, 8)}`;
      return `<div class="relative group/code"><pre data-code-id="${id}" class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto my-3"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre></div>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    // Bold / Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-sm leading-relaxed mb-2">')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return `<p class="text-sm leading-relaxed mb-2">${html}</p>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const VideoSummary: React.FC<VideoSummaryProps> = ({
  content,
  collapsedHeight = 260,
  className,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const html = useMemo(() => renderMarkdown(content), [content]);

  const handleCopy = async (e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('[data-copy-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-copy-id')!;
    const pre = document.querySelector(`[data-code-id="${id}"]`);
    if (!pre) return;
    await navigator.clipboard.writeText(pre.textContent ?? '');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const needsCollapse = content.length > 600;

  return (
    <section
      className={cn('glass-card p-6', className)}
      aria-label={t('lesson.summary')}
    >
      <h3 className="font-semibold text-sm mb-4">{t('lesson.summary')}</h3>

      <div
        className={cn(
          'relative prose dark:prose-invert max-w-none overflow-hidden transition-all',
          !expanded && needsCollapse && 'max-h-[var(--collapsed-h)]',
        )}
        style={{ '--collapsed-h': `${collapsedHeight}px` } as React.CSSProperties}
        onClick={handleCopy}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {/* Fade overlay when collapsed */}
        {!expanded && needsCollapse && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse */}
      {needsCollapse && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? t('common.showLess') : t('common.showMore')}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3 w-3" aria-hidden />
          </motion.span>
        </button>
      )}
    </section>
  );
};

export { VideoSummary };
