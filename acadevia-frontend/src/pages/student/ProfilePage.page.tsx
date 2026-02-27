import React from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { useAuthStore } from '@/stores/useAuthStore';

const mockBadges = [
  { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson', icon: '📖', category: 'learning', earnedAt: '2024-01-15', rarity: 'common' as const },
  { id: 'b2', name: 'Quiz Master', description: 'Pass 10 quizzes with 80%+', icon: '🧠', category: 'quiz', earnedAt: '2024-02-01', rarity: 'rare' as const },
  { id: 'b3', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streak', earnedAt: '2024-02-10', rarity: 'rare' as const },
  { id: 'b4', name: 'Scholar', description: 'Reach level 10', icon: '🎓', category: 'level', rarity: 'epic' as const },
  { id: 'b5', name: 'Game Champion', description: 'Win 50 games', icon: '🏆', category: 'game', earnedAt: '2024-03-01', rarity: 'epic' as const },
  { id: 'b6', name: 'Legend', description: 'Reach level 50', icon: '⭐', category: 'level', rarity: 'legendary' as const },
];

const ProfilePage: React.FC = () => {
  const user = useAuthStore(s => s.user);

  return (
    <div className="space-y-6 p-1">
      <ProfileHeader
        name={user?.fullName || ''}
        email={user?.email || 'student@acadevia.com'}
        level={10}
        levelName="Rising Scholar"
        currentXP={720}
        requiredXP={1000}
        totalXP={8500}
        school="Delhi Public School"
        location="New Delhi"
        joinDate="Jan 2024"
        badgeCount={5}
        streak={12}
        role={user?.role || 'STUDENT'}
      />
      <div className="glass-card p-5">
        <h3 className="text-base font-semibold mb-4">Your Badges</h3>
        <BadgeShowcase badges={mockBadges} />
      </div>
    </div>
  );
};

export default ProfilePage;
