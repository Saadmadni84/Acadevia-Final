import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useContinueLearning } from '@/hooks/useContinueLearning';
import { dataService } from '@/services/data.service';

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
  const navigate = useNavigate();
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

  const studentId = user?.id ? String(user.id) : '20';
  const studentMetrics = useMemo(() => {
    return dataService.getStudentMetrics(studentId);
  }, [studentId, dataVersion]);

  // Real backend-driven Continue Learning system
  const { data: continueLessons = [], isLoading: isLoadingContinue } = useContinueLearning(4);

  // Active student metadata
  const resolvedXP = studentMetrics.totalXP || xp || 720;
  const resolvedLevel = studentMetrics.level || level || 4;
  const resolvedStreak = studentMetrics.streak || streak || 5;
  const todayMinutes = studentMetrics.studyMinutes || 20;
  const minutesRemaining = Math.max(0, dailyGoalSetting - todayMinutes);

  const studentName = user?.fullName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Aarav');
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

  // Global search shortcut (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* 1. EDITORIAL DASHBOARD HEADER */}
      <DashboardHeader
        studentName={studentName}
        studentClass={studentClass}
        schoolName={schoolName}
        minutesRemaining={minutesRemaining}
        todayMinutes={todayMinutes}
        streak={resolvedStreak}
        dailyGoalMinutes={dailyGoalSetting}
        onOpenStreak={() => navigate(ROUTES.STREAKS)}
        onOpenGoal={() => setIsXPHistoryOpen(true)}
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
        />

        {/* 2-Column Split: Recommendations & Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <RecommendedLearningGrid />
          </div>

          <div className="lg:col-span-5">
            <WeakTopicsCard
              onPracticeTopic={(title, mastery) => setPracticeTopic({ title, mastery })}
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
              currentXP={resolvedXP}
              userId={studentId}
              userName={studentName}
              userAvatar={user?.avatarUrl}
              userRank={1}
            />
          </div>
        </div>
      </section>

      {/* Interactive Modals */}
      <XPHistoryModal
        isOpen={isXPHistoryOpen}
        onClose={() => setIsXPHistoryOpen(false)}
        currentXP={resolvedXP}
        level={resolvedLevel}
      />

      <SubjectDetailModal
        isOpen={Boolean(selectedSubject)}
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />

      <AdaptivePracticeModal
        isOpen={Boolean(practiceTopic)}
        topicTitle={practiceTopic?.title}
        initialMastery={practiceTopic?.mastery}
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

