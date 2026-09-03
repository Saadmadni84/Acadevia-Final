import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { GamePlayer } from '@/components/games/GamePlayer';
import { TrigonometryQuest } from '@/components/games/trigonometry/TrigonometryQuest';
import { NumberKingdom } from '@/components/games/number-kingdom/NumberKingdom';
import { AcademicGame } from '@/components/games/AcademicGame';
import { getGameById } from '@/components/games/gameCatalog';

const GamePlayPage: React.FC = () => {
  const { t } = useTranslation();
  const { gameId } = useParams<{ gameId: string }>();

  if (gameId === 'number-kingdom') {
    return (
      <div className="space-y-4">
        <NumberKingdom />
      </div>
    );
  }

  if (gameId === 'trigonometry-quest') {
    return (
      <div className="space-y-4">
        <TrigonometryQuest />
      </div>
    );
  }

  const game = getGameById(gameId ?? '');
  if (game?.questions) return <AcademicGame game={game} />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('games.play.title', 'Play Game')} />
      <GamePlayer gameId={gameId!} />
    </div>
  );
};

export default GamePlayPage;
