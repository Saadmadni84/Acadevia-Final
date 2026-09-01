import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { Tabs } from '@/components/ui/Tabs';
import { useGamificationProfile } from '@/hooks/useGamification';

const defaultBadges = [
  { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson', icon: '📖', category: 'learning', earnedAt: '2024-01-15', rarity: 'common' as const, isEarned: true },
  { id: 'b2', name: 'Quiz Master', description: 'Pass 10 quizzes with 80%+', icon: '🧠', category: 'quiz', earnedAt: '2024-02-01', rarity: 'rare' as const, isEarned: true },
  { id: 'b3', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', earnedAt: '2024-02-10', rarity: 'rare' as const, isEarned: true },
  { id: 'b4', name: 'Scholar', description: 'Reach level 10', icon: '🎓', category: 'level', rarity: 'epic' as const, isEarned: false },
  { id: 'b5', name: 'Game Champion', description: 'Win 50 games', icon: '🏆', category: 'game', earnedAt: '2024-03-01', rarity: 'epic' as const, isEarned: true },
  { id: 'b6', name: 'Legend', description: 'Reach level 50', icon: '⭐', category: 'level', rarity: 'legendary' as const, isEarned: false },
  { id: 'b7', name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', icon: '⚡', category: 'quiz', rarity: 'rare' as const, isEarned: false },
  { id: 'b8', name: 'Social Butterfly', description: 'Add 10 friends', icon: '🦋', category: 'social', rarity: 'common' as const, isEarned: false },
  { id: 'b9', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '💯', category: 'quiz', earnedAt: '2024-03-15', rarity: 'epic' as const, isEarned: true },
  { id: 'b10', name: 'Marathon Learner', description: 'Study for 3 hours straight', icon: '🏃', category: 'learning', rarity: 'rare' as const, isEarned: false },
  { id: 'b11', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', category: 'streak', earnedAt: '2024-01-20', rarity: 'common' as const, isEarned: true },
  { id: 'b12', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', category: 'streak', earnedAt: '2024-01-25', rarity: 'common' as const, isEarned: true },
];

const tabs = [
  { id: 'all', label: 'All Badges' },
  { id: 'earned', label: 'Earned' },
  { id: 'locked', label: 'Locked' },
];

const BadgesPage: React.FC = () => {
  const [tab, setTab] = useState('all');
  const { data: gamification } = useGamificationProfile();

  const badges = (gamification?.badges && gamification.badges.length > 0)
    ? defaultBadges.map(def => {
        const live = gamification.badges.find(b => b.id === def.id || b.name.toLowerCase() === def.name.toLowerCase());
        if (live) {
          return {
            ...def,
            isEarned: live.isEarned ?? Boolean(live.earnedAt),
            earnedAt: live.earnedAt ?? def.earnedAt,
            iconUrl: live.iconUrl || undefined,
          };
        }
        return def;
      })
    : defaultBadges;

  const earnedCount = badges.filter(b => b.isEarned || b.earnedAt).length;

  const filtered = tab === 'earned'
    ? badges.filter(b => b.isEarned || b.earnedAt)
    : tab === 'locked'
    ? badges.filter(b => !b.isEarned && !b.earnedAt)
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
