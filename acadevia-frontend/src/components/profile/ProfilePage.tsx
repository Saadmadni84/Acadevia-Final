import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Edit3,
  Star,
  Trophy,
  BookOpen,
  HelpCircle,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface ProfileData {
  avatarUrl?: string;
  name: string;
  school: string;
  className: string;
  section: string;
  xp: number;
  level: number;
  rank: number;
  badges: Badge[];
  coursesCompleted: number;
  quizzesTaken: number;
  hoursLearned: number;
  activityHeatmap: number[]; // 30 values (0-4 intensity)
  achievements: Achievement[];
}

interface ProfilePageProps {
  profile: ProfileData;
  editLink?: string;
}

const LEVEL_RING_COLORS = [
  'ring-gray-400',
  'ring-green-400',
  'ring-blue-400',
  'ring-purple-400',
  'ring-yellow-400',
  'ring-red-400',
];

function getLevelRing(level: number): string {
  return LEVEL_RING_COLORS[Math.min(level, LEVEL_RING_COLORS.length - 1)] ?? 'ring-gray-400';
}

function intensityClass(val: number): string {
  if (val === 0) return 'bg-gray-200 dark:bg-gray-700';
  if (val === 1) return 'bg-green-200 dark:bg-green-900';
  if (val === 2) return 'bg-green-400 dark:bg-green-700';
  if (val === 3) return 'bg-green-500 dark:bg-green-600';
  return 'bg-green-600 dark:bg-green-500';
}

export default function ProfilePage({ profile, editLink = '/profile/edit' }: ProfilePageProps) {
  const { t } = useTranslation();

  const statItems = [
    {
      label: t('profile.coursesCompleted', 'Courses Completed'),
      value: profile.coursesCompleted,
      icon: BookOpen,
      color: 'text-indigo-500',
    },
    {
      label: t('profile.quizzesTaken', 'Quizzes Taken'),
      value: profile.quizzesTaken,
      icon: HelpCircle,
      color: 'text-purple-500',
    },
    {
      label: t('profile.hoursLearned', 'Hours Learned'),
      value: profile.hoursLearned,
      icon: Clock,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('profile.header', 'Profile Header')}
      >
        {/* Edit Button */}
        <Link
          to={editLink}
          className="absolute right-4 top-4 rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
          aria-label={t('profile.edit', 'Edit Profile')}
        >
          <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Link>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar with level ring */}
          <div className="relative">
            <div
              className={`h-24 w-24 overflow-hidden rounded-full ring-4 ${getLevelRing(profile.level)} ring-offset-2 ring-offset-white dark:ring-offset-gray-800`}
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
              Lv.{profile.level}
            </span>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.school} · {profile.className} · {profile.section}
            </p>

            {/* XP / Level / Rank */}
            <div className="mt-3 flex flex-wrap justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profile.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('profile.level', 'Level')} {profile.level}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('profile.rank', 'Rank')} #{profile.rank}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
            <span className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
            <span className="text-center text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Badge Wall */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('profile.badges', 'Badges')}
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Award className="h-5 w-5 text-amber-500" aria-hidden="true" />
          {t('profile.badges', 'Badges')}
          <span className="text-sm font-normal text-gray-400">({profile.badges.length})</span>
        </h2>
        {profile.badges.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {profile.badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center gap-1"
                title={`${badge.name} - ${new Date(badge.earnedAt).toLocaleDateString()}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 text-2xl dark:from-yellow-900/40 dark:to-amber-900/40">
                  {badge.icon}
                </div>
                <span className="max-w-[60px] truncate text-center text-xs text-gray-600 dark:text-gray-400">
                  {badge.name}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
            {t('profile.noBadges', 'No badges earned yet')}
          </p>
        )}
      </motion.section>

      {/* 30-Day Activity Heatmap */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('profile.activityGraph', 'Activity Graph')}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('profile.activityGraph', '30-Day Activity')}
        </h2>
        <div className="flex flex-wrap gap-1.5" role="img" aria-label={t('profile.activityHeatmap', 'Activity heatmap for the last 30 days')}>
          {profile.activityHeatmap.map((val, idx) => (
            <div
              key={idx}
              className={`h-5 w-5 rounded-sm ${intensityClass(val)}`}
              title={`Day ${idx + 1}: ${val} activities`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{t('profile.less', 'Less')}</span>
          {[0, 1, 2, 3, 4].map((v) => (
            <div key={v} className={`h-3 w-3 rounded-sm ${intensityClass(v)}`} />
          ))}
          <span>{t('profile.more', 'More')}</span>
        </div>
      </motion.section>

      {/* Achievements Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-label={t('profile.achievements', 'Achievements')}
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
          {t('profile.achievements', 'Achievements')}
        </h2>
        {profile.achievements.length > 0 ? (
          <ol className="relative border-l-2 border-gray-200 dark:border-gray-700" role="list">
            {profile.achievements.map((ach, idx) => (
              <motion.li
                key={ach.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.06 }}
                className="mb-6 ml-4 last:mb-0"
              >
                <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-500 dark:border-gray-800" />
                <time className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(ach.date).toLocaleDateString()}
                </time>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{ach.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ach.description}</p>
              </motion.li>
            ))}
          </ol>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
            {t('profile.noAchievements', 'No achievements yet')}
          </p>
        )}
      </motion.section>
    </div>
  );
}
