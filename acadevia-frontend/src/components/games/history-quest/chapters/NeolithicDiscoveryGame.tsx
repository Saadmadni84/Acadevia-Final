import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles, MapPin, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NEOLITHIC_SITES } from '../ancientIndiaData';
import type { ArchaeologySite } from '../types';
import { cn } from '@/lib/utils';

interface NeolithicDiscoveryGameProps {
  onComplete: () => void;
}

export const NeolithicDiscoveryGame: React.FC<NeolithicDiscoveryGameProps> = ({ onComplete }) => {
  const [sites, setSites] = useState<ArchaeologySite[]>(NEOLITHIC_SITES);
  const [activeSite, setActiveSite] = useState<ArchaeologySite | null>(null);
  const [brushProgress, setBrushProgress] = useState<number>(0);
  const [inspectedJournalSite, setInspectedJournalSite] = useState<ArchaeologySite | null>(null);

  const discoveredCount = sites.filter((s) => s.discovered).length;
  const isExpeditionComplete = discoveredCount === sites.length;

  const handleSelectMapSite = (site: ArchaeologySite) => {
    setActiveSite(site);
    setBrushProgress(site.discovered ? site.excavationDepth : 0);
  };

  const handleExcavateStep = () => {
    if (!activeSite) return;
    const nextProgress = brushProgress + 1;
    setBrushProgress(nextProgress);

    if (nextProgress >= activeSite.excavationDepth && !activeSite.discovered) {
      setSites((prev) =>
        prev.map((s) => (s.id === activeSite.id ? { ...s, discovered: true } : s))
      );
    }
  };

  const handleCloseExcavation = () => {
    setActiveSite(null);
    setBrushProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Narrative Intro Card */}
      <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-green-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-teal-950/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-inner">
              ⛏️
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                Chapter 3 · Neolithic Archaeology (c. 7000–1000 BCE)
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                The Neolithic Settlements of the Subcontinent
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                Explore the interactive map of ancient India. Locate and excavate all <strong>4 Neolithic settlements</strong> (Burzahom, Mehrgarh, Paiyampalli, Chirand) to recover prehistoric tools and record them in your Archaeology Journal.
              </p>
            </div>
          </div>

          {/* Progress Tracker Pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-emerald-200 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>Sites Unearthed: {discoveredCount} / {sites.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Subcontinent Map + Archaeology Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Ancient India Map Canvas (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-800/80 bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 p-5 relative overflow-hidden shadow-xl min-h-[460px] flex flex-col justify-between">
          {/* Geographical Map Backdrop Markings */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #059669 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-4 left-1/3 text-xs font-black uppercase tracking-widest text-emerald-900/40 dark:text-emerald-300/30">
            ▲ ▲ HIMALAYAN MOUNTAIN BARRIER ▲ ▲
          </div>
          <div className="absolute bottom-6 right-6 text-xs font-black uppercase tracking-widest text-sky-800/40 dark:text-sky-300/30">
            ≈ ≈ BAY OF BENGAL ≈ ≈
          </div>
          <div className="absolute bottom-6 left-6 text-xs font-black uppercase tracking-widest text-sky-800/40 dark:text-sky-300/30">
            ≈ ≈ ARABIAN SEA ≈ ≈
          </div>

          {/* Map Title Header */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full border border-emerald-300/60 shadow-2xs">
              🗺️ Prehistoric Indian Subcontinent Map
            </span>
            <span className="text-[10px] text-gray-500 font-bold">
              Click site pins to begin excavation
            </span>
          </div>

          {/* Interactive Site Pins Positioned Geographically */}
          <div className="relative w-full h-80 sm:h-96 my-2 z-10">
            {sites.map((site) => {
              const isSelected = activeSite?.id === site.id;

              return (
                <div
                  key={site.id}
                  style={{ left: `${site.position.x}%`, top: `${site.position.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectMapSite(site)}
                    className={cn(
                      'flex items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer shadow-lg',
                      isSelected
                        ? 'bg-amber-400 text-amber-950 border-amber-600 ring-4 ring-amber-300 scale-110 z-30'
                        : site.discovered
                        ? 'bg-emerald-600 text-white border-emerald-400 z-20'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-emerald-400 hover:border-emerald-600 animate-bounce z-10'
                    )}
                  >
                    <span className="text-xl">
                      {site.discovered ? site.artefactIcon : '📍'}
                    </span>
                    <div className="text-left hidden sm:block">
                      <span className="text-[10px] font-black uppercase block leading-none">
                        {site.name}
                      </span>
                      <span className="text-[8px] text-gray-200 block">
                        {site.discovered ? 'Unearthed ✓' : 'Excavate'}
                      </span>
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Bottom Active Excavation Panel Overlay */}
          <AnimatePresence>
            {activeSite && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="rounded-2xl bg-white/95 dark:bg-card-dark/95 border-2 border-emerald-400 p-4 sm:p-5 shadow-2xl z-20 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      Archaeological Trench · {activeSite.region} ({activeSite.state})
                    </span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Excavation: {activeSite.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseExcavation}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    ✕ Close Trench
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {activeSite.historicalSignificance}
                </p>

                {/* Trench Dirt / Excavation Brush Action */}
                <div className="p-3 rounded-xl bg-amber-950/10 dark:bg-black/40 border border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-200 dark:bg-gray-800 flex items-center justify-center text-2xl shadow-inner">
                      {brushProgress >= activeSite.excavationDepth ? activeSite.artefactIcon : '🪨'}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">
                        Trench Strata Cleared
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {brushProgress >= activeSite.excavationDepth
                          ? activeSite.artefactName
                          : `Soil Layer ${brushProgress} of ${activeSite.excavationDepth}`}
                      </span>
                    </div>
                  </div>

                  {brushProgress < activeSite.excavationDepth ? (
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={handleExcavateStep}
                      className="cursor-pointer font-bold shadow-xs"
                    >
                      🧹 Brush Away Sediment ({brushProgress + 1}/{activeSite.excavationDepth})
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Added to Archaeology Journal!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Archaeology Journal Sidebar (1 col) */}
        <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="font-black text-base text-gray-900 dark:text-white">
                  Archaeology Journal
                </h3>
                <span className="text-[11px] text-gray-500">
                  Prehistoric Subcontinent Evidence Log
                </span>
              </div>
            </div>

            {/* List of 4 Sites */}
            <div className="space-y-2.5">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className={cn(
                    'p-3 rounded-2xl border transition-all text-xs',
                    site.discovered
                      ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 opacity-70'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{site.discovered ? site.artefactIcon : '❓'}</span>
                      <span>{site.name} ({site.state})</span>
                    </span>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                      site.discovered ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-600'
                    )}>
                      {site.discovered ? 'Discovered' : 'Pending'}
                    </span>
                  </div>

                  {site.discovered ? (
                    <p className="mt-1.5 text-[11px] text-emerald-900 dark:text-emerald-200 font-medium">
                      🦴 <strong>Artefact:</strong> {site.artefactName}
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] text-gray-400">
                      Explore the {site.region} to locate this prehistoric settlement.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expedition Completion Action */}
          <div className="pt-2">
            {isExpeditionComplete ? (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="space-y-2 text-center">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                  🏆 All 4 Neolithic settlements documented! You have mastered Class 6 Ancient India!
                </div>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={onComplete}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full shadow-md font-bold cursor-pointer"
                >
                  Complete Chronicles of Ancient India 👑
                </Button>
              </motion.div>
            ) : (
              <div className="text-center text-[11px] text-gray-400 font-bold">
                Find and excavate all 4 sites to complete Chapter 3 ({discoveredCount}/4 complete)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
