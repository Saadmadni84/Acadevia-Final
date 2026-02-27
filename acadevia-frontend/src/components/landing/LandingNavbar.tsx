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
      scrolled ? 'bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Features</a>
            <a href="#courses" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Courses</a>
            <a href="#quiz" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Quiz</a>
            <a href="#leaderboard" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Leaderboard</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Testimonials</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <Link to={ROUTES.LOGIN}><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to={ROUTES.REGISTER}><Button variant="gradient" size="sm">Get Started</Button></Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
          <a href="#features" className="block py-2 text-sm">Features</a>
          <a href="#courses" className="block py-2 text-sm">Courses</a>
          <a href="#quiz" className="block py-2 text-sm">Quiz</a>
          <a href="#leaderboard" className="block py-2 text-sm">Leaderboard</a>
          <div className="flex gap-2 pt-2">
            <Link to={ROUTES.LOGIN} className="flex-1"><Button variant="outline" className="w-full" size="sm">Login</Button></Link>
            <Link to={ROUTES.REGISTER} className="flex-1"><Button variant="gradient" className="w-full" size="sm">Sign Up</Button></Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export { LandingNavbar };
