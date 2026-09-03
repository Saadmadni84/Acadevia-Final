import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  Droplets,
  Flame,
  Snowflake,
  Footprints,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface WaterWorldGameProps {
  onComplete: () => void;
}

type ObjectiveStep = 1 | 2 | 3 | 4 | 5 | 6;

interface WorldStation {
  id: 'lake' | 'solar_heater' | 'cloud_cooling' | 'water_gate' | 'village_reservoir';
  name: string;
  icon: string;
  pos: { x: number; y: number }; // percentage
  radius: number; // interaction threshold
  actionVerb: string;
  targetStep: ObjectiveStep;
}

const STATIONS: WorldStation[] = [
  {
    id: 'lake',
    name: 'Freshwater Mountain Lake',
    icon: '🌊',
    pos: { x: 18, y: 28 },
    radius: 14,
    actionVerb: 'Collect 40L Water',
    targetStep: 1,
  },
  {
    id: 'solar_heater',
    name: 'Thermal Solar Furnace',
    icon: '🔥',
    pos: { x: 44, y: 32 },
    radius: 14,
    actionVerb: 'Heat Water to 100°C',
    targetStep: 2,
  },
  {
    id: 'cloud_cooling',
    name: 'Mountain Peak Cooling Station',
    icon: '❄️',
    pos: { x: 76, y: 22 },
    radius: 14,
    actionVerb: 'Cool Atmosphere & Condense',
    targetStep: 3,
  },
  {
    id: 'water_gate',
    name: 'Aqueduct Channel Sluice Gate',
    icon: '🚪',
    pos: { x: 62, y: 70 },
    radius: 14,
    actionVerb: 'Open Sluice Gate',
    targetStep: 4,
  },
  {
    id: 'village_reservoir',
    name: 'Drought-Stricken Village Reservoir',
    icon: '🚰',
    pos: { x: 86, y: 78 },
    radius: 14,
    actionVerb: 'Verify Village Reservoir Storage',
    targetStep: 5,
  },
];

