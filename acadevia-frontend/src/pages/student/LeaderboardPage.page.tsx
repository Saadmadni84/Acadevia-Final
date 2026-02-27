import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Tabs } from '@/components/ui/Tabs';

const mockEntries = [
  { rank: 1, userId: 'u1', name: 'Arjun Patel', level: 15, xp: 12400, streak: 45, change: 'same' as const },
  { rank: 2, userId: 'u2', name: 'Priya Sharma', level: 14, xp: 11800, streak: 38, change: 'up' as const },
  { rank: 3, userId: 'u3', name: 'Rahul Kumar', level: 13, xp: 10500, streak: 30, change: 'down' as const },
  { rank: 4, userId: 'u4', name: 'Meera Iyer', level: 12, xp: 9800, streak: 25, change: 'up' as const },
  { rank: 5, userId: 'u5', name: 'Amit Singh', level: 12, xp: 9400, streak: 22, change: 'down' as const },
  { rank: 6, userId: 'u6', name: 'Kavitha Nair', level: 11, xp: 8900, streak: 18, change: 'same' as const },
  { rank: 7, userId: 'u7', name: 'You', level: 10, xp: 7200, streak: 12, change: 'up' as const, isCurrentUser: true },
];

const tabs = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
];

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('weekly');

  return (
    <div className="space-y-6 p-1">
      <PageHeader title="Leaderboard" subtitle="See how you rank among other students" />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <LeaderboardPodium top3={mockEntries.slice(0, 3).map(e => ({ rank: e.rank, name: e.name, xp: e.xp, level: e.level }))} />
      <LeaderboardTable entries={mockEntries} />
    </div>
  );
};

export default LeaderboardPage;
