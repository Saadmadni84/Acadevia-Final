import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Filter, Grid, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SeparationFactoryGameProps {
  onComplete: () => void;
}

type SeparationStage = 'mixture1_sand_stones' | 'mixture2_sand_water' | 'complete';

export const SeparationFactoryGame: React.FC<SeparationFactoryGameProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<SeparationStage>('mixture1_sand_stones');
  // Mixture 1 state
  const [sieveProcessed, setSieveProcessed] = useState(false);
  // Mixture 2 state
  const [settledSediment, setSettledSediment] = useState(false);
  const [decantedWater, setDecantedWater] = useState(false);
  const [filteredPureWater, setFilteredPureWater] = useState(false);

  const [feedback, setFeedback] = useState<string>(
    'Factory Mission 1: We have a solid mixture of coarse Gravel Stones & fine Sand. Select the physical Sieve Apparatus to separate by particle size!'
  );

  // Mixture 1: Sieving Action
  const handleApplySieve = () => {
    setSieveProcessed(true);
    setFeedback(
      '✨ Sieving Succeeded! Fine sand particles passed through the mesh pores while larger gravel stones were retained on top of the sieve!'
    );
  };

  const handleNextToMixture2 = () => {
    setStage('mixture2_sand_water');
    setFeedback(
      'Factory Mission 2: We have Muddy Water (Sand + Water). First allow Sedimentation to let dense sand settle to the bottom, then Decant the liquid, and finally Filter it through filter paper!'
    );
  };

  // Mixture 2: Sedimentation Action
  const handleSedimentation = () => {
    setSettledSediment(true);
    setFeedback(
      '⏳ Sedimentation Complete! Dense, insoluble sand grains have settled at the bottom of the beaker due to gravity.'
    );
  };

  // Mixture 2: Decantation Action
  const handleDecantation = () => {
    if (!settledSediment) {
      setFeedback('⚠️ Wait! You must allow sedimentation first before pouring off the top liquid (decantation).');
      return;
    }
    setDecantedWater(true);
    setFeedback(
      '🧪 Decantation Succeeded! The upper liquid was carefully poured into a clean flask without disturbing the settled sediment.'
    );
  };

  // Mixture 2: Filtration Action
  const handleFiltration = () => {
    if (!decantedWater) {
      setFeedback('⚠️ Decant the bulk liquid into the funnel flask first before final filtration.');
      return;
    }
    setFilteredPureWater(true);
    setFeedback(
      '🎉 Filtration Complete! The filter paper trapped tiny suspended particles as residue, yielding clear, pure water in the beaker!'
    );
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-br from-teal-50 via-emerald-50/40 to-cyan-50 dark:from-slate-900 dark:via-teal-950/20 dark:to-emerald-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center text-3xl shadow-inner">
            🧪
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 block">
              Chapter 9 · Methods of Separation in Everyday Life
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              The Separation Factory Laboratory
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Operate mechanical <strong>Sieving</strong>, <strong>Sedimentation</strong>, <strong>Decantation</strong>, and <strong>Filtration</strong> apparatus to purify industrial mixtures!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-teal-200 text-xs font-extrabold text-teal-800 dark:text-teal-200 shadow-2xs">
          <Filter className="h-4 w-4 text-teal-500" />
          <span>Stage: {stage === 'mixture1_sand_stones' ? '1/2 (Sieving)' : '2/2 (Liquid Purification)'}</span>
        </div>
      </div>

      {/* 2D LABORATORY BENCH EXPERIMENT STAGE */}
      <div className="relative rounded-3xl border-4 border-teal-400/90 dark:border-teal-700/80 bg-[#E8F0EC] dark:bg-[#15201C] overflow-hidden shadow-2xl h-[420px] sm:h-[460px] p-6 flex flex-col justify-between">
        {stage === 'mixture1_sand_stones' ? (
          /* STAGE 1: SOLID SIEVING EXPERIMENT */
          <div className="my-auto space-y-6 max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-6">
              {/* Raw Mixture Tray */}
              <div className="p-4 rounded-3xl bg-white dark:bg-gray-800 border-2 border-amber-300 shadow-md">
                <div className="text-4xl">🪨⏳</div>
                <span className="text-[10px] font-black uppercase text-gray-500 block mt-1">Raw Mixture</span>
                <span className="text-xs font-bold text-gray-800 dark:text-white">Gravel + Fine Sand</span>
              </div>

              <div className="text-2xl font-black text-teal-600">➔</div>

              {/* Sieve Apparatus */}
              <motion.div
                animate={sieveProcessed ? { rotate: [0, -5, 5, 0] } : {}}
                className={cn(
                  'p-5 rounded-3xl border-2 transition-all shadow-lg',
                  sieveProcessed
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500'
                    : 'bg-white dark:bg-gray-800 border-teal-400'
                )}
              >
                <div className="text-5xl">{sieveProcessed ? '✨🪨' : '🕸️'}</div>
                <span className="text-[10px] font-black uppercase text-teal-700 block mt-1">
                  Wire Mesh Sieve
                </span>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  {sieveProcessed ? 'Separated: Stones Retained / Sand Passed' : 'Ready for Sieving'}
                </span>
              </motion.div>
            </div>

            <div className="flex justify-center gap-3">
              {!sieveProcessed ? (
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleApplySieve}
                  className="cursor-pointer font-bold shadow-md"
                >
                  Pour Through Sieve Mesh 🕸️
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleNextToMixture2}
                  className="cursor-pointer font-bold shadow-md bg-gradient-to-r from-teal-500 to-emerald-600"
                >
                  Proceed to Liquid Separation Factory (Stage 2) →
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* STAGE 2: SEDIMENTATION, DECANTATION & FILTRATION EXPERIMENT */
          <div className="my-auto space-y-6 max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* 1. Sedimentation Tank */}
              <div
                className={cn(
                  'p-3.5 rounded-2xl border-2 transition-all shadow-sm flex flex-col items-center justify-between h-40',
                  settledSediment
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-gray-300 bg-white dark:bg-gray-800'
                )}
              >
                <span className="text-[10px] font-black uppercase text-teal-700">1. Sedimentation</span>
                <div className="text-4xl">{settledSediment ? '🧪 (Settled)' : '🟤 (Muddy)'}</div>
                <Button
                  size="sm"
                  variant={settledSediment ? 'outline' : 'gradient'}
                  disabled={settledSediment}
                  onClick={handleSedimentation}
                  className="text-[10px] font-bold h-7 px-2 cursor-pointer w-full"
                >
                  {settledSediment ? 'Settled ✓' : 'Settle Gravity'}
                </Button>
              </div>

              {/* 2. Decantation Vessel */}
              <div
                className={cn(
                  'p-3.5 rounded-2xl border-2 transition-all shadow-sm flex flex-col items-center justify-between h-40',
                  decantedWater
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-gray-300 bg-white dark:bg-gray-800'
                )}
              >
                <span className="text-[10px] font-black uppercase text-teal-700">2. Decantation</span>
                <div className="text-4xl">{decantedWater ? '🫗 (Poured)' : '⚗️ (Flask)'}</div>
                <Button
                  size="sm"
                  variant={decantedWater ? 'outline' : 'gradient'}
                  disabled={!settledSediment || decantedWater}
                  onClick={handleDecantation}
                  className="text-[10px] font-bold h-7 px-2 cursor-pointer w-full"
                >
                  {decantedWater ? 'Decanted ✓' : 'Pour Off Liquid'}
                </Button>
              </div>

              {/* 3. Filter Funnel */}
              <div
                className={cn(
                  'p-3.5 rounded-2xl border-2 transition-all shadow-sm flex flex-col items-center justify-between h-40',
                  filteredPureWater
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-gray-300 bg-white dark:bg-gray-800'
                )}
              >
                <span className="text-[10px] font-black uppercase text-teal-700">3. Filtration</span>
                <div className="text-4xl">{filteredPureWater ? '💧 (Pure Water)' : '🌪️ (Filter Paper)'}</div>
                <Button
                  size="sm"
                  variant={filteredPureWater ? 'outline' : 'gradient'}
                  disabled={!decantedWater || filteredPureWater}
                  onClick={handleFiltration}
                  className="text-[10px] font-bold h-7 px-2 cursor-pointer w-full"
                >
                  {filteredPureWater ? 'Pure Water ✓' : 'Pass Filter'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-teal-50 dark:bg-gray-800/80 border border-teal-200 p-3.5 text-xs font-medium text-teal-950 dark:text-teal-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-teal-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Final Completion Modal */}
      {filteredPureWater && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">🧪🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Mixture Separations Successfully Mastered!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully performed mechanical Sieving on solids and combined Sedimentation, Decantation, and Filtration on liquid mixtures (+40 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Separation Factory Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
