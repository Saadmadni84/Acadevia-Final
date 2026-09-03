import React, { useState, useEffect } from 'react';
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

import { dataService } from '@/services/data.service';

// Standard Acadevia badge catalog for available and unlockable achievements
const acadeviaBadgeCatalog = [
  { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson or quiz', icon: '📖', category: 'Learning', rarity: 'common' as const },
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, setSyncCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    dataService.syncFromBackend().then(() => {
      if (mounted) setSyncCount((c) => c + 1);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await userService.uploadAvatar(file);
      setSyncCount((c) => c + 1);
    } catch (err: any) {
      setUploadError(err.message || 'Unable to update profile photo. Please try again.');
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  // 1. User Profile Data from /api/v1/users/me (parameterized by authenticated user id)
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => (await userService.getProfile()).data.data,
    enabled: Boolean(user),
  });

  // 2. Gamification Data from /api/v1/gamification/profile
  const { data: gamification } = useQuery({
    queryKey: ['gamification-profile', user?.id],
    queryFn: async () => (await gamificationService.getProfile()).data.data,
    enabled: Boolean(user),
  });

  // 3. Enrolled Courses from /api/v1/courses/enrolled
  const { data: enrolledCourses } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => (await courseService.getEnrolled()).data.data,
    enabled: Boolean(user),
  });

  // 4. Student Analytics from /api/v1/analytics/student
  const { data: studentAnalytics } = useQuery({
    queryKey: ['student-analytics', user?.id],
    queryFn: async () => (await analyticsService.getStudentAnalytics()).data.data,
    enabled: Boolean(user),
  });

  const profile = userProfile ?? user;
  const studentId = user?.id ? String(user.id) : '20';
  const studentName =
    user?.fullName ||
    userProfile?.fullName ||
    (user?.id ? dataService.getUserById(String(user.id))?.fullName : undefined) ||
    'Student';

  // Retrieve actual student metrics from persistent data layer
  const metrics = dataService.getStudentMetrics(studentId);
  const realWeeklyActivity = dataService.getStudentWeeklyActivity(studentId);
  const realSubjectProgress = dataService.getStudentSubjectProgress(studentId);
  const realRecentActivities = dataService.getRecentActivities(studentId, 'STUDENT').map((a) => ({
    id: a.id,
    type: (a.type === 'QUIZ_COMPLETED' ? 'quiz' : a.type === 'LESSON_COMPLETED' ? 'lesson' : 'badge') as any,
    title: a.title,
    description: a.description,
    xpEarned: undefined,
    timestamp: a.timestamp,
  }));

  const level = gamification?.level ?? metrics.level ?? 1;
  const xp = gamification?.xp ?? metrics.totalXP ?? 0;
  const requiredXP = Math.max(100, Math.ceil((xp + 1) / 100) * 100);
  const streak = gamification?.streak ?? metrics.streak ?? 0;

  // Real criteria-driven badge evaluation
  const liveBadges = gamification?.badges ?? [];
  const combinedBadges = acadeviaBadgeCatalog.map((catalogBadge) => {
    let isEarned = false;
    const liveMatch = liveBadges.find(
      (b) => b.id === catalogBadge.id || b.name.toLowerCase() === catalogBadge.name.toLowerCase()
    );

    if (liveMatch) {
      isEarned = liveMatch.isEarned ?? Boolean(liveMatch.earnedAt);
    } else {
      // Dynamic criteria evaluation from real student metrics
      if (catalogBadge.id === 'b1') {
        isEarned = metrics.lessonsCompleted >= 1;
      } else if (catalogBadge.id === 'b2') {
        isEarned = metrics.quizzesCompleted >= 10 && metrics.averageScore >= 80;
      } else if (catalogBadge.id === 'b3') {
        isEarned = streak >= 7;
      } else if (catalogBadge.id === 'b4') {
        isEarned = level >= 10;
      } else if (catalogBadge.id === 'b5') {
        isEarned = false;
      } else if (catalogBadge.id === 'b6') {
        isEarned = metrics.perfectQuizzesCount >= 5;
      } else if (catalogBadge.id === 'b7') {
        isEarned = level >= 50;
      } else if (catalogBadge.id === 'b8') {
        isEarned = false;
      }
    }

    return {
      ...catalogBadge,
      isEarned,
      earnedAt: isEarned ? 'Recently' : undefined,
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
  const schoolDisplay =
    profile?.schoolName ||
    user?.schoolName ||
    dataService.getUserById(studentId)?.schoolName;
  const classNameVal =
    profile?.className ||
    (profile?.classGrade ? `Class ${profile.classGrade}` : undefined) ||
    user?.className ||
    (user?.classGrade ? `Class ${user.classGrade}` : undefined) ||
    (dataService.getUserById(studentId)?.classGrade ? `Class ${dataService.getUserById(studentId)?.classGrade}` : undefined);
  const sectionVal = profile?.section || (profile as any)?.sectionName;
  const stateNameVal =
    profile?.stateName ||
    user?.stateName ||
    dataService.getUserById(studentId)?.stateName;
  const cityNameVal =
    profile?.cityName ||
    user?.cityName ||
    dataService.getUserById(studentId)?.cityName;
  const pinCodeVal =
    profile?.pinCode ||
    (profile as any)?.pincode ||
    user?.pinCode ||
    (user as any)?.pincode ||
    dataService.getUserById(studentId)?.pinCode ||
    dataService.getUserById(studentId)?.pincode;
  const phoneVal =
    profile?.phone ||
    (profile as any)?.phoneNumber ||
    user?.phone ||
    (user as any)?.phoneNumber ||
    (studentId ? dataService.getUserById(studentId)?.phone : undefined) ||
    (studentId ? dataService.getUserById(studentId)?.phoneNumber : undefined);
  const boardVal = profile?.board || (user as any)?.board;
  const languageVal = profile?.languagePreference || user?.languagePreference || 'English';

  // Purely data-driven statistics without fake fallbacks
  const coursesCompleted = metrics.coursesCompleted;
  const quizzesTaken = metrics.quizzesCompleted;
  const hoursLearned = metrics.hoursLearned;
  const averageScore = metrics.averageScore;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2 sm:p-4">
      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}

      {/* 1. Main Reference-Styled Profile Card */}
      <ProfileHeader
        name={studentName}
        email={profile?.email || ''}
        avatar={profile?.avatarUrl || user?.avatarUrl || (studentId ? dataService.getUserById(studentId)?.avatarUrl : undefined)}
        phone={phoneVal}
        school={schoolDisplay}
        classNameVal={classNameVal}
        section={sectionVal}
        stateName={stateNameVal}
        cityName={cityNameVal}
        pinCode={pinCodeVal}
        board={boardVal}
        language={languageVal}
        level={level}
        totalXP={xp}
        badgeCount={earnedBadgesList.length}
        streak={streak}
        role={profile?.role || 'Student'}
        isUploading={isUploading}
        onAvatarChange={handleAvatarUpload}
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
        enrolledCourses={enrolledCourses && enrolledCourses.length > 0 ? enrolledCourses : realSubjectProgress}
        coursesCompletedCount={coursesCompleted}
        quizzesTakenCount={quizzesTaken}
        hoursLearnedCount={hoursLearned}
        studyMinutesCount={metrics.studyMinutes}
        averageQuizScore={averageScore}
        weeklyActivity={studentAnalytics?.weeklyActivity || realWeeklyActivity}
        recentActivities={realRecentActivities}
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
