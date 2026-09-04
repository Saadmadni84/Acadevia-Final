import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Info, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface LifeExplorerGameProps {
  onComplete: () => void;
}

interface BiomeOrganism {
  id: string;
  name: string;
  icon: string;
  habitat: 'Aquatic (Water)' | 'Terrestrial (Land)' | 'Aerial (Air / Canopy)';
  classification: 'Animal' | 'Plant';
  adaptationFact: string;
  x: number;
  y: number;
  scanned: boolean;
  classified: boolean;
}

const BIOME_ORGANISMS: BiomeOrganism[] = [
  { id: 'frog', name: 'Amphibian Frog', icon: '🐸', habitat: 'Aquatic (Water)', classification: 'Animal', adaptationFact: 'Webbed feet for swimming and moist skin for aquatic respiration.', x: 25, y: 75, scanned: false, classified: false },
  { id: 'lotus', name: 'Lotus Plant', icon: '🪷', habitat: 'Aquatic (Water)', classification: 'Plant', adaptationFact: 'Waxy coated floating leaves with stomata on upper surface to prevent water clogging.', x: 18, y: 60, scanned: false, classified: false },
  { id: 'tiger', name: 'Bengal Tiger', icon: '🐅', habitat: 'Terrestrial (Land)', classification: 'Animal', adaptationFact: 'Camouflage stripes for dense tall grass hunting and sharp retractable claws.', x: 70, y: 70, scanned: false, classified: false },
  { id: 'banyan', name: 'Banyan Tree', icon: '🌳', habitat: 'Terrestrial (Land)', classification: 'Plant', adaptationFact: 'Prop roots growing downwards from branches to support huge canopy structure.', x: 80, y: 40, scanned: false, classified: false },
  { id: 'kingfisher', name: 'Kingfisher Bird', icon: '🐦', habitat: 'Aerial (Air / Canopy)', classification: 'Animal', adaptationFact: 'Streamlined aerodynamic beak to dive into water without creating surface ripples.', x: 45, y: 25, scanned: false, classified: false },
];

export const LifeExplorerGame: React.FC<LifeExplorerGameProps> = ({ onComplete }) => {
  const [organisms, setOrganisms] = useState<BiomeOrganism[]>(BIOME_ORGANISMS);
  const [selectedOrganism, setSelectedOrganism] = useState<BiomeOrganism | null>(null);
  const [feedback, setFeedback] = useState<string>(
    'Biodiversity Biome: Tap on animals and plants in the ecosystem to scan their characteristics and log them in your Field Classification Board!'
  );

  const scannedCount = organisms.filter((o) => o.scanned).length;
  const classifiedCount = organisms.filter((o) => o.classified).length;

  const handleScan = (organism: BiomeOrganism) => {
    setSelectedOrganism(organism);
    setOrganisms((prev) =>
      prev.map((o) => (o.id === organism.id ? { ...o, scanned: true } : o))
    );
    setFeedback(`🔍 Scanned ${organism.name}! ${organism.adaptationFact}. Now assign its correct Habitat in the Field Journal below.`);
  };

  const handleClassify = (habitat: 'Aquatic (Water)' | 'Terrestrial (Land)' | 'Aerial (Air / Canopy)') => {
    if (!selectedOrganism) return;

    if (selectedOrganism.habitat === habitat) {
      setOrganisms((prev) =>
        prev.map((o) => (o.id === selectedOrganism.id ? { ...o, classified: true } : o))
      );
      setFeedback(`✨ Correct Classification! ${selectedOrganism.name} thrives in ${habitat}. Logged in Field Board!`);
      setSelectedOrganism(null);
    } else {
      setFeedback(`❌ Incorrect habitat! ${selectedOrganism.name} belongs to ${selectedOrganism.habitat}, not ${habitat}. Try again.`);
    }
  };

  const isMissionComplete = classifiedCount === organisms.length;

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50 via-green-50/40 to-teal-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-teal-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
            🌿
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
              Chapter 2 & 10 · Diversity & Living Creatures
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Life Explorer Biome
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Explore the biodiversity habitat, scan all <strong>5 living species</strong>, and categorize their habitats and ecological adaptations!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-emerald-200 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 shadow-2xs">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span>Classified: {classifiedCount} / {organisms.length}</span>
        </div>
      </div>

      {/* 2D PHYSICAL ECOSYSTEM BIOME CANVAS */}
      <div className="relative rounded-3xl border-4 border-emerald-400/90 dark:border-emerald-700/80 bg-gradient-to-b from-sky-200 via-lime-100 to-emerald-300 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/60 overflow-hidden shadow-2xl h-[400px] sm:h-[440px] p-6 relative">
        {/* Environment Decorators */}
        <div className="absolute top-4 left-6 text-2xl opacity-60">☁️ ☁️</div>
        <div className="absolute bottom-6 left-6 w-44 h-28 rounded-3xl bg-blue-400/40 border-2 border-blue-300 flex items-center justify-center text-xs font-black text-blue-900">
          🌊 Aquatic Pond
        </div>
        <div className="absolute bottom-6 right-6 w-48 h-32 rounded-3xl bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-900">
          🌴 Terrestrial Forest
        </div>

        {/* Organisms in the Biome */}
        {organisms.map((org) => (
          <motion.button
            key={org.id}
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScan(org)}
            style={{ left: `${org.x}%`, top: `${org.y}%` }}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl border-2 transition-all flex flex-col items-center cursor-pointer shadow-lg z-20',
              selectedOrganism?.id === org.id
                ? 'bg-amber-300 border-amber-600 ring-4 ring-amber-200 scale-110'
                : org.classified
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-white/95 dark:bg-gray-800 border-emerald-400 animate-bounce'
            )}
          >
            <span className="text-3xl">{org.icon}</span>
            <span className="text-[9px] font-black mt-0.5 whitespace-nowrap px-1 rounded bg-black/70 text-white">
              {org.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Field Classification Board */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
            Field Classification Desk
          </span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white">
            {selectedOrganism ? `Classify Habitat for ${selectedOrganism.name}` : 'Select any organism in the biome above'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedOrganism}
            onClick={() => handleClassify('Aquatic (Water)')}
            className="cursor-pointer font-bold shadow-xs text-xs"
          >
            🌊 Aquatic (Water)
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedOrganism}
            onClick={() => handleClassify('Terrestrial (Land)')}
            className="cursor-pointer font-bold shadow-xs text-xs"
          >
            🌴 Terrestrial (Land)
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedOrganism}
            onClick={() => handleClassify('Aerial (Air / Canopy)')}
            className="cursor-pointer font-bold shadow-xs text-xs"
          >
            🪶 Aerial (Air)
          </Button>
        </div>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-emerald-50 dark:bg-gray-800/80 border border-emerald-200 p-3.5 text-xs font-medium text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">🌿🦁🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Biodiversity & Living Characteristics Catalogued!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully discovered 5 species across aquatic, terrestrial, and aerial habitats and analyzed their physiological adaptations (+40 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Life Explorer Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
