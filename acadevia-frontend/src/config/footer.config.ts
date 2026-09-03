import { ROUTES } from './routes.config';

export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLinksConfig {
  instagram: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  github: string;
}

export interface CompanyContactConfig {
  companyName: string;
  tagline: string;
  description: string;
  secondaryTagline: string;
  addressLine1: string;
  addressLine2: string;
  addressPostal: string;
  mapsUrl: string;
  supportEmail: string;
  phone: string;
  phones: Array<{ display: string; tel: string }>;
  availability: string;
}

export const COMPANY_CONTACT: CompanyContactConfig = {
  companyName: 'Acadevia Education Technologies',
  tagline: 'Learn Smarter. Practice Better. Achieve More.',
  description:
    'Acadevia is an AI-powered learning platform designed to make education personalized, engaging, and accessible for every learner across Grades 1–12.',
  secondaryTagline: 'Learn. Practice. Compete. Grow.',
  addressLine1: 'Acadevia Education Technologies',
  addressLine2: 'Gamma 1, Greater Noida',
  addressPostal: '201310, India',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gamma+1%2C+Greater+Noida%2C+201310%2C+India',
  supportEmail: 'adityajr.asr07@gmail.com',
  phone: '+91 88403 69569',
  phones: [
    { display: '+91 88403 69569', tel: 'tel:+918840369569' },
    { display: '+91 97926 96413', tel: 'tel:+919792696413' },
  ],
  availability: 'Available Monday to Saturday (9:00 AM – 6:00 PM IST)',
};

export const SOCIAL_LINKS: SocialLinksConfig = {
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://x.com',
  facebook: 'https://facebook.com',
  github: 'https://github.com',
};

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Courses', href: ROUTES.COURSES },
      { label: 'Subjects', href: ROUTES.SUBJECTS },
      { label: 'Quizzes', href: ROUTES.QUIZ.replace(':courseId', 'c1').replace(':quizId', 'q1') },
      { label: 'AI Learning', href: ROUTES.AI_LEARNING, badge: 'AI' },
      { label: 'Personalized Learning', href: ROUTES.COURSES },
      { label: 'Competency Tracking', href: ROUTES.COMPETENCY },
      { label: 'Leaderboard', href: ROUTES.LEADERBOARD },
      { label: 'Learning Streaks', href: ROUTES.STREAKS },
      { label: 'Achievements', href: ROUTES.ACHIEVEMENTS },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Study Materials', href: ROUTES.STUDY_MATERIALS },
      { label: 'Practice Questions', href: ROUTES.PRACTICE_QUESTIONS },
      { label: 'MCQ Practice', href: ROUTES.MCQ_PRACTICE },
      { label: 'Learning Guides', href: ROUTES.LEARNING_GUIDES },
      { label: 'AI Study Assistant', href: ROUTES.AI_LEARNING, badge: 'New' },
      { label: 'Help Center', href: ROUTES.HELP_CENTER },
      { label: 'FAQs', href: ROUTES.FAQS },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Acadevia', href: ROUTES.ABOUT },
      { label: 'Contact Us', href: ROUTES.CONTACT },
      { label: 'Our Mission', href: `${ROUTES.ABOUT}#mission` },
      { label: 'Careers', href: ROUTES.CAREERS, badge: 'Hiring' },
      { label: 'Blog', href: ROUTES.BLOG },
      { label: 'Success Stories', href: ROUTES.SUCCESS_STORIES },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Student Support', href: ROUTES.CONTACT },
      { label: 'Parent Guidance', href: ROUTES.CONTACT },
      { label: 'Educator Portal', href: ROUTES.TEACHER_DASHBOARD },
      { label: 'System Status', href: ROUTES.HELP_CENTER },
      { label: 'Offline Learning Sync', href: ROUTES.DOWNLOADS },
    ],
  },
];

export const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: ROUTES.PRIVACY_POLICY },
  { label: 'Terms & Conditions', href: ROUTES.TERMS },
  { label: 'Contact Us', href: ROUTES.CONTACT },
];
