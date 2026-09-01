import React from 'react';
import { FOOTER_SECTIONS } from '@/config/footer.config';
import { FooterCTA } from './FooterCTA';
import { FooterBrand } from './FooterBrand';
import { FooterColumn } from './FooterColumn';
import { FooterSocials } from './FooterSocials';
import { FooterTrustSection } from './FooterTrustSection';
import { FooterBottomBar } from './FooterBottomBar';

interface FooterProps {
  showCTA?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ showCTA = true, className = '' }) => {
  return (
    <footer
      className={`relative w-full bg-white dark:bg-card-dark border-t border-gray-200/80 dark:border-gray-800 transition-colors duration-200 ${className}`}
      role="contentinfo"
      aria-label="Acadevia Site Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Top CTA / Learning Section */}
        {showCTA && (
          <div className="mb-14">
            <FooterCTA />
          </div>
        )}

        {/* Main Footer Links & Brand Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10">
          {/* Brand & Mission Block */}
          <div className="md:col-span-12 lg:col-span-4">
            <FooterBrand />
          </div>

          {/* Navigation Columns (Platform, Resources, Company, Help & Support) */}
          <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <FooterColumn key={section.title} section={section} />
            ))}
          </div>
        </div>

        {/* Contact / Trust Information Card */}
        <div className="my-4">
          <FooterTrustSection />
        </div>

        {/* Social Media Section */}
        <FooterSocials />

        {/* Legal & Copyright Bottom Bar */}
        <FooterBottomBar />
      </div>
    </footer>
  );
};
