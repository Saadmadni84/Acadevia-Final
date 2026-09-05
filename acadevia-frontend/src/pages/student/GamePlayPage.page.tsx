import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { getGameById } from '@/components/games/gameCatalog';
import { GameBriefingView } from '@/components/games/GameBriefingView';
import { AcademicSimulationRunner } from '@/components/games/AcademicSimulationRunner';

// Existing legacy / flagship games
import { TrigonometryQuest } from '@/components/games/trigonometry/TrigonometryQuest';
import { NumberKingdom } from '@/components/games/number-kingdom/NumberKingdom';
import { HistoryQuest } from '@/components/games/history-quest/HistoryQuest';
import { ScienceLab } from '@/components/games/science-lab/ScienceLab';
import { TypeRush } from '@/components/games/type-rush/TypeRush';
import { VedicMathMaster } from '@/components/games/vedic-math/VedicMathMaster';

// Flagship Subject Interactive Games
import { ProjectileMaster } from '@/components/games/physics/ProjectileMaster';
import { BinaryBlitz } from '@/components/games/computer-science/BinaryBlitz';
import { ElementFactory } from '@/components/games/chemistry/ElementFactory';
import { CellDefender } from '@/components/games/biology/CellDefender';
import { WorldExplorer } from '@/components/games/geography/WorldExplorer';
import { FractionForge } from '@/components/games/math/FractionForge';
import { EcosystemTycoon } from '@/components/games/science/EcosystemTycoon';
import { IndusValleyBuilder } from '@/components/games/history/IndusValleyBuilder';

// Cognitive & Mind Games
import { MemoryVault } from '@/components/games/cognitive/MemoryVault';
import { PatternPulse } from '@/components/games/cognitive/PatternPulse';
import { MemoryMaze } from '@/components/games/cognitive/MemoryMaze';
import { SequenceBuilder } from '@/components/games/cognitive/SequenceBuilder';
import { FocusHunter } from '@/components/games/cognitive/FocusHunter';

// Detective & Logic Games
import { MissingArtifact } from '@/components/games/detective/MissingArtifact';
import { Codebreaker } from '@/components/games/detective/Codebreaker';
import { DetectivesOffice } from '@/components/games/detective/DetectivesOffice';
import { TimeTravelMystery } from '@/components/games/detective/TimeTravelMystery';
import { LogicDetective } from '@/components/games/detective/LogicDetective';

const GamePlayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const game = getGameById(gameId ?? '');

  if (!game && !gameId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Game Not Found</h2>
        <Button onClick={() => navigate(ROUTES.GAMES)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Games
        </Button>
      </div>
    );
  }

  // Pre-game Detail & Briefing screen (Requirement 19)
  if (!isPlaying && game) {
    return (
      <GameBriefingView
        game={game}
        onStartGame={() => setIsPlaying(true)}
        onBack={() => navigate(ROUTES.GAMES)}
      />
    );
  }

  // Flagship & Dedicated Interactive Games
  switch (gameId) {
    // Subject Flagships
    case 'projectile-master':
    case 'projectile-motion':
      return <ProjectileMaster />;
    case 'binary-blitz':
      return <BinaryBlitz />;
    case 'element-factory':
      return <ElementFactory />;
    case 'cell-defender':
      return <CellDefender />;
    case 'world-explorer':
      return <WorldExplorer />;
    case 'fraction-forge':
      return <FractionForge />;
    case 'ecosystem-tycoon':
      return <EcosystemTycoon />;
    case 'indus-valley-builder':
      return <IndusValleyBuilder />;
    case 'type-rush':
      return <TypeRush />;
    case 'vedic-math-master':
      return <VedicMathMaster />;
    case 'number-kingdom':
      return (
        <div className="space-y-4">
          <NumberKingdom />
        </div>
      );
    case 'history-quest':
      return (
        <div className="space-y-4">
          <HistoryQuest />
        </div>
      );
    case 'science-lab':
      return (
        <div className="space-y-4">
          <ScienceLab />
        </div>
      );
    case 'trigonometry-quest':
      return (
        <div className="space-y-4">
          <TrigonometryQuest />
        </div>
      );

    // Mind & Memory
    case 'memory-vault':
      return <MemoryVault />;
    case 'pattern-pulse':
      return <PatternPulse />;
    case 'memory-maze':
      return <MemoryMaze />;
    case 'sequence-builder':
      return <SequenceBuilder />;
    case 'focus-hunter':
      return <FocusHunter />;

    // Detective & Logic
    case 'missing-artifact':
      return <MissingArtifact />;
    case 'codebreaker':
      return <Codebreaker />;
    case 'detectives-office':
      return <DetectivesOffice />;
    case 'time-travel-mystery':
      return <TimeTravelMystery />;
    case 'logic-detective':
      return <LogicDetective />;

    default:
      if (game) {
        return (
          <AcademicSimulationRunner
            game={game}
            onExit={() => setIsPlaying(false)}
          />
        );
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Game Not Found</h2>
          <Button onClick={() => navigate(ROUTES.GAMES)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Games
          </Button>
        </div>
      );
  }
};

export default GamePlayPage;
