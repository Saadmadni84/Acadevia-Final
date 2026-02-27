import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPGainAnimationProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

const XPGainAnimation: React.FC<XPGainAnimationProps> = ({ amount, show, onComplete }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={{ opacity: 1, y: -60, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
        className="fixed top-20 right-8 z-50 pointer-events-none"
      >
        <div className="flex items-center gap-1 bg-primary/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
          <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
          <span className="text-lg font-bold">+{amount} XP</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export { XPGainAnimation };
