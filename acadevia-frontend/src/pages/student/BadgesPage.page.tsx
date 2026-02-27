import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { Tabs } from '@/components/ui/Tabs';
import { useState } from 'react';

const allBadges = [
  { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson', icon: '📖', category: 'learning', earnedAt: '2024-01-15', rarity: 'common' as const },
  { id: 'b2', name: 'Quiz Master', description: 'Pass 10 quizzes with 80%+', icon: '🧠', category: 'quiz', earnedAt: '2024-02-01', rarity: 'rare' as const },
  { id: 'b3', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', earnedAt: '2024-02-10', rarity: 'rare' as const },
  { id: 'b4', name: 'Scholar', description: 'Reach level 10', icon: '🎓', category: 'level', rarity: 'epic' as const },
  { id: 'b5', name: 'Game Champion', description: 'Win 50 games', icon: '🏆', category: 'game', earnedAt: '2024-03-01', rarity: 'epic' as const },
  { id: 'b6', name: 'Legend', description: 'Reach level 50', icon: '⭐', category: 'level', rarity: 'legendary' as const },
  { id: 'b7', name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', icon: '⚡', category: 'quiz', rarity: 'rare' as const },
  { id: 'b8', name: 'Social Butterfly', description: 'Add 10 friends', icon: '🦋', category: 'social', rarity: 'common' as const },
  { id: 'b9', name: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '💯', category: 'quiz', earnedAt: '2024-03-15', rarity: 'epic' as const },
  { id: 'b10', name: 'Marathon Learner', description: 'Study for 3 hours straight', icon: '🏃', category: 'learning', rarity: 'rare' as const },
  { id: 'b11', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', category: 'streak', earnedAt: '2024-01-20', rarity: 'common' as const },
  { id: 'b12', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', category: 'streak', earnedAt: '2024-01-25', rarity: 'common' as const },
];

const tabs = [
  { id: 'all', label: 'All Badges' },
  { id: 'earned', label: 'Earned' },
  { id: 'locked', label: 'Locked' },
];

const BadgesPage: React.FC = () => {
  const [tab, setTab] = useState('all');
  const filtered = tab === 'earned' ? allBadges.filter(b => b.earnedAt) : tab === 'locked' ? allBadges.filter(b => !b.earnedAt) : allBadges;

  return (
    <div className="space-y-6 p-1">
      <PageHeader title="Badges & Achievements" subtitle={`You've earned ${allBadges.filter(b => b.earnedAt).length} of ${allBadges.length} badges`} />
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />
      <BadgeShowcase badges={filtered} />
    </div>
  );
};

export default BadgesPage;
