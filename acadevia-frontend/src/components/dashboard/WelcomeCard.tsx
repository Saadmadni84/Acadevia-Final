import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, ArrowRight, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { ROUTES } from '@/config/routes.config';

interface WelcomeCardProps {
  name: string;
  level: number;
  levelName: string;
  currentXP: number;
  requiredXP: number;
  streak: number;
  todayGoalProgress: number;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ name, level, levelName, currentXP, requiredXP, streak, todayGoalProgress }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#7B3F95] to-[#3A1B47] p-6 md:p-8 text-white shadow-2xl shadow-primary/25"
  >
    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
    <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white/5 rounded-full" />
    <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
    <div className="absolute top-6 right-8 w-20 h-20 bg-secondary/20 rounded-2xl rotate-12 hidden md:block" />
    <div className="absolute bottom-4 right-24 w-16 h-16 bg-secondary/10 rounded-xl -rotate-6 hidden md:block" />

    {/* Floating icons */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-8 right-12 hidden lg:block"
    >
      <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <BookOpen className="h-7 w-7 text-white/80" />
      </div>
    </motion.div>
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-10 right-40 hidden lg:block"
    >
      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <Trophy className="h-6 w-6 text-yellow-300/80" />
      </div>
    </motion.div>

    <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left content */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/70">Your Learning Hub</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
            Welcome back, {name}! 👋
          </h2>
          <p className="text-sm md:text-base text-white/60 mt-2 max-w-md">
            Continue your learning journey and unlock new achievements today.
          </p>

          <Link
            to={ROUTES.COURSES}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-white text-primary font-semibold text-sm rounded-xl hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/20 group"
          >
            Continue Learning
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Right stats */}
        <div className="flex-shrink-0 space-y-4 md:min-w-[240px]">
          {/* XP Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <XPProgressBar
              currentXP={currentXP}
              requiredXP={requiredXP}
              level={level}
              levelName={levelName}
              size="sm"
              className="[&_span]:text-white/90 [&_p]:text-white/70"
            />
          </div>

          {/* Stats row */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Flame className="h-5 w-5 text-orange-300 mx-auto mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Target className="h-5 w-5 text-green-300 mx-auto mb-1" />
              <p className="text-lg font-bold">{todayGoalProgress}%</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export { WelcomeCard };
