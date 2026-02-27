import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, BarChart3, Users, Target, Gamepad2, Award } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const features = [
  { icon: Trophy, title: 'Achievements & Badges', desc: 'Earn badges and trophies as you learn. Showcase your achievements on your profile.' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'Track your learning journey with detailed analytics and performance insights.' },
  { icon: Users, title: 'Social Learning', desc: 'Learn together with classmates. Compete on leaderboards and share achievements.' },
  { icon: Target, title: 'Personalized Paths', desc: 'AI-powered learning paths customized to your pace and strengths.' },
  { icon: Gamepad2, title: 'Interactive Content', desc: 'Engage with interactive games, quizzes, and video lessons with popup questions.' },
  { icon: Award, title: 'Certified Learning', desc: 'Earn certificates upon course completion to validate your knowledge.' },
];

const FeatureCards: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="features" className="py-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Why Choose <span className="gradient-text">Acadevia</span>?</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">Everything you need for an engaging and effective learning experience.</p>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 0 30px rgba(108,99,255,0.15)' }}
              className="glass-card p-6 cursor-pointer group"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary inline-block mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeatureCards };
