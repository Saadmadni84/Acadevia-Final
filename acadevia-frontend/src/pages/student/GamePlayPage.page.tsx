import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { GamePlayer } from '@/components/games/GamePlayer';

const GamePlayPage: React.FC = () => {
  const { t } = useTranslation();
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title={t('games.play.title')} />
      <GamePlayer gameId={gameId!} />
    </div>
  );
};

export default GamePlayPage;
