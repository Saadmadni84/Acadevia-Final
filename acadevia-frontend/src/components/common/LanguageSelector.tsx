import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/config/app.config';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    if (lang?.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
        <Globe className="h-4 w-4" />
        <span>{currentLang.nativeName}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => changeLang(lang.code)} className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <span>{lang.nativeName} <span className="text-gray-400 text-xs">({lang.name})</span></span>
                {i18n.language === lang.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { LanguageSelector };
