import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import {
  Brain,
  Target,
  Trophy,
  CheckCircle,
  Globe2,
  WifiOff,
  ArrowRight,
  GraduationCap,
  Users,
  Compass,
  Lightbulb,
} from 'lucide-react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const coreOfferings = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description:
        'Personalized study recommendations, intelligent concept breakdown, and real-time guidance tailored to each student’s unique pace.',
    },
    {
      icon: Target,
      title: 'Personalized Learning Paths',
      description:
        'Adaptive learning trajectories that dynamically diagnose competency gaps and reinforce core foundational concepts.',
    },
    {
      icon: Trophy,
      title: 'Gamified Education',
      description:
        'XP, streaks, milestone badges, and friendly leaderboards designed to make daily practice enjoyable and habit-forming.',
    },
    {
      icon: CheckCircle,
      title: 'Smart Assessments',
      description:
        'Intelligent quizzes and MCQ evaluations that measure true conceptual mastery and critical thinking rather than rote memorization.',
    },
    {
      icon: Globe2,
      title: 'Multilingual Learning',
      description:
        'Deep localization across 28+ Indian languages and native scripts to ensure language is never a barrier to quality learning.',
    },
    {
      icon: WifiOff,
      title: 'Offline Learning Support',
      description:
        'Local-first offline synchronization enabling seamless video watching, note reading, and quiz practice without active internet.',
    },
  ];

  const philosophyPoints = [
    {
      icon: Compass,
      title: 'Learn at Your Own Pace',
      description: 'Master concepts thoroughly without the pressure of rigid timelines.',
    },
    {
      icon: Lightbulb,
      title: 'Identify Competency Gaps',
      description: 'Pinpoint exact areas of difficulty and get targeted practice modules.',
    },
    {
      icon: Target,
      title: 'Intelligent Quizzes',
      description: 'Engaging, interactive assessments that reinforce learning in real time.',
    },
    {
      icon: Users,
      title: 'Parent & Teacher Visibility',
      description: 'Transparent analytics empowering parents and educators to support progress.',
    },
  ];

  return (
    <div className="py-12 md:py-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 border border-primary-100 dark:border-primary-800 text-xs sm:text-sm font-semibold mb-6"
        >
          <GraduationCap className="h-4 w-4 text-secondary" />
          <span>About Acadevia Education</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          Reimagining Learning for <span className="text-primary dark:text-primary-300">Every Student</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
        >
          Acadevia is a next-generation, AI-assisted educational ecosystem engineered to make quality K-12 learning personalized, interactive, gamified, and accessible anywhere in India.
        </motion.p>
      </section>

      {/* Mission Section */}
      <section id="mission" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary-50 via-purple-50/50 to-white dark:from-[#241530] dark:via-[#1E1128] dark:to-card-dark p-8 md:p-14 border border-primary-100 dark:border-primary-800/40 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Our Core Mission</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Democratizing World-Class Education Through Intelligent Technology
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Our mission is to make high-quality learning accessible to every student by combining intelligent technology, engaging curriculum content, personalized learning paths, and meaningful practice. Whether learning from a metro city or a remote rural classroom, every student deserves equal access to modern learning tools.
            </p>
          </div>
        </div>
      </section>

      {/* What Acadevia Offers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-300">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
            What Acadevia Offers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm sm:text-base">
            Engineered with student success and holistic understanding at the core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreOfferings.map((offering, idx) => (
            <motion.div
              key={offering.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hoverable className="h-full flex flex-col p-6 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/40 text-primary dark:text-primary-300 flex items-center justify-center mb-5">
                  <offering.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{offering.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                  {offering.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Acadevia Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Our Philosophy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
            Why Choose Acadevia?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {philosophyPoints.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{item.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 text-center">
          <Link to={ROUTES.REGISTER}>
            <Button size="lg" className="px-8 py-3.5" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Join the Acadevia Community
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
