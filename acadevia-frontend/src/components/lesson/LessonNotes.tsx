import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Edit3, Clock, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LessonNotesProps {
  lessonId: string;
  className?: string;
}

/* ---------- IndexedDB helpers ---------- */
const DB_NAME = 'acadevia_notes';
const STORE_NAME = 'lesson_notes';
const DB_VERSION = 1;

interface NoteEntry {
  lessonId: string;
  text: string;
  bookmarks: NoteBookmark[];
  updatedAt: number;
}

interface NoteBookmark {
  id: string;
  label: string;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'lessonId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadNote(lessonId: string): Promise<NoteEntry | undefined> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(lessonId);
    req.onsuccess = () => resolve(req.result as NoteEntry | undefined);
    req.onerror = () => resolve(undefined);
  });
}

async function saveNote(entry: NoteEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ---------- Component ---------- */
const LessonNotes: React.FC<LessonNotesProps> = ({ lessonId, className }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [bookmarks, setBookmarks] = useState<NoteBookmark[]>([]);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text],
  );

  // Load on mount / lessonId change
  useEffect(() => {
    let cancelled = false;
    loadNote(lessonId).then((entry) => {
      if (cancelled) return;
      setText(entry?.text ?? '');
      setBookmarks(entry?.bookmarks ?? []);
      setSaved(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // Debounced auto-save
  const persist = useCallback(
    (newText: string, newBookmarks: NoteBookmark[]) => {
      clearTimeout(debounceRef.current);
      setSaved(false);
      debounceRef.current = setTimeout(async () => {
        await saveNote({
          lessonId,
          text: newText,
          bookmarks: newBookmarks,
          updatedAt: Date.now(),
        });
        setSaved(true);
      }, 800);
    },
    [lessonId],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    persist(val, bookmarks);
  };

  const addBookmark = () => {
    const label = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const next: NoteBookmark[] = [
      ...bookmarks,
      { id: crypto.randomUUID(), label, createdAt: Date.now() },
    ];
    setBookmarks(next);
    persist(text, next);
  };

  const removeBookmark = (id: string) => {
    const next = bookmarks.filter((b) => b.id !== id);
    setBookmarks(next);
    persist(text, next);
  };

  /** Very lightweight Markdown preview (bold, italic, code, headings, lists). */
  const previewHtml = useMemo(() => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-white/10 p-2 rounded text-xs my-1"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-white/10 px-1 rounded text-xs">$1</code>')
      .replace(/^### (.+)$/gm, '<h3 class="font-semibold mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-bold text-base mt-3 mb-1">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
      .replace(/\n/g, '<br/>');
  }, [text]);

  return (
    <section className={cn('glass-card p-5 space-y-3', className)} aria-label={t('notes.title')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{t('notes.title')}</h3>
        <div className="flex items-center gap-2">
          {/* Save indicator */}
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <Save className="h-3 w-3" aria-hidden />
            {saved ? t('notes.saved') : t('notes.saving')}
          </span>

          {/* Preview toggle */}
          <button
            onClick={() => setPreview((p) => !p)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              preview
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400',
            )}
            aria-pressed={preview}
            aria-label={preview ? t('notes.edit') : t('notes.preview')}
          >
            {preview ? (
              <Edit3 className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose dark:prose-invert max-w-none text-sm min-h-[160px] p-3 rounded-lg bg-gray-50 dark:bg-white/5"
          dangerouslySetInnerHTML={{ __html: previewHtml || `<p class="text-gray-400">${t('notes.empty')}</p>` }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder={t('notes.placeholder')}
          className="w-full min-h-[160px] p-3 text-sm rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y transition-colors"
          aria-label={t('notes.textarea')}
        />
      )}

      {/* Footer: word count + bookmark */}
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <Hash className="h-3 w-3" aria-hidden />
          {wordCount} {t('notes.words')}
        </div>
        <button
          onClick={addBookmark}
          className="flex items-center gap-1 text-primary hover:underline"
          aria-label={t('notes.addBookmark')}
        >
          <Clock className="h-3 w-3" aria-hidden />
          {t('notes.bookmark')}
        </button>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {bookmarks.map((bm) => (
            <span
              key={bm.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium"
            >
              <Clock className="h-2.5 w-2.5" aria-hidden />
              {bm.label}
              <button
                onClick={() => removeBookmark(bm.id)}
                className="ml-0.5 hover:text-red-500 transition-colors"
                aria-label={`${t('notes.removeBookmark')}: ${bm.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export { LessonNotes };
