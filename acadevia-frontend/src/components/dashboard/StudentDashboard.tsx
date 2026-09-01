import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WelcomeCard } from './WelcomeCard';
import { ContinueLearningCard } from './ContinueLearningCard';
import { DailyGoalProgress } from './DailyGoalProgress';
import { WeeklyHeatmap } from './WeeklyHeatmap';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { RecommendedCoursesCarousel } from './RecommendedCoursesCarousel';
import { EnrolledCoursesOverview } from './EnrolledCoursesOverview';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationProfile } from '@/hooks/useGamification';
import { userService } from '@/services/user.service';

const mockContinue = [
  { id: '1', courseTitle: 'Mathematics Class 10', lessonTitle: 'Chapter 5: Quadratic Equations', progress: 65, timeLeft: '12 min', courseId: 'c1', lessonId: 'l1', thumbnail: '', category: 'Mathematics', color: 'from-[#5B2C6F] to-[#3A1B47]' },
  { id: '2', courseTitle: 'Science Class 10', lessonTitle: 'Chapter 3: Light and Reflection', progress: 30, timeLeft: '25 min', courseId: 'c2', lessonId: 'l2', thumbnail: '', category: 'Science', color: 'from-[#D4A843] to-[#B08B2E]' },
  { id: '3', courseTitle: 'English Literature', lessonTitle: 'Chapter 7: Poetry Analysis', progress: 45, timeLeft: '18 min', courseId: 'c3', lessonId: 'l3', thumbnail: '', category: 'English', color: 'from-[#E74C3C] to-[#C0392B]' },
];

const mockEnrolled = [
  { id: 'e1', title: 'Mathematics', progress: 65, total: 12, completed: 8, color: 'from-[#5B2C6F] to-[#3A1B47]', icon: '📐' },
  { id: 'e2', title: 'Science', progress: 30, total: 10, completed: 3, color: 'from-[#D4A843] to-[#B08B2E]', icon: '🔬' },
  { id: 'e3', title: 'English', progress: 45, total: 8, completed: 4, color: 'from-[#E74C3C] to-[#C0392B]', icon: '📖' },
  { id: 'e4', title: 'Hindi', progress: 80, total: 6, completed: 5, color: 'from-[#7B3F95] to-[#D4A843]', icon: '🏛️' },
];

const mockRecommended = [
  { id: 'r1', title: 'Advanced Algebra & Functions', instructor: 'Dr. Priya Sharma', rating: 4.8, duration: '6h 30m', lessonsCount: 24, category: 'Mathematics', color: 'from-[#5B2C6F] to-[#7B3F95]' },
  { id: 'r2', title: 'Physics: Mechanics & Motion', instructor: 'Prof. Rajesh Kumar', rating: 4.7, duration: '8h 15m', lessonsCount: 32, category: 'Science', color: 'from-[#3A1B47] to-[#5B2C6F]' },
  { id: 'r3', title: 'Creative Writing Masterclass', instructor: 'Ms. Anita Desai', rating: 4.9, duration: '4h 45m', lessonsCount: 18, category: 'English', color: 'from-[#E74C3C] to-[#7B3F95]' },
  { id: 'r4', title: 'Chemistry: Organic Compounds', instructor: 'Dr. Suresh Patel', rating: 4.6, duration: '7h', lessonsCount: 28, category: 'Science', color: 'from-[#D4A843] to-[#E74C3C]' },
  { id: 'r5', title: 'History of Ancient India', instructor: 'Prof. Meera Nair', rating: 4.5, duration: '5h 20m', lessonsCount: 20, category: 'History', color: 'from-[#4A2359] to-[#5B2C6F]' },
];

const mockGoals = [
  { id: '1', title: 'Complete 2 lessons', type: 'lesson' as const, current: 1, target: 2, completed: false },
  { id: '2', title: 'Score 80%+ on a quiz', type: 'quiz' as const, current: 1, target: 1, completed: true },
  { id: '3', title: 'Play 1 learning game', type: 'game' as const, current: 0, target: 1, completed: false },
  { id: '4', title: 'Earn 100 XP', type: 'xp' as const, current: 75, target: 100, completed: false },
];

const mockWeek = [
  { day: 'Mon', minutes: 45 }, { day: 'Tue', minutes: 30 }, { day: 'Wed', minutes: 60 },
  { day: 'Thu', minutes: 15 }, { day: 'Fri', minutes: 0 }, { day: 'Sat', minutes: 90 }, { day: 'Sun', minutes: 20 },
];

const mockActivities = [
  { id: '1', type: 'lesson' as const, title: 'Completed Lesson', description: 'Quadratic Equations - Part 1', xpEarned: 50, timestamp: '2h ago' },
  { id: '2', type: 'quiz' as const, title: 'Quiz Passed', description: 'Light and Reflection - 92%', xpEarned: 80, timestamp: '3h ago' },
  { id: '3', type: 'badge' as const, title: 'Badge Earned', description: 'Quiz Master - 10 quizzes passed', xpEarned: 200, timestamp: '3h ago' },
  { id: '4', type: 'game' as const, title: 'Game Completed', description: 'Math Blaster - High Score!', xpEarned: 30, timestamp: '5h ago' },
];

const StudentDashboard: React.FC = () => {
  const authUser = useAuthStore(s => s.user);

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => (await userService.getProfile()).data.data,
    enabled: Boolean(authUser),
  });

  const { data: gamification } = useGamificationProfile();

  const user = userProfile ?? authUser;
  const level = gamification?.level ?? user?.level ?? 1;
  const xp = gamification?.xp ?? user?.xp ?? 0;
  const requiredXP = Math.max(100, Math.ceil((xp + 1) / 100) * 100);
  const streak = gamification?.streak ?? user?.streak ?? 0;
  const longestStreak = gamification?.longestStreak ?? streak;
  const goalProgress = gamification?.dailyGoal
    ? Math.min(100, Math.round((gamification.dailyProgress / gamification.dailyGoal) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-4 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <WelcomeCard
        name={user?.fullName?.split(' ')[0] || 'Student'}
        level={level}
        levelName={`Level ${level}`}
        currentXP={xp}
        requiredXP={requiredXP}
        streak={streak}
        todayGoalProgress={goalProgress}
      />

      {/* Enrolled Courses Overview */}
      <EnrolledCoursesOverview courses={mockEnrolled} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <ContinueLearningCard items={mockContinue} />
          <RecommendedCoursesCarousel courses={mockRecommended} />
          <RecentActivity activities={mockActivities} />
        </div>

        {/* Right Column - Profile & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileSummaryCard
            name={user?.fullName || 'Student'}
            email={user?.email || ''}
            avatarUrl={user?.avatarUrl}
            level={level}
            xp={xp}
            streak={streak}
          />
          <StreakDisplay
            currentStreak={streak}
            longestStreak={longestStreak}
            todayCompleted={goalProgress >= 100}
          />
          <DailyGoalProgress goals={mockGoals} />
          <WeeklyHeatmap data={mockWeek} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
