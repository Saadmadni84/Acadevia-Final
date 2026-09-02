import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, ArrowRight, Play, CheckCircle2, Briefcase } from 'lucide-react';
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
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationProfile } from '@/hooks/useGamification';
import { userService } from '@/services/user.service';
import { dataService } from '@/services/data.service';
import { ROUTES } from '@/config/routes.config';

const mockRecommended = [
  { id: 'r1', title: 'Advanced Algebra & Functions', instructor: 'Dr. Priya Sharma', rating: 4.8, duration: '6h 30m', lessonsCount: 24, category: 'Mathematics', color: 'from-[#5B2C6F] to-[#7B3F95]' },
  { id: 'r2', title: 'Physics: Mechanics & Motion', instructor: 'Prof. Rajesh Kumar', rating: 4.7, duration: '8h 15m', lessonsCount: 32, category: 'Science', color: 'from-[#3A1B47] to-[#5B2C6F]' },
  { id: 'r3', title: 'Creative Writing Masterclass', instructor: 'Ms. Anita Desai', rating: 4.9, duration: '4h 45m', lessonsCount: 18, category: 'English', color: 'from-[#E74C3C] to-[#7B3F95]' },
  { id: 'r4', title: 'Chemistry: Organic Compounds', instructor: 'Dr. Suresh Patel', rating: 4.6, duration: '7h', lessonsCount: 28, category: 'Science', color: 'from-[#D4A843] to-[#E74C3C]' },
  { id: 'r5', title: 'History of Ancient India', instructor: 'Prof. Meera Nair', rating: 4.5, duration: '5h 20m', lessonsCount: 20, category: 'History', color: 'from-[#4A2359] to-[#5B2C6F]' },
];

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore(s => s.user);

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => (await userService.getProfile()).data.data,
    enabled: Boolean(authUser),
  });

  const { data: gamification } = useGamificationProfile();

  const user = userProfile ?? authUser;
  const studentId = user?.id ? String(user.id) : '20';
  const metrics = dataService.getStudentMetrics(studentId);
  const teacher = metrics.teacher || dataService.getStudentTeacher(studentId);
  const availableQuizzes = dataService.getQuizzesForStudent(studentId);
  const studentResults = dataService.getStudentQuizResults(studentId);

  // Real data-driven subject cards
  const realEnrolled = React.useMemo(() => {
    return metrics.subjectProgress.map((sub, idx) => ({
      id: sub.id,
      title: sub.subject,
      progress: sub.progress,
      total: sub.lessonsCount,
      completed: sub.completedLessons,
      color: idx % 3 === 0 ? 'from-[#5B2C6F] to-[#3A1B47]' : idx % 3 === 1 ? 'from-[#D4A843] to-[#B08B2E]' : 'from-[#7B3F95] to-[#5B2C6F]',
      icon: sub.icon,
    }));
  }, [metrics.subjectProgress]);

  // Real weekly study time
  const realWeekly = React.useMemo(() => {
    return dataService.getStudentWeeklyActivity(studentId).map((d) => ({
      day: d.day,
      minutes: d.minutes,
    }));
  }, [studentId, studentResults.length]);

  // Real student activities
  const realActivities = React.useMemo(() => {
    const raw = dataService.getRecentActivities(studentId, 'STUDENT');
    return raw.map((a) => ({
      id: a.id,
      type: (a.type === 'QUIZ_COMPLETED' ? 'quiz' : a.type === 'LESSON_COMPLETED' ? 'lesson' : 'badge') as any,
      title: a.title,
      description: a.description,
      xpEarned: undefined,
      timestamp: a.timestamp,
    }));
  }, [studentId, studentResults.length]);

  // Real dynamic goals
  const dynamicGoals = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayQuizCount = studentResults.filter(
      (r) => r.completedAt && r.completedAt.startsWith(todayStr)
    ).length;
    const todayXP = studentResults
      .filter((r) => r.completedAt && r.completedAt.startsWith(todayStr))
      .reduce((sum, r) => sum + (r.xpEarned || 0), 0);

    return [
      { id: '1', title: 'Complete 1 quiz or lesson', type: 'quiz' as const, current: todayQuizCount, target: 1, completed: todayQuizCount >= 1 },
      { id: '2', title: 'Score 80%+ on an assessment', type: 'quiz' as const, current: studentResults.some((r) => r.percentage >= 80) ? 1 : 0, target: 1, completed: studentResults.some((r) => r.percentage >= 80) },
      { id: '3', title: 'Earn 100 XP', type: 'xp' as const, current: Math.min(todayXP, 100), target: 100, completed: todayXP >= 100 },
    ];
  }, [studentResults]);

  // Real continue learning items
  const realContinue = React.useMemo(() => {
    return availableQuizzes.slice(0, 3).map((q, idx) => {
      const res = studentResults.find((r) => r.quizId === q.id);
      return {
        id: q.id,
        courseTitle: `${q.subject} Class ${q.classGrade}`,
        lessonTitle: q.title,
        progress: res ? res.percentage : 0,
        timeLeft: `${Math.round(q.timeLimit / 60)} min`,
        courseId: `c-${q.subject.toLowerCase()}`,
        lessonId: q.id,
        thumbnail: '',
        category: q.subject,
        color: idx === 0 ? 'from-[#5B2C6F] to-[#3A1B47]' : idx === 1 ? 'from-[#D4A843] to-[#B08B2E]' : 'from-[#E74C3C] to-[#C0392B]',
      };
    });
  }, [availableQuizzes, studentResults]);

  const level = gamification?.level ?? metrics.level ?? 1;
  const xp = gamification?.xp ?? metrics.totalXP ?? 0;
  const requiredXP = Math.max(100, Math.ceil((xp + 1) / 100) * 100);
  const streak = gamification?.streak ?? metrics.streak ?? 0;
  const longestStreak = metrics.longestStreak ?? streak;
  const goalProgress = dynamicGoals.filter((g) => g.completed).length > 0
    ? Math.round((dynamicGoals.filter((g) => g.completed).length / dynamicGoals.length) * 100)
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
      <EnrolledCoursesOverview courses={realEnrolled} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Assigned & Available Quizzes from Teacher */}
          {availableQuizzes.length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-primary flex items-center justify-center">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Assigned Quizzes
                    </h3>
                    <p className="text-xs text-gray-500">
                      Assessments published for your class ({availableQuizzes.length} available)
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.QUIZZES)}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  View All
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {availableQuizzes.slice(0, 4).map((quiz) => {
                  const completedResult = studentResults.find(
                    (r) => String(r.quizId) === String(quiz.id)
                  );

                  return (
                    <div
                      key={quiz.id}
                      className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-primary/40 hover:shadow-xs transition flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary dark:text-[#D4A843]">
                            {quiz.subject}
                          </span>
                          {completedResult ? (
                            <span className="flex items-center gap-1 font-bold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {completedResult.percentage}%
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold">Pending</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {quiz.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{quiz.questions.length} questions</span>
                          <span>{Math.round((quiz.timeLimit || 300) / 60)} min</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                          By {quiz.teacherName}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/quizzes?id=${quiz.id}`)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          {completedResult ? 'Retake' : 'Take Quiz'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ContinueLearningCard items={realContinue} />
          <RecommendedCoursesCarousel courses={mockRecommended} />
          <RecentActivity activities={realActivities} />
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

          {/* Connected Teacher Card (Retrieved via data relationship) */}
          {teacher && (
            <div className="rounded-2xl border border-primary/20 bg-white dark:bg-card-dark p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-[#D4A843] flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" /> My Assigned Teacher
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  Class {teacher.classesTaught?.[0] || 10}
                </span>
              </div>
              <div className="flex items-center gap-3.5 pt-1">
                <img
                  src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {teacher.fullName}
                  </h4>
                  <p className="text-xs text-primary font-medium">
                    {teacher.subject || 'Mathematics'} Teacher
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {teacher.schoolName}
                  </p>
                </div>
              </div>
            </div>
          )}

          <StreakDisplay
            currentStreak={streak}
            longestStreak={longestStreak}
            todayCompleted={goalProgress >= 100}
          />
          <DailyGoalProgress goals={dynamicGoals} />
          <WeeklyHeatmap data={realWeekly} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
