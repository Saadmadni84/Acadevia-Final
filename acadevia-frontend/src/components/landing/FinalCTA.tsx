import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { ArrowRight, BookOpen } from 'lucide-react';

const FinalCTA: React.FC = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-primary opacity-90" />
    <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl lg:text-5xl font-bold">
        Join 10 Lakh+ Students Today
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
        Start your learning journey with Acadevia. It's free, fun, and effective.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-4 justify-center mt-8">
        <Link to={ROUTES.REGISTER}>
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100" rightIcon={<ArrowRight className="h-5 w-5" />}>
            Create Free Account
          </Button>
        </Link>
        <Link to={ROUTES.COURSES}>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" leftIcon={<BookOpen className="h-5 w-5" />}>
            Browse Courses
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

export { FinalCTA };
