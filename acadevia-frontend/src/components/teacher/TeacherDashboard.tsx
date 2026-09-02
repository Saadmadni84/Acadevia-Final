import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, Brain, TrendingUp, Upload, BarChart3, CheckCircle2 } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService } from '@/services/data.service';
import { executeClass10Simulation } from '@/services/class10Simulation.service';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const teacherId = user?.id || '10';
  const [, setUpdated] = useState(0);

  useEffect(() => {
    let mounted = true;
    dataService.syncFromBackend().then(() => {
      if (mounted) setUpdated((v) => v + 1);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Calculate real metrics from persistent data layer
  const teacherMetrics = dataService.getTeacherMetrics(teacherId);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.fullName || 'Teacher'} &bull; Manage your courses and track student performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                executeClass10Simulation();
                window.location.reload();
              }}
              className="border-dashed border-primary/40 text-primary text-xs"
            >
              ⚡ Run Class 10 Simulation
            </Button>
          )}
          <Button
            variant="gradient"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => navigate(ROUTES.TEACHER_CONTENT_UPLOAD)}
          >
            Upload Content
          </Button>
        </div>
      </div>

      {/* Real Statistics from Data Layer */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Students"
          value={teacherMetrics.totalStudents}
          icon={<Users className="h-5 w-5" />}
          trend={10}
        />
        <StatsCard
          label="Active Courses"
          value={8}
          icon={<BookOpen className="h-5 w-5" />}
          trend={2}
        />
        <StatsCard
          label="Quizzes Created"
          value={teacherMetrics.quizzesCreated}
          icon={<Brain className="h-5 w-5" />}
        />
        <StatsCard
          label="Avg Performance"
          value={teacherMetrics.averagePerformance}
          suffix="%"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={4}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Real Student Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Recent Student Submissions
            </h3>
            <span className="text-xs text-primary font-semibold cursor-pointer hover:underline" onClick={() => navigate(ROUTES.TEACHER_STUDENTS)}>
              View All
            </span>
          </div>

          <div className="space-y-3">
            {teacherMetrics.recentSubmissions.length > 0 ? (
              teacherMetrics.recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {sub.studentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sub.quizTitle} &bull; Class {sub.classGrade}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {sub.percentage}% ({sub.score}/{sub.totalPoints})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.TEACHER_STUDENTS)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">
                No recent submissions recorded yet.
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark"
        >
          <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Create Quiz', icon: Brain, color: 'from-[#5B2C6F] to-[#7B3F95]', route: ROUTES.TEACHER_QUIZ_CREATE },
              { label: 'Upload Content', icon: Upload, color: 'from-[#3A1B47] to-[#5B2C6F]', route: ROUTES.TEACHER_CONTENT_UPLOAD },
              { label: 'View Analytics', icon: BarChart3, color: 'from-[#D4A843] to-[#B08B2E]', route: ROUTES.TEACHER_ANALYTICS },
              { label: 'Manage Students', icon: Users, color: 'from-[#E74C3C] to-[#C0392B]', route: ROUTES.TEACHER_STUDENTS },
            ].map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(a.route)}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:border-primary/40 hover:shadow-xs text-left transition group"
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.color} text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {a.label}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { TeacherDashboard };
export default TeacherDashboard;
