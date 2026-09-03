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
  pinCode?: string;
  board?: string;
  language?: string;
  level: number;
  totalXP: number;
  badgeCount?: number;
  streak?: number;
  role?: string;
  isUploading?: boolean;
  onEdit?: () => void;
  onAvatarChange?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatar,
  school,
  classNameVal,
  stateName,
  cityName,
  pinCode,
  level,
  totalXP,
  isUploading,
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

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Edit Settings
          </button>
        )}
      </div>

      {/* 2. Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Avatar + Name + Level */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-[#F0E8F4] dark:bg-purple-950/40 border border-primary/20 dark:border-purple-900/50 flex items-center justify-center p-2 shadow-xs">

              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Student'}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-[#F0E8F4] to-[#DDBFE8] dark:from-purple-950/60 dark:to-purple-900/60 text-primary dark:text-purple-300">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {name
                      ? name.charAt(0).toUpperCase()
                      : 'S'}
                  </span>
                </div>
              )}

              {/* Camera Icon */}
              <label
                aria-label="Change profile photo"
                className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 ring-3 ring-white dark:ring-card-dark cursor-pointer ${
                  isUploading
                    ? 'opacity-80 pointer-events-none'
                    : ''
                }`}
              >
                {isUploading ? (
                  <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Camera className="h-4.5 w-4.5" />
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onAvatarChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Student Name */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 tracking-tight">
              {name || 'Student'}
            </h2>

            {/* Level Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFF8EE] dark:bg-amber-950/30 border border-[#FDE6B8] dark:border-amber-800/80 text-xs sm:text-sm font-bold text-[#8C5200] dark:text-amber-300 shadow-2xs">
              <span className="text-base leading-none">
                💎
              </span>

              <span>Level {level}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* A. Level Up Overview */}
            <div className="bg-[#F4F7FE] dark:bg-gray-800/50 rounded-2xl p-5 border border-[#E2E8F0]/70 dark:border-gray-700/50">

              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3">
                Level Up Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                {/* Total XP */}
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

                {/* Highest Level */}
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

            {/* B. Academic Affiliation */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700/60 shadow-2xs">

              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Academic Affiliation</span>

                <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                  Verified Student Record
                </span>
              </h3>

              {/* 5 columns because we have 5 fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">

                {/* School */}
                <div className="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40">
                  <p className="text-xs text-gray-400 font-medium">
                    School / Institution
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {school || 'School not assigned'}
                  </p>
                </div>

                {/* Class */}
                <div className="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40">
                  <p className="text-xs text-gray-400 font-medium">
                    Enrolled Class
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {classNameVal || 'Class not assigned'}
                  </p>
                </div>

                {/* State */}
                <div className="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40">
                  <p className="text-xs text-gray-400 font-medium">
                    State / Region
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {stateName || 'Not provided'}
                  </p>
                </div>

                {/* City */}
                <div className="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40">
                  <p className="text-xs text-gray-400 font-medium">
                    City
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {cityName || 'Not provided'}
                  </p>
                </div>

                {/* PIN Code */}
                <div className="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40">
                  <p className="text-xs text-gray-400 font-medium">
                    PIN Code
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {pinCode || 'Not provided'}
                  </p>
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