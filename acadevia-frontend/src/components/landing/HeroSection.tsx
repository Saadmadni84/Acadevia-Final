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
    <div className="text-center px-3 py-2 sm:py-0">
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-[#F5F5F5]">
        {count}
        <span className="text-primary dark:text-[#F5F5F5]">{suffix}</span>
      </p>
      <p className="text-xs sm:text-[13px] text-gray-500 dark:text-[#8A8A8A] mt-1 font-medium">{label}</p>
    </div>
  );
};

const HeroSection: React.FC = () => (
  <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden bg-background-light dark:bg-black">
    {/* Atmospheric glow completely hidden in dark mode for pure OLED black experience */}
    <div className="absolute inset-0 bg-primary/5 dark:bg-black pointer-events-none" />
    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float dark:hidden pointer-events-none" />
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float dark:hidden pointer-events-none" style={{ animationDelay: '1s' }} />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Confident Editorial Typography & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          {/* Subtle Platform Tag - Neutral with crisp border */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 dark:bg-[#050505] text-primary dark:text-[#D4D4D4] border border-primary/20 dark:border-[#242424] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-white" />
            India's Leading Gamified Learning Platform
          </div>

          {/* MasterClass-Inspired High Impact Heading: Both lines WHITE in Dark Mode */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0F172A] dark:text-[#F5F5F5] leading-[1.08] tracking-tight">
            Learn Through{' '}
            <span className="text-primary dark:text-[#F5F5F5]">Gaming</span>
          </h1>

          {/* Secondary Editorial Description */}
          <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-[#A1A1AA] max-w-xl leading-relaxed font-normal">
            India's most engaging learning platform. Master concepts through interactive games, earn badges, and compete on leaderboards.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-wrap gap-4 mt-8 items-center">
            <Link to={ROUTES.REGISTER}>
              <Button
                variant="primary"
                size="lg"
                className="bg-[#5B2C6F] hover:bg-[#4A2359] dark:bg-[#5B2C6F] dark:hover:bg-[#6D3484] text-white px-7 py-3.5 rounded-xl font-semibold shadow-none transition-all"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Start Learning
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent dark:bg-transparent border border-gray-300 dark:border-[#2A2A2A] text-gray-800 dark:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#111111] dark:hover:border-[#333333] px-6 py-3.5 rounded-xl font-medium transition-all"
              leftIcon={<Play className="h-4 w-4 text-gray-700 dark:text-[#F5F5F5] fill-current" />}
            >
              Watch Demo
            </Button>
          </div>

          {/* Supporting Statistics Card: Neutral OLED Surface + Crisp Typography */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#242424] divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-[#242424]">
            <StatItem value={10} suffix="L+" label="Students" />
            <StatItem value={50} suffix="K+" label="Active Today" />
            <StatItem value={5} suffix="L+" label="Lessons Done" />
            <StatItem value={85} suffix="%" label="Avg Score" />
          </div>
        </motion.div>

        {/* Right Column: Refined Neutral Visual Panel with Preserved Graduation Cap */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:flex lg:col-span-5 justify-center"
        >
          <div className="relative w-80 sm:w-96 h-[510px] bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#242424] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none transition-all duration-300 overflow-hidden">
            {/* Top Bar of Panel */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1C1C1C] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary dark:bg-white" />
                <span className="text-[11px] font-bold tracking-widest text-gray-500 dark:text-[#8A8A8A] uppercase">
                  Acadevia Classroom
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#111111] text-gray-600 dark:text-[#8A8A8A] border border-gray-200 dark:border-[#242424]">
                Class 6–12
              </span>
            </div>

            {/* Center: Concentric Rings Frame with Educational Motif */}
            <div className="my-auto flex flex-col items-center justify-center py-6">
              <div className="relative w-36 h-36 rounded-full border border-gray-100 dark:border-[#1C1C1C] flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-gray-200 dark:border-[#242424] bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center shadow-inner">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-14 h-14 text-gray-800 dark:text-[#E5E5E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    <span className="absolute bottom-2 right-1.5 w-1.5 h-1.5 rounded-full bg-primary dark:bg-[#A855F7]" />
                  </div>
                </div>
              </div>
              <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-[#F5F5F5] tracking-tight">
                Curriculum-Aligned Learning
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-[#8A8A8A] text-center max-w-[220px]">
                Interactive chapters, real-time analytics & mastery badges
              </p>
            </div>

            {/* Bottom HUD info card inside panel */}
            <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#1C1C1C] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-[#8A8A8A]">Current Standing</p>
                <p className="text-xs font-bold text-gray-900 dark:text-[#F5F5F5] mt-0.5">Top 5% Nationwide</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] text-gray-800 dark:text-[#F5F5F5] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                <span>+250 XP</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export { HeroSection };

