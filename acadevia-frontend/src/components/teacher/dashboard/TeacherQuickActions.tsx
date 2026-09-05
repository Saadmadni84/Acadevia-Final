import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Upload, BarChart3, Users, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';

export const TeacherQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create Assessment',
      description: 'Design custom quizzes with auto-grading and topic tags',
      icon: Brain,
      color: 'from-[#5B2C6F] to-[#7B3F95]',
      route: ROUTES.TEACHER_QUIZ_CREATE,
    },
    {
      title: 'Upload Content',
      description: 'Distribute MP4 video lectures, PDFs and study guides',
      icon: Upload,
      color: 'from-[#3A1B47] to-[#5B2C6F]',
      route: ROUTES.TEACHER_CONTENT_UPLOAD,
    },
    {
      title: 'Class Analytics',
      description: 'Examine detailed mastery trends and diagnostic reports',
      icon: BarChart3,
      color: 'from-[#D4A843] to-[#B08B2E]',
      route: ROUTES.TEACHER_ANALYTICS,
    },
    {
      title: 'Manage Students',
      description: 'Review individual student profiles and quiz histories',
      icon: Users,
      color: 'from-[#C0392B] to-[#962D22]',
      route: ROUTES.TEACHER_STUDENTS,
    },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1A1222] border border-[#E8E4DA] dark:border-[#2D1B36] p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]/80 dark:border-[#2D1B36]">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Teacher Command Actions
        </h3>
        <span className="text-xs text-gray-400 font-medium">Quick Workflows</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act) => (
          <div
            key={act.title}
            onClick={() => navigate(act.route)}
            className="group p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-[#5B2C6F]/40 dark:hover:border-[#C084FC]/40 hover:bg-white dark:hover:bg-[#20152B] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300`}
              >
                <act.icon className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#5B2C6F] dark:group-hover:text-[#C084FC] transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                  {act.description}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-2 flex items-center text-xs font-semibold text-[#5B2C6F] dark:text-[#C084FC] gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
