import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Target, Award, Sparkles, Wind, Gauge, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface Planet {
  name: string;
  gravity: number; // m/s^2
  color: string;
  skyColor: string;
  groundColor: string;
}

const PLANETS: Planet[] = [
  { name: 'Earth', gravity: 9.8, color: '#3b82f6', skyColor: '#1e293b', groundColor: '#15803d' },
  { name: 'Moon', gravity: 1.62, color: '#94a3b8', skyColor: '#090d16', groundColor: '#475569' },
  { name: 'Mars', gravity: 3.72, color: '#ef4444', skyColor: '#2a1215', groundColor: '#991b1b' },
];

interface LevelConfig {
  level: number;
  targetX: number; // in meters from cannon
  targetY: number; // height of target in meters
  targetRadius: number;
  obstacleX?: number;
  obstacleWidth?: number;
  obstacleHeight?: number;
  windSpeed: number; // m/s (-10 to +10)
  shotsAllowed: number;
}

const LEVELS: LevelConfig[] = [
  { level: 1, targetX: 180, targetY: 0, targetRadius: 16, windSpeed: 0, shotsAllowed: 5 },
  { level: 2, targetX: 260, targetY: 20, targetRadius: 14, windSpeed: -2.5, shotsAllowed: 5 },
  { level: 3, targetX: 340, targetY: 45, targetRadius: 12, obstacleX: 180, obstacleWidth: 25, obstacleHeight: 60, windSpeed: 3.5, shotsAllowed: 6 },
  { level: 4, targetX: 420, targetY: 10, targetRadius: 10, obstacleX: 250, obstacleWidth: 30, obstacleHeight: 90, windSpeed: -5.0, shotsAllowed: 6 },
  { level: 5, targetX: 500, targetY: 35, targetRadius: 9, obstacleX: 300, obstacleWidth: 40, obstacleHeight: 120, windSpeed: 7.0, shotsAllowed: 7 },
];

