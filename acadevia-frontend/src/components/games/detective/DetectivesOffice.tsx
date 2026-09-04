import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Landmark,
  FileSearch,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface BoardPin {
  id: string;
  category: 'suspect' | 'evidence' | 'motive' | 'location';
  title: string;
  notes: string;
  emoji: string;
  x: number; // percentage on corkboard
  y: number;
}

const BOARD_PINS: BoardPin[] = [
  { id: 'vane', category: 'suspect', title: 'Baron Alistair Vane', notes: 'Wealthy rail tycoon with sudden liquidity bankruptcy.', emoji: '🧐', x: 20, y: 22 },
  { id: 'ledger', category: 'motive', title: 'Extortion Ledger', notes: 'Demands $500,000 cash before midnight to hide fraudulent bonds.', emoji: '📒', x: 75, y: 22 },
  { id: 'handkerchief', category: 'evidence', title: 'Monogrammed Handkerchief', notes: 'Finest imported Lyon silk embroidered with initials "AV".', emoji: '🧣', x: 30, y: 72 },
  { id: 'conservatory', category: 'location', title: 'The Grand Conservatory', notes: 'Shattered greenhouse glass stained with rare cyanide residue.', emoji: '🌿', x: 70, y: 72 },
  { id: 'opera_ticket', category: 'evidence', title: 'Torn Opera Ticket', notes: 'Punched at 8:00 PM, but torn in half before Act II started.', emoji: '🎟️', x: 50, y: 46 },
];

// Valid yarn connection pairs that build the case
const VALID_CONNECTIONS = [
  ['vane', 'handkerchief'],
  ['handkerchief', 'conservatory'],
  ['vane', 'ledger'],
  ['vane', 'opera_ticket'],
];

export const DetectivesOffice: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [connections, setConnections] = useState<string[][]>([]);
  const [activeInspectorPin, setActiveInspectorPin] = useState<BoardPin | null>(null);
  const [caseSolved, setCaseSolved] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const handlePinClick = (pin: BoardPin) => {
    setActiveInspectorPin(pin);

    if (!selectedPin) {
      setSelectedPin(pin.id);
    } else if (selectedPin === pin.id) {
      setSelectedPin(null);
    } else {
      // Connect selectedPin and pin.id
      const pair = [selectedPin, pin.id].sort();
      const alreadyConnected = connections.some(
        (c) => c[0] === pair[0] && c[1] === pair[1]
      );

      if (!alreadyConnected) {
        const newConnections = [...connections, pair];
        setConnections(newConnections);

        // Check if pair is a valid logical link
        const isValid = VALID_CONNECTIONS.some(
          (vc) => vc[0] === pair[0] && vc[1] === pair[1]
        );

        if (isValid) {
          setScore((prev) => prev + 150);
        }

        // Check victory condition (all 4 key threads linked)
        const validLinkedCount = VALID_CONNECTIONS.filter((vc) =>
          newConnections.some((c) => c[0] === vc[0] && c[1] === vc[1])
        ).length;

        if (validLinkedCount >= 4) {
          setCaseSolved(true);
          if (user?.id) {
            gameService.saveGameScore({
              studentId: user.id,
              gameId: 'detectives-office',
              gameTitle: "Detective's Office: Case Corkboard",
              score: score + 600,
              accuracy: 100,
              timeSpent: 150,
              xpEarned: 210,
              metadata: { threadsCount: newConnections.length },
            }).catch(console.error);
          }
        }
      }

      setSelectedPin(null);
    }
  };

  const handleRestart = () => {
    setSelectedPin(null);
    setConnections([]);
    setActiveInspectorPin(null);
    setCaseSolved(false);
    setScore(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-5 py-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.GAMES)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-gray-200 dark:border-gray-700"
          >
            Exit Office
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                Detective's Office
              </span>
              <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
                Active Evidence Corkboard
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Relational Yarn Graph & Case Deduction</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Red Yarn Links</span>
            <span className="text-sm font-black text-rose-500">{connections.length} threads</span>
          </div>
          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
            <span className="text-lg font-black text-primary">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Corkboard Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-[#2b1d16] border-8 border-[#1f140f] p-6 sm:p-8 shadow-2xl min-h-[500px] flex flex-col justify-between">
        {/* Cork texture overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #5c3a21 10%, transparent 20%), radial-gradient(circle, #1a0f08 10%, transparent 20%)',
            backgroundSize: '16px 16px, 24px 24px',
          }}
        />

        {/* Board Instruction Banner */}
        <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
            <Share2 className="w-4 h-4 text-rose-400" />
            <span>
              Click two pinned cards to string red yarn between them. Connect Suspect ➔ Alibi ➔ Trace ➔ Motive!
            </span>
          </div>
          {selectedPin && (
            <span className="text-xs font-mono font-bold bg-rose-500/30 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/40 animate-pulse">
              Stringing Yarn from {BOARD_PINS.find((p) => p.id === selectedPin)?.title}...
            </span>
          )}
        </div>

        {/* Interactive Corkboard Surface */}
        <div className="relative z-10 flex-1 my-4 min-h-[380px]">
          {/* SVG Yarn Strings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(([idA, idB], idx) => {
              const pinA = BOARD_PINS.find((p) => p.id === idA);
              const pinB = BOARD_PINS.find((p) => p.id === idB);
              if (!pinA || !pinB) return null;

              return (
                <line
                  key={idx}
                  x1={`${pinA.x}%`}
                  y1={`${pinA.y}%`}
                  x2={`${pinB.x}%`}
                  y2={`${pinB.y}%`}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                  className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                />
              );
            })}
          </svg>

          {/* Pinned Evidence Cards */}
          {BOARD_PINS.map((pin) => {
            const isSelected = selectedPin === pin.id;

            return (
              <motion.button
                key={pin.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePinClick(pin)}
                style={{
                  position: 'absolute',
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                }}
                className={`transform -translate-x-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-[#fffef5] dark:bg-stone-900 border-2 shadow-2xl max-w-[170px] text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-rose-500 shadow-[0_0_20px_#ef4444] scale-105'
                    : 'border-stone-300 dark:border-stone-700 hover:border-amber-400'
                }`}
              >
                {/* Red Pushpin Icon at top */}
                <div className="w-3 h-3 rounded-full bg-rose-600 shadow-md border border-white mx-auto -mt-2 mb-1.5" />

                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xl">{pin.emoji}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {pin.category}
                  </span>
                </div>

                <h5 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 leading-tight">
                  {pin.title}
                </h5>
                <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                  {pin.notes}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Pin Dossier Footer */}
        {activeInspectorPin && (
          <div className="relative z-10 bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Investigator Notebook Note:
              </span>
              <p className="text-xs text-gray-200 mt-0.5">
                <strong className="text-white">{activeInspectorPin.title}:</strong> {activeInspectorPin.notes}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 font-mono shrink-0">
              Click another pin to link yarn
            </span>
          </div>
        )}
      </div>

      {/* Case Solved Modal */}
      <AnimatePresence>
        {caseSolved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Conspiracy Unraveled!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  You connected all vital threads on the corkboard! Baron Vane’s torn opera ticket proved he abandoned the theatre; his Lyon silk handkerchief left in the Conservatory tied him directly to the crime scene, driven by the extortion ledger.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +210 XP Earned • Final Score: {score}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Re-examine Board
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
