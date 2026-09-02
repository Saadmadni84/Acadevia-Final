import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
  school?: string;
  classNameVal?: string;
  section?: string;
  stateName?: string;
  cityName?: string;
  board?: string;
  language?: string;
  level: number;
  totalXP: number;
  badgeCount?: number;
  streak?: number;
  role?: string;
  onEdit?: () => void;
  onAvatarChange?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatar,
  level,
  totalXP,
  onEdit,
  onAvatarChange,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* 1. Top Page Navigation Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2.5 text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
          <span>Profile</span>
        </button>
      </div>

      {/* 2. Main Profile Card (Matching Reference Layout) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Avatar Box + Student Name + Level Pill Badge */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            {/* Square Rounded Avatar Frame with Sky Blue Tint */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-[#EAF2FF] dark:bg-sky-950/40 border border-blue-100 dark:border-sky-900/50 flex items-center justify-center p-2 shadow-xs">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Student'}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-sky-900/60 dark:to-indigo-950/60 text-primary dark:text-primary-light">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {name ? name.charAt(0).toUpperCase() : 'S'}
                  </span>
                </div>
              )}

              {/* Camera Icon Overlay */}
              <button
                type="button"
                onClick={onAvatarChange || onEdit}
                aria-label="Change profile photo"
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 ring-3 ring-white dark:ring-card-dark cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Student Name */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 tracking-tight">
              {name || 'Student'}
            </h2>

            {/* Level Pill Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFF8EE] dark:bg-amber-950/30 border border-[#FDE6B8] dark:border-amber-800/80 text-xs sm:text-sm font-bold text-[#8C5200] dark:text-amber-300 shadow-2xs">
              <span className="text-base leading-none">💎</span>
              <span>Level {level}</span>
            </div>
          </div>

          {/* Right Column: Level Up Overview + Profile Detail */}
          <div className="lg:col-span-8 space-y-6">
            {/* A. Level Up Overview Box */}
            <div className="bg-[#F4F7FE] dark:bg-gray-800/50 rounded-2xl p-5 border border-[#E2E8F0]/70 dark:border-gray-700/50">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3">
                Level Up Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Total XP Card */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-3.5 sm:p-4 border border-gray-100 dark:border-gray-700/60 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5">
                    <span>Total XP</span>
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    <span>{totalXP.toLocaleString()}</span>
                    <span className="text-base">💎</span>
                  </div>
                </div>

                {/* Highest Level Card */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-3.5 sm:p-4 border border-gray-100 dark:border-gray-700/60 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5">
                    <span>Highest Level</span>
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    <span>Level {level}</span>
                    <span className="text-base">👑</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { ProfileHeader };
