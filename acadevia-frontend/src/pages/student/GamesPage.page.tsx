import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { GameGrid } from '@/components/game/GameGrid';
import { Tabs } from '@/components/ui/Tabs';
import { GAME_CATALOG } from '@/components/games/gameCatalog';

const allGamesList = GAME_CATALOG.map((game) => ({ ...game, category: game.subject }));

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
    if (activeTab === 'math') return allGamesList.filter((g) => g.subject === 'Mathematics');
    if (activeTab === 'science') return allGamesList.filter((g) => g.subject === 'Science');
    if (activeTab === 'english') return allGamesList.filter((g) => g.subject === 'English');
    return allGamesList.filter(
      (g) => !['Mathematics', 'Science', 'English'].includes(g.subject)
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
