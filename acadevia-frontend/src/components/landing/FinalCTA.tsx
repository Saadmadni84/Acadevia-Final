import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { ArrowRight, BookOpen } from 'lucide-react';

const FinalCTA: React.FC = () => (
  <section className="py-20 relative overflow-hidden bg-transparent dark:bg-black">
    <div className="max-w-5xl mx-auto px-4">
      <div className="relative rounded-3xl bg-primary dark:bg-[#050505] border border-primary/20 dark:border-[#242424] p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 dark:bg-purple-900/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Join 10 Lakh+ Students Today
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-white/80 dark:text-[#A1A1AA] max-w-2xl mx-auto">
            Start your learning journey with Acadevia. It's free, fun, and effective.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-4 justify-center mt-8">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="bg-white dark:bg-primary text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-primary-dark" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Create Free Account
              </Button>
            </Link>
            <Link to={ROUTES.COURSES}>
              <Button size="lg" variant="outline" className="border-white dark:border-[#242424] text-white hover:bg-white/10 dark:hover:bg-[#111111]" leftIcon={<BookOpen className="h-5 w-5" />}>
                Browse Courses
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export { FinalCTA };
