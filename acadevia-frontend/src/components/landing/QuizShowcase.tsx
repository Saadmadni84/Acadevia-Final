import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Clock, Zap, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const quizFeatures = [
  { icon: Brain, title: 'Adaptive Difficulty', desc: 'Questions adjust to your skill level for optimal learning.' },
  { icon: Clock, title: 'Timed Challenges', desc: 'Race against the clock in daily quiz challenges.' },
  { icon: Zap, title: 'Instant Feedback', desc: 'Get detailed explanations for every answer immediately.' },
  { icon: Target, title: 'Topic Mastery', desc: 'Track accuracy across subjects to identify strengths.' },
];

const sampleQuestions = [
  { subject: 'Mathematics', question: 'What is the derivative of x²?', options: ['x', '2x', '2', 'x²'], correct: 1 },
  { subject: 'Science', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
  { subject: 'English', question: 'Choose the correct form:', options: ['Their going', "They're going", 'There going', 'Theyre going'], correct: 1 },
];

const QuizShowcase: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="quiz" className="py-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Interactive <span className="gradient-text">Quizzes</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Test your knowledge with thousands of quizzes across all subjects. Compete with friends and earn XP.
          </p>
        </motion.div>

        <div ref={ref} className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Quiz Features */}
          <div className="grid sm:grid-cols-2 gap-4">
            {quizFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-5 group hover:border-primary/30 transition-all"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary inline-block mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Right: Sample Quiz Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">Live Preview</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 00:30</span>
            </div>
            {sampleQuestions.map((q, qi) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0 }}
                animate={isIntersecting ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 + qi * 0.15 }}
                className={`p-4 rounded-xl border transition-all ${qi === 0 ? 'border-primary/30 bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    q.subject === 'Mathematics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                    q.subject === 'Science' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                  }`}>{q.subject}</span>
                </div>
                <p className="text-sm font-medium mb-2">{q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-xs py-1.5 px-3 rounded-lg border text-center transition-all ${
                        oi === q.correct
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {oi === q.correct && <CheckCircle className="inline h-3 w-3 mr-1" />}
                      {opt}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link to={ROUTES.REGISTER}>
            <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Try a Quiz Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export { QuizShowcase };
