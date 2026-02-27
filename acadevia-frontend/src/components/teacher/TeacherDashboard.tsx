import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Brain, TrendingUp, Upload, BarChart3 } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const TeacherDashboard: React.FC = () => (
  <div className="space-y-6 p-1">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your courses and track student progress</p>
      </div>
      <Button variant="gradient" leftIcon={<Upload className="h-4 w-4" />}>Upload Content</Button>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard label="Total Students" value={1234} icon={<Users className="h-5 w-5" />} trend={12} />
      <StatsCard label="Active Courses" value={8} icon={<BookOpen className="h-5 w-5" />} trend={2} />
      <StatsCard label="Quizzes Created" value={45} icon={<Brain className="h-5 w-5" />} />
      <StatsCard label="Avg Performance" value={78} suffix="%" icon={<TrendingUp className="h-5 w-5" />} trend={5} />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">Recent Submissions</h3>
        <div className="space-y-3">
          {['Math Quiz - Ch.5', 'Science Assignment', 'English Essay'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div><p className="text-sm font-medium">{item}</p><p className="text-xs text-gray-500">{12 + i * 5} submissions</p></div>
              <Button variant="outline" size="sm">Review</Button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Create Quiz', icon: Brain, color: 'from-[#5B2C6F] to-[#7B3F95]' },
            { label: 'Upload Video', icon: Upload, color: 'from-[#3A1B47] to-[#5B2C6F]' },
            { label: 'View Analytics', icon: BarChart3, color: 'from-[#D4A843] to-[#B08B2E]' },
            { label: 'Manage Students', icon: Users, color: 'from-[#E74C3C] to-[#C0392B]' },
          ].map((a, i) => (
            <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', a.color)}>
                <a.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default TeacherDashboard;
