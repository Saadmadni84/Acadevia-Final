import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Boxes,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

const SUSPECTS = ['Alice', 'Bob', 'Charlie', 'Diana'];
const ROOMS = ['Library', 'Study', 'Ballroom', 'Conservatory'];
const ITEMS = ['Candlestick', 'Poison', 'Dagger', 'Watch'];

// True solution:
// Alice: Library + Watch? Let's verify constraints:
// Clue 1: Alice in Library. Did not have Candlestick.
// Clue 2: Person with Poison was in Conservatory.
// Clue 3: Bob was never in Conservatory and had Watch.
// Clue 4: Person in Study had Dagger.
// Clue 5: Diana was not in Ballroom or Study. (So Diana must be in Conservatory!)
// From Clue 2 & 5: Diana has Poison in Conservatory.
// From Clue 1: Alice is in Library.
// From Clue 4: Study has Dagger. Who is in Study? Bob has Watch, so Charlie must be in Study with Dagger!
// Bob has Watch and is in Ballroom.
// Therefore:
// Alice: Library + Candlestick? Wait, Clue 1 says Alice did NOT have Candlestick!
// Let's check items left for Alice: Poison (Diana), Watch (Bob), Dagger (Charlie), so Candlestick would be the only one!
// Let's refine clues cleanly:
// Alice: Library + Candlestick? Let's say:
// Alice: Library + Magnifying Glass or let's use:
// Items: 'Candlestick', 'Poison', 'Dagger', 'Ring'
// Clue 1: Alice was in the Library and found the Ring.
// Clue 2: The person in the Conservatory held the Poison.
// Clue 3: Bob was in the Ballroom with the Candlestick.
// Clue 4: The person in the Study wielded the Dagger.
// Clue 5: Diana was never in the Ballroom or the Study.
// Then:
// Alice -> Library -> Ring
// Bob -> Ballroom -> Candlestick
// Diana -> Conservatory -> Poison
// Charlie -> Study -> Dagger
// Clean, elegant, perfectly solvable with deduction!

const REFINED_ITEMS = ['Ring', 'Poison', 'Candlestick', 'Dagger'];

const CLUES = [
  '1. Alice was in the Library and discovered the Ring.',
  '2. The person observed in the Conservatory held the vial of Poison.',
  '3. Bob was in the Ballroom holding the heavy Candlestick.',
  '4. The investigator in the Study was examining the Dagger.',
  '5. Diana was never present in the Ballroom or the Study.',
];

const CORRECT_MAPPINGS: Record<string, { room: string; item: string }> = {
  Alice: { room: 'Library', item: 'Ring' },
  Bob: { room: 'Ballroom', item: 'Candlestick' },
  Charlie: { room: 'Study', item: 'Dagger' },
  Diana: { room: 'Conservatory', item: 'Poison' },
};

