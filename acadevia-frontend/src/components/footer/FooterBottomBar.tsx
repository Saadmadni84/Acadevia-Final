import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_LINKS } from '@/config/footer.config';
import { Heart } from 'lucide-react';

export const FooterBottomBar: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 text-xs text-gray-500 dark:text-gray-400">
      {/* Copyright */}
      <div className="flex items-center gap-1 text-center md:text-left">
        <span>© {currentYear} Acadevia. All rights reserved. Made with</span>
        <Heart className="h-3 w-3 text-accent fill-accent inline" aria-label="love" />
        <span>for learners across India.</span>
      </div>

      {/* Legal & Essential Links */}
      <nav aria-label="Legal navigation">
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {LEGAL_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                className="hover:text-primary dark:hover:text-primary-300 transition-colors duration-150 font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
