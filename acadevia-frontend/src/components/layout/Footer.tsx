import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  HelpCircle,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Globe,
} from 'lucide-react';

const footerLinks = [
  {
    titleKey: 'footer.learning',
    links: [
      { labelKey: 'footer.courses', to: '/courses' },
      { labelKey: 'footer.quizzes', to: '/games' },
      { labelKey: 'footer.leaderboard', to: '/leaderboard' },
    ],
    icon: BookOpen,
  },
  {
    titleKey: 'footer.community',
    links: [
      { labelKey: 'footer.forums', to: '#' },
      { labelKey: 'footer.events', to: '#' },
      { labelKey: 'footer.blog', to: '#' },
    ],
    icon: Users,
  },
  {
    titleKey: 'footer.support',
    links: [
      { labelKey: 'footer.helpCenter', to: '#' },
      { labelKey: 'footer.faq', to: '#' },
      { labelKey: 'footer.accessibility', to: '#' },
    ],
    icon: HelpCircle,
  },
  {
    titleKey: 'footer.contact',
    links: [
      { labelKey: 'footer.email', to: 'mailto:support@acadevia.com' },
      { labelKey: 'footer.feedback', to: '#' },
      { labelKey: 'footer.partnerships', to: '#' },
    ],
    icon: Mail,
  },
];

const socialLinks = [
  { label: 'GitHub', icon: Github, href: '#' },
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      role="contentinfo"
      aria-label={t('footer.siteFooter', 'Site footer')}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400"
              aria-label={t('footer.home', 'Go to homepage')}
            >
              <BookOpen className="h-6 w-6" aria-hidden="true" />
              Acadevia
            </Link>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {t('footer.tagline', 'Empowering learners through gamified education.')}
            </p>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.titleKey}>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <group.icon className="h-4 w-4" aria-hidden="true" />
                {t(group.titleKey, group.titleKey.split('.')[1])}
              </h3>
              <ul className="mt-3 space-y-2" role="list">
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    >
                      {t(link.labelKey, link.labelKey.split('.')[1])}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800" />

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Acadevia. {t('footer.allRightsReserved', 'All rights reserved.')}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3" role="list" aria-label={t('footer.socialMedia', 'Social media links')}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <social.icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <label htmlFor="footer-lang-select" className="sr-only">
              {t('footer.selectLanguage', 'Select language')}
            </label>
            <select
              id="footer-lang-select"
              value={i18n.language}
              onChange={handleLanguageChange}
              className="rounded-md border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:text-gray-400"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export { Footer };
