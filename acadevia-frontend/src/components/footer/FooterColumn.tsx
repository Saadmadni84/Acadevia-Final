import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FooterSection } from '@/config/footer.config';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FooterColumnProps {
  section: FooterSection;
}

export const FooterColumn: React.FC<FooterColumnProps> = ({ section }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 md:border-none py-3 md:py-0">
      {/* Mobile Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1 text-left font-semibold text-gray-900 dark:text-gray-100 md:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">
          {section.title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 md:hidden ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Links List - Desktop */}
      <ul className="hidden md:mt-4 md:space-y-2.5 md:block" role="list">
        {section.links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="group inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 transition-colors duration-150 py-0.5"
            >
              <span className="relative">
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-primary-300 transition-all duration-200 group-hover:w-full" />
              </span>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {link.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Links List - Mobile Accordion */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2 md:hidden overflow-hidden pl-1"
            role="list"
          >
            {section.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 py-1"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
