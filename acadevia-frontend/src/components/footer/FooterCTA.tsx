import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface FooterCTAProps {
  className?: string;
}

export const FooterCTA: React.FC<FooterCTAProps> = ({ className = '' }) => {
  return (
    <section
      aria-label="Call to Action"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-[#3A1B47] text-white p-8 md:p-12 lg:p-16 shadow-2xl ${className}`}
    >
      {/* Decorative gradient glowing spheres */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary-light/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-secondary-light"
        >
          <Sparkles className="h-4 w-4 animate-pulse text-secondary" />
          <span>Empowering Grades 1–12 across India</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
        >
          Start Your Learning Journey with Acadevia
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg lg:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed"
        >
          Learn smarter, practice consistently, and grow with a personalized learning experience built around you.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 shadow-xl hover:shadow-2xl font-semibold px-8 py-3.5 text-base rounded-xl transition-all duration-200 group"
              rightIcon={
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              }
            >
              Start Learning
            </Button>
          </Link>
          <Link to={ROUTES.COURSES} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/10 hover:border-white font-medium px-8 py-3.5 text-base rounded-xl transition-all duration-200"
              leftIcon={<BookOpen className="h-5 w-5 text-secondary-light" />}
            >
              Explore Courses
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
