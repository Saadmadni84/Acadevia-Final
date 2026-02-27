import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';

interface AchievementToastProps {
  show: boolean;
  title: string;
  description: string;
  icon?: string;
  onDone?: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ show, title, description, icon, onDone }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 20 }}
        onAnimationComplete={() => setTimeout(() => onDone?.(), 3000)}
        className="fixed top-20 right-4 z-50 glass-card p-4 w-80 shadow-xl border-l-4 border-primary"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl flex-shrink-0">
            {icon || <Award className="h-5 w-5 text-white" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary uppercase">Achievement Unlocked</p>
            <p className="font-bold text-sm">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export { AchievementToast };
