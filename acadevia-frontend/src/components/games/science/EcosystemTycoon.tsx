import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TreePine, Award, Sparkles, Sun, CloudRain, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface SpeciesTier {
  id: string;
  name: string;
  category: 'producer' | 'herbivore' | 'carnivore' | 'apex';
  count: number;
  icon: string;
  costBio: number;
  feedRequirement: string;
  color: string;
}

export const EcosystemTycoon: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Environmental Parameters
  const [sunlight, setSunlight] = useState(70); // %
  const [rainfall, setRainfall] = useState(60); // %

  // Biomass Energy Points
  const [biomass, setBiomass] = useState(300);

  // Species Populations
  const [producers, setProducers] = useState(120); // Grass/Plants
  const [herbivores, setHerbivores] = useState(35); // Rabbits/Deer
  const [carnivores, setCarnivores] = useState(12); // Foxes/Snakes
  const [apex, setApex] = useState(3); // Wolves/Hawks

  const [ecosystemHealth, setEcosystemHealth] = useState(85);
  const [score, setScore] = useState(0);
  const [cycleDay, setCycleDay] = useState(1);
  const [isSimulating, setIsSimulating] = useState(true);
  const [eventAlert, setEventAlert] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Simulation tick (Every 2.5s = 1 ecosystem cycle day)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setCycleDay((d) => d + 1);

      // 1. Producers grow based on sunlight + rainfall, eaten by herbivores
      setProducers((p) => {
        const growthFactor = (sunlight / 100) * (rainfall / 100) * 35;
        const eatenByHerbivores = herbivores * 0.8;
        const newP = Math.max(10, Math.min(250, Math.round(p + growthFactor - eatenByHerbivores)));
        return newP;
      });

      // 2. Herbivores thrive if producers > herbivores * 2, hunted by carnivores
      setHerbivores((h) => {
        const foodAvailable = producers > h * 2;
        const huntedByCarnivores = carnivores * 0.6;
        const delta = foodAvailable ? 3 : -5;
        const newH = Math.max(2, Math.min(100, Math.round(h + delta - huntedByCarnivores)));
        return newH;
      });

      // 3. Carnivores thrive if herbivores > carnivores * 2, hunted/limited by apex
      setCarnivores((c) => {
        const preyAvailable = herbivores > c * 2;
        const eatenByApex = apex * 0.4;
        const delta = preyAvailable ? 1.5 : -3;
        const newC = Math.max(1, Math.min(40, Math.round(c + delta - eatenByApex)));
        return newC;
      });

      // 4. Apex predators require carnivores + herbivores
      setApex((a) => {
        const preyAvailable = carnivores >= a * 2;
        const delta = preyAvailable ? 0.6 : -1;
        const newA = Math.max(1, Math.min(15, Math.round(a + delta)));
        return newA;
      });

      // 5. Calculate ecosystem health & score
      setEcosystemHealth(() => {
        // Ideal pyramid: producers >> herbivores >> carnivores >> apex
        let health = 100;
        if (producers < 30) health -= 25; // Overgrazed
        if (herbivores < 5) health -= 20; // Herbivores starving
        if (carnivores < 2) health -= 15; // Predator collapse
        if (producers > 220 && herbivores < 10) health -= 15; // Stagnation

        const earned = Math.max(10, Math.round(health * 0.5));
        setScore((s) => s + earned);
        setBiomass((b) => b + Math.round(health * 0.2));

        if (health >= 80) {
          setEventAlert('🌿 Trophic equilibrium achieved: 10% energy pyramid running optimally!');
        } else if (producers < 30) {
          setEventAlert('⚠️ Warning: Overgrazing! Producers depleted. Increase rainfall or introduce predators.');
        } else if (herbivores < 5) {
          setEventAlert('⚠️ Warning: Herbivores on the brink of extinction! Provide more plant food.');
        }

        return Math.max(10, Math.min(100, health));
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isSimulating, sunlight, rainfall, producers, herbivores, carnivores, apex]);

  // Introduce species actions
  const addSpecies = (type: 'producer' | 'herbivore' | 'carnivore' | 'apex') => {
    if (type === 'producer' && biomass >= 30) {
      setBiomass((b) => b - 30);
      setProducers((p) => Math.min(250, p + 25));
    } else if (type === 'herbivore' && biomass >= 50) {
      setBiomass((b) => b - 50);
      setHerbivores((h) => Math.min(100, h + 8));
    } else if (type === 'carnivore' && biomass >= 80) {
      setBiomass((b) => b - 80);
      setCarnivores((c) => Math.min(40, c + 3));
    } else if (type === 'apex' && biomass >= 120) {
      setBiomass((b) => b - 120);
      setApex((a) => Math.min(15, a + 1));
    }
  };

  const handleRestart = () => {
    setSunlight(70);
    setRainfall(60);
    setBiomass(300);
    setProducers(120);
    setHerbivores(35);
    setCarnivores(12);
    setApex(3);
    setEcosystemHealth(85);
    setScore(0);
    setCycleDay(1);
    setEventAlert(null);
  };

  const handleExit = () => {
    setIsSimulating(false);
    gameService.submitScore('ecosystem-tycoon', { score, timeTaken: cycleDay * 3 }).catch(() => {});
    navigate(ROUTES.GAMES);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 select-none">
      {/* Top Header */}
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
            <TreePine className="h-4 w-4 text-emerald-500" />
            <span>Ecosystem Tycoon: Food Web Balance</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold">
              Day {cycleDay}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Biome Health: {ecosystemHealth}%</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Trophic Pyramid Display Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Trophic Level 4: Apex Predators */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🦅</span>
            <span className="text-xs font-bold text-red-500">Apex Predators</span>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900 dark:text-white">{apex}</span>
            <p className="text-[11px] text-gray-400">Wolves & Hawks</p>
          </div>
          <button
            type="button"
            onClick={() => addSpecies('apex')}
            disabled={biomass < 120}
            className="w-full py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 font-bold text-xs hover:bg-red-100 transition disabled:opacity-50"
          >
            +1 Apex (-120 Bio)
          </button>
        </div>

        {/* Trophic Level 3: Secondary Consumers */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🦊</span>
            <span className="text-xs font-bold text-amber-500">Secondary Consumers</span>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900 dark:text-white">{carnivores}</span>
            <p className="text-[11px] text-gray-400">Foxes & Snakes</p>
          </div>
          <button
            type="button"
            onClick={() => addSpecies('carnivore')}
            disabled={biomass < 80}
            className="w-full py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition disabled:opacity-50"
          >
            +3 Carnivores (-80 Bio)
          </button>
        </div>

        {/* Trophic Level 2: Primary Consumers */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🦌</span>
            <span className="text-xs font-bold text-blue-500">Primary Consumers</span>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900 dark:text-white">{herbivores}</span>
            <p className="text-[11px] text-gray-400">Rabbits & Deer</p>
          </div>
          <button
            type="button"
            onClick={() => addSpecies('herbivore')}
            disabled={biomass < 50}
            className="w-full py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition disabled:opacity-50"
          >
            +8 Herbivores (-50 Bio)
          </button>
        </div>

        {/* Trophic Level 1: Producers */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🌱</span>
            <span className="text-xs font-bold text-emerald-500">Producers (Flora)</span>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900 dark:text-white">{producers}</span>
            <p className="text-[11px] text-gray-400">Wildflowers & Shrubs</p>
          </div>
          <button
            type="button"
            onClick={() => addSpecies('producer')}
            disabled={biomass < 30}
            className="w-full py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition disabled:opacity-50"
          >
            +25 Flora (-30 Bio)
          </button>
        </div>
      </div>

      {/* Environmental Controls & Ecosystem Event Alert */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        {eventAlert && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{eventAlert}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sunlight Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Solar Radiation (Photosynthesis):</span>
              </span>
              <span className="text-amber-500 font-mono text-sm">{sunlight}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={sunlight}
              onChange={(e) => setSunlight(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <CloudRain className="h-4 w-4 text-blue-500" />
                <span>Precipitation (Soil Hydration):</span>
              </span>
              <span className="text-blue-500 font-mono text-sm">{rainfall}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span className="font-mono">
            Available Biomass Energy: <strong className="text-emerald-500 font-bold">{biomass} pts</strong>
          </span>
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Biome</span>
          </button>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit Ecosystem Tycoon?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your ecosystem score of {score} pts will be saved to your profile.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Keep Simulating
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