export const LogicDetective: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Grid state: cell key "Suspect:Room" or "Suspect:Item" -> 'empty' | 'no' | 'yes'
  const [grid, setGrid] = useState<Record<string, 'empty' | 'no' | 'yes'>>({});
  const [selectedMapping, setSelectedMapping] = useState<Record<string, { room: string; item: string }>>({
    Alice: { room: '', item: '' },
    Bob: { room: '', item: '' },
    Charlie: { room: '', item: '' },
    Diana: { room: '', item: '' },
  });

  const [validationResult, setValidationResult] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [score, setScore] = useState<number>(0);

  const toggleGridCell = (key: string) => {
    setGrid((prev) => {
      const cur = prev[key] || 'empty';
      let next: 'empty' | 'no' | 'yes' = 'no';
      if (cur === 'no') next = 'yes';
      else if (cur === 'yes') next = 'empty';
      return { ...prev, [key]: next };
    });
  };

  const handleDropdownChange = (suspect: string, type: 'room' | 'item', value: string) => {
    setSelectedMapping((prev) => ({
      ...prev,
      [suspect]: {
        ...prev[suspect],
        [type]: value,
      },
    }));
  };

  const handleValidate = () => {
    let allCorrect = true;

    for (const suspect of SUSPECTS) {
      const mapping = selectedMapping[suspect];
      const target = CORRECT_MAPPINGS[suspect];
      if (mapping.room !== target.room || mapping.item !== target.item) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setValidationResult('correct');
      setScore(600);
      if (user?.id) {
        gameService.saveGameScore({
          studentId: user.id,
          gameId: 'logic-detective',
          gameTitle: 'Logic Detective: The Grid Matrix',
          score: 600,
          accuracy: 100,
          timeSpent: 160,
          xpEarned: 200,
          metadata: { solved: true },
        }).catch(console.error);
      }
    } else {
      setValidationResult('incorrect');
    }
  };

  const handleRestart = () => {
    setGrid({});
    setSelectedMapping({
      Alice: { room: '', item: '' },
      Bob: { room: '', item: '' },
      Charlie: { room: '', item: '' },
      Diana: { room: '', item: '' },
    });
    setValidationResult('none');
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
            Exit Case
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                Logic Detective
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Einstein Matrix Deduction
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Pure Propositional Logic & Constraint Satisfaction</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Score</span>
          <span className="text-lg font-black text-primary">{score} pts</span>
        </div>
      </div>

      {/* Main Deduction Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clues & Proposition Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Inspector’s Case Clues</span>
          </div>

          <div className="space-y-2.5">
            {CLUES.map((clue, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed"
              >
                {clue}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400">
            Tip: Use the deduction grid on the right to mark ✗ (impossible) and ✓ (confirmed).
          </div>
        </div>

        {/* Right: Interactive Matrix Grid & Deduction Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Scratchpad Matrix Grid */}
          <div className="bg-gradient-to-b from-gray-950 via-slate-900 to-black rounded-3xl p-6 border border-emerald-950/50 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Interactive Deduction Matrix:
              </span>
              <span className="text-[10px] text-gray-400">
                Click cell to cycle: [Blank] ➔ [✗] ➔ [✓]
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-2 text-left font-sans">Suspect</th>
                    {ROOMS.map((r) => (
                      <th key={r} className="py-2 px-1 text-[10px]">
                        {r.slice(0, 4)}
                      </th>
                    ))}
                    <th className="w-2 border-r border-gray-800" />
                    {REFINED_ITEMS.map((it) => (
                      <th key={it} className="py-2 px-1 text-[10px]">
                        {it.slice(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUSPECTS.map((s) => (
                    <tr key={s} className="border-b border-gray-800/60">
                      <td className="py-2.5 text-left font-sans font-bold text-gray-200">
                        {s}
                      </td>
                      {ROOMS.map((r) => {
                        const cellKey = `${s}:${r}`;
                        const val = grid[cellKey] || 'empty';

                        return (
                          <td key={r} className="p-1">
                            <button
                              type="button"
                              onClick={() => toggleGridCell(cellKey)}
                              className={`w-7 h-7 rounded-lg font-black text-xs transition ${
                                val === 'yes'
                                  ? 'bg-emerald-500 text-black shadow-[0_0_8px_#10b981]'
                                  : val === 'no'
                                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                                  : 'bg-gray-900 border border-gray-800 text-transparent hover:border-gray-600'
                              }`}
                            >
                              {val === 'yes' ? '✓' : val === 'no' ? '✗' : '·'}
                            </button>
                          </td>
                        );
                      })}
                      <td className="w-2 border-r border-gray-800" />
                      {REFINED_ITEMS.map((it) => {
                        const cellKey = `${s}:${it}`;
                        const val = grid[cellKey] || 'empty';

                        return (
                          <td key={it} className="p-1">
                            <button
                              type="button"
                              onClick={() => toggleGridCell(cellKey)}
                              className={`w-7 h-7 rounded-lg font-black text-xs transition ${
                                val === 'yes'
                                  ? 'bg-emerald-500 text-black shadow-[0_0_8px_#10b981]'
                                  : val === 'no'
                                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                                  : 'bg-gray-900 border border-gray-800 text-transparent hover:border-gray-600'
                              }`}
                            >
                              {val === 'yes' ? '✓' : val === 'no' ? '✗' : '·'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Deduction Solution Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Final Deduction Roster:
            </h4>

            <div className="space-y-3">
              {SUSPECTS.map((s) => (
                <div
                  key={s}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700"
                >
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white w-24">
                    {s}
                  </span>

                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={selectedMapping[s].room}
                      onChange={(e) => handleDropdownChange(s, 'room', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Room...</option>
                      {ROOMS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedMapping[s].item}
                      onChange={(e) => handleDropdownChange(s, 'item', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Item...</option>
                      {REFINED_ITEMS.map((it) => (
                        <option key={it} value={it}>
                          {it}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={handleValidate}
              className="w-full font-bold shadow-lg"
            >
              Verify Deduction Solution ⚖️
            </Button>
          </div>
        </div>
      </div>

      {/* Correct Victory Modal */}
      <AnimatePresence>
        {validationResult === 'correct' && (
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Master Detective Certified!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Flawless deduction matrix! You rigorously derived each suspect’s location and item through systematic elimination.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +200 XP Earned • Final Score: {score}
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

      {/* Incorrect Feedback Modal */}
      <AnimatePresence>
        {validationResult === 'incorrect' && (
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Logical Contradiction Detected!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  One or more assignments contradict the inspector's clues. Check the matrix again to spot impossible overlap!
                </p>
              </div>
              <Button
                variant="gradient"
                onClick={() => setValidationResult('none')}
                className="w-full font-bold"
              >
                Re-check Deductions
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
