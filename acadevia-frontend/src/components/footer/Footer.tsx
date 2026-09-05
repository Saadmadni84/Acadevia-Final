import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';

/* ------------------------------------------------------------------ */
/*  Footer Link Data                                                   */
/* ------------------------------------------------------------------ */

const linkSections = [
  {
    heading: 'Product',
    links: [
      { label: 'Courses', to: ROUTES.COURSES },
      { label: 'Quizzes', to: ROUTES.QUIZZES },
      { label: 'Games', to: ROUTES.GAMES },
      { label: 'Leaderboard', to: ROUTES.LEADERBOARD },
      { label: 'Achievements', to: ROUTES.ACHIEVEMENTS },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Study Materials', to: ROUTES.STUDY_MATERIALS },
      { label: 'Practice Questions', to: ROUTES.PRACTICE_QUESTIONS },
      { label: 'Learning Guides', to: ROUTES.LEARNING_GUIDES },
      { label: 'Help Center', to: ROUTES.HELP_CENTER },
      { label: 'FAQs', to: ROUTES.FAQS },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: ROUTES.ABOUT },
      { label: 'Contact', to: ROUTES.CONTACT },
      { label: 'Blog', to: ROUTES.BLOG },
      { label: 'Careers', to: ROUTES.CAREERS },
      { label: 'Success Stories', to: ROUTES.SUCCESS_STORIES },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { label: 'Twitter', icon: Twitter, href: 'https://x.com' },
];

/* ------------------------------------------------------------------ */
/*  Newsletter form                                                    */
/* ------------------------------------------------------------------ */

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-2.5">
        Get weekly study tips and platform updates.
      </p>
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="flex-1 min-w-0 px-3.5 py-2 text-[13px] bg-white dark:bg-[#1C1226] border border-[#E8E5DF] dark:border-[#2E1B3D] rounded-l-lg text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#5B2C6F] dark:focus:border-[#A855F7] transition-colors"
          aria-label="Email address"
        />
        <button
          type="submit"
          className="px-3.5 py-2 bg-[#5B2C6F] hover:bg-[#4A2359] text-white text-[13px] font-medium rounded-r-lg transition-colors shrink-0"
        >
          {submitted ? 'Sent ✓' : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Footer                                                        */
/* ------------------------------------------------------------------ */

interface FooterProps {
  showCTA?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`w-full bg-[#FAF9F6] dark:bg-[#0C0712] border-t border-[#E8E5DF] dark:border-[#1E1228] transition-colors duration-200 ${className}`}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  Main Grid                                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16 pt-16 pb-12">

          {/* ── Brand Column (wider) ── */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 group" aria-label="Acadevia home">
              <GraduationCap className="h-7 w-7 text-[#5B2C6F] dark:text-[#C084FC]" />
              <span className="text-[20px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Acadevia
              </span>
            </Link>

            <p className="mt-4 text-[14px] leading-[1.7] text-[#64748B] dark:text-[#94A3B8] max-w-xs">
              Making quality education personal, engaging, and accessible
              for every learner across Grades 1–12.
            </p>

            <NewsletterForm />
          </div>

          {/* ── Link Columns ── */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-8">
            {linkSections.map((section) => (
              <div key={section.heading}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] dark:text-[#64748B] mb-4">
                  {section.heading}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-[13px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  Bottom Bar                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#E8E5DF] dark:border-[#1E1228]">

          {/* Left: Copyright */}
          <p className="text-[12px] text-[#94A3B8] dark:text-[#64748B]">
            © {year} Acadevia Education Technologies. All rights reserved.
          </p>

          {/* Right: Legal + Socials */}
          <div className="flex items-center gap-6">
            {/* Legal links */}
            <nav aria-label="Legal" className="flex items-center gap-4">
              <Link
                to={ROUTES.PRIVACY_POLICY}
                className="text-[12px] text-[#94A3B8] dark:text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
              >
                Privacy
              </Link>
              <Link
                to={ROUTES.TERMS}
                className="text-[12px] text-[#94A3B8] dark:text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
              >
                Terms
              </Link>
            </nav>

            {/* Divider */}
            <span className="h-3.5 w-px bg-[#E8E5DF] dark:bg-[#2E1B3D]" aria-hidden="true" />

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="p-1.5 text-[#94A3B8] dark:text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors duration-150"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
