import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Gift, Zap, Check } from 'lucide-react';

interface DailyReward {
  day: number;
  xp: number;
  claimed: boolean;
  today: boolean;
}

interface DailyRewardPopupProps {
  open: boolean;
  onClose: () => void;
  rewards: DailyReward[];
  onClaim: (day: number) => void;
  streak: number;
}

const DailyRewardPopup: React.FC<DailyRewardPopupProps> = ({ open, onClose, rewards, onClaim, streak }) => {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = (day: number) => {
    onClaim(day);
    setClaimed(true);
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-md">
      <div className="py-6 px-4">
        <div className="text-center mb-6">
          <Gift className="h-10 w-10 text-primary mx-auto mb-2" />
          <h3 className="text-xl font-bold">Daily Rewards</h3>
          <p className="text-sm text-gray-500">Day {streak} streak bonus!</p>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {rewards.slice(0, 7).map((r) => (
            <motion.div
              key={r.day}
              whileHover={r.today && !r.claimed ? { scale: 1.1 } : {}}
              className={`p-2 rounded-xl text-center text-xs border-2 transition-all ${
                r.claimed ? 'border-secondary bg-secondary/10' : r.today ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="font-semibold text-[10px] mb-1">Day {r.day}</p>
              {r.claimed ? <Check className="h-4 w-4 text-secondary mx-auto" /> : <Zap className="h-4 w-4 text-primary mx-auto" />}
              <p className="font-bold text-[10px] mt-0.5">+{r.xp}</p>
            </motion.div>
          ))}
        </div>
        {!claimed ? (
          <Button variant="gradient" className="w-full" onClick={() => { const today = rewards.find(r => r.today && !r.claimed); if (today) handleClaim(today.day); }}>
            Claim Today's Reward
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={onClose}>
            See you tomorrow! 🎉
          </Button>
        )}
      </div>
    </Modal>
  );
};

export { DailyRewardPopup };
