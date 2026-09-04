import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Flame,
  Shield,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type {
  RunnerLane,
  MathChallengeGate,
  CollectibleCoin,
  ActivePowerup,
  PlayerStats,
  BossState,
  ZoneConfig,
} from './runnerTypes';
import { ZONES, generateObstacleGate } from './runnerGenerator';

interface VedicMathRushGameProps {
  classGrade?: number;
  onExitGame: () => void;
  onSaveProgress?: (stats: { score: number; distance: number; coins: number }) => void;
}

export const VedicMathRushGame: React.FC<VedicMathRushGameProps> = ({
  classGrade = 8,
  onExitGame,
  onSaveProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'game' | 'dojo' | 'upgrades'>('game');

  // Player Run State
  const [lane, setLane] = useState<RunnerLane>(1); // 0: Left, 1: Center, 2: Right
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [health, setHealth] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [bestCombo, setBestCombo] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [calculationsCount, setCalculationsCount] = useState<number>(0);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active shortcut tooltip (when mistake or near-base happens)
  const [activeHint, setActiveHint] = useState<{
    prompt: string;
    technique: string;
    hint: string;
  } | null>(null);

  // Boss Battle State (Triggered every 1500m)
  const [boss, setBoss] = useState<BossState | null>(null);

  // Track Objects
  const gatesRef = useRef<MathChallengeGate[]>([]);
  const coinsRef = useRef<CollectibleCoin[]>([]);
  const playerLaneRef = useRef<RunnerLane>(1);
  const playerJumpRef = useRef<boolean>(false);
  const playerSlideRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1.0);
  const distanceRef = useRef<number>(0);
  const healthRef = useRef<number>(3);
  const comboRef = useRef<number>(0);
  const activeHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs synced with states
  useEffect(() => {
    playerLaneRef.current = lane;
  }, [lane]);
  useEffect(() => {
    playerJumpRef.current = isJumping;
  }, [isJumping]);
  useEffect(() => {
    playerSlideRef.current = isSliding;
  }, [isSliding]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);
  useEffect(() => {
    healthRef.current = health;
  }, [health]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  // Current Zone computation
  const currentZone: ZoneConfig =
    ZONES.slice()
      .reverse()
      .find((z) => distance >= z.minDistance) || ZONES[0];

  // Touch Swipe Handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isPlaying) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0) moveRight();
        else moveLeft();
      } else {
        if (dy < 0) jump();
        else slide();
      }
    }
    touchStartRef.current = null;
  };

  // Lane movement functions
  const moveLeft = useCallback(() => {
    setLane((prev) => (prev > 0 ? ((prev - 1) as RunnerLane) : 0));
  }, []);

  const moveRight = useCallback(() => {
    setLane((prev) => (prev < 2 ? ((prev + 1) as RunnerLane) : 2));
  }, []);

  const jump = useCallback(() => {
    if (isJumping || isSliding) return;
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 550);
  }, [isJumping, isSliding]);

  const slide = useCallback(() => {
    if (isSliding || isJumping) return;
    setIsSliding(true);
    setTimeout(() => setIsSliding(false), 550);
  }, [isSliding, isJumping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || showExitConfirm) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        slide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, showExitConfirm, moveLeft, moveRight, jump, slide]);

  // Main Game Loop Canvas Render
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let gateSpawnDistance = 0;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update distance & speed
      const distDelta = dt * 15 * speedRef.current;
      distanceRef.current += distDelta;
      setDistance(Math.floor(distanceRef.current));

      // Gradual speed acceleration
      speedRef.current = Math.min(3.2, 1.0 + distanceRef.current / 3000);
      setSpeed(Number(speedRef.current.toFixed(2)));

      // Spawn gates every 50 distance units
      gateSpawnDistance += distDelta;
      if (gateSpawnDistance > 45) {
        gateSpawnDistance = 0;
        const newGate = generateObstacleGate(
          Math.floor(distanceRef.current),
          currentZone,
          classGrade
        );
        gatesRef.current.push(newGate);

        // Also spawn coins
        const coinLane = (Math.floor(Math.random() * 3)) as RunnerLane;
        coinsRef.current.push({
          id: `coin-${Date.now()}`,
          z: 110,
          lane: coinLane,
        });
      }

      // Update gates position & collision
      for (let i = gatesRef.current.length - 1; i >= 0; i--) {
        const gate = gatesRef.current[i];
        gate.z -= dt * 25 * speedRef.current;

        // Collision Check (when gate reaches player z ~ 10-15)
        if (gate.z <= 12 && !gate.passed) {
          gate.passed = true;
          const playerChosenLane = playerLaneRef.current;
          const chosenOption = gate.lanes[playerChosenLane];

          if (chosenOption.isCorrect) {
            // PASS OBSTACLE!
            const newCombo = comboRef.current + 1;
            setCombo(newCombo);
            comboRef.current = newCombo;
            setBestCombo((prev) => Math.max(prev, newCombo));
            setScore((s) => s + 50 * Math.min(5, Math.floor(newCombo / 3) + 1));
            setCoins((c) => c + 5);
            setCalculationsCount((c) => c + 1);

            // Boss damage if boss active
            setBoss((prevBoss) => {
              if (!prevBoss) return null;
              const nextHealth = prevBoss.currentHealth - 25;
              if (nextHealth <= 0) return null;
              return { ...prevBoss, currentHealth: nextHealth };
            });
          } else {
            // HIT OBSTACLE!
            const nextHealth = healthRef.current - 1;
            healthRef.current = nextHealth;
            setHealth(nextHealth);
            setCombo(0);
            comboRef.current = 0;

            // Display Vedic formula popup so student immediately learns
            setActiveHint({
              prompt: gate.prompt,
              technique: gate.techniqueName,
              hint: gate.formulaHint,
            });
            if (activeHintTimeoutRef.current) clearTimeout(activeHintTimeoutRef.current);
            activeHintTimeoutRef.current = setTimeout(() => {
              setActiveHint(null);
            }, 3000);

            if (nextHealth <= 0) {
              setIsPlaying(false);
              setIsGameOver(true);
              return;
            }
          }
        }

        if (gate.z < -10) {
          gatesRef.current.splice(i, 1);
        }
      }

      // Update coins
      for (let i = coinsRef.current.length - 1; i >= 0; i--) {
        const c = coinsRef.current[i];
        c.z -= dt * 25 * speedRef.current;
        if (c.z <= 12 && c.z >= 5 && !c.collected && c.lane === playerLaneRef.current) {
          c.collected = true;
          setCoins((val) => val + 1);
          setScore((s) => s + 10);
        }
        if (c.z < -10) {
          coinsRef.current.splice(i, 1);
        }
      }

      // -------------------------------------------------------------
      // DRAW 2.5D ARCADE RUNNER GRAPHICS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Dynamic Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, '#0F172A');
      skyGrad.addColorStop(1, currentZone.groundColor);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Horizon & Ground (Perspective 3D Runway)
      const horizonY = h * 0.45;
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      groundGrad.addColorStop(0, '#020617');
      groundGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // 3 Perspective Lanes
      const getLaneX = (l: RunnerLane, z: number) => {
        const factor = (100 - z) / 100;
        const topW = w * 0.25;
        const botW = w * 0.85;
        const currentTrackW = topW + (botW - topW) * factor;
        const startX = (w - currentTrackW) / 2;
        const laneW = currentTrackW / 3;
        return startX + laneW * l + laneW / 2;
      };

      const getZScreenY = (z: number) => {
        const factor = Math.max(0, Math.min(1, (100 - z) / 100));
        return horizonY + (h - horizonY) * (factor * factor);
      };

      // Draw Grid Lines / Perspective Track
      ctx.strokeStyle = currentZone.themeColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      for (let l = 0; l <= 3; l++) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + (l - 1.5) * (w * 0.08), horizonY);
        ctx.lineTo(w / 2 + (l - 1.5) * (w * 0.28), h);
        ctx.stroke();
      }

      // Moving Speed Lines on Track
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#FFFFFF';
      const offset = (distanceRef.current * 10) % 50;
      for (let dist = offset; dist < 100; dist += 20) {
        const y = getZScreenY(dist);
        ctx.beginPath();
        ctx.moveTo(getLaneX(0, dist) - 30, y);
        ctx.lineTo(getLaneX(2, dist) + 30, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Draw Floating Math Glyphs in Environment
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('√x', w * 0.1, horizonY - 30);
      ctx.fillText('n²', w * 0.85, horizonY - 45);
      ctx.fillText('100-x', w * 0.75, horizonY - 70);

      // Draw Approaching Gates (from far to near)
      const sortedGates = [...gatesRef.current].sort((a, b) => b.z - a.z);
      for (const gate of sortedGates) {
        if (gate.z > 100 || gate.z < 0) continue;
        const y = getZScreenY(gate.z);
        const scale = Math.max(0.3, (100 - gate.z) / 100);

        // Gate Portal Arch Banner above lanes
        const archW = w * 0.75 * scale;
        const archX = (w - archW) / 2;
        const archY = y - 65 * scale;

        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = currentZone.themeColor;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.roundRect(archX, archY, archW, 35 * scale, [10 * scale]);
        ctx.fill();
        ctx.stroke();

        // Gate Math Prompt Text
        ctx.fillStyle = '#F8FAFC';
        ctx.font = `black ${Math.max(12, Math.floor(18 * scale))}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(gate.prompt, w / 2, archY + 22 * scale);

        // 3 Path Option Portals
        for (let l = 0; l < 3; l++) {
          const laneX = getLaneX(l as RunnerLane, gate.z);
          const option = gate.lanes[l];
          const boxW = 75 * scale;
          const boxH = 45 * scale;

          ctx.fillStyle = '#0F172A';
          ctx.strokeStyle = option.isCorrect ? '#10B981' : '#F43F5E';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.roundRect(laneX - boxW / 2, y - boxH / 2, boxW, boxH, [8 * scale]);
          ctx.fill();
          ctx.stroke();

          // Option Value Text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.max(11, Math.floor(16 * scale))}px monospace`;
          ctx.fillText(String(option.value), laneX, y + 5 * scale);
        }
      }

      // Draw Collectible Coins
      for (const coin of coinsRef.current) {
        if (coin.z > 100 || coin.z < 0 || coin.collected) continue;
        const cx = getLaneX(coin.lane, coin.z);
        const cy = getZScreenY(coin.z);
        const radius = 10 * ((100 - coin.z) / 100);

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Player Runner Avatar (At Bottom z ~ 8)
      const playerX = getLaneX(playerLaneRef.current, 8);
      let playerY = h * 0.88;
      if (playerJumpRef.current) playerY -= 45;
      if (playerSlideRef.current) playerY += 15;

      // Player Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(playerX, h * 0.90, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Runner Avatar Emoji / Body
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        playerJumpRef.current
          ? '🦘'
          : playerSlideRef.current
          ? '🛹'
          : '🏃‍♂️',
        playerX,
        playerY
      );

      // Speed Exhaust Fire Trail
      if (speedRef.current > 1.4) {
        ctx.font = '18px sans-serif';
        ctx.fillText('🔥', playerX, playerY + 15);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, classGrade, currentZone]);

  const handleStartGame = () => {
    setHealth(3);
    setScore(0);
    setCoins(0);
    setDistance(0);
    setCombo(0);
    setSpeed(1.0);
    setCalculationsCount(0);
    gatesRef.current = [];
    coinsRef.current = [];
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-slate-950 text-white p-2 sm:p-4 select-none relative flex flex-col justify-between"
    >
      {/* TOP HEADER HUD */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-2 p-2 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md z-30 shadow-lg">
        {/* Left Stats */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-black shadow-md">
            ⚡
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              {currentZone.name}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-4 w-4 ${
                    i < health
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Live Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-black">
          <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5">
            <span className="text-amber-400">🏃</span>
            <span>{distance}m</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5">
            <span className="text-yellow-400">🪙</span>
            <span>{coins}</span>
          </div>

          <div
            className={`px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
              combo >= 3
                ? 'bg-amber-500 text-white animate-pulse shadow-md'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{combo}x Combo</span>
          </div>

          <div className="hidden sm:flex px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>{score} PTS</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isPlaying) setShowExitConfirm(true);
              else onExitGame();
            }}
            className="rounded-xl border-rose-800 text-rose-400 hover:bg-rose-950/60 font-bold text-xs cursor-pointer"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* ACTIVE RUNNER VIEWPORT */}
      <div className="relative max-w-5xl mx-auto w-full my-2 flex-1 flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-slate-800 bg-slate-950 shadow-2xl">
        {/* Real-time Arcade Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full h-full max-h-[520px] object-cover rounded-3xl"
        />

        {/* Floating Instant Vedic Shortcut Tooltip on Mistake */}
        <AnimatePresence>
          {activeHint && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 right-4 max-w-md mx-auto p-3.5 rounded-2xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl backdrop-blur-md text-xs space-y-1 z-40"
            >
              <div className="flex items-center justify-between text-amber-400 font-black uppercase text-[10px]">
                <span>💡 {activeHint.technique}</span>
                <span>{activeHint.prompt}</span>
              </div>
              <p className="font-mono font-bold text-white text-sm">
                {activeHint.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Game Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-6 z-40">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>3D Arcade Mental Mathematics</span>
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                Vedic Math Rush
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 max-w-md">
                Calculate Fast. Move Faster. Run through multiplication gates, square crystals, and root towers!
              </p>
            </div>

            {/* Arcade Controls Guide */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm w-full text-xs space-y-2">
              <p className="font-black text-amber-400 uppercase tracking-widest text-[10px]">
                Controls
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2 rounded-xl bg-slate-800">
                  <span className="font-bold text-white block">← / → or A / D</span>
                  <span className="text-[10px] text-slate-400">Change Lanes</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800">
                  <span className="font-bold text-white block">↑ or Space</span>
                  <span className="text-[10px] text-slate-400">Jump Barrier</span>
                </div>
              </div>
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartGame}
              className="px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <span>START RUN 🚀</span>
            </Button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5 z-40">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-3xl font-black border border-rose-500/40">
              💥
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white">RUN COMPLETE!</h2>
              <p className="text-xs text-slate-400">
                You dashed through {currentZone.name}
              </p>
            </div>

            {/* Run Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg w-full text-left">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-black text-slate-500">Distance</span>
                <p className="text-lg font-black text-white">{distance}m</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-black text-slate-500">Score</span>
                <p className="text-lg font-black text-amber-400">{score}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-black text-slate-500">Coins</span>
                <p className="text-lg font-black text-yellow-400">{coins}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-black text-slate-500">Calculations</span>
                <p className="text-lg font-black text-emerald-400">{calculationsCount}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="gradient"
                size="md"
                onClick={handleStartGame}
                className="font-black px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white cursor-pointer shadow-lg"
              >
                <RotateCcw className="h-4 w-4" />
                <span>RUN AGAIN</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={onExitGame}
                className="font-bold px-6 rounded-xl border-slate-700 text-slate-300 cursor-pointer"
              >
                <span>EXIT</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ON-SCREEN RESPONSIVE TOUCHPAD (Mobile & Tablet) */}
      <div className="max-w-md mx-auto w-full grid grid-cols-4 gap-2 pt-1 pb-2">
        <button
          type="button"
          onClick={moveLeft}
          className="h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-amber-500 active:text-white flex items-center justify-center text-slate-300 font-black transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={jump}
          className="h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-amber-500 active:text-white flex items-center justify-center text-slate-300 font-black transition cursor-pointer"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={slide}
          className="h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-amber-500 active:text-white flex items-center justify-center text-slate-300 font-black transition cursor-pointer"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={moveRight}
          className="h-12 rounded-xl bg-slate-900 border border-slate-800 active:bg-amber-500 active:text-white flex items-center justify-center text-slate-300 font-black transition cursor-pointer"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-800 text-center space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-black text-white">Leave this run?</h3>
              <p className="text-xs text-slate-400">
                Your current run distance and streak will end.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setShowExitConfirm(false)}
                  className="bg-emerald-500 font-bold rounded-xl cursor-pointer"
                >
                  Continue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExitGame}
                  className="border-rose-700 text-rose-400 font-bold rounded-xl cursor-pointer"
                >
                  Exit
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
