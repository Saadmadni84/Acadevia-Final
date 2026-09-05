import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Award, Sparkles, Heart, Zap, RotateCcw, AlertTriangle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface DefenderType {
  id: string;
  name: string;
  role: string;
  costATP: number;
  damage: number;
  range: number;
  fireRate: number; // shots per sec
  color: string;
  icon: string;
  desc: string;
}

const DEFENDERS: DefenderType[] = [
  { id: 'ribosome', name: 'Ribosome Turret', role: 'Rapid Antiviral Peptides', costATP: 60, damage: 15, range: 110, fireRate: 2.2, color: '#3b82f6', icon: '🧬', desc: 'Synthesizes antimicrobial peptides with high firing rate.' },
  { id: 'lysosome', name: 'Lysosome Digestor', role: 'Enzymatic Acid Spray', costATP: 90, damage: 45, range: 85, fireRate: 1.0, color: '#10b981', icon: '🧪', desc: 'Releases hydrolytic enzymes that break down bacterial walls.' },
  { id: 'macrophage', name: 'Macrophage Guard', role: 'Phagocytosis Heavy Strike', costATP: 130, damage: 95, range: 75, fireRate: 0.7, color: '#f59e0b', icon: '🛡️', desc: 'Engulfs and neutralizes heavy pathogen invaders.' },
  { id: 'mitochondria', name: 'Mitochondria Plant', role: 'ATP Energy Generator', costATP: 75, damage: 0, range: 0, fireRate: 0, color: '#ec4899', icon: '⚡', desc: 'Generates +8 ATP every 3 seconds for the cell.' },
];

interface PlacedDefender {
  x: number;
  y: number;
  type: DefenderType;
  lastShotTime: number;
}

interface Pathogen {
  id: number;
  name: string;
  x: number;
  y: number;
  maxHp: number;
  hp: number;
  speed: number;
  rewardATP: number;
  icon: string;
}

