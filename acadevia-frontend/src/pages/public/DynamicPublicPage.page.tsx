import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  Brain,
} from 'lucide-react';

interface DynamicPublicPageProps {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  features?: string[];
  ctaLabel?: string;
  ctaRoute?: string;
}

export const DynamicPublicPage: React.FC<DynamicPublicPageProps> = ({
  title,
  subtitle,
  badge,
  description,
  features = [
    'Integrated with Indian K-12 curriculum (CBSE, ICSE, State Boards)',
    'Real-time competency tracking and performance diagnostics',
    'Interactive quizzes, gamified milestones, and streak rewards',
    'Multilingual audio-visual explanations across 28+ Indian languages',
  ],
  ctaLabel = 'Explore Platform',
  ctaRoute = ROUTES.COURSES,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-12 md:py-20">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 border border-primary-100 dark:border-primary-800 text-xs sm:text-sm font-semibold mb-4"
          >
            <Sparkles className="h-4 w-4 text-secondary" />
            <span>{badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 sm:p-12 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-md">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-8">
              {description}
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Key Highlights & Learning Benefits
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                >
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Personalized AI Powered Learning
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Accessible on Web and Mobile, online and offline.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Link to={ctaRoute} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-6 py-3"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {ctaLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};
