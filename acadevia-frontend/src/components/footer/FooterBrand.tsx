import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { COMPANY_CONTACT } from '@/config/footer.config';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const FooterBrand: React.FC = () => {
  return (
    <div className="space-y-4 lg:pr-6">
      {/* Acadevia Logo */}
      <Link to="/" className="inline-block" aria-label="Acadevia Homepage">
        <Logo size="lg" />
      </Link>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm">
        {COMPANY_CONTACT.description}
      </p>

      {/* Secondary Tagline Badge */}
      <div className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-primary-300">
        <Sparkles className="h-3.5 w-3.5 text-secondary" />
        <span>{COMPANY_CONTACT.secondaryTagline}</span>
      </div>

      {/* Feature Highlights Pills */}
      <div className="pt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40">
          <CheckCircle2 className="h-3 w-3 text-secondary" /> AI Powered
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40">
          <CheckCircle2 className="h-3 w-3 text-secondary" /> Grades 1–12
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40">
          <CheckCircle2 className="h-3 w-3 text-secondary" /> 28+ Languages
        </span>
      </div>
    </div>
  );
};