export const ProjectileMaster: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game state
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(PLANETS[0]);
  const [angleDeg, setAngleDeg] = useState(45);
  const [velocity, setVelocity] = useState(55); // m/s
  const [shotsRemaining, setShotsRemaining] = useState(LEVELS[0].shotsAllowed);
  const [score, setScore] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [levelCleared, setLevelCleared] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Telemetry
  const [maxHeightReached, setMaxHeightReached] = useState(0);
  const [rangeReached, setRangeReached] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  const level = LEVELS[currentLevelIdx];

  // Trail history
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const projectileRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    t: number;
    active: boolean;
  }>({ x: 0, y: 0, vx: 0, vy: 0, t: 0, active: false });

  // Theoretical physics calculations
  const theoreticalRange = ((velocity * velocity * Math.sin((2 * angleDeg * Math.PI) / 180)) / selectedPlanet.gravity).toFixed(1);
  const theoreticalMaxH = (((velocity * Math.sin((angleDeg * Math.PI) / 180)) ** 2) / (2 * selectedPlanet.gravity)).toFixed(1);
  const theoreticalTime = ((2 * velocity * Math.sin((angleDeg * Math.PI) / 180)) / selectedPlanet.gravity).toFixed(1);

  // Initialize level
  const resetLevel = useCallback((lvlIdx: number) => {
    setCurrentLevelIdx(lvlIdx);
    setShotsRemaining(LEVELS[lvlIdx].shotsAllowed);
    setIsFiring(false);
    setLevelCleared(false);
    setFeedback(null);
    trailRef.current = [];
    projectileRef.current = { x: 0, y: 0, vx: 0, vy: 0, t: 0, active: false };
  }, []);

  // Fire cannon
  const handleFire = () => {
    if (isFiring || shotsRemaining <= 0 || levelCleared) return;

    setShotsRemaining((prev) => prev - 1);
    setIsFiring(true);
    setFeedback(null);
    trailRef.current = [];

    const rad = (angleDeg * Math.PI) / 180;
    projectileRef.current = {
      x: 10,
      y: 10,
      vx: velocity * Math.cos(rad),
      vy: velocity * Math.sin(rad),
      t: 0,
      active: true,
    };
  };

  // Main canvas animation and physics engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05); // cap delta time to 50ms
      lastTimestamp = now;

      // Coordinate scaling: Map physics meters to canvas pixels
      const scaleX = canvas.width / 600; // 600m world width
      const scaleY = canvas.height / 250; // 250m world height
      const originX = 30;
      const originY = canvas.height - 40;

      // Update projectile physics
      if (projectileRef.current.active) {
        const p = projectileRef.current;
        p.t += dt;

        // Apply wind resistance and gravity
        const windAcceleration = level.windSpeed * 0.4;
        p.vx += windAcceleration * dt;
        p.vy -= selectedPlanet.gravity * dt;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        trailRef.current.push({ x: p.x, y: p.y });

        // Update telemetry
        if (p.y > maxHeightReached) setMaxHeightReached(Math.round(p.y));
        setRangeReached(Math.round(p.x));
        setFlightTime(Number(p.t.toFixed(2)));

        // Collision: Check obstacle
        if (level.obstacleX && level.obstacleWidth && level.obstacleHeight) {
          if (
            p.x >= level.obstacleX &&
            p.x <= level.obstacleX + level.obstacleWidth &&
            p.y <= level.obstacleHeight
          ) {
            p.active = false;
            setIsFiring(false);
            setFeedback('💥 Blocked by terrain barrier! Increase angle or velocity.');
          }
        }

        // Collision: Check target
        const distToTarget = Math.hypot(p.x - level.targetX, p.y - level.targetY);
        if (distToTarget <= level.targetRadius) {
          p.active = false;
          setIsFiring(false);
          setLevelCleared(true);
          const pointsEarned = 250 + shotsRemaining * 50;
          setScore((s) => s + pointsEarned);
          setFeedback(`🎯 DIRECT HIT! Target eliminated! (+${pointsEarned} pts)`);

          // Submit score to backend
          gameService.submitScore('projectile-master', { score: pointsEarned, timeTaken: Math.round(p.t) }).catch(() => {});
        }

        // Collision: Ground hit or out of bounds
        if (p.y <= 0 && p.active) {
          p.active = false;
          setIsFiring(false);
          const missDistance = Math.abs(p.x - level.targetX);
          if (missDistance < 15) {
            setFeedback(`Very close! Missed by only ${missDistance.toFixed(1)}m. Slight adjustment needed.`);
          } else if (p.x < level.targetX) {
            setFeedback(`Fell short by ${(level.targetX - p.x).toFixed(1)}m. Increase velocity or optimize angle.`);
          } else {
            setFeedback(`Over-shot target by ${(p.x - level.targetX).toFixed(1)}m. Reduce launch power.`);
          }

          if (shotsRemaining - 1 <= 0 && !levelCleared) {
            setGameOver(true);
          }
        }
      }

      // ----------------------------------------------------
      // Draw Scene
      // ----------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, selectedPlanet.skyColor);
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines (Meters)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 600; x += 50) {
        const cx = originX + x * scaleX;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, canvas.height);
        ctx.stroke();
      }

      // Ground
      ctx.fillStyle = selectedPlanet.groundColor;
      ctx.fillRect(0, originY, canvas.width, canvas.height - originY);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, originY, canvas.width, 4);

      // Draw Obstacle Wall
      if (level.obstacleX && level.obstacleWidth && level.obstacleHeight) {
        const ox = originX + level.obstacleX * scaleX;
        const ow = level.obstacleWidth * scaleX;
        const oh = level.obstacleHeight * scaleY;
        const oy = originY - oh;

        ctx.fillStyle = '#64748b';
        ctx.fillRect(ox, oy, ow, oh);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, ow, oh);

        // Warning stripes
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText('BARRIER', ox + 2, oy + 15);
      }

      // Draw Target
      const tx = originX + level.targetX * scaleX;
      const ty = originY - level.targetY * scaleY;
      const tr = level.targetRadius * scaleX;

      // Outer ring
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Middle ring
      ctx.beginPath();
      ctx.arc(tx, ty, tr * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Bullseye
      ctx.beginPath();
      ctx.arc(tx, ty, tr * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Target Pole
      if (level.targetY > 0) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx, originY);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      // Draw Trajectory Trail
      if (trailRef.current.length > 1) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        trailRef.current.forEach((pt, idx) => {
          const cx = originX + pt.x * scaleX;
          const cy = originY - pt.y * scaleY;
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Cannon
      ctx.save();
      ctx.translate(originX, originY);
      // Cannon Base
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.fill();
      // Cannon Barrel
      ctx.rotate((-angleDeg * Math.PI) / 180);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, -6, 28, 12);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, -6, 28, 12);
      ctx.restore();

      // Draw Flying Projectile Ball
      if (projectileRef.current.active) {
        const px = originX + projectileRef.current.x * scaleX;
        const py = originY - projectileRef.current.y * scaleY;

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedPlanet, angleDeg, velocity, level, shotsRemaining, levelCleared, maxHeightReached]);

  // Clean Exit handler
  const handleExit = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    navigate(ROUTES.GAMES);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-red-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Game</span>
          </Button>
          <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-700" />
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Projectile Master</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                Level {level.level} of {LEVELS.length}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
            <span>Score: {score}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <span>Shots Left:</span>
            <span className="text-primary text-sm font-extrabold">{shotsRemaining}</span>
          </div>
        </div>
      </div>

      {/* Physics Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={960}
          height={400}
          className="w-full h-auto block aspect-[960/400]"
        />

        {/* HUD Overlay in Canvas */}
        <div className="absolute top-3 left-4 flex items-center gap-3 text-xs font-semibold text-white/90 pointer-events-none">
          <span className="bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1">
            <Wind className="h-3.5 w-3.5 text-cyan-400" />
            Wind: {level.windSpeed > 0 ? `+${level.windSpeed} m/s (East)` : level.windSpeed < 0 ? `${level.windSpeed} m/s (West)` : 'Calm (0 m/s)'}
          </span>
          <span className="bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
            Gravity: {selectedPlanet.gravity} m/s² ({selectedPlanet.name})
          </span>
          <span className="bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-amber-300">
            Target: {level.targetX}m range, {level.targetY}m elevation
          </span>
        </div>

        {/* Real-time Telemetry Readout */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[11px] font-mono text-white/80 pointer-events-none">
          <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">
            Current Range: {rangeReached}m
          </span>
          <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">
            Apex: {maxHeightReached}m
          </span>
          <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">
            Flight Time: {flightTime}s
          </span>
        </div>

        {/* Level Complete Overlay */}
        <AnimatePresence>
          {levelCleared && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-20"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-400 mb-1">Target Cleared!</h3>
              <p className="text-sm text-gray-300 max-w-sm mb-4">
                Perfect kinematic calculation. You successfully neutralized the target on {selectedPlanet.name}.
              </p>
              <div className="flex gap-3">
                {currentLevelIdx + 1 < LEVELS.length ? (
                  <Button
                    onClick={() => resetLevel(currentLevelIdx + 1)}
                    className="bg-emerald-500 hover:bg-emerald-600 font-bold px-6 py-2 rounded-xl text-white shadow-lg"
                  >
                    Next Mission (Level {currentLevelIdx + 2})
                  </Button>
                ) : (
                  <Button
                    onClick={handleExit}
                    className="bg-primary hover:bg-primary/90 font-bold px-6 py-2 rounded-xl text-white shadow-lg"
                  >
                    Grand Championship Won! Exit
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Game Over Overlay */}
          {gameOver && !levelCleared && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-20"
            >
              <div className="h-16 w-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mb-3">
                <ShieldAlert className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-red-400 mb-1">Out of Artillery Shells</h3>
              <p className="text-sm text-gray-300 max-w-sm mb-4">
                You used all {level.shotsAllowed} shells without hitting the target. Try re-calculating with the kinematic formula!
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setGameOver(false);
                    resetLevel(currentLevelIdx);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 font-bold px-6 py-2 rounded-xl text-white shadow-lg"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Retry Level {level.level}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExit}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Exit to Games
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Physics Controls Console */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Angle & Velocity Sliders */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <span>Ballistics Calibration Console</span>
            </h4>
            {feedback && (
              <span className="text-xs font-semibold text-primary animate-pulse truncate max-w-xs">
                {feedback}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Launch Angle */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">Launch Angle (θ):</span>
                <span className="text-primary font-mono text-sm">{angleDeg}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="1"
                value={angleDeg}
                disabled={isFiring || levelCleared}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>10° (Flat)</span>
                <span>45° (Max Range)</span>
                <span>85° (Mortar)</span>
              </div>
            </div>

            {/* Launch Velocity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">Muzzle Velocity (v₀):</span>
                <span className="text-primary font-mono text-sm">{velocity} m/s</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                step="1"
                value={velocity}
                disabled={isFiring || levelCleared}
                onChange={(e) => setVelocity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>15 m/s (Low)</span>
                <span>55 m/s (Medium)</span>
                <span>100 m/s (High)</span>
              </div>
            </div>
          </div>

          {/* Fire Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
            {/* Planet Environment Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Planet:</span>
              <div className="flex gap-1.5">
                {PLANETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedPlanet(p)}
                    disabled={isFiring}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      selectedPlanet.name === p.name
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleFire}
              disabled={isFiring || shotsRemaining <= 0 || levelCleared}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isFiring ? 'Shell in Flight...' : 'FIRE CANNON'}</span>
            </Button>
          </div>
        </div>

        {/* Theoretical Physics Helper */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Kinematic Equations (Ideal)</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Standard projectile motion without wind:
          </p>
          <div className="space-y-2 text-xs font-mono bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-500">Max Range R:</span>
              <span className="text-primary font-bold">{theoreticalRange} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Max Apex H:</span>
              <span className="text-emerald-500 font-bold">{theoreticalMaxH} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Flight Time T:</span>
              <span className="text-indigo-500 font-bold">{theoreticalTime} s</span>
            </div>
            <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
              Formula: R = (v₀² sin 2θ) / g
            </div>
          </div>
          <div className="text-[11px] text-gray-400 italic">
            💡 Tip: 45° yields the maximum range in vacuum. Compensate against wind!
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Projectile Master?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your current mission progress and score ({score} pts) will be saved. Timers and animations will be stopped safely.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Stay in Game
                </Button>
                <Button
                  onClick={handleExit}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                >
                  Exit to Games
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
