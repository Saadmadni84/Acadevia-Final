import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Brain, Gamepad2, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: 'Course' | 'Quiz' | 'Game' | 'Topic';
  subtitle: string;
  route: string;
  icon: React.ElementType;
}

const searchableCatalog: SearchItem[] = [
  { id: '1', title: 'Quadratic Functions & Equations', category: 'Course', subtitle: 'Class 10 Mathematics · Chapter 4', route: '/courses', icon: BookOpen },
  { id: '2', title: 'Refraction of Light Through Prism', category: 'Course', subtitle: 'Class 10 Science · Chapter 10', route: '/courses', icon: BookOpen },
  { id: '3', title: 'Trigonometric Ratios Diagnostic Quiz', category: 'Quiz', subtitle: 'Mathematics · 10 Questions', route: ROUTES.QUIZZES, icon: Brain },
  { id: '4', title: 'Light & Optics Assessment', category: 'Quiz', subtitle: 'Science · 8 Questions', route: ROUTES.QUIZZES, icon: Brain },
  { id: '5', title: 'Number Kingdom Quest', category: 'Game', subtitle: 'Class 1–4 Math Rescue Adventure', route: '/games/number-kingdom', icon: Gamepad2 },
  { id: '6', title: 'Trigonometry Titan Battle', category: 'Game', subtitle: 'Class 9–12 Sin/Cos Boss Fight', route: '/games/trigonometry-quest', icon: Gamepad2 },
  { id: '7', title: 'Acadevia Weekly Leaderboard', category: 'Topic', subtitle: 'State & National Rankings', route: ROUTES.LEADERBOARD, icon: Trophy },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? searchableCatalog
    : searchableCatalog.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Search Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-[#E8E2D8] dark:border-[#382447] shadow-2xl z-10 flex flex-col max-h-[80vh]"
        >
          {/* Input Bar */}
          <div className="flex items-center gap-3 p-4 border-b border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226]">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search courses, chapters, quizzes, quests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="p-3 overflow-y-auto max-h-[380px] space-y-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No matching topics or materials found for "{query}".
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onClose();
                      navigate(item.route);
                    }}
                    className="w-full p-3 rounded-xl hover:bg-purple-50/60 dark:hover:bg-purple-950/20 text-left flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:text-purple-300 flex items-center justify-center text-gray-500 transition-colors shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-purple-300 transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary dark:group-hover:text-purple-300 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* Palette Footer */}
          <div className="p-3 border-t border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226] text-[11px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Quick command palette for Acadevia syllabus
            </span>
            <span>Press Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default GlobalSearchModal;
