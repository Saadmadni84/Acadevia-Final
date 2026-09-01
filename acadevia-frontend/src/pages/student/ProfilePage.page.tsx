import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { LearningOverview } from '@/components/profile/LearningOverview';
import { useAuthStore } from '@/stores/useAuthStore';
import { userService } from '@/services/user.service';
import { gamificationService } from '@/services/gamification.service';
import { courseService } from '@/services/course.service';
import { analyticsService } from '@/services/analytics.service';
import { ROUTES } from '@/config/routes.config';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Standard Acadevia badge catalog for available and unlockable achievements
const acadeviaBadgeCatalog = [
  { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson', icon: '📖', category: 'Learning', rarity: 'common' as const },
  { id: 'b2', name: 'Quiz Master', description: 'Score 80%+ on 10 quizzes', icon: '🧠', category: 'Quiz', rarity: 'rare' as const },
  { id: 'b3', name: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: '🔥', category: 'Streak', rarity: 'rare' as const },
  { id: 'b4', name: 'Scholar', description: 'Reach Level 10 on Acadevia', icon: '🎓', category: 'Level', rarity: 'epic' as const },
  { id: 'b5', name: 'Game Champion', description: 'Win 50 learning games', icon: '🏆', category: 'Game', rarity: 'epic' as const },
  { id: 'b6', name: 'Perfect Score', description: 'Score 100% on 5 quizzes', icon: '💯', category: 'Quiz', rarity: 'epic' as const },
  { id: 'b7', name: 'Legend', description: 'Reach Level 50 on Acadevia', icon: '⭐', category: 'Level', rarity: 'legendary' as const },
  { id: 'b8', name: 'Early Bird', description: 'Complete study session before 7 AM', icon: '🌅', category: 'Streak', rarity: 'common' as const },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');

  // 1. User Profile Data from /api/v1/users/me
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => (await userService.getProfile()).data.data,
    enabled: Boolean(user),
  });

  // 2. Gamification Data from /api/v1/gamification/profile
  const { data: gamification } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: async () => (await gamificationService.getProfile()).data.data,
    enabled: Boolean(user),
  });

  // 3. Enrolled Courses from /api/v1/courses/enrolled
  const { data: enrolledCourses } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => (await courseService.getEnrolled()).data.data,
    enabled: Boolean(user),
  });

  // 4. Student Analytics from /api/v1/analytics/student
  const { data: studentAnalytics } = useQuery({
    queryKey: ['student-analytics'],
    queryFn: async () => (await analyticsService.getStudentAnalytics()).data.data,
    enabled: Boolean(user),
  });

  const profile = userProfile ?? user;
  const level = gamification?.level ?? profile?.level ?? 1;
  const xp = gamification?.xp ?? profile?.xp ?? 0;
  const requiredXP = Math.max(100, Math.ceil((xp + 1) / 100) * 100);
  const streak = gamification?.streak ?? profile?.streak ?? 0;

  // Real badges matching
  const liveBadges = gamification?.badges ?? [];
  const combinedBadges = acadeviaBadgeCatalog.map((catalogBadge) => {
    const liveMatch = liveBadges.find(
      (b) => b.id === catalogBadge.id || b.name.toLowerCase() === catalogBadge.name.toLowerCase()
    );
    const isEarned = liveMatch ? (liveMatch.isEarned ?? Boolean(liveMatch.earnedAt)) : false;

    return {
      ...catalogBadge,
      isEarned,
      earnedAt: liveMatch?.earnedAt,
      iconUrl: liveMatch?.iconUrl || undefined,
    };
  });

  const earnedBadgesList = combinedBadges.filter((b) => b.isEarned);
  const lockedBadgesList = combinedBadges.filter((b) => !b.isEarned);

  const displayedBadges =
    badgeFilter === 'earned'
      ? earnedBadgesList
      : badgeFilter === 'locked'
      ? lockedBadgesList
      : combinedBadges;

  // Real educational fields from logged in student
  const schoolDisplay = profile?.schoolName || 'School not available';
  const classNameVal = profile?.className;
  const sectionVal = profile?.section;
  const stateNameVal = profile?.stateName;
  const cityNameVal = profile?.cityName;
  const phoneVal = profile?.phone;
  const boardVal = profile?.board;
  const languageVal = profile?.languagePreference || 'English';

  // Statistics
  const coursesCompleted = profile?.coursesCompleted ?? studentAnalytics?.lessonsCompleted ?? 0;
  const quizzesTaken = profile?.quizzesTaken ?? studentAnalytics?.quizzesTaken ?? 0;
  const hoursLearned = profile?.hoursLearned ?? studentAnalytics?.hoursLearned ?? 0;
  const averageScore = studentAnalytics?.averageScore ?? 85;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2 sm:p-4">
      {/* 1. Main Reference-Styled Profile Card */}
      <ProfileHeader
        name={profile?.fullName || 'Student'}
        email={profile?.email || ''}
        avatar={profile?.avatarUrl}
        phone={phoneVal}
        school={schoolDisplay}
        classNameVal={classNameVal}
        section={sectionVal}
        stateName={stateNameVal}
        cityName={cityNameVal}
        board={boardVal}
        language={languageVal}
        level={level}
        totalXP={xp}
        badgeCount={earnedBadgesList.length}
        streak={streak}
        role={profile?.role || 'Student'}
        onEdit={() => navigate(ROUTES.SETTINGS || '/settings')}
      />

      {/* 2. Level / XP Progress Card */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm">
        <XPProgressBar
          currentXP={xp}
          requiredXP={requiredXP}
          level={level}
          levelName={`Level ${level}`}
          size="md"
        />
      </div>

      {/* 3. Educational & Learning Overview Section */}
      <LearningOverview
        enrolledCourses={enrolledCourses}
        coursesCompletedCount={coursesCompleted}
        quizzesTakenCount={quizzesTaken}
        hoursLearnedCount={hoursLearned}
        averageQuizScore={averageScore}
        weeklyActivity={studentAnalytics?.weeklyActivity}
      />

      {/* 4. Badges & Achievements Section */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 text-secondary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Badges & Achievements
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {earnedBadgesList.length} of {combinedBadges.length} unlocked · Complete lessons, quizzes, and maintain streaks to earn more
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBadgeFilter('all')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                badgeFilter === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              All ({combinedBadges.length})
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('earned')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer',
                badgeFilter === 'earned'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Earned ({earnedBadgesList.length})
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('locked')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer',
                badgeFilter === 'locked'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Lock className="h-3 w-3 text-gray-400" />
              Available ({lockedBadgesList.length})
            </button>
          </div>
        </div>

        {/* Badges Display */}
        {displayedBadges.length > 0 ? (
          <BadgeShowcase badges={displayedBadges} />
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <Award className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No badges in this category
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Switch to All or Available to see upcoming achievements!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
