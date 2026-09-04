import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Rocket,
  Hourglass,
  Scan,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface EraScene {
  id: string;
  eraName: string;
  dateStr: string;
  location: string;
  description: string;
  items: {
    id: string;
    name: string;
    emoji: string;
    isAnachronism: boolean;
    explanation: string;
  }[];
}

const ERAS: EraScene[] = [
  {
    id: 'indus',
    eraName: 'Indus Valley Civilization',
    dateStr: '2500 BCE',
    location: 'Mohenjo-daro Brick Kiln & Great Bath',
    description: 'Ancient Harappan bronze workers bake standardized terracotta bricks alongside covered drainage channels.',
    items: [
      { id: 'seal', name: 'Steatite Unicorn Seal', emoji: '🦏', isAnachronism: false, explanation: 'Genuine Indus steatite seal used for merchant trade verification.' },
      { id: 'kiln', name: 'Baked Clay Ingot', emoji: '🧱', isAnachronism: false, explanation: 'Standardized 1:2:4 ratio Harappan construction brick.' },
      { id: 'phone', name: '5G Smartphone', emoji: '📱', isAnachronism: true, explanation: 'Lithium-ion silicon smartphone fabricated 4,500 years before modern electronics!' },
      { id: 'bead', name: 'Carnelian Bead Necklace', emoji: '📿', isAnachronism: false, explanation: 'Famous Harappan drilled carnelian jewelry shipped to Mesopotamia.' },
    ],
  },
  {
    id: 'rome',
    eraName: 'Roman Republic',
    dateStr: '44 BCE',
    location: 'The Roman Curia & Forum',
    description: 'Senators in woolen togas debate provincial grain laws upon marble rostrums.',
    items: [
      { id: 'toga', name: 'Tyrian Purple Toga', emoji: '👘', isAnachronism: false, explanation: 'Authentic senatorial wool dyed with Mediterranean murex snails.' },
      { id: 'watch', name: 'Digital Quartz Watch', emoji: '⌚', isAnachronism: true, explanation: 'Microchip LED digital watch dropped centuries before sundials were even perfected!' },
      { id: 'scroll', name: 'Papyrus Lex Scroll', emoji: '📜', isAnachronism: false, explanation: 'Legal statute inscribed in Classical Latin script.' },
      { id: 'gladius', name: 'Iron Gladius Sword', emoji: '🗡️', isAnachronism: false, explanation: 'Standard issue Roman legionary short sword.' },
    ],
  },
  {
    id: 'florence',
    eraName: 'Renaissance Florence',
    dateStr: '1500 CE',
    location: "Leonardo da Vinci's Bottega",
    description: 'Anatomical charcoal sketches, lute strings, and bronze gears fill the Renaissance atelier.',
    items: [
      { id: 'sketch', name: 'Ornithopter Flying Wing Sketch', emoji: '📐', isAnachronism: false, explanation: 'Genuine hand-drawn Da Vinci aerodynamic study.' },
      { id: 'palette', name: 'Oil Tempera Palette', emoji: '🎨', isAnachronism: false, explanation: 'Pigments mixed with linseed oil and egg yolk.' },
      { id: 'bulb', name: 'LED Lightbulb', emoji: '💡', isAnachronism: true, explanation: 'Gallium-nitride light emitting diode inside a 16th century candle workshop!' },
      { id: 'lute', name: 'Wooden Lute Instrument', emoji: '🪕', isAnachronism: false, explanation: 'Classical 6-course Renaissance musical string instrument.' },
    ],
  },
  {
    id: 'victorian',
    eraName: 'Victorian Industrial Era',
    dateStr: '1888 CE',
    location: 'Cobblestone Street of Gaslit London',
    description: 'Steam locomotives chug across iron bridges while gaslamps flicker in the Thames fog.',
    items: [
      { id: 'hat', name: 'Silk Top Hat', emoji: '🎩', isAnachronism: false, explanation: 'Standard formal Victorian gentleman headwear.' },
      { id: 'earbuds', name: 'Wireless Bluetooth Earbuds', emoji: '🎧', isAnachronism: true, explanation: 'Wireless charging audio buds dropped over 100 years before Bluetooth protocols!' },
      { id: 'watch_mech', name: 'Brass Pocket Watch', emoji: '⏱️', isAnachronism: false, explanation: 'Period-accurate spring-driven mechanical timepiece.' },
      { id: 'pipe', name: 'Briarwood Tobacco Pipe', emoji: '🪵', isAnachronism: false, explanation: 'Common 19th-century smoking pipe.' },
    ],
  },
];

export const TimeTravelMystery: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [activeEraIndex, setActiveEraIndex] = useState<number>(0);
  const [purgedAnachronisms, setPurgedAnachronisms] = useState<string[]>([]);
  const [selectedItemExplanation, setSelectedItemExplanation] = useState<string | null>(null);
  const [timelineStability, setTimelineStability] = useState<number>(40);
  const [score, setScore] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const currentEra = ERAS[activeEraIndex];

  const handleScanItem = (item: typeof ERAS[0]['items'][0]) => {
    if (item.isAnachronism) {
      if (!purgedAnachronisms.includes(item.id)) {
        const nextPurged = [...purgedAnachronisms, item.id];
        setPurgedAnachronisms(nextPurged);
        const newStability = Math.min(100, timelineStability + 15);
        setTimelineStability(newStability);
        setScore((prev) => prev + 250);
        setSelectedItemExplanation(`CHRONO-ANOMALY DETECTED & CONTAINED! ${item.explanation}`);

        if (nextPurged.length >= 4) {
          setTimelineStability(100);
          setGameWon(true);
          if (user?.id) {
            gameService.saveGameScore({
              studentId: user.id,
              gameId: 'time-travel-mystery',
              gameTitle: 'The Time Travel Mystery',
              score: score + 500,
              accuracy: 100,
              timeSpent: 140,
              xpEarned: 220,
              metadata: { restoredEras: 4 },
            }).catch(console.error);
          }
        }
      } else {
        setSelectedItemExplanation(`Already purged: ${item.explanation}`);
      }
    } else {
      setSelectedItemExplanation(`AUTHENTIC HISTORICAL ARTIFACT: ${item.explanation}`);
    }
  };

  const handleRestart = () => {
    setActiveEraIndex(0);
    setPurgedAnachronisms([]);
    setSelectedItemExplanation(null);
    setTimelineStability(40);
    setScore(0);
    setGameWon(false);
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
            Exit Vortex
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                The Time Travel Mystery
              </span>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                Spacetime Anomaly Bureau
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Historical Chronology & Anachronism Repair</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Timeline Integrity</span>
            <span className={`text-sm font-black ${timelineStability >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {timelineStability}%
            </span>
          </div>
          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
            <span className="text-lg font-black text-primary">{score}</span>
          </div>
        </div>
      </div>

      {/* Era Navigation Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ERAS.map((era, idx) => {
          const isSelected = activeEraIndex === idx;
          const isCleared = era.items.some(
            (it) => it.isAnachronism && purgedAnachronisms.includes(it.id)
          );

          return (
            <button
              key={era.id}
              type="button"
              onClick={() => setActiveEraIndex(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-900/30 border-purple-500 shadow-sm scale-102'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mb-1">
                <span>{era.dateStr}</span>
                {isCleared && <span className="text-emerald-400 font-bold">✓ Purged</span>}
              </div>
              <h5 className="font-extrabold text-xs text-gray-900 dark:text-white line-clamp-1">
                {era.eraName}
              </h5>
            </button>
          );
        })}
      </div>

      {/* Main Era Investigation Screen */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-slate-900 to-black border border-purple-950/60 p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[460px] text-white">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold">
              <Hourglass className="w-4 h-4 animate-spin" />
              <span>TEMPORAL JUMP: {currentEra.dateStr}</span>
            </div>
            <span className="text-xs text-gray-400">{currentEra.location}</span>
          </div>

          <h3 className="text-2xl font-black">{currentEra.eraName}</h3>
          <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
            {currentEra.description}
          </p>

          {/* Interactive Artifacts Grid in this Era */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
            {currentEra.items.map((item) => {
              const isPurged = purgedAnachronisms.includes(item.id);

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleScanItem(item)}
                  className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center text-center space-y-2 transition-all ${
                    isPurged
                      ? 'bg-emerald-950/40 border-emerald-500/60 opacity-60'
                      : 'bg-white/5 border-white/10 hover:border-purple-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-4xl filter drop-shadow-md select-none">{item.emoji}</span>
                  <span className="text-xs font-extrabold text-gray-200 line-clamp-1">
                    {item.name}
                  </span>
                  {isPurged && (
                    <span className="text-[10px] font-bold text-emerald-400">
                      Anachronism Sealed
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scanner Telemetry Readout */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
          <Scan className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-purple-300 block">
              Chrono-Scanner Sensor Output:
            </span>
            <p className="text-gray-200 mt-0.5">
              {selectedItemExplanation || 'Tap any object in the scene to scan for temporal anomalies.'}
            </p>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      <AnimatePresence>
        {gameWon && (
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
                  Spacetime Restored!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  You discovered and sealed all 4 historical anachronisms (Smartphone in Mohenjo-daro, Quartz watch in Rome, LED light in Florence, Bluetooth buds in London). Timeline stability restored to 100%!
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +220 XP Earned • Final Score: {score}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit
                </Button>
                <Button variant="gradient" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Play Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
