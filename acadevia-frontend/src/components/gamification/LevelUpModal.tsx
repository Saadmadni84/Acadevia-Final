import React from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Star, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
  levelName: string;
  rewards?: string[];
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ open, onClose, newLevel, levelName, rewards }) => (
  <Modal isOpen={open} onClose={onClose} className="max-w-sm">
    <div className="text-center py-6 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], x: Math.cos(i * 30 * Math.PI / 180) * 120, y: Math.sin(i * 30 * Math.PI / 180) * 120 }}
          transition={{ duration: 1.5, delay: 0.2 + i * 0.05 }}
          className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-yellow-400"
        />
      ))}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="relative z-10">
        <Sparkles className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-secondary uppercase mb-1">Level Up!</p>
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-3 shadow-xl">
          <span className="text-3xl font-extrabold text-white">{newLevel}</span>
        </div>
        <h3 className="text-xl font-bold mb-1">{levelName}</h3>
        {rewards && rewards.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase font-semibold">Rewards Unlocked</p>
            {rewards.map((r, i) => (
              <div key={i} className="flex items-center gap-2 justify-center text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}
        <Button variant="gradient" className="w-full mt-6" onClick={onClose}>Continue</Button>
      </motion.div>
    </div>
  </Modal>
);

export { LevelUpModal };
