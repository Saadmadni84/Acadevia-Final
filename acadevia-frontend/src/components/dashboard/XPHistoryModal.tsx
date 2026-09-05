import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trophy, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

interface XPHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentXP?: number;
  level?: number;
  levelTitle?: string;
}

export interface XPHistoryEntry {
  id: string;
  source: string;
  category: 'lesson' | 'quiz' | 'streak' | 'quest' | 'practice';
  amount: number;
  timestamp: string;
}

const mockHistory: XPHistoryEntry[] = [
  { id: '1', source: 'Completed lesson · Quadratic Functions', category: 'lesson', amount: 50, timestamp: '2 hours ago' },
  { id: '2', source: 'Quiz · Light & Reflection (8/10)', category: 'quiz', amount: 80, timestamp: 'Yesterday' },
  { id: '3', source: 'Daily streak bonus · 5 Days active', category: 'streak', amount: 25, timestamp: 'Yesterday' },
  { id: '4', source: 'Daily quest · Watch 2 video lectures', category: 'quest', amount: 100, timestamp: '2 days ago' },
  { id: '5', source: 'Adaptive Practice · Trigonometric Ratios', category: 'practice', amount: 60, timestamp: '3 days ago' },
];

export const XPHistoryModal: React.FC<XPHistoryModalProps> = ({
  isOpen,
  onClose,
  currentXP = 720,
  level = 4,
  levelTitle = 'Explorer',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const nextThreshold = 1000;
  const currentThreshold = 600;
  const progressPercent = Math.min(100, Math.round(((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
  const xpNeeded = Math.max(0, nextThreshold - currentXP);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-[#E8E2D8] dark:border-[#382447] shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-primary dark:text-purple-300 flex items-center justify-center font-bold">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">XP & Progression History</h3>
                <p className="text-xs text-gray-500">Track all points earned toward your next rank</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Level Progress Banner */}
          <div className="p-6 bg-gradient-to-br from-[#FAF8F5] to-white dark:from-[#251830] dark:to-card-dark border-b border-[#E8E2D8] dark:border-[#382447] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-primary dark:text-purple-300">
                  LEVEL 0{level}
                </span>
                <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">{levelTitle}</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  {currentXP.toLocaleString()} <span className="text-xs text-gray-500 font-semibold">/ {nextThreshold.toLocaleString()} XP</span>
                </span>
                <p className="text-xs font-semibold text-primary dark:text-purple-300">
                  {xpNeeded} XP to Level {level + 1}
                </p>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* XP History Feed */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider pb-1">
              <span>Activity</span>
              <span>Reward</span>
            </div>

            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-950/40 text-primary dark:text-purple-300">
                    {item.category === 'lesson' && <CheckCircle2 className="h-4 w-4" />}
                    {item.category === 'quiz' && <Trophy className="h-4 w-4 text-warning" />}
                    {item.category === 'streak' && <Flame className="h-4 w-4 text-streak" />}
                    {item.category === 'quest' && <Zap className="h-4 w-4 text-primary" />}
                    {item.category === 'practice' && <Zap className="h-4 w-4 text-secondary" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.source}</p>
                    <p className="text-xs text-gray-400">{item.timestamp}</p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-success shrink-0 bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                  +{item.amount} XP
                </span>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#E8E2D8] dark:border-[#382447] bg-[#FDFCF9] dark:bg-[#1E1226] flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                navigate(ROUTES.BADGES);
              }}
              className="text-xs font-bold text-primary dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Badges & Achievements</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default XPHistoryModal;
