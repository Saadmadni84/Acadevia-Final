import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, Info, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MeasureMoveGameProps {
  onComplete: () => void;
}

export const MeasureMoveGame: React.FC<MeasureMoveGameProps> = ({ onComplete }) => {
  // Rover distance in meters
  const [roverDistance, setRoverDistance] = useState<number>(0);
  const [targetDistance] = useState<number>(5.0); // 5.0 meters target
  const [measuredCurvedPath, setMeasuredCurvedPath] = useState<boolean>(false);
  const [threadUnits, setThreadUnits] = useState<number>(0); // measuring string segments
  const [feedback, setFeedback] = useState<string>(
    'Rover Calibration Mission: Use the movement distance controls (+1.0m, +0.5m, +0.1m) to pilot the science rover exactly to the 5.0m Target Mark!'
  );

  const handleDrive = (meters: number) => {
    const next = Math.round((roverDistance + meters) * 10) / 10;
    setRoverDistance(next);

    if (Math.abs(next - targetDistance) < 0.05) {
      setFeedback('🎯 Target Reached! Exact 5.0 metres distance navigated! Now test measuring a curved perimeter track with a measuring string thread.');
    } else if (next > targetDistance) {
      setFeedback(`⚠️ Overshot! Rover travelled ${next}m. Reverse back to 5.0m.`);
    } else {
      setFeedback(`🚀 Driving... Current distance: ${next}m. Target: ${targetDistance}m.`);
    }
  };

  const handleMeasureCurvedTrack = () => {
    const nextUnits = threadUnits + 1;
    setThreadUnits(nextUnits);

    if (nextUnits >= 3) {
      setMeasuredCurvedPath(true);
      setFeedback('✨ Curved Line Measured! By laying a flexible thread along the curve and then measuring the straight thread against a standard ruler, you obtained the exact SI length (12.5 cm)!');
    } else {
      setFeedback(`🧵 Aligning measuring thread along curved contours... (${nextUnits}/3 segments placed).`);
    }
  };

  const isMissionComplete = Math.abs(roverDistance - targetDistance) < 0.05 && measuredCurvedPath;

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 via-yellow-50/40 to-orange-50 dark:from-slate-900 dark:via-amber-950/20 dark:to-orange-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
            📏
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
              Chapter 5 · Measurement of Length & Motion
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Measure & Move Workshop
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Pilot the science rover to the calibrated <strong>5.0m mark</strong> and measure curved line geometry using standard SI units!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-amber-200 text-xs font-extrabold text-amber-800 dark:text-amber-200 shadow-2xs">
          <Ruler className="h-4 w-4 text-amber-600" />
          <span>Distance: {roverDistance.toFixed(1)}m / 5.0m</span>
        </div>
      </div>

      {/* 2D PHYSICAL ROVER & CALIBRATED TRACK VIEWPORT */}
      <div className="relative rounded-3xl border-4 border-amber-400/90 dark:border-amber-700/80 bg-[#FFFBEB] dark:bg-[#1C1914] overflow-hidden shadow-2xl h-[400px] sm:h-[440px] p-6 flex flex-col justify-between">
        {/* Top: Calibrated 0 to 6 Meter Track with Millimeter/Centimeter Ticks */}
        <div className="space-y-2 z-10">
          <div className="flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-200">
            <span>START (0.0 m)</span>
            <span className="text-red-600 font-extrabold animate-pulse">🎯 TARGET (5.0 m)</span>
            <span>END (6.0 m)</span>
          </div>

          {/* Metric Track with Ruler Markings */}
          <div className="relative w-full h-12 bg-amber-200 dark:bg-gray-800 rounded-2xl border-2 border-amber-400 flex items-center px-4 overflow-hidden">
            {/* Meter Ticks */}
            {[0, 1, 2, 3, 4, 5, 6].map((tick) => (
              <div
                key={tick}
                style={{ left: `${(tick / 6) * 100}%` }}
                className="absolute top-0 bottom-0 flex flex-col justify-between items-center -translate-x-1/2 pointer-events-none"
              >
                <div className="w-0.5 h-3 bg-amber-800 dark:bg-amber-300" />
                <span className="text-[10px] font-black text-amber-900 dark:text-amber-200">{tick}m</span>
                <div className="w-0.5 h-3 bg-amber-800 dark:bg-amber-300" />
              </div>
            ))}

            {/* Target Marker Pin */}
            <div
              style={{ left: `${(5.0 / 6) * 100}%` }}
              className="absolute top-0 bottom-0 w-2 bg-red-500/50 -translate-x-1/2 pointer-events-none"
            />

            {/* PLAYABLE ROVER ON TRACK */}
            <motion.div
              animate={{ left: `${Math.min(96, Math.max(2, (roverDistance / 6) * 100))}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="absolute -translate-x-1/2 flex items-center justify-center z-20"
            >
              <div className="w-12 h-10 rounded-xl bg-orange-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-2xl">
                🚜
              </div>
            </motion.div>
          </div>
        </div>

        {/* Middle: Curved Line Thread Experiment Box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border-2 border-amber-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
              Curved Path Length Measurement (Thread Method)
            </span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white">
              Measure curved tree trunk contour
            </h4>
            <p className="text-xs text-gray-500">
              Straight rulers cannot bend directly. Lay string along the curve, then measure the straight string!
            </p>
          </div>

          <Button
            size="sm"
            variant={measuredCurvedPath ? 'outline' : 'gradient'}
            disabled={measuredCurvedPath}
            onClick={handleMeasureCurvedTrack}
            className="cursor-pointer font-bold shadow-xs text-xs"
          >
            {measuredCurvedPath ? 'Curved Length Verified (12.5 cm) ✓' : `Lay Thread Along Curve (${threadUnits}/3)`}
          </Button>
        </div>

        {/* Bottom: Rover Driving Distance Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="gradient"
              onClick={() => handleDrive(1.0)}
              className="cursor-pointer font-bold shadow-xs text-xs"
            >
              +1.0 m Forward
            </Button>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => handleDrive(0.5)}
              className="cursor-pointer font-bold shadow-xs text-xs"
            >
              +0.5 m Forward
            </Button>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => handleDrive(0.1)}
              className="cursor-pointer font-bold shadow-xs text-xs"
            >
              +0.1 m Forward
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRoverDistance(0)}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              className="cursor-pointer font-bold shadow-xs text-xs"
            >
              Reset 0m
            </Button>
          </div>

          <div className="text-xs font-black text-gray-700 dark:text-gray-300">
            Current Position: <span className="text-orange-600 font-extrabold">{roverDistance.toFixed(1)} metres</span>
          </div>
        </div>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 p-3.5 text-xs font-medium text-amber-950 dark:text-amber-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-amber-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">📏🎯🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Standard Length Measurement Mastered!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You accurately calibrated SI distances in standard meters and mastered measuring curved contours using the flexible string method (+35 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Measurement Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
