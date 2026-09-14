import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { ROUTES } from '@/config/routes.config';
import { Menu, X } from 'lucide-react';

const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 dark:bg-black/95 border-b border-gray-200 dark:border-[#242424] backdrop-blur-xl shadow-sm dark:shadow-none' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <nav className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:text-primary dark:hover:text-[#F5F5F5] transition-colors">Features</a>
            <a href="#courses" className="text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:text-primary dark:hover:text-[#F5F5F5] transition-colors">Courses</a>
            <a href="#quiz" className="text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:text-primary dark:hover:text-[#F5F5F5] transition-colors">Quiz</a>
            <a href="#leaderboard" className="text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:text-primary dark:hover:text-[#F5F5F5] transition-colors">Leaderboard</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:text-primary dark:hover:text-[#F5F5F5] transition-colors">Testimonials</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <Link to={ROUTES.LOGIN}><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to={ROUTES.REGISTER}><Button variant="primary" size="sm" className="bg-[#5B2C6F] hover:bg-[#4A2359] dark:bg-[#5B2C6F] dark:hover:bg-[#7B3F95] text-white">Get Started</Button></Link>
          </div>
          <button className="md:hidden p-2 text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-[#242424] px-4 py-4 space-y-3">
          <a href="#features" className="block py-2 text-sm text-gray-700 dark:text-[#F5F5F5]">Features</a>
          <a href="#courses" className="block py-2 text-sm text-gray-700 dark:text-[#F5F5F5]">Courses</a>
          <a href="#quiz" className="block py-2 text-sm text-gray-700 dark:text-[#F5F5F5]">Quiz</a>
          <a href="#leaderboard" className="block py-2 text-sm text-gray-700 dark:text-[#F5F5F5]">Leaderboard</a>
          <div className="flex gap-2 pt-2">
            <Link to={ROUTES.LOGIN} className="flex-1"><Button variant="outline" className="w-full" size="sm">Login</Button></Link>
            <Link to={ROUTES.REGISTER} className="flex-1"><Button variant="primary" className="w-full bg-[#5B2C6F] hover:bg-[#4A2359] dark:bg-[#5B2C6F] dark:hover:bg-[#7B3F95] text-white" size="sm">Sign Up</Button></Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export { LandingNavbar };
