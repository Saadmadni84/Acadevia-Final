import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { useCountUp } from '@/hooks/useCountUp';
import { Play, ArrowRight } from 'lucide-react';

const StatItem: React.FC<{ value: number; suffix: string; label: string }> = ({ value, suffix, label }) => {
  const count = useCountUp(value, 2000);
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-primary">{count}{suffix}</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

const HeroSection: React.FC = () => (
  <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-primary/5" />
    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Learn Through{' '}
            <span className="gradient-text">Gaming</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-lg">
            India's most engaging learning platform. Master concepts through interactive games, earn badges, and compete on leaderboards.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to={ROUTES.REGISTER}>
              <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start Learning
              </Button>
            </Link>
            <Button variant="outline" size="lg" leftIcon={<Play className="h-5 w-5" />}>
              Watch Demo
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-12 p-6 glass-card">
            <StatItem value={10} suffix="L+" label="Students" />
            <StatItem value={50} suffix="K+" label="Active Today" />
            <StatItem value={5} suffix="L+" label="Lessons Done" />
            <StatItem value={85} suffix="%" label="Avg Score" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:flex justify-center">
          <div className="relative w-80 h-[500px] bg-primary/10 rounded-3xl flex items-center justify-center text-6xl shadow-2xl">
            🎓
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export { HeroSection };
