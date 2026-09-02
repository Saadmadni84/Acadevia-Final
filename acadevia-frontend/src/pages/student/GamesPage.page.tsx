import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { GameGrid } from '@/components/game/GameGrid';
import { Tabs } from '@/components/ui/Tabs';

const allGamesList = [
  {
    id: 'number-kingdom',
    title: 'Number Kingdom',
    description: 'Explore • Build • Learn! An interactive adventure across 9 magical worlds for Class 1–4.',
    category: 'Mathematics',
    difficulty: 'easy' as const,
    playersCount: 64200,
    rating: 5.0,
    xpReward: 150,
    estimatedTime: '10–15 min',
  },
  {
    id: 'trigonometry-quest',
    title: 'Trigonometry Quest',
    description: 'Master sin, cos & tan, special angles, quadrants and unit circle through 7 interactive combat stages!',
    category: 'Mathematics',
    difficulty: 'medium' as const,
    playersCount: 58400,
    rating: 4.9,
    xpReward: 150,
    estimatedTime: '10–15 min',
  },
  {
    id: '1',
    title: 'Math Blaster',
    description: 'Solve equations to blast through levels!',
    category: 'Mathematics',
    difficulty: 'easy' as const,
    playersCount: 45200,
    rating: 4.7,
    xpReward: 50,
    estimatedTime: '5-10 min',
  },
  {
    id: '2',
    title: 'Word Wizard',
    description: 'Build vocabulary through interactive word puzzles.',
    category: 'English',
    difficulty: 'medium' as const,
    playersCount: 32100,
    rating: 4.5,
    xpReward: 40,
    estimatedTime: '8-15 min',
  },
  {
    id: '3',
    title: 'Science Lab',
    description: 'Virtual experiments to learn chemical reactions.',
    category: 'Science',
    difficulty: 'medium' as const,
    playersCount: 28400,
    rating: 4.8,
    xpReward: 60,
    estimatedTime: '10-20 min',
  },
  {
    id: '4',
    title: 'History Quest',
    description: 'Travel through time and discover Indian history.',
    category: 'Social Studies',
    difficulty: 'easy' as const,
    playersCount: 19300,
    rating: 4.3,
    xpReward: 35,
    estimatedTime: '10-15 min',
  },
  {
    id: '5',
    title: 'Code Runner',
    description: 'Learn programming concepts through gaming.',
    category: 'Computer Science',
    difficulty: 'hard' as const,
    playersCount: 15600,
    rating: 4.9,
    xpReward: 80,
    estimatedTime: '15-25 min',
  },
  {
    id: '6',
    title: 'Grammar Galaxy',
    description: 'Fix sentences and earn stars!',
    category: 'English',
    difficulty: 'easy' as const,
    playersCount: 22800,
    rating: 4.4,
    xpReward: 30,
    estimatedTime: '5-10 min',
  },
];

const tabs = [
  { id: 'all', label: 'All Games' },
  { id: 'math', label: 'Math' },
  { id: 'science', label: 'Science' },
  { id: 'english', label: 'English' },
  { id: 'others', label: 'Others' },
];

const GamesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredGames = useMemo(() => {
    if (activeTab === 'all') return allGamesList;
    if (activeTab === 'math') return allGamesList.filter((g) => g.category === 'Mathematics');
    if (activeTab === 'science') return allGamesList.filter((g) => g.category === 'Science');
    if (activeTab === 'english') return allGamesList.filter((g) => g.category === 'English');
    return allGamesList.filter(
      (g) => !['Mathematics', 'Science', 'English'].includes(g.category)
    );
  }, [activeTab]);

  return (
    <div className="space-y-6 p-1">
      <PageHeader
        title="Learning Games"
        subtitle="Have fun while learning with interactive educational games"
      />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <GameGrid games={filteredGames} />
    </div>
  );
};

export default GamesPage;
