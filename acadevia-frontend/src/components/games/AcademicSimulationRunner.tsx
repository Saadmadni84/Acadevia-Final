import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Trophy,
  Sparkles,
  Sliders,
  CheckCircle2,
  Activity,
  Zap,
  Award,
  Layers,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';
import type { GameMetadata } from './gameCatalog';

interface AcademicSimulationRunnerProps {
  game: GameMetadata;
  onExit: () => void;
}

interface SimulationParam {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export const AcademicSimulationRunner: React.FC<AcademicSimulationRunnerProps> = ({
  game,
  onExit,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Derive simulation parameters based on game category/title
  const params: SimulationParam[] = React.useMemo(() => {
    switch (game.category) {
      case 'Physics':
        return [
          { id: 'v1', name: 'Applied Frequency / Voltage', unit: 'Hz / V', min: 1, max: 100, step: 1, defaultValue: 45 },
          { id: 'v2', name: 'Damping / Resistance', unit: 'Ω', min: 0.1, max: 20, step: 0.1, defaultValue: 5 },
          { id: 'v3', name: 'Field Amplitude', unit: 'Tesla / N', min: 10, max: 200, step: 5, defaultValue: 80 },
        ];
      case 'Chemistry':
        return [
          { id: 'v1', name: 'Solute Concentration', unit: 'mol/L', min: 0.01, max: 2.0, step: 0.01, defaultValue: 0.5 },
          { id: 'v2', name: 'Reaction Temperature', unit: '°C', min: 0, max: 100, step: 1, defaultValue: 25 },
          { id: 'v3', name: 'Catalyst Efficiency', unit: '%', min: 0, max: 100, step: 5, defaultValue: 50 },
        ];
      case 'Biology':
        return [
          { id: 'v1', name: 'Substrate Affinity', unit: 'Km', min: 0.5, max: 10, step: 0.1, defaultValue: 3.2 },
          { id: 'v2', name: 'Enzyme Saturation', unit: 'μmol/min', min: 10, max: 150, step: 2, defaultValue: 60 },
          { id: 'v3', name: 'pH Medium', unit: 'pH', min: 2, max: 12, step: 0.1, defaultValue: 7.4 },
        ];
      case 'Computer Science':
        return [
          { id: 'v1', name: 'Input Array Size', unit: 'elements', min: 8, max: 64, step: 4, defaultValue: 24 },
          { id: 'v2', name: 'Clock Cycle Speed', unit: 'MHz', min: 10, max: 100, step: 5, defaultValue: 50 },
          { id: 'v3', name: 'Memory Partition Block', unit: 'KB', min: 64, max: 1024, step: 64, defaultValue: 256 },
        ];
      case 'Geography':
        return [
          { id: 'v1', name: 'Tectonic Plate Velocity', unit: 'mm/yr', min: 5, max: 100, step: 5, defaultValue: 35 },
          { id: 'v2', name: 'Atmospheric Moisture', unit: '% RH', min: 10, max: 100, step: 2, defaultValue: 65 },
          { id: 'v3', name: 'Topographic Elevation', unit: 'm', min: 0, max: 4000, step: 100, defaultValue: 1200 },
        ];
      default:
        return [
          { id: 'v1', name: 'Primary Vector Magnitude', unit: 'units', min: 5, max: 100, step: 1, defaultValue: 50 },
          { id: 'v2', name: 'Rate Coefficient (k)', unit: 's⁻¹', min: 0.1, max: 5, step: 0.1, defaultValue: 1.5 },
          { id: 'v3', name: 'Harmonic Oscillation', unit: 'rad/s', min: 1, max: 20, step: 0.5, defaultValue: 6 },
        ];
    }
  }, [game.category]);

  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    params.forEach((p) => {
      initial[p.id] = p.defaultValue;
    });
    return initial;
  });

  const [targetValue, setTargetValue] = useState<number>(75);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Compute live system output
  const systemOutput = React.useMemo(() => {
    const v1 = values['v1'] ?? 50;
    const v2 = values['v2'] ?? 5;
    const v3 = values['v3'] ?? 50;
    // Non-linear function to simulate real physical / biological response
    const output = Math.round(((v1 * 1.4) + (v3 * 0.6)) / Math.max(0.5, v2 * 0.15) * 10) / 10;
    return output;
  }, [values]);

  const diffPercent = Math.abs(systemOutput - targetValue) / Math.max(1, targetValue);
  const accuracy = Math.max(0, Math.min(100, Math.round((1 - diffPercent) * 100)));

