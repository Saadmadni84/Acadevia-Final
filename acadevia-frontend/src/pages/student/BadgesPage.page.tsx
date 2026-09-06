import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { Tabs } from '@/components/ui/Tabs';
import { useGamificationProfile } from '@/hooks/useGamification';

import { useAuthStore } from '@/stores/useAuthStore';
import { dataService } from '@/services/data.service';

const catalogBadges = [
  { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson or quiz', icon: '📖', category: 'learning', rarity: 'common' as const },
  { id: 'b2', name: 'Quiz Master', description: 'Pass 10 quizzes with 80%+', icon: '🧠', category: 'quiz', rarity: 'rare' as const },
  { id: 'b3', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', rarity: 'rare' as const },
  { id: 'b4', name: 'Scholar', description: 'Reach level 10', icon: '🎓', category: 'level', rarity: 'epic' as const },
  { id: 'b5', name: 'Game Champion', description: 'Win 50 games', icon: '🏆', category: 'game', rarity: 'epic' as const },
  { id: 'b6', name: 'Legend', description: 'Reach level 50', icon: '⭐', category: 'level', rarity: 'legendary' as const },
  { id: 'b7', name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', icon: '⚡', category: 'quiz', rarity: 'rare' as const },
  { id: 'b8', name: 'Social Butterfly', description: 'Add 10 friends', icon: '🦋', category: 'social', rarity: 'common' as const },
  { id: 'b9', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '💯', category: 'quiz', rarity: 'epic' as const },
  { id: 'b10', name: 'Marathon Learner', description: 'Study for 3 hours straight', icon: '🏃', category: 'learning', rarity: 'rare' as const },
  { id: 'b11', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', category: 'streak', rarity: 'common' as const },
  { id: 'b12', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', category: 'streak', rarity: 'common' as const },
];

const tabs = [
  { id: 'all', label: 'All Badges' },
  { id: 'earned', label: 'Earned' },
  { id: 'locked', label: 'Locked' },
];

const BadgesPage: React.FC = () => {
  const [tab, setTab] = useState('all');
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id ? String(user.id) : '';
  const metrics = dataService.getStudentMetrics(studentId);
  const { data: gamification } = useGamificationProfile();

  const badges = catalogBadges.map((def) => {
    let isEarned = false;
    let earnedAt: string | undefined = undefined;
    let iconUrl: string | undefined = undefined;

    // Check backend gamification first
    const live = gamification?.badges?.find(
      (b) => b.id === def.id || b.name.toLowerCase() === def.name.toLowerCase()
    );
    if (live) {
      isEarned = live.isEarned ?? Boolean(live.earnedAt);
      earnedAt = live.earnedAt;
      iconUrl = live.iconUrl || undefined;
    } else {
      // Evaluate actual criteria from student metrics
      if (def.id === 'b1') {
        isEarned = metrics.lessonsCompleted >= 1;
      } else if (def.id === 'b2') {
        isEarned = metrics.quizzesCompleted >= 10 && metrics.averageScore >= 80;
      } else if (def.id === 'b3') {
        isEarned = metrics.streak >= 7;
      } else if (def.id === 'b4') {
        isEarned = metrics.level >= 10;
      } else if (def.id === 'b6') {
        isEarned = metrics.level >= 50;
      } else if (def.id === 'b9') {
        isEarned = metrics.perfectQuizzesCount >= 5;
      } else if (def.id === 'b10') {
        isEarned = metrics.studyMinutes >= 180;
      }
      if (isEarned) {
        earnedAt = 'Recently';
      }
    }

    return {
      ...def,
      isEarned,
      earnedAt,
      iconUrl,
    };
  });

  const earnedCount = badges.filter((b) => b.isEarned).length;

  const filtered = tab === 'earned'
    ? badges.filter((b) => b.isEarned)
    : tab === 'locked'
    ? badges.filter((b) => !b.isEarned)
    : badges;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2">
      <PageHeader
        title="Badges & Achievements"
        subtitle={`You've earned ${earnedCount} of ${badges.length} badges`}
      />
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-6 shadow-sm">
        <BadgeShowcase badges={filtered} />
      </div>
    </div>
  );
};

export default BadgesPage;
