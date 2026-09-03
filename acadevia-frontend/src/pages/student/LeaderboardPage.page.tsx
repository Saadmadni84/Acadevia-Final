import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Tabs } from '@/components/ui/Tabs';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService } from '@/services/data.service';
import { Trophy, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const tabs = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
];

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useAuthStore((s) => s.user);

  const loadLeaderboard = useCallback(async (period: 'weekly' | 'monthly' | 'alltime') => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch from high-performance backend API with automatic fallback
      const rawData = await dataService.fetchLeaderboard(period);

      // 2. Mark current authenticated user safely
      const processed: LeaderboardEntry[] = rawData.map((entry) => {
        const isSelf = !!(
          currentUser &&
          (String(entry.userId) === String(currentUser.id) ||
            (entry.name && currentUser.fullName && entry.name.toLowerCase() === currentUser.fullName.toLowerCase()) ||
            ((currentUser as any).studentSchoolId && String(entry.userId) === String((currentUser as any).studentSchoolId)))
        );

        return {
          ...entry,
          isCurrentUser: isSelf,
        };
      });

      // 3. If current logged-in user is a registered student not yet in the list, calculate their position
      if (
        currentUser &&
        currentUser.role === 'STUDENT' &&
        !processed.some((e) => e.isCurrentUser)
      ) {
        const userObj = dataService.getUserById(String(currentUser.id));
        const userXP = period === 'alltime' ? (userObj?.totalXP || currentUser.xp || 0) : 0;
        const userLevel = userObj?.currentLevel || currentUser.level || 1;
        const userStreak = userObj?.currentStreak || currentUser.streak || 0;

        const selfEntry: LeaderboardEntry = {
          rank: processed.length + 1,
          userId: String(currentUser.id),
          name: currentUser.fullName || currentUser.email?.split('@')[0] || 'You',
          avatar: currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName || 'Student')}`,
          level: userLevel,
          xp: userXP,
          streak: userStreak,
          change: 'same',
          isCurrentUser: true,
        };

        processed.push(selfEntry);
        processed.sort((a, b) => b.xp - a.xp || b.level - a.level || a.name.localeCompare(b.name));
        processed.forEach((item, idx) => {
          item.rank = idx + 1;
        });
      }

      setEntries(processed);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadLeaderboard(activeTab);

    // Auto-update when new quiz submissions or data changes occur in the application
    const handleDataUpdate = () => {
      loadLeaderboard(activeTab);
    };

    window.addEventListener('acadevia_data_updated', handleDataUpdate);
    return () => {
      window.removeEventListener('acadevia_data_updated', handleDataUpdate);
    };
  }, [activeTab, loadLeaderboard]);

  // Handle clicking a student
  const handleSelectStudent = (studentId: string) => {
    if (currentUser?.role === 'TEACHER') {
      navigate(`/teacher/students?studentId=${studentId}`);
    } else {
      navigate(`/profile?id=${studentId}`);
    }
  };

  // Determine top 3 for podium
  const top3 = entries.slice(0, 3).map((e) => ({
    rank: e.rank,
    userId: e.userId,
    name: e.name,
    xp: e.xp,
    level: e.level,
    avatar: e.avatar,
  }));

  // Check if any student has earned XP
  const hasEarnedXP = entries.some((e) => e.xp > 0);

  return (
    <div className="space-y-6 p-1">
      <PageHeader
        title="Leaderboard"
        subtitle="See how you rank among other students based on real quiz performance"
      />

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'weekly' | 'monthly' | 'alltime')}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="flex items-end justify-center gap-4 py-8">
            <div className="w-24 h-28 bg-gray-200 dark:bg-gray-800 rounded-t-xl" />
            <div className="w-28 h-36 bg-gray-300 dark:bg-gray-700 rounded-t-xl" />
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-t-xl" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-14 bg-gray-100 dark:bg-gray-800/60 rounded-xl w-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="glass-card p-8 text-center max-w-md mx-auto my-8 border border-red-200 dark:border-red-900/30">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Unable to Load Leaderboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => loadLeaderboard(activeTab)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!hasEarnedXP || entries.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-md mx-auto my-8"
        >
          <Trophy className="h-14 w-14 text-yellow-500/70 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            No students have earned XP yet.
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete quizzes and lessons to earn XP and claim the top rank on the leaderboard!
          </p>
        </motion.div>
      )}

      {/* Populated State */}
      {!isLoading && !error && hasEarnedXP && entries.length > 0 && (
        <>
          {top3.length >= 3 && top3[0].xp > 0 && (
            <LeaderboardPodium top3={top3} onSelectStudent={handleSelectStudent} />
          )}
          <LeaderboardTable entries={entries} onSelectStudent={handleSelectStudent} />
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
