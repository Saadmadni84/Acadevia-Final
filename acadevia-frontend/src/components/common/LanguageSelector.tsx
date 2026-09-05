import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, Search, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/app.config';
import { googleTranslateService } from '@/services/googleTranslate.service';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'minimal' | 'full';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className, variant = 'full' }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular'>('all');
  const [currentCode, setCurrentCode] = useState<string>(() => {
    return googleTranslateService.getCurrentLanguage() || i18n.language || 'en';
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync with googleTranslateService subscriptions
  useEffect(() => {
    const unsubscribe = googleTranslateService.subscribe((lang) => {
      setCurrentCode(lang);
    });
    return unsubscribe;
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentCode || l.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code: string) => {
    // 1. Update i18next
    i18n.changeLanguage(code);

    // 2. Set direction
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    document.documentElement.dir = lang?.dir === 'rtl' ? 'rtl' : 'ltr';

    // 3. Trigger Google Translate across the entire website
    googleTranslateService.changeLanguage(code);
    setCurrentCode(code);

    setOpen(false);
    setSearchQuery('');
  };

  const handleResetToEnglish = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectLanguage('en');
  };

  // Filter languages
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    if (activeFilter === 'popular' && !lang.popular && lang.code !== 'en') {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      (lang.region && lang.region.toLowerCase().includes(query)) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs',
          open
            ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
            : currentCode !== 'en'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            : 'bg-white/80 dark:bg-card-dark/80 hover:bg-white dark:hover:bg-card-dark border-[#E8E2D8] dark:border-[#382447] text-gray-700 dark:text-gray-200'
        )}
        title="Translate website with Google Translate"
        aria-label="Select Language"
      >
        <Globe className={cn('h-3.5 w-3.5', currentCode !== 'en' ? 'text-amber-600 dark:text-amber-400' : 'text-primary')} />
        <span className="font-bold tracking-tight">
          {currentLang.nativeName}
          {currentCode !== 'en' && variant === 'full' && (
            <span className="ml-1 text-[10px] font-medium opacity-80">({currentLang.name})</span>
          )}
        </span>
        <ChevronDown className={cn('h-3 w-3 transition-transform duration-200 opacity-60', open && 'rotate-180')} />
      </button>

      {/* Floating Language Dropdown Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1B1124] rounded-2xl shadow-2xl border border-[#E8E2D8] dark:border-[#382447] z-50 overflow-hidden flex flex-col max-h-[460px]"
          >
            {/* Header: Title + Google Translate Badge */}
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 bg-[#FAF7F2]/80 dark:bg-[#251833]/80">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Indian Languages Translation
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Google Translate
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Hindi, Tamil, Telugu, বাংলা..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer',
                    activeFilter === 'all'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  )}
                >
                  All Indian Languages ({SUPPORTED_LANGUAGES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('popular')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer',
                    activeFilter === 'popular'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  )}
                >
                  Most Popular (11)
                </button>
              </div>
            </div>

            {/* Language Selection List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredLanguages.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No matching language found for "{searchQuery}"
                </div>
              ) : (
                filteredLanguages.map((lang: SupportedLanguage) => {
                  const isSelected = currentCode === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer group',
                        isSelected
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-800 dark:text-gray-200'
                      )}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold tracking-tight">
                            {lang.nativeName}
                          </span>
                          <span className="text-xs text-gray-400 font-normal">
                            ({lang.name})
                          </span>
                        </div>
                        {lang.region && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {lang.region}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {lang.code === 'en' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                            Original
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-2xs">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with Reset to English & Quick Status */}
            <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 bg-[#FAF7F2]/80 dark:bg-[#251833]/80 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">
                Translates all pages & content dynamically
              </span>

              {currentCode !== 'en' && (
                <button
                  type="button"
                  onClick={handleResetToEnglish}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-white dark:hover:bg-card-dark border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to English
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { LanguageSelector };
export default LanguageSelector;
