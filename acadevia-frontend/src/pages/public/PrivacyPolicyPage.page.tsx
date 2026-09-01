import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { COMPANY_CONTACT } from '@/config/footer.config';
import { ShieldCheck, Lock, Eye, Baby, FileText, Bell } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'September 2026';

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: FileText,
      content: `Welcome to Acadevia ("we", "our", or "us"). We are committed to protecting the privacy, security, and personal data of our learners, parents, educators, and institutions. This Privacy Policy details the types of information we collect, how we use and safeguard that information, and the rights you hold regarding your personal data when using our platform, mobile applications, and offline synchronization services.`,
    },
    {
      id: 'children-privacy',
      title: "2. Children's Privacy (K-12 Educational Safeguards)",
      icon: Baby,
      highlight: true,
      content: `Because Acadevia serves students from Grades 1 through 12, protecting young learners is our highest priority:
• We only collect the minimal personal data necessary to provide personalized education (e.g., student name, grade level, and language preference).
• Parental or school consent is obtained prior to account creation for minors.
• We do NOT sell children's personal information to any third parties.
• We do NOT display targeted behavioral advertising to students on the platform.
• Parents and legal guardians retain the absolute right to review, modify, or request the deletion of their child's educational data at any time.`,
    },
    {
      id: 'information-collected',
      title: '3. Information We Collect',
      icon: Eye,
      content: `We collect the following categories of data:
• Account & Profile Information: Name, email address, password hash, phone number, grade level, school/classroom association, and selected learning languages.
• Learning & Progress Data: Quiz attempts, assessment scores, course completions, study time, streak logs, XP, and badges earned.
• Offline Synchronization Data: Encrypted delta logs cached on local devices (via IndexedDB) to sync progress once reconnected to the internet.
• Technical & Device Data: IP address, browser type, operating system, and crash analytics strictly for platform reliability and security monitoring.`,
    },
    {
      id: 'how-we-use',
      title: '4. How We Use Your Information',
      icon: ShieldCheck,
      content: `We use personal and learning data exclusively to:
• Deliver tailored lessons, smart quizzes, and adaptive learning paths.
• Provide parents and educators with insightful academic progress reports and competency analytics.
• Maintain real-time leaderboards and gamification features.
• Synchronize offline study records securely across devices.
• Respond to user inquiries, customer support requests, and security alerts.`,
    },
    {
      id: 'ai-personalization',
      title: '5. AI and Personalized Learning',
      icon: Lock,
      content: `Acadevia uses proprietary artificial intelligence and machine learning algorithms to diagnose competency gaps and recommend targeted practice materials:
• Student answers are analyzed algorithmically to adjust lesson difficulty.
• Student data is never used to train third-party public AI models without strict de-identification and institutional consent.
• AI-generated study recommendations serve as supplementary academic aids and undergo human educational review.`,
    },
    {
      id: 'cookies-tracking',
      title: '6. Cookies and Local Storage',
      icon: FileText,
      content: `We use essential session tokens and local storage (IndexedDB / localStorage) to remember your preferences, active language pack, and facilitate offline learning. We do not employ intrusive tracking cookies across external websites.`,
    },
    {
      id: 'data-security',
      title: '7. Data Security and Retention',
      icon: Lock,
      content: `We employ enterprise-grade security controls including TLS 1.3 encryption in transit, AES-256 encryption at rest, role-based access controls (RBAC), and continuous vulnerability monitoring. Educational records are retained as long as the student maintains an active account, or as required by applicable educational compliance laws.`,
    },
    {
      id: 'user-rights',
      title: '8. Your Data Rights & Choices',
      icon: ShieldCheck,
      content: `You and your guardians have the right to:
• Access and export your academic learning history.
• Request correction of inaccurate profile data.
• Request complete deletion of your account and personal records.
• Withdraw consent for non-essential notifications.`,
    },
    {
      id: 'contact-legal',
      title: '9. Changes and Legal Contact',
      icon: Bell,
      content: `We may periodically update this Privacy Policy to reflect platform enhancements or regulatory changes. Material changes will be communicated via in-app notification.
For any privacy questions or data deletion requests, contact our Data Protection Officer at: ${COMPANY_CONTACT.supportEmail}.`,
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 border border-primary-100 dark:border-primary-800 text-xs sm:text-sm font-semibold mb-4">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span>Legal Information</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last Updated: {lastUpdated} • Acadevia Education Technologies
          </p>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card
                className={`p-6 sm:p-8 rounded-2xl border ${
                  section.highlight
                    ? 'border-primary/40 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/20 dark:to-card-dark shadow-md ring-1 ring-primary/20'
                    : 'border-gray-200/80 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
