import React from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Share2 } from 'lucide-react';

interface BadgeUnlockModalProps {
  open: boolean;
  onClose: () => void;
  badge?: { name: string; icon: string; description: string; rarity: string; xpReward?: number };
}

const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ open, onClose, badge }) => {
  if (!badge) return null;

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-sm">
      <div className="text-center py-6 px-4">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10 }} className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl shadow-2xl">
            {badge.icon}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-sm font-semibold text-secondary uppercase tracking-wide mb-2">Badge Unlocked!</p>
          <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{badge.description}</p>
          {badge.xpReward && (
            <p className="text-lg font-bold text-primary mb-6">+{badge.xpReward} XP</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" leftIcon={<Share2 className="h-4 w-4" />}>Share</Button>
            <Button variant="gradient" className="flex-1" onClick={onClose}>Awesome!</Button>
          </div>
        </motion.div>
      </div>
    </Modal>
  );
};

export { BadgeUnlockModal };
