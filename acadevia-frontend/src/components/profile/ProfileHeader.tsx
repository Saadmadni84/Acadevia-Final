import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit, MapPin, School, Calendar } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string;
  level: number;
  levelName: string;
  currentXP: number;
  requiredXP: number;
  totalXP: number;
  school?: string;
  location?: string;
  joinDate: string;
  badgeCount: number;
  streak: number;
  role: string;
  onEdit?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name, email, avatar, level, levelName, currentXP, requiredXP, totalXP,
  school, location, joinDate, badgeCount, streak, role, onEdit,
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
    <div className="h-32 bg-gradient-to-r from-primary via-[#7B3F95] to-secondary relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
    </div>
    <div className="px-6 pb-6 -mt-12">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="relative">
          <Avatar name={name} src={avatar} size="xl" levelRing className="ring-4 ring-white dark:ring-gray-900" />
          <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{name}</h1>
            <Badge variant="default" className="capitalize">{role}</Badge>
          </div>
          <p className="text-sm text-gray-500 mb-2">{email}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {school && <span className="flex items-center gap-1"><School className="h-3 w-3" />{school}</span>}
            {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {joinDate}</span>
          </div>
        </div>
        {onEdit && <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={onEdit}>Edit Profile</Button>}
      </div>
      <div className="mt-4">
        <XPProgressBar currentXP={currentXP} requiredXP={requiredXP} level={level} levelName={levelName} size="md" />
      </div>
      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"><p className="text-lg font-bold text-primary">{totalXP.toLocaleString()}</p><p className="text-[10px] text-gray-500">Total XP</p></div>
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"><p className="text-lg font-bold text-secondary">{badgeCount}</p><p className="text-[10px] text-gray-500">Badges</p></div>
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"><p className="text-lg font-bold text-orange-500">{streak}</p><p className="text-[10px] text-gray-500">Day Streak</p></div>
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"><p className="text-lg font-bold">{level}</p><p className="text-[10px] text-gray-500">Level</p></div>
      </div>
    </div>
  </motion.div>
);

export { ProfileHeader };
