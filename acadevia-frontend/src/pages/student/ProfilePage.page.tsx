/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { LearningOverview } from '@/components/profile/LearningOverview';
import { useAuthStore } from '@/stores/useAuthStore';
import { userService } from '@/services/user.service';
import { courseService } from '@/services/course.service';
import { analyticsService } from '@/services/analytics.service';
import { ROUTES } from '@/config/routes.config';
import { Award, Lock, CheckCircle2, BookOpen } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, setSyncCount] = useState(0);

  // Access Control: Students can ONLY view their own profile.
  // Query param tampering (?id= or ?studentId=) is strictly disallowed for students.
  const isStudent = user?.role === 'STUDENT' || !user?.role;
  const queryStudentId = searchParams.get('id') || searchParams.get('studentId');
  const targetStudentId = isStudent ? (user?.id ? String(user.id) : '20') : (queryStudentId || (user?.id ? String(user.id) : '20'));

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

  // 1. Authoritative Student Academic Profile from live backend database
  const { data: dbProfile } = useQuery({
    queryKey: ['student-database-profile', targetStudentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/student/profile?studentId=${targetStudentId}`, {
        headers: {
          'X-User-Id': String(user?.id || targetStudentId),
          'X-User-Role': user?.role || 'STUDENT',
        },
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const json = await res.json();
      return json.data;
    },
    enabled: Boolean(targetStudentId),
  });

  // 2. User Profile Data from /api/v1/users/me as secondary enhancement
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => (await userService.getProfile()).data.data,
    enabled: Boolean(user),
  });

  // 3. Enrolled Courses from /api/v1/courses/enrolled
  const { data: enrolledCourses } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => (await courseService.getEnrolled()).data.data,
    enabled: Boolean(user) && isStudent,
  });

  // 4. Student Analytics from /api/v1/analytics/student
  const { data: studentAnalytics } = useQuery({
    queryKey: ['student-analytics', user?.id],
    queryFn: async () => (await analyticsService.getStudentAnalytics()).data.data,
    enabled: Boolean(user) && isStudent,
  });

  const profile = userProfile ?? user;

  const studentId = targetStudentId;
  const studentName =
    dbProfile?.fullName ||
    dbProfile?.name ||
    user?.fullName ||
    userProfile?.fullName ||
    'Student';

  // Retrieve actual student metrics from persistent data layer or authoritative database profile
  const metrics = dataService.getStudentMetrics(studentId);
  const realWeeklyActivity = dataService.getStudentWeeklyActivity(studentId);
  const realSubjectProgress = dataService.getStudentSubjectProgress(studentId);
  const realRecentActivities = (dbProfile?.activities && dbProfile.activities.length > 0)
    ? dbProfile.activities.map((a: any) => ({
        id: a.id,
        type: (a.type === 'QUIZ_COMPLETED' ? 'quiz' : a.type === 'LESSON_COMPLETED' ? 'lesson' : 'badge') as any,
        title: a.title,
        description: a.description,
        xpEarned: undefined,
        timestamp: a.timestamp,
      }))
    : dataService.getRecentActivities(studentId, 'STUDENT').map((a) => ({
        id: a.id,
        type: (a.type === 'QUIZ_COMPLETED' ? 'quiz' : a.type === 'LESSON_COMPLETED' ? 'lesson' : 'badge') as any,
        title: a.title,
        description: a.description,
        xpEarned: undefined,
        timestamp: a.timestamp,
      }));

  const level = dbProfile?.level ?? metrics.level ?? 1;
  const totalXP = dbProfile?.totalXP ?? metrics.totalXP ?? 0;
  const streak = dbProfile?.streak ?? metrics.streak ?? 0;
  const requiredXP = Math.max(100, Math.ceil((totalXP + 1) / 100) * 100);

  // Real criteria-driven badge evaluation
  const liveBadges = (dbProfile?.badges || []) as any[];
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
    (profile as any)?.schoolName ||
    user?.schoolName ||
    dataService.getUserById(studentId)?.schoolName ||
    'Not enrolled';

  const classNameVal =
    (profile as any)?.className ||
    ((profile as any)?.classGrade ? `Class ${(profile as any).classGrade}` : undefined) ||
    user?.className ||
    (user?.classGrade ? `Class ${user.classGrade}` : undefined) ||
    (dataService.getUserById(studentId)?.classGrade
      ? `Class ${dataService.getUserById(studentId)?.classGrade}`
      : undefined);

  const sectionVal = (profile as any)?.section || user?.section || (profile as any)?.sectionName;
  const stateNameVal =
    (profile as any)?.stateName ||
    user?.stateName ||
    dataService.getUserById(studentId)?.stateName;
  const cityNameVal =
    (profile as any)?.cityName ||
    user?.cityName ||
    dataService.getUserById(studentId)?.cityName;
  const pinCodeVal =
    (profile as any)?.pinCode ||
    (profile as any)?.pincode ||
    user?.pinCode ||
    (user as any)?.pincode ||
    dataService.getUserById(studentId)?.pinCode ||
    dataService.getUserById(studentId)?.pincode;

  const phoneVal =
    (profile as any)?.phone ||
    (profile as any)?.phoneNumber ||
    user?.phone ||
    (user as any)?.phoneNumber ||
    (studentId ? dataService.getUserById(studentId)?.phone : undefined) ||
    (studentId ? dataService.getUserById(studentId)?.phoneNumber : undefined);

  const boardVal = (profile as any)?.board || (user as any)?.board;
  const languageVal = (profile as any)?.languagePreference || user?.languagePreference || 'English';

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
        totalXP={totalXP}
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
          currentXP={totalXP}
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

      {/* 3.5 Quiz Performance History Section */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Quiz Performance History
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {(dbProfile?.results || []).length} completed assessments &bull; Authoritative database submission records
              </p>
            </div>
          </div>
        </div>

        {(dbProfile?.results || []).length > 0 ? (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="py-3 px-4 font-bold">Quiz Title</th>
                    <th className="py-3 px-3 font-bold">Subject</th>
                    <th className="py-3 px-3 font-bold">Completed Date</th>
                    <th className="py-3 px-3 font-bold text-center">Score</th>
                    <th className="py-3 px-3 font-bold text-center">Percentage</th>
                    <th className="py-3 px-3 font-bold text-center">XP Earned</th>
                    <th className="py-3 px-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(dbProfile?.results || []).map((res: any, idx: number) => (
                    <tr key={`${res.id || idx}`} className="hover:bg-primary/5 transition">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white max-w-[240px] truncate">
                        {res.quizTitle}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {res.subject}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                        {res.completedAt ? new Date(res.completedAt).toLocaleDateString() : 'Recently'}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-700 dark:text-gray-300">
                        {res.score}/{res.totalPoints}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        {res.percentage}%
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-primary dark:text-[#D4A843]">
                        +{res.xpEarned} XP
                      </td>
                      <td className="py-3 px-4 text-right">
                        {res.percentage >= 60 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                            Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No quiz submissions recorded yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Complete your first quiz to build your academic history!
            </p>
          </div>
        )}
      </div>

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
