import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Info, Search, Flame, Lightbulb, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ScienceDetectiveGameProps {
  onComplete: () => void;
}

export const ScienceDetectiveGame: React.FC<ScienceDetectiveGameProps> = ({ onComplete }) => {
  // 3 Scientific Investigations on Workbench:
  // 1. Thermal melting of ice
  // 2. Electric circuit conduction test
  // 3. Magnetic attraction test
  const [thermalHeated, setThermalHeated] = useState(false);
  const [circuitConducted, setCircuitConducted] = useState(false);
  const [magneticTested, setMagneticTested] = useState(false);

  const [feedback, setFeedback] = useState<string>(
    'Detective Workbench: Investigate the 3 mystery phenomena on the workbench: Melt ice on the heating pad, close the electric circuit switch, and test magnetic response!'
  );

  const completedCount = (thermalHeated ? 1 : 0) + (circuitConducted ? 1 : 0) + (magneticTested ? 1 : 0);
  const isMissionComplete = completedCount === 3;

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-50 via-indigo-50/40 to-blue-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-blue-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center text-3xl shadow-inner">
            🔍
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 block">
              Chapter 1 · The Wonderful World of Science
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Science Detective Laboratory
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Formulate hypotheses, perform controlled tests on the workbench, and gather empirical evidence!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-purple-200 text-xs font-extrabold text-purple-800 dark:text-purple-200 shadow-2xs">
          <Search className="h-4 w-4 text-purple-600" />
          <span>Evidence Logged: {completedCount} / 3</span>
        </div>
      </div>

      {/* 2D SCIENTIFIC WORKBENCH APPARATUS STAGE */}
      <div className="relative rounded-3xl border-4 border-purple-400/90 dark:border-purple-700/80 bg-[#F3F0F9] dark:bg-[#181622] overflow-hidden shadow-2xl h-[400px] sm:h-[440px] p-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
          {/* 1. Thermal Plate Experiment */}
          <div
            className={cn(
              'p-4 rounded-3xl border-2 transition-all shadow-md flex flex-col items-center justify-between text-center h-56',
              thermalHeated ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-purple-300 bg-white dark:bg-card-dark'
            )}
          >
            <span className="text-[10px] font-black uppercase text-purple-700">Apparatus 1: Thermal Plate</span>
            <div className="text-5xl">{thermalHeated ? '💧 (Melted Water)' : '🧊 (Solid Ice)'}</div>
            <p className="text-[11px] text-gray-500">
              {thermalHeated ? 'Observation: Heat energy caused physical phase change from solid ice to liquid water.' : 'Ice block at 0°C.'}
            </p>
            <Button
              size="sm"
              variant={thermalHeated ? 'outline' : 'gradient'}
              disabled={thermalHeated}
              onClick={() => {
                setThermalHeated(true);
                setFeedback('🔥 Observation Recorded! Heat energy broke molecular bonds in ice, converting solid ice to liquid water (Physical Change).');
              }}
              className="text-xs font-bold w-full cursor-pointer"
            >
              {thermalHeated ? 'Evidence Logged ✓' : 'Heat Thermal Pad ♨️'}
            </Button>
          </div>

          {/* 2. Electric Conduction Switch */}
          <div
            className={cn(
              'p-4 rounded-3xl border-2 transition-all shadow-md flex flex-col items-center justify-between text-center h-56',
              circuitConducted ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-purple-300 bg-white dark:bg-card-dark'
            )}
          >
            <span className="text-[10px] font-black uppercase text-purple-700">Apparatus 2: Circuit Loop</span>
            <div className="text-5xl">{circuitConducted ? '💡⚡ (Closed Circuit)' : '🔌 (Open Switch)'}</div>
            <p className="text-[11px] text-gray-500">
              {circuitConducted ? 'Observation: Copper wire conducted electric current from battery to light bulb.' : 'Broken open circuit.'}
            </p>
            <Button
              size="sm"
              variant={circuitConducted ? 'outline' : 'gradient'}
              disabled={circuitConducted}
              onClick={() => {
                setCircuitConducted(true);
                setFeedback('⚡ Observation Recorded! Copper wire conducts electric charge across a complete unbroken closed loop to illuminate the lamp!');
              }}
              className="text-xs font-bold w-full cursor-pointer"
            >
              {circuitConducted ? 'Evidence Logged ✓' : 'Close Circuit Key 💡'}
            </Button>
          </div>

          {/* 3. Magnetic Deflection Compass */}
          <div
            className={cn(
              'p-4 rounded-3xl border-2 transition-all shadow-md flex flex-col items-center justify-between text-center h-56',
              magneticTested ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-purple-300 bg-white dark:bg-card-dark'
            )}
          >
            <span className="text-[10px] font-black uppercase text-purple-700">Apparatus 3: Magnetic Compass</span>
            <div className="text-5xl">{magneticTested ? '🧭⚡ (Deflected Needle)' : '🧭 (North-South)'}</div>
            <p className="text-[11px] text-gray-500">
              {magneticTested ? 'Observation: Magnetic field aligned the compass needle along invisible field lines.' : 'Resting compass.'}
            </p>
            <Button
              size="sm"
              variant={magneticTested ? 'outline' : 'gradient'}
              disabled={magneticTested}
              onClick={() => {
                setMagneticTested(true);
                setFeedback('🧲 Observation Recorded! The magnetic field exerted a non-contact force deflecting the magnetic compass needle!');
              }}
              className="text-xs font-bold w-full cursor-pointer"
            >
              {magneticTested ? 'Evidence Logged ✓' : 'Apply Magnet 🧲'}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-purple-50 dark:bg-gray-800/80 border border-purple-200 p-3.5 text-xs font-medium text-purple-950 dark:text-purple-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-purple-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">🔍🏆🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Scientific Investigation & Evidence Logged!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully applied the scientific method: observation, hypothesis, testing, and evidence collection across thermal, electrical, and magnetic phenomena (+35 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Detective Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