  // Target generation
  useEffect(() => {
    setTargetValue(Math.floor(Math.random() * 80) + 40);
  }, [game.id]);

  // Canvas waveform / visualizer loop
  useEffect(() => {
    let animId: number;
    let time = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with dark tech grid
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center reference baseline
      const centerY = h / 2;
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (isRunning) {
        time += 0.05;
      }

      const amp = (values['v1'] ?? 50) * 0.7;
      const freq = ((values['v3'] ?? 50) / 30) * 0.03;
      const damping = Math.max(0.2, (values['v2'] ?? 5) * 0.08);

      // Target waveform (dashed amber line)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = centerY + Math.sin(x * 0.02 + time * 0.5) * (targetValue * 0.6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Live simulation waveform (vibrant gradient cyan/purple)
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#6366f1');
      grad.addColorStop(1, '#a855f7');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 10;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const y = centerY + Math.sin(x * freq + time) * Math.cos(x * 0.01) * (amp / damping);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Particle dots across wave
      ctx.fillStyle = '#38bdf8';
      for (let p = 0; p < w; p += 60) {
        const px = (p + time * 40) % w;
        const py = centerY + Math.sin(px * freq + time) * Math.cos(px * 0.01) * (amp / damping);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, values, targetValue]);

  // Handle simulation calibration validation
  const handleVerify = () => {
    if (accuracy >= 92) {
      setIsCalibrated(true);
      const earned = Math.round(game.xpReward * (accuracy / 100));
      setCurrentScore((prev) => prev + 500);

      if (!xpAwarded && user?.id) {
        setXpAwarded(true);
        gameService.saveGameScore({
          studentId: user.id,
          gameId: game.id,
          gameTitle: game.title,
          score: 500,
          accuracy: accuracy,
          timeSpent: 60,
          xpEarned: earned,
          metadata: { category: game.category, genre: game.genre },
        }).catch(console.error);
      }
      setShowVictory(true);
    } else {
      setIsCalibrated(false);
    }
  };

  const handleNextChallenge = () => {
    setTargetValue(Math.floor(Math.random() * 80) + 40);
    setIsCalibrated(false);
    setShowVictory(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Simulation Top Bar / Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-gray-200 dark:border-gray-700"
          >
            Exit Game
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-gray-900 dark:text-white">
                {game.title}
              </span>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                {game.category} Lab
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive Academic Simulation • Classes {game.classes}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Lab Score</span>
            <span className="text-xl font-black text-primary">{currentScore} pts</span>
          </div>
          <div className="text-right border-l pl-4 border-gray-200 dark:border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Target Accuracy</span>
            <span className={`text-xl font-black ${accuracy >= 92 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic Oscilloscope / Canvas Visualizer */}
        <div className="lg:col-span-8 bg-gray-950 rounded-3xl p-6 border border-gray-800 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Real-Time State Telemetry Monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Target: {targetValue} units
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Output: {systemOutput} units
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black aspect-video flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={720}
              height={405}
              className="w-full h-full object-contain"
            />
            {/* HUD Overlay */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-gray-300">
              Waveform Mode: Continuous Dynamic Synthesis
            </div>
          </div>

          {/* Verification Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>Calibrate the variable dials below to match the amber target wave (Tolerance: ±8%).</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {isRunning ? 'Pause Engine' : 'Resume Engine'}
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleVerify}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="font-bold px-6 shadow-md shadow-primary/30"
              >
                Test Calibration
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Interactive Variable Dials & Objectives */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Controls Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base">
              <Sliders className="w-5 h-5 text-primary" />
              <h3>Academic Control Parameters</h3>
            </div>

            <div className="space-y-5">
              {params.map((p) => {
                const current = values[p.id] ?? p.defaultValue;
                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {p.name}
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-primary font-bold">
                        {current} {p.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={current}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setValues((prev) => ({ ...prev, [p.id]: val }));
                      }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>{p.min} {p.unit}</span>
                      <span>{p.max} {p.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Principle Card */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-5 border border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>Fundamental Scientific Law</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Output follows proportional dynamics: increase frequency to compress wavelength, optimize damping to prevent system collapse.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showVictory && (
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Calibration Verified!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You successfully balanced the simulation parameters with {accuracy}% accuracy!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  +{game.xpReward} XP Earned!
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onExit}
                  className="flex-1"
                >
                  Exit to Library
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleNextChallenge}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Next Challenge
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