export const CellDefender: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game economy and health
  const [atp, setAtp] = useState(180);
  const [cellHealth, setCellHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedDefender, setSelectedDefender] = useState<DefenderType>(DEFENDERS[0]);
  const [placedDefenders, setPlacedDefenders] = useState<PlacedDefender[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Game entities refs for canvas render loop
  const defendersRef = useRef<PlacedDefender[]>([]);
  defendersRef.current = placedDefenders;

  const pathogensRef = useRef<Pathogen[]>([]);
  const projectilesRef = useRef<{ x: number; y: number; targetId: number; damage: number; color: string }[]>([]);
  const nextPathogenId = useRef(1);
  const waveSpawningRef = useRef(false);

  // Periodic passive ATP generation from mitochondria
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const interval = setInterval(() => {
      const mitoCount = defendersRef.current.filter((d) => d.type.id === 'mitochondria').length;
      setAtp((a) => a + 5 + mitoCount * 8);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGameOver, isVictory]);

  // Spawn Pathogen Wave
  const startWave = useCallback((currentWave: number) => {
    waveSpawningRef.current = true;
    let spawned = 0;
    const count = 6 + currentWave * 4;

    const spawner = setInterval(() => {
      if (spawned >= count) {
        clearInterval(spawner);
        waveSpawningRef.current = false;
        return;
      }

      spawned++;
      const isBacteria = spawned % 3 === 0;
      const pathogen: Pathogen = {
        id: nextPathogenId.current++,
        name: isBacteria ? 'Streptococcus Bacteria' : 'Influenza Virus',
        x: 0,
        y: 100 + Math.random() * 180,
        maxHp: 50 + currentWave * 25,
        hp: 50 + currentWave * 25,
        speed: isBacteria ? 35 : 55,
        rewardATP: isBacteria ? 25 : 15,
        icon: isBacteria ? '🦠' : '👾',
      };
      pathogensRef.current.push(pathogen);
    }, 1200);
  }, []);

  // Initialize Wave 1
  useEffect(() => {
    startWave(1);
  }, [startWave]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // 1. Move Pathogens along cytoplasm towards nucleus on the right
      const nucleusX = canvas.width - 60;
      pathogensRef.current.forEach((pathogen) => {
        pathogen.x += pathogen.speed * dt;

        // Pathogen reaches nucleus: damage cell health
        if (pathogen.x >= nucleusX) {
          pathogen.hp = 0;
          setCellHealth((h) => {
            const nextH = Math.max(0, h - 12);
            if (nextH <= 0) setIsGameOver(true);
            return nextH;
          });
        }
      });

      // 2. Defender Tower Targeting & Shooting
      defendersRef.current.forEach((defender) => {
        if (defender.type.damage === 0) return; // mitochondria produces ATP only

        if (now - defender.lastShotTime >= 1000 / defender.type.fireRate) {
          // Find closest pathogen in range
          let closestDist = defender.type.range;
          let targetPathogen: Pathogen | null = null;

          pathogensRef.current.forEach((p) => {
            const dist = Math.hypot(p.x - defender.x, p.y - defender.y);
            if (dist <= closestDist) {
              closestDist = dist;
              targetPathogen = p;
            }
          });

          if (targetPathogen) {
            defender.lastShotTime = now;
            projectilesRef.current.push({
              x: defender.x,
              y: defender.y,
              targetId: (targetPathogen as Pathogen).id,
              damage: defender.type.damage,
              color: defender.type.color,
            });
          }
        }
      });

      // 3. Update Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];
        const target = pathogensRef.current.find((p) => p.id === proj.targetId);

        if (!target) {
          projectilesRef.current.splice(i, 1);
          continue;
        }

        const angle = Math.atan2(target.y - proj.y, target.x - proj.x);
        proj.x += Math.cos(angle) * 320 * dt;
        proj.y += Math.sin(angle) * 320 * dt;

        // Hit target
        if (Math.hypot(target.x - proj.x, target.y - proj.y) < 12) {
          target.hp -= proj.damage;
          projectilesRef.current.splice(i, 1);

          if (target.hp <= 0) {
            setScore((s) => s + target.rewardATP * 10);
            setAtp((a) => a + target.rewardATP);
          }
        }
      }

      // Filter dead pathogens
      pathogensRef.current = pathogensRef.current.filter((p) => p.hp > 0);

      // Check wave clear
      if (pathogensRef.current.length === 0 && !waveSpawningRef.current && !isGameOver) {
        if (wave >= 5) {
          setIsVictory(true);
          gameService.submitScore('cell-defender', { score: score + 500, timeTaken: 120 }).catch(() => {});
        } else {
          setWave((w) => {
            const nextW = w + 1;
            startWave(nextW);
            return nextW;
          });
        }
      }

      // --------------------------------------------------
      // Render Scene
      // --------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cytoplasm Gel Background
      const cytoGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      cytoGrad.addColorStop(0, '#064e3b');
      cytoGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = cytoGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cellular Cytoskeleton Filaments (Decorative)
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < canvas.width; i += 70) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 30, canvas.height / 2, i - 20, canvas.height / 2, i + 10, canvas.height);
        ctx.stroke();
      }

      // Cell Membrane (Left Entrance)
      ctx.fillStyle = '#059669';
      ctx.fillRect(0, 0, 18, canvas.height);
      ctx.fillStyle = '#34d399';
      for (let y = 10; y < canvas.height; y += 24) {
        ctx.beginPath();
        ctx.arc(8, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nucleus Vault (Right Target)
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.arc(nucleusX + 40, canvas.height / 2, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Nucleus Label
      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('NUCLEUS', nucleusX - 10, canvas.height / 2 + 4);

      // Draw Range circles for selected defender under placement
      // (rendered when placing)

      // Draw Placed Defenders
      defendersRef.current.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = d.type.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.type.icon, d.x, d.y);
      });

      // Draw Pathogens
      pathogensRef.current.forEach((p) => {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.icon, p.x, p.y);

        // HP Bar
        const barW = 28;
        const hpPct = p.hp / p.maxHp;
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(p.x - barW / 2, p.y - 18, barW, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x - barW / 2, p.y - 18, barW * hpPct, 4);
      });

      // Draw Projectiles
      projectilesRef.current.forEach((proj) => {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = proj.color;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [wave, isGameOver, isVictory, startWave, score]);

  // Click canvas to place defender
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver || isVictory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Must place within cytoplasm area (away from membrane entrance & nucleus)
    if (x < 40 || x > canvas.width - 100) return;

    if (atp < selectedDefender.costATP) return;

    // Check collision with already placed defenders
    const overlap = placedDefenders.some((d) => Math.hypot(d.x - x, d.y - y) < 40);
    if (overlap) return;

    setAtp((a) => a - selectedDefender.costATP);
    setPlacedDefenders((prev) => [
      ...prev,
      { x, y, type: selectedDefender, lastShotTime: 0 },
    ]);
  };

  const handleRestart = () => {
    setAtp(180);
    setCellHealth(100);
    setWave(1);
    setScore(0);
    setPlacedDefenders([]);
    pathogensRef.current = [];
    projectilesRef.current = [];
    setIsGameOver(false);
    setIsVictory(false);
    startWave(1);
  };

  const handleExit = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    navigate(ROUTES.GAMES);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 select-none">
      {/* Top Navigation & Status */}
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
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Cell Defender: Immune Assault</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold">
              Wave {wave} / 5
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          {/* Health */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300/40 text-red-600 dark:text-red-400">
            <Heart className="h-4 w-4 fill-current" />
            <span>Cell Health: {cellHealth}%</span>
          </div>

          {/* ATP */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4 fill-current" />
            <span>ATP: {atp}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300/40 text-purple-600 dark:text-purple-400">
            <Award className="h-4 w-4" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Battlefield Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-emerald-950">
        <canvas
          ref={canvasRef}
          width={900}
          height={400}
          onClick={handleCanvasClick}
          className="w-full h-auto block aspect-[900/400] cursor-crosshair"
        />

        {/* Victory Screen */}
        <AnimatePresence>
          {isVictory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-30 space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-emerald-400">Cell Defended Successfully!</h3>
              <p className="text-sm text-gray-300 max-w-md">
                All 5 pathogen infection waves repelled! Your organelles maintained cellular integrity and earned {score + 500} pts!
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleRestart}
                  className="bg-emerald-500 hover:bg-emerald-600 font-bold px-6 py-2.5 rounded-xl text-black shadow-lg"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Play Again
                </Button>
                <Button
                  onClick={handleExit}
                  className="bg-primary hover:bg-primary/90 font-bold px-6 py-2.5 rounded-xl text-white shadow-lg"
                >
                  Exit to Games
                </Button>
              </div>
            </motion.div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-30 space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-red-400">Cell Nucleus Breached!</h3>
              <p className="text-sm text-gray-300 max-w-md">
                Pathogens penetrated into the nucleus and disrupted cellular division. Deploy more ribosomes and lysosomes early!
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleRestart}
                  className="bg-emerald-500 hover:bg-emerald-600 font-bold px-6 py-2.5 rounded-xl text-black shadow-lg"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Retry Defense
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExit}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Exit to Games
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Organelle Deployment Bar */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Deploy Cell Organelles</span>
            <span className="text-xs font-normal text-gray-400">(Click an organelle, then click the cytoplasm to place)</span>
          </h4>
          <span className="text-xs font-semibold text-amber-500">Available ATP: {atp}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEFENDERS.map((def) => {
            const isSelected = selectedDefender.id === def.id;
            const canAfford = atp >= def.costATP;

            return (
              <button
                key={def.id}
                type="button"
                onClick={() => setSelectedDefender(def)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-md scale-105'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 hover:border-gray-300'
                } ${!canAfford ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{def.icon}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    {def.costATP} ATP
                  </span>
                </div>
                <h5 className="font-bold text-xs text-gray-900 dark:text-white truncate">{def.name}</h5>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{def.desc}</p>
              </button>
            );
          })}
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Cell Defender?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your score of {score} pts will be preserved. Active waves will be halted safely.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Keep Defending
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
