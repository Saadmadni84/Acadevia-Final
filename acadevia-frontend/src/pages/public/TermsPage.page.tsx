import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { COMPANY_CONTACT } from '@/config/footer.config';
import { FileCheck, BookOpen, AlertTriangle, Scale, Shield, Users } from 'lucide-react';

const TermsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'September 2026';

  const sections = [
    {
      id: 'introduction',
      title: '1. Agreement to Terms',
      icon: FileCheck,
      content: `These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User", "Student", "Parent", or "Teacher") and Acadevia Education Technologies ("Acadevia", "we", "us"). By creating an account, accessing our website, or using our mobile application and offline sync features, you agree to comply with and be bound by these Terms.`,
    },
    {
      id: 'eligibility',
      title: '2. User Eligibility & Guardian Consent',
      icon: Users,
      content: `Acadevia provides educational content designed for students in Grades 1 through 12. If you are under the age of majority in your jurisdiction:
• You must obtain permission and consent from a parent or legal guardian prior to registering an account.
• Parents/guardians are responsible for monitoring and supervising their minor's use of the platform.
• Schools and institutions enrolling students under enterprise accounts warrant that they have obtained requisite institutional consent.`,
    },
    {
      id: 'ai-disclaimer',
      title: '3. Educational & AI Content Disclaimer',
      icon: AlertTriangle,
      highlight: true,
      content: `Important Academic Notice regarding AI-Assisted Educational Features:
• Acadevia provides artificial intelligence-powered study assistance, question generation, and personalized recommendations intended solely to support learning and self-practice.
• AI-generated hints, summaries, and answers are supplementary aids and must NOT automatically be treated as definitive, authoritative, or infallible academic determinations without verification.
• Students and educators are encouraged to exercise critical judgment and cross-reference educational materials with accredited standard curricula (e.g., NCERT, State Boards).`,
    },
    {
      id: 'acceptable-use',
      title: '4. Acceptable Use & Academic Integrity',
      icon: Shield,
      content: `When using Acadevia, you agree that you will NOT:
• Engage in academic dishonesty, plagiarism, or misuse leaderboards through automated scripts or cheating.
• Upload harmful, defamatory, offensive, or copyright-infringing content.
• Attempt to reverse engineer, disrupt, or probe vulnerabilities in our microservice infrastructure or APIs.
• Share account credentials or bypass rate-limiting controls.`,
    },
    {
      id: 'intellectual-property',
      title: '5. Intellectual Property Rights',
      icon: BookOpen,
      content: `All courses, lessons, video content, graphics, quiz questions, interactive games, source code, and branding trademarks remain the exclusive intellectual property of Acadevia or its licensors. Users receive a limited, revocable, non-transferable license for personal, non-commercial educational study only.`,
    },
    {
      id: 'availability',
      title: '6. Platform Availability & Offline Sync',
      icon: Scale,
      content: `While we strive for 99.9% uptime, Acadevia is provided on an "as is" and "as available" basis. Offline-cached materials and progress sync depend on device storage and periodic connectivity. Acadevia is not liable for data loss caused by unauthorized device tampering or cache clearing.`,
    },
    {
      id: 'limitation-liability',
      title: '7. Limitation of Liability',
      icon: Scale,
      content: `To the maximum extent permitted by applicable law, Acadevia and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from platform use, examination outcomes, or academic assessments.`,
    },
    {
      id: 'contact',
      title: '8. Governing Law & Contact Information',
      icon: FileCheck,
      content: `These Terms are governed by the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in India.
For inquiries regarding these Terms, please reach out to: ${COMPANY_CONTACT.supportEmail}.`,
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
            <FileCheck className="h-4 w-4 text-secondary" />
            <span>Platform Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last Updated: {lastUpdated} • Acadevia Education Technologies
          </p>
        </motion.div>

        {/* Terms Sections */}
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
                    ? 'border-secondary/40 bg-gradient-to-br from-secondary/5 to-white dark:from-secondary/10 dark:to-card-dark shadow-md ring-1 ring-secondary/20'
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

export default TermsPage;
