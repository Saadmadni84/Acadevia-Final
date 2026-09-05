import React from 'react';
import { ArrowRight, Clock, Zap, Sparkles, BookOpen, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

export interface RecommendationItem {
  id: string;
  subject: string;
  title: string;
  subtitle: string;
  reason: string;
  duration: string;
  xpReward: string;
  route: string;
  difficulty: string;
  tag: string;
}

const defaultRecommendations: RecommendationItem[] = [
  {
    id: 'rec_1',
    subject: 'MATHEMATICS',
    title: 'Quadratic Equations & Roots',
    subtitle: 'Factorization, quadratic formula, & nature of roots',
    reason: 'Adaptive AI identified 2 common mistakes in your recent algebra assessment',
    duration: '8 min',
    xpReward: '+60 XP',
    route: '/lesson/less_math_10_quad',
    difficulty: 'Core Mastery',
    tag: 'Board Priority',
  },
  {
    id: 'rec_2',
    subject: 'SCIENCE',
    title: 'Refraction through Glass Prism',
    subtitle: 'Light dispersion, spectrum formation, & Snell’s law',
    reason: 'Recommended because you scored 58% in optics ray tracing',
    duration: '10 min',
    xpReward: '+80 XP',
    route: '/courses',
    difficulty: 'Targeted Fix',
    tag: 'Concept Gap',
  },
];

export const RecommendedLearningGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <span>Recommended for You</span>
            <Sparkles className="h-4 w-4 text-primary dark:text-purple-300" />
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            AI-driven study recommendations based on your recent quiz gaps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
        {defaultRecommendations.map((rec) => (
          <div
            key={rec.id}
            onClick={() => navigate(rec.route)}
            className="group rounded-2xl bg-white dark:bg-card-dark border border-[#E8E2D8] dark:border-[#382447] p-5 shadow-xs hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.98]"
          >
            <div className="space-y-3">
              {/* Tag & XP Reward */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-primary/20">
                    {rec.subject}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                    {rec.tag}
                  </span>
                </div>

                <span className="text-[10px] font-black text-warning bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-current" />
                  {rec.xpReward}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-purple-300 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 line-clamp-1">
                  {rec.subtitle}
                </p>
              </div>

              {/* Algorithmic Reason Callout */}
              <div className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-primary/15 text-[11px] text-gray-600 dark:text-gray-300 font-medium space-y-1">
                <span className="font-extrabold text-primary dark:text-purple-300 block text-[10px] uppercase tracking-wider">
                  WHY THIS IS RECOMMENDED:
                </span>
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                  {rec.reason}
                </p>
              </div>
            </div>

            {/* Bottom Duration & Action */}
            <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold">
              <span className="text-gray-400 flex items-center gap-1.5 font-semibold">
                <Clock className="h-3.5 w-3.5" />
                {rec.duration}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(rec.route);
                }}
                className="text-primary dark:text-purple-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold cursor-pointer"
              >
                <span>Start Lesson →</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecommendedLearningGrid;
