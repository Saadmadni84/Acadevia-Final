import React, { useState } from 'react';
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
  const user = useAuthStore((s) => s.user);
  const { xp, level, streak } = useGamificationStore();
  const dailyGoalSetting = useSettingsStore((s) => s.settings.dailyGoalMinutes) || 30;

  // Real backend-driven Continue Learning system
  const { data: continueLessons = [], isLoading: isLoadingContinue } = useContinueLearning(4);

  // Active student metadata
  const resolvedXP = xp > 0 ? xp : 720;
  const resolvedLevel = level > 1 ? level : 4;
  const resolvedStreak = streak > 0 ? streak : 5;

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

  const todayMinutes = 20;
  const minutesRemaining = Math.max(0, dailyGoalSetting - todayMinutes);

  // Modal State Controls
  const [isXPHistoryOpen, setIsXPHistoryOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [practiceTopic, setPracticeTopic] = useState<{ title: string; mastery: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-3 sm:px-6 select-none">
      {/* ==================================================== */}
      {/* LAYER 1: LEARNING CORE                               */}
      {/* Greeting, Continue Learning Module, Today's Focus     */}
      {/* ==================================================== */}
      <section className="space-y-6">
        <DashboardHeader
          studentName={studentName}
          studentClass={studentClass}
          schoolName={schoolName}
          minutesRemaining={minutesRemaining}
          todayMinutes={todayMinutes}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Hero: What to learn right now (70% ~ 8 cols) */}
          <div className="lg:col-span-8">
            <ContinueLearningHero
              activeLesson={continueLessons.length > 0 ? continueLessons[0] : null}
              isLoading={isLoadingContinue}
            />
          </div>

          {/* Today's Goal / Daily Mission (30% ~ 4 cols) */}
          <div className="lg:col-span-4">
            <DailyGoalCard
              todayMinutes={todayMinutes}
              goalMinutes={dailyGoalSetting}
              streak={resolvedStreak}
            />
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* LAYER 2: PROGRESS & ADAPTIVE LEARNING                */}
      {/* Subject Mastery Track, Recommendations, Weak Topics  */}
      {/* ==================================================== */}
      <section className="space-y-6 pt-2">
        {/* Subject Mastery Grid */}
        <SubjectProgressGrid
          onSelectSubject={(subj) => setSelectedSubject(subj)}
        />

        {/* 2-Column Split: Algorithmic Recommendations & Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Algorithmic Recommendations (7 cols) */}
          <div className="lg:col-span-7">
            <RecommendedLearningGrid />
          </div>

          {/* Weak Topics Diagnostic & Practice Launcher (5 cols) */}
          <div className="lg:col-span-5">
            <WeakTopicsCard
              onPracticeTopic={(title, mastery) => setPracticeTopic({ title, mastery })}
            />
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* LAYER 3: GAMIFICATION & SOCIAL COMPETITIVENESS        */}
      {/* Recent Activity Timeline & Leaderboard Preview       */}
      {/* ==================================================== */}
      <section className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Recent Activity Feed with XP delta (7 cols) */}
          <div className="lg:col-span-7">
            <RecentActivityTimeline
              onOpenXPHistory={() => setIsXPHistoryOpen(true)}
            />
          </div>

          {/* Weekly Class Leaderboard & Arena Battle (5 cols) */}
          <div className="lg:col-span-5">
            <LeaderboardPreview
              currentXP={resolvedXP}
              userRank={4}
            />
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* MODALS & SLIDE-OVERS (100% Functional Interactions)  */}
      {/* ==================================================== */}
      <XPHistoryModal
        isOpen={isXPHistoryOpen}
        onClose={() => setIsXPHistoryOpen(false)}
        currentXP={resolvedXP}
        level={resolvedLevel}
        levelTitle="Explorer"
      />

      <SubjectDetailModal
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        subject={selectedSubject}
      />

      <AdaptivePracticeModal
        isOpen={Boolean(practiceTopic)}
        onClose={() => setPracticeTopic(null)}
        topicTitle={practiceTopic?.title}
        initialMastery={practiceTopic?.mastery}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;
