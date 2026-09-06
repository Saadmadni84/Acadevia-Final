import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useContinueLearning } from '@/hooks/useContinueLearning';
import { dataService, calculateLevelAndProgress } from '@/services/data.service';

// Modular Dashboard Components
import { DashboardHeader } from './DashboardHeader';
import { ContinueLearningHero } from './ContinueLearningHero';
import { DailyGoalCard } from './DailyGoalCard';
import { SubjectProgressGrid } from './SubjectProgressGrid';
import { WeakTopicsCard } from './WeakTopicsCard';
import { RecommendedLearningGrid } from './RecommendedLearningGrid';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { LeaderboardPreview } from './LeaderboardPreview';

// Interactive Modals
import { XPHistoryModal } from './XPHistoryModal';
import { SubjectDetailModal, type SubjectData } from './SubjectDetailModal';
import { AdaptivePracticeModal } from './AdaptivePracticeModal';
import { GlobalSearchModal } from './GlobalSearchModal';

export const StudentDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { xp, level, streak } = useGamificationStore();
  const dailyGoalSetting = useSettingsStore((s) => s.settings.dailyGoalMinutes) || 45;

  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    dataService.syncFromBackend(true).catch(() => {});
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener('acadevia_data_updated', handleUpdate);
    return () => window.removeEventListener('acadevia_data_updated', handleUpdate);
  }, []);

  const studentId = user?.id ? String(user.id) : '';
  const studentMetrics = useMemo(() => {
    return dataService.getStudentMetrics(studentId);
  }, [studentId, dataVersion]);

  // Real backend-driven Continue Learning system
  const { data: continueLessons = [], isLoading: isLoadingContinue } = useContinueLearning(4);

  // Active student metadata - entirely derived from database records without fake fallbacks
  const resolvedXP = studentMetrics.totalXP ?? (user as any)?.totalXP ?? (user as any)?.xp ?? 0;
  const levelInfo = calculateLevelAndProgress(resolvedXP);
  const resolvedLevel = levelInfo.level;
  const resolvedTitle = levelInfo.levelTitle;
  const resolvedStreak = studentMetrics.streak ?? (user as any)?.currentStreak ?? 0;
  const todayMinutes = studentMetrics.studyMinutes ?? (user as any)?.studyMinutes ?? 0;
  const minutesRemaining = Math.max(0, dailyGoalSetting - todayMinutes);

  const studentResults = useMemo(() => {
    return dataService.getStudentQuizResults(studentId);
  }, [studentId, dataVersion]);

  const dynamicWeakTopics = useMemo(() => {
    if (studentResults.length === 0) {
      return undefined;
    }
    const topicStats: Record<string, { subject: string; scores: number[]; title: string }> = {};
    studentResults.forEach((r) => {
      const topicKey = r.quizTitle || r.subject;
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { subject: r.subject, scores: [], title: topicKey };
      }
      topicStats[topicKey].scores.push(r.percentage);
    });

    return Object.values(topicStats)
      .map((t) => {
        const avg = Math.round(t.scores.reduce((a, b) => a + b, 0) / t.scores.length);
        return {
          title: t.title,
          subject: t.subject,
          mastery: avg,
          recommendation: avg < 60 ? 'Needs immediate revision' : avg < 80 ? 'Recommended: Reinforce key concepts' : 'Mastered: Great job!',
          estTime: '4 min',
          status: avg < 60 ? 'Needs Attention' : avg < 80 ? 'Improving' : 'Strong',
        };
      })
      .sort((a, b) => a.mastery - b.mastery);
  }, [studentResults]);

  const studentName = user?.fullName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Student');
  const studentClass =
    user?.className ||
    (user?.classGrade ? `Class ${user.classGrade} CBSE` : undefined) ||
    (user?.id ? (dataService.getUserById(String(user.id))?.classGrade ? `Class ${dataService.getUserById(String(user.id))?.classGrade} CBSE` : undefined) : undefined) ||
    'Class 10 CBSE';
  const schoolName =
    user?.schoolName ||
    (user?.id ? dataService.getUserById(String(user.id))?.schoolName : undefined) ||
    'Delhi Public School';

  // Modal State Controls
  const [isXPHistoryOpen, setIsXPHistoryOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [practiceTopic, setPracticeTopic] = useState<{ title: string; mastery: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* 1. EDITORIAL DASHBOARD HEADER */}
      <DashboardHeader
        studentName={studentName}
        studentClass={studentClass}
        schoolName={schoolName}
        minutesRemaining={minutesRemaining}
        todayMinutes={todayMinutes}
      />

      {/* 2. CONTINUE LEARNING FLAGSHIP HERO */}
      <section className="space-y-4">
        <ContinueLearningHero
          activeLesson={continueLessons.length > 0 ? continueLessons[0] : null}
          isLoading={isLoadingContinue}
        />
      </section>

      {/* 3. CORE TWO-COLUMN ACTION WORKSPACE */}
      <section className="space-y-6 pt-2">
        {/* Subject Mastery Grid */}
        <SubjectProgressGrid
          onSelectSubject={(subj) => setSelectedSubject(subj)}
          subjectProgress={studentMetrics.subjectProgress}
        />

        {/* 2-Column Split: Recommendations & Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <RecommendedLearningGrid />
          </div>

          <div className="lg:col-span-5">
            <WeakTopicsCard
              onPracticeTopic={(title, mastery) => setPracticeTopic({ title, mastery })}
              topics={dynamicWeakTopics}
            />
          </div>
        </div>
      </section>

      {/* 4. RECENT ACTIVITY & LEADERBOARD */}
      <section className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <RecentActivityTimeline
              studentId={studentId}
              onOpenXPHistory={() => setIsXPHistoryOpen(true)}
            />
          </div>

          <div className="lg:col-span-5">
            <LeaderboardPreview
              userId={studentId}
              userName={user?.fullName || user?.firstName || 'You'}
              userAvatar={user?.avatarUrl}
              currentXP={resolvedXP}
              userRank={1}
            />
          </div>
        </div>
      </section>

      {/* Interactive Modals */}
      <XPHistoryModal
        isOpen={isXPHistoryOpen}
        onClose={() => setIsXPHistoryOpen(false)}
        studentId={studentId}
        currentXP={resolvedXP}
        level={resolvedLevel}
        levelTitle={resolvedTitle}
      />

      <SubjectDetailModal
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />

      <AdaptivePracticeModal
        topic={practiceTopic}
        onClose={() => setPracticeTopic(null)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;

