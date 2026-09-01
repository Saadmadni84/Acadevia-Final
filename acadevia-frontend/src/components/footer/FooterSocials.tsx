import React from 'react';
import { SOCIAL_LINKS } from '@/config/footer.config';
import { Instagram, Youtube, Linkedin, Twitter, Facebook, Github } from 'lucide-react';

export const FooterSocials: React.FC = () => {
  const socialItems = [
    { label: 'Instagram', icon: Instagram, href: SOCIAL_LINKS.instagram },
    { label: 'YouTube', icon: Youtube, href: SOCIAL_LINKS.youtube },
    { label: 'LinkedIn', icon: Linkedin, href: SOCIAL_LINKS.linkedin },
    { label: 'X (Twitter)', icon: Twitter, href: SOCIAL_LINKS.twitter },
    { label: 'Facebook', icon: Facebook, href: SOCIAL_LINKS.facebook },
    { label: 'GitHub', icon: Github, href: SOCIAL_LINKS.github },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-b border-gray-100 dark:border-gray-800 my-8">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center sm:text-left">
          Follow Acadevia
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
          Join our learning community & stay updated with educational insights.
        </p>
      </div>

      <div className="flex items-center gap-2" role="list" aria-label="Social media profiles">
        {socialItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow Acadevia on ${item.label}`}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-white hover:bg-primary dark:hover:bg-primary transition-all duration-200 hover:scale-110 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
};
