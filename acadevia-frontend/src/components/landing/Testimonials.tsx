import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const testimonials = [
  { name: 'Priya Sharma', school: 'DPS Noida, Class 10', quote: 'Acadevia made studying fun! I improved my math score from 65% to 94% in just 3 months.', rating: 5 },
  { name: 'Arjun Patel', school: 'Ryan International, Class 9', quote: 'The gamification keeps me motivated. I have a 45-day learning streak and earned 15 badges!', rating: 5 },
  { name: 'Meera Iyer', school: 'Kendriya Vidyalaya, Class 8', quote: 'I love the offline mode. I can download lessons and study even when there is no internet in my village.', rating: 5 },
];

const Testimonials: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section id="testimonials" className="py-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">What Students <span className="gradient-text">Say</span></h2>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={isIntersecting ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.15 }} className="glass-card p-6 relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
              <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 text-warning fill-warning" />)}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <Avatar name={t.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Testimonials };