export const WaterWorldGame: React.FC<WaterWorldGameProps> = ({ onComplete }) => {
  // Player Position in world percentage
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 14, y: 70 });
  const [isMoving, setIsMoving] = useState(false);

  // Progressive Gameplay Objectives (1 to 6)
  const [currentStep, setCurrentStep] = useState<ObjectiveStep>(1);

  // Player Inventory / Holding State
  const [hasBucket, setHasBucket] = useState(false);
  const [bucketWaterVolume, setBucketWaterVolume] = useState<number>(0); // 0 to 40 Liters

  // Environmental World State
  const [furnaceTemperature, setFurnaceTemperature] = useState<number>(25); // Celsius
  const [vapourCreated, setVapourCreated] = useState<boolean>(false);
  const [cloudCoolingActive, setCloudCoolingActive] = useState<boolean>(false);
  const [cloudRainActive, setCloudRainActive] = useState<boolean>(false);
  const [waterGateOpen, setWaterGateOpen] = useState<boolean>(false);
  const [reservoirLiters, setReservoirLiters] = useState<number>(0); // Target: 40L

  const [feedback, setFeedback] = useState<string>(
    'Tutorial: Use WASD or Arrow Keys to walk your Science Explorer to the highlighted Mountain Lake.'
  );

  // Proximity to any station
  const getNearbyStation = useCallback(
    (pos: { x: number; y: number }) => {
      for (const st of STATIONS) {
        const dist = Math.hypot(st.pos.x - pos.x, st.pos.y - pos.y);
        if (dist <= st.radius) return st;
      }
      return null;
    },
    []
  );

  const nearby = getNearbyStation(playerPos);

  // Interactive Action at current station
  const handleStationInteract = () => {
    if (!nearby) return;

    // 1. Lake Interaction
    if (nearby.id === 'lake') {
      if (bucketWaterVolume === 0) {
        setHasBucket(true);
        setBucketWaterVolume(40);
        setCurrentStep(2);
        setFeedback(
          '💧 40L Liquid Water Collected! Now walk eastward to the glowing Solar Furnace to heat the water to 100°C for Evaporation!'
        );
      } else {
        setFeedback('💧 Bucket is already full with 40L water. Walk to the Solar Furnace!');
      }
      return;
    }

    // 2. Solar Heater Interaction
    if (nearby.id === 'solar_heater') {
      if (bucketWaterVolume === 0 && !vapourCreated) {
        setFeedback('⚠️ You must carry water from the mountain lake before heating!');
        return;
      }
      if (furnaceTemperature < 100) {
        const nextTemp = Math.min(100, furnaceTemperature + 40);
        setFurnaceTemperature(nextTemp);
        if (nextTemp >= 100) {
          setBucketWaterVolume(0);
          setVapourCreated(true);
          setCurrentStep(3);
          setFeedback(
            '🔥 100°C REACHED! Liquid water boiled and Evaporated into rising steam/vapour! Follow the vapour to the Mountain Peak Cooling Station (top-right)!'
          );
        } else {
          setFeedback(`♨️ Heated furnace to ${nextTemp}°C. Press [E] / Interact again to reach 100°C Boiling Point!`);
        }
      } else {
        setFeedback('♨️ Water has evaporated into the atmosphere above! Walk to the Mountain Peak Cooling Station.');
      }
      return;
    }

    // 3. Cloud Cooling Station Interaction
    if (nearby.id === 'cloud_cooling') {
      if (!vapourCreated) {
        setFeedback('⚠️ Heat water at the solar furnace first to generate vapour in the sky!');
        return;
      }
      if (!cloudCoolingActive) {
        setCloudCoolingActive(true);
        setCloudRainActive(true);
        setCurrentStep(4);
        setFeedback(
          '❄️ CONDENSATION & RAIN! Cooling the vapour to 10°C forced droplets to condense into rainclouds! Now walk down to the Aqueduct Sluice Gate to open the water channel!'
        );
      } else {
        setFeedback('🌧️ Rainfall is pouring down! Proceed south to open the Aqueduct Sluice Gate.');
      }
      return;
    }

    // 4. Aqueduct Sluice Gate Interaction
    if (nearby.id === 'water_gate') {
      if (!cloudRainActive) {
        setFeedback('⚠️ Trigger rainfall from the cloud cooling station before opening the sluice channel!');
        return;
      }
      if (!waterGateOpen) {
        setWaterGateOpen(true);
        setCurrentStep(5);
        setFeedback(
          '🚪 SLUICE GATE OPENED! Rainwater runoff is rushing along the stone aqueduct toward the village reservoir!'
        );

        setTimeout(() => {
          setReservoirLiters(40);
          setCurrentStep(6);
          setFeedback(
            '🎉 RESERVOIR AT 100% (40L)! The village water supply is fully restored through the complete hydrological cycle (+40 XP · ⭐ 1 Star)!'
          );
        }, 1200);
      } else {
        setFeedback('🚪 Sluice gate is already open and channeling water into the village reservoir.');
      }
      return;
    }

    // 5. Village Reservoir Interaction
    if (nearby.id === 'village_reservoir') {
      if (reservoirLiters >= 40) {
        setFeedback('🚰 Village Reservoir is full (40L/40L). Pure water secured for the entire village community!');
      } else {
        setFeedback(`🚰 Village Reservoir is dry (${reservoirLiters}L/40L). Follow the water cycle steps to fill it!`);
      }
    }
  };

  // Movement physics with collision boundaries and terrain clamping
  const movePlayer = useCallback((dx: number, dy: number) => {
    setIsMoving(true);
    setPlayerPos((prev) => {
      const nextX = Math.max(6, Math.min(94, prev.x + dx));
      const nextY = Math.max(8, Math.min(90, prev.y + dy));
      return { x: nextX, y: nextY };
    });

    const timer = setTimeout(() => setIsMoving(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation listener (WASD / Arrows / Space / E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const STEP = 5.5;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -STEP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, STEP);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-STEP, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(STEP, 0);
          break;
        case ' ':
        case 'e':
        case 'E':
        case 'Enter':
          e.preventDefault();
          handleStationInteract();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(6, Math.min(94, clickX));
    const clampedY = Math.max(8, Math.min(90, clickY));

    setPlayerPos({ x: clampedX, y: clampedY });
  };

  // Active Target Station determining the directional guiding beam
  const activeStation =
    currentStep === 1
      ? STATIONS[0]
      : currentStep === 2
      ? STATIONS[1]
      : currentStep === 3
      ? STATIONS[2]
      : currentStep === 4
      ? STATIONS[3]
      : STATIONS[4];

  const isMissionComplete = reservoirLiters >= 40;

  return (
    <div className="space-y-4 select-none">
      {/* Top Objective Ribbon & Controls Onboarding */}
      <div className="rounded-3xl border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-br from-sky-50 via-cyan-50/40 to-blue-50 dark:from-slate-900 dark:via-sky-950/20 dark:to-blue-950/20 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border-2 border-sky-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
            💧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400">
                Mission {currentStep}/5: {activeStation.actionVerb}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200">
                Active Goal
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
              Water World: Hydrological Adventure
            </h2>
          </div>
        </div>

        {/* Dynamic Controls Helper Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-gray-800 border border-sky-200 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-2xs">
            <span className="font-mono text-primary font-black">WASD / Arrows</span>
            <span>Move</span>
            <span className="text-gray-300">|</span>
            <span className="font-mono text-primary font-black">[E]</span>
            <span>Interact</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-300 text-xs font-black text-sky-900 dark:text-sky-200">
            <Droplets className="h-3.5 w-3.5 text-sky-500 fill-sky-500" />
            <span>Reservoir: {reservoirLiters}L / 40L</span>
          </div>
        </div>
      </div>

      {/* 2D PHYSICAL EXPLORABLE WATER CYCLE WORLD VIEWPORT */}
      <div className="relative rounded-3xl border-4 border-sky-400/90 dark:border-sky-700/80 bg-[#C8DFD2] dark:bg-[#111A16] overflow-hidden shadow-2xl h-[440px] sm:h-[480px]">
        {/* Clickable World Ground Canvas */}
        <div onClick={handleCanvasClick} className="absolute inset-0 cursor-crosshair">
          {/* Ground Terrain Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #0369a1 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Top Atmospheric Sky Layer */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-sky-400/30 via-sky-200/20 to-transparent pointer-events-none" />

          {/* Aqueduct Sluice Stream Path connecting cloud rainfall to reservoir */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 600 110 Q 650 260, 520 330 T 730 380"
              stroke={waterGateOpen ? '#0284c7' : '#94a3b8'}
              strokeWidth={waterGateOpen ? 12 : 6}
              strokeDasharray={waterGateOpen ? '8,4' : '4,4'}
              fill="none"
              className={waterGateOpen ? 'animate-pulse' : ''}
            />
          </svg>

          {/* World-space Directional Guiding Line to Current Active Objective Station */}
          {activeStation && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45">
              <line
                x1={`${playerPos.x}%`}
                y1={`${playerPos.y}%`}
                x2={`${activeStation.pos.x}%`}
                y2={`${activeStation.pos.y}%`}
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
            </svg>
          )}

          {/* 1. FRESHWATER MOUNTAIN LAKE (Top-Left) */}
          <div
            style={{ left: `${STATIONS[0].pos.x}%`, top: `${STATIONS[0].pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
          >
            <div
              className={cn(
                'w-20 h-16 rounded-3xl border-2 shadow-md flex items-center justify-center text-3xl transition-all',
                currentStep === 1
                  ? 'bg-blue-500/50 border-blue-500 ring-4 ring-blue-300 animate-pulse scale-105'
                  : 'bg-blue-500/30 border-blue-400'
              )}
            >
              🌊
            </div>
            <span className="text-[10px] font-black uppercase text-blue-950 dark:text-blue-200 bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded-full mt-1 shadow-xs">
              1. Mountain Lake
            </span>
          </div>

          {/* 2. SOLAR FURNACE HEATING AREA (Center) */}
          <div
            style={{ left: `${STATIONS[1].pos.x}%`, top: `${STATIONS[1].pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
          >
            <div
              className={cn(
                'w-20 h-20 rounded-3xl border-2 shadow-md flex flex-col items-center justify-center transition-all',
                currentStep === 2
                  ? 'bg-amber-500/50 border-amber-600 ring-4 ring-amber-300 animate-pulse scale-105'
                  : 'bg-amber-500/30 border-amber-500'
              )}
            >
              <span className="text-3xl">🔥</span>
              <span className="text-[10px] font-black text-amber-950 dark:text-amber-200">
                {furnaceTemperature}°C
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-950 dark:text-amber-200 bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded-full mt-1 shadow-xs">
              2. Solar Furnace
            </span>
          </div>

          {/* 3. MOUNTAIN PEAK COOLING & CLOUD CHAMBER (Top-Right) */}
          <div
            style={{ left: `${STATIONS[2].pos.x}%`, top: `${STATIONS[2].pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
          >
            <motion.div
              animate={cloudRainActive ? { y: [0, -4, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={cn(
                'w-24 h-20 rounded-3xl border-2 shadow-lg flex flex-col items-center justify-center transition-all',
                cloudRainActive
                  ? 'bg-slate-800 text-white border-sky-400 ring-4 ring-sky-300'
                  : currentStep === 3
                  ? 'bg-sky-200 border-sky-500 ring-4 ring-sky-300 animate-pulse scale-105'
                  : 'bg-white/70 border-gray-300'
              )}
            >
              <span className="text-3xl">{cloudRainActive ? '🌧️' : vapourCreated ? '☁️' : '🏔️'}</span>
              <span className="text-[9px] font-black">{cloudRainActive ? 'Rain Active' : 'Cooling Stn'}</span>
            </motion.div>
            <span className="text-[10px] font-black uppercase text-sky-950 dark:text-sky-200 bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded-full mt-1 shadow-xs">
              3. Cloud Cooling
            </span>
          </div>

          {/* Rising Evaporation Vapour Particles */}
          {vapourCreated && !cloudRainActive && (
            <motion.div
              animate={{ x: [0, 40, 80], y: [0, -30, -60], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ left: '48%', top: '24%' }}
              className="absolute text-2xl pointer-events-none z-15"
            >
              ♨️ ♨️ (Vapour Rising)
            </motion.div>
          )}

          {/* 4. AQUEDUCT SLUICE GATE (Middle-Bottom) */}
          <div
            style={{ left: `${STATIONS[3].pos.x}%`, top: `${STATIONS[3].pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
          >
            <div
              className={cn(
                'w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-md transition-all',
                waterGateOpen
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : currentStep === 4
                  ? 'bg-amber-100 border-amber-500 ring-4 ring-amber-300 animate-pulse scale-105'
                  : 'bg-gray-200 border-gray-400'
              )}
            >
              {waterGateOpen ? '🚪 (Open)' : '🔒 (Closed)'}
            </div>
            <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded-full mt-1 shadow-xs">
              4. Sluice Gate
            </span>
          </div>

          {/* 5. VILLAGE RESERVOIR (Bottom-Right) */}
          <div
            style={{ left: `${STATIONS[4].pos.x}%`, top: `${STATIONS[4].pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
          >
            <div
              className={cn(
                'w-24 h-20 rounded-3xl border-2 flex flex-col items-center justify-center text-center shadow-lg transition-all',
                reservoirLiters >= 40
                  ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-200'
                  : 'bg-amber-100 dark:bg-gray-800 border-amber-300'
              )}
            >
              <span className="text-3xl">🚰</span>
              <span className="text-[10px] font-black">
                {reservoirLiters >= 40 ? 'Full 40L ✓' : `${reservoirLiters}L / 40L`}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-950 dark:text-emerald-200 bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded-full mt-1 shadow-xs">
              5. Village Reservoir
            </span>
          </div>

          {/* PLAYABLE SCIENCE EXPLORER AVATAR WITH FOOTPRINT ANIMATION */}
          <motion.div
            animate={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30"
          >
            <div className="relative">
              <div
                className={cn(
                  'w-13 h-13 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 border-2 border-white shadow-2xl flex items-center justify-center text-2xl transition-transform',
                  isMoving ? 'scale-110' : 'scale-100'
                )}
              >
                🧑‍🔬
              </div>
              {hasBucket && (
                <div className="absolute -bottom-1 -right-1 text-sm bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-sky-300">
                  {bucketWaterVolume > 0 ? '💧' : '🪣'}
                </div>
              )}
            </div>

            <span className="text-[9px] font-black text-white bg-blue-950/90 px-2 py-0.5 rounded-full shadow-md mt-0.5 whitespace-nowrap">
              Explorer
            </span>
          </motion.div>
        </div>

        {/* Nearby Station Interactive Action Prompt */}
        <AnimatePresence>
          {nearby && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-card-dark/95 border-2 border-sky-500 rounded-2xl p-3 shadow-2xl z-40 flex items-center gap-3 max-w-md"
            >
              <div className="text-3xl">{nearby.icon}</div>
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-600 block">
                  Nearby: {nearby.name}
                </span>
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  Press [E] or tap button to {nearby.actionVerb}
                </span>
              </div>
              <Button
                size="sm"
                variant="gradient"
                onClick={handleStationInteract}
                className="cursor-pointer font-bold shadow-xs text-xs px-3 shrink-0"
              >
                [E] {nearby.actionVerb.split(' ')[0]} ⚡
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-sky-50 dark:bg-gray-800/80 border border-sky-200 p-3.5 text-xs font-medium text-sky-950 dark:text-sky-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-sky-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Movement & Navigation D-Pad Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          📍 <strong>Explorer Coordinates:</strong> ({Math.round(playerPos.x)}%, {Math.round(playerPos.y)}%) · Walk directly to the highlighted station to trigger physical reactions.
        </div>

        {/* D-Pad Buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => movePlayer(0, -10)}
            className="w-12 h-9 rounded-xl bg-sky-100 dark:bg-gray-800 border border-sky-300 text-sky-900 dark:text-sky-200 flex items-center justify-center font-bold hover:bg-sky-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
            title="Move North"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => movePlayer(-10, 0)}
              className="w-12 h-9 rounded-xl bg-sky-100 dark:bg-gray-800 border border-sky-300 text-sky-900 dark:text-sky-200 flex items-center justify-center font-bold hover:bg-sky-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move West"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 10)}
              className="w-12 h-9 rounded-xl bg-sky-100 dark:bg-gray-800 border border-sky-300 text-sky-900 dark:text-sky-200 flex items-center justify-center font-bold hover:bg-sky-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move South"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(10, 0)}
              className="w-12 h-9 rounded-xl bg-sky-100 dark:bg-gray-800 border border-sky-300 text-sky-900 dark:text-sky-200 flex items-center justify-center font-bold hover:bg-sky-200 active:scale-90 transition-all cursor-pointer shadow-2xs"
              title="Move East"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">💧🌈🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Water Cycle Restored & Village Reservoir Filled!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully applied thermodynamic state transitions: collected lake water, evaporated it to steam at 100°C, cooled the clouds for condensation & rainfall, and opened the sluice channel to fill the village reservoir (+40 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Water World Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
