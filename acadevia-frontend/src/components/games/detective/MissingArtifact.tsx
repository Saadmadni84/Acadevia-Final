import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Search,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface EvidenceItem {
  id: string;
  name: string;
  location: string;
  description: string;
  contradictsSuspect: string;
}

interface Suspect {
  id: string;
  name: string;
  role: string;
  avatar: string;
  alibi: string;
  motive: string;
  isGuilty: boolean;
}

const CRIME_SCENES = [
  { id: 'pedestal', name: 'Exhibition Pedestal', icon: '🏛️', description: 'The shattered glass case where the Harappan Golden Relic was mounted.' },
  { id: 'security', name: 'Security Control Room', icon: '📹', description: 'Monitor bank with recorded CCTV feeds and digital door keycard swipe logs.' },
  { id: 'vent', name: 'Service Duct & Roof Vent', icon: '🛠️', description: 'The narrow maintenance bypass behind the HVAC air circulation shafts.' },
  { id: 'study', name: "Curator's Private Study", icon: '📚', description: 'Dr. Voss’s mahogany office filled with excavation maps and correspondence.' },
];

const EVIDENCE_POOL: EvidenceItem[] = [
  {
    id: 'cctv_log',
    name: 'Tampered CCTV Timestamp',
    location: 'Security Control Room',
    description: 'The cameras looped a 10-minute static video feed at exactly 11:42 PM using an internal administrator override password.',
    contradictsSuspect: 'elena',
  },
  {
    id: 'blue_fabric',
    name: 'Torn Blue Contractor Fabric',
    location: 'Service Duct & Roof Vent',
    description: 'A snagged scrap of heavy flame-retardant blue twill caught on the exhaust louvers, matching HVAC technician overalls.',
    contradictsSuspect: 'silas',
  },
  {
    id: 'invoice',
    name: 'Forged Zurich Auction Invoice',
    location: "Curator's Private Study",
    description: 'A pre-dated private sales receipt for an unnamed Bronze Age artifact transferring funds to an offshore bank account.',
    contradictsSuspect: 'voss',
  },
  {
    id: 'ticket',
    name: 'First-Class Flight Itinerary',
    location: 'Exhibition Pedestal',
    description: 'A boarding pass stub dropped near the display pedestal stamped with a VIP frequent flyer number.',
    contradictsSuspect: 'thorne',
  },
];

const SUSPECTS: Suspect[] = [
  {
    id: 'silas',
    name: 'Silas Vance',
    role: 'HVAC Maintenance Contractor',
    avatar: '🔧',
    alibi: '"I only worked on the ground floor boilers. I was never anywhere near the third floor roof vents or exhibition chambers yesterday!"',
    motive: 'Substantial gambling debts and access to the building air ducts.',
    isGuilty: true, // Guilty: blue fabric was snagged on the 3rd floor vent!
  },
  {
    id: 'voss',
    name: 'Dr. Julian Voss',
    role: 'Chief Curator',
    avatar: '🧐',
    alibi: '"I locked the gallery vault at 9:00 PM sharp and attended the academic banquet across town until 1:00 AM. Multiple deans saw me."',
    motive: 'Desperate for research grant funding.',
    isGuilty: false,
  },
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Night Security Guard',
    avatar: '👮‍♀️',
    alibi: '"I conducted my routine perimeter patrol every 30 minutes. The camera glitch was an external power surge on circuit breaker B."',
    motive: 'Recently reprimanded for disciplinary lapses.',
    isGuilty: false,
  },
  {
    id: 'thorne',
    name: 'Marcus Thorne',
    role: 'Private Antiquities Collector',
    avatar: '💼',
    alibi: '"I was dining at the British Archaeological Institute in London all weekend. My assistant took care of local deliveries."',
    motive: 'Obsessed with completing his private Bronze Age collection.',
    isGuilty: false,
  },
];

export const MissingArtifact: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [activeScene, setActiveScene] = useState<string>('pedestal');
  const [collectedClues, setCollectedClues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'scenes' | 'dossiers' | 'accuse'>('scenes');
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [verdictState, setVerdictState] = useState<'none' | 'solved' | 'failed'>('none');
  const [score, setScore] = useState<number>(0);

  const handleInspectScene = (sceneId: string) => {
    setActiveScene(sceneId);
    const sceneEvidence = EVIDENCE_POOL.find((e) => {
      const matchScene =
        (sceneId === 'pedestal' && e.location.includes('Pedestal')) ||
        (sceneId === 'security' && e.location.includes('Security')) ||
        (sceneId === 'vent' && e.location.includes('Vent')) ||
        (sceneId === 'study' && e.location.includes('Study'));
      return matchScene;
    });

    if (sceneEvidence && !collectedClues.includes(sceneEvidence.id)) {
      setCollectedClues((prev) => [...prev, sceneEvidence.id]);
      setScore((prev) => prev + 150);
    }
  };

  const handleAccusation = () => {
    if (!selectedSuspect || !selectedProof) return;

    const suspect = SUSPECTS.find((s) => s.id === selectedSuspect);
    const proof = EVIDENCE_POOL.find((e) => e.id === selectedProof);

    if (suspect?.isGuilty && proof?.contradictsSuspect === suspect.id) {
      setVerdictState('solved');
      setScore((prev) => prev + 600);
      if (user?.id) {
        gameService.saveGameScore({
          studentId: user.id,
          gameId: 'missing-artifact',
          gameTitle: 'The Missing Artifact',
          score: score + 600,
          accuracy: 100,
          timeSpent: 180,
          xpEarned: 200,
          metadata: { culprit: suspect.name },
        }).catch(console.error);
      }
    } else {
      setVerdictState('failed');
    }
  };

  const handleRestart = () => {
    setCollectedClues([]);
    setSelectedSuspect(null);
    setSelectedProof(null);
    setVerdictState('none');
    setActiveTab('scenes');
    setScore(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-5 py-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.GAMES)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-gray-200 dark:border-gray-700"
          >
            Exit Case
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                The Missing Artifact
              </span>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                Case #104: Museum Heist
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Forensic Investigation & Contradiction Deduction</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Clues Discovered</span>
            <span className="text-sm font-black text-amber-500">{collectedClues.length} of 4</span>
          </div>
          <div className="text-right pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Detective XP</span>
            <span className="text-lg font-black text-primary">{score}</span>
          </div>
        </div>
      </div>

      {/* Mode Tabs: Crime Scenes | Suspect Dossiers | The Accusation */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/60 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('scenes')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'scenes'
              ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🔍 Crime Scenes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dossiers')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'dossiers'
              ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          👥 Suspect Alibis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('accuse')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'accuse'
              ? 'bg-white dark:bg-gray-900 text-rose-500 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          ⚖️ The Accusation
        </button>
      </div>

      {/* Main Investigation Arena */}
      {activeTab === 'scenes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Crime Scene Selector */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Locations Under Investigation:
            </h3>
            {CRIME_SCENES.map((scene) => {
              const isActive = activeScene === scene.id;
              const hasClue = collectedClues.some((c) => {
                const item = EVIDENCE_POOL.find((ev) => ev.id === c);
                return (
                  (scene.id === 'pedestal' && item?.location.includes('Pedestal')) ||
                  (scene.id === 'security' && item?.location.includes('Security')) ||
                  (scene.id === 'vent' && item?.location.includes('Vent')) ||
                  (scene.id === 'study' && item?.location.includes('Study'))
                );
              });

              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => handleInspectScene(scene.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{scene.icon}</span>
                    {hasClue ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Evidence Secured
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Unexamined
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {scene.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {scene.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Inspection Hotspot Viewer */}
          <div className="lg:col-span-7 bg-gray-950 rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl flex flex-col justify-between min-h-[420px] text-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Active Forensic Sweep
                </span>
                <span className="text-xs text-gray-400">Security Grade Alpha</span>
              </div>
              <h3 className="text-2xl font-black">
                {CRIME_SCENES.find((s) => s.id === activeScene)?.name}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {CRIME_SCENES.find((s) => s.id === activeScene)?.description}
              </p>
            </div>

            {/* Evidence Found in this Scene */}
            {(() => {
              const ev = EVIDENCE_POOL.find((e) => {
                return (
                  (activeScene === 'pedestal' && e.location.includes('Pedestal')) ||
                  (activeScene === 'security' && e.location.includes('Security')) ||
                  (activeScene === 'vent' && e.location.includes('Vent')) ||
                  (activeScene === 'study' && e.location.includes('Study'))
                );
              });

              if (!ev) return null;
              const isFound = collectedClues.includes(ev.id);

              return (
                <div className="my-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Search className="w-4 h-4" />
                    <span>Forensic Clue: {ev.name}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    "{ev.description}"
                  </p>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Tagged to location: {ev.location}
                  </div>
                </div>
              );
            })()}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {collectedClues.length >= 3 ? 'Sufficient clues collected to examine alibis!' : 'Inspect remaining locations for clues.'}
              </span>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setActiveTab('dossiers')}
              >
                Examine Suspect Alibis ➔
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suspect Dossiers Tab */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Cross-Examine Suspect Statements:
            </h3>
            <span className="text-xs text-gray-500">
              Look for contradictions against your forensic evidence!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUSPECTS.map((suspect) => (
              <div
                key={suspect.id}
                className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-gray-100 dark:bg-gray-800">
                    {suspect.avatar}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                      {suspect.name}
                    </h4>
                    <span className="text-xs text-primary font-medium">{suspect.role}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs italic text-gray-700 dark:text-gray-300">
                  {suspect.alibi}
                </div>

                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  <strong className="text-gray-700 dark:text-gray-300">Motive Profile:</strong>{' '}
                  {suspect.motive}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="gradient"
              onClick={() => setActiveTab('accuse')}
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Proceed to The Accusation ➔
            </Button>
          </div>
        </div>
      )}

      {/* The Accusation Tab */}
      {activeTab === 'accuse' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-lg space-y-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Deliver the Final Indictment
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the perpetrator and attach the decisive forensic proof that shatters their false alibi.
            </p>
          </div>

          {/* Suspect Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              1. Accuse the Culprit:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUSPECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSuspect(s.id)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selectedSuspect === s.id
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-2xl">{s.avatar}</span>
                  <h5 className="font-extrabold text-sm text-gray-900 dark:text-white mt-1">
                    {s.name}
                  </h5>
                  <span className="text-[10px] text-gray-400 block">{s.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              2. Attach Decisive Contradiction Evidence:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EVIDENCE_POOL.map((ev) => {
                const isCollected = collectedClues.includes(ev.id);

                return (
                  <button
                    key={ev.id}
                    type="button"
                    disabled={!isCollected}
                    onClick={() => setSelectedProof(ev.id)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      !isCollected
                        ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-700'
                        : selectedProof === ev.id
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <h5 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {isCollected ? ev.name : '??? (Uncollected Evidence)'}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {isCollected ? ev.description : 'Inspect crime scenes to recover this piece.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            onClick={handleAccusation}
            disabled={!selectedSuspect || !selectedProof}
            className="w-full font-bold shadow-lg"
          >
            Submit Formal Accusation ⚖️
          </Button>
        </div>
      )}

      {/* Verdict Solved Modal */}
      <AnimatePresence>
        {verdictState === 'solved' && (
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Case Solved! Relic Recovered!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Brilliant deduction! Silas Vance claimed he was never on the third floor, but the torn blue flame-retardant fabric proved he climbed through the roof vent. Silas confessed and revealed the hidden relic!
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +200 XP Awarded • Final Score: {score}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} className="flex-1">
                  Exit to Library
                </Button>
                <Button variant="gradient" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />} className="flex-1">
                  Play Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verdict Failed Modal */}
      <AnimatePresence>
        {verdictState === 'failed' && (
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Accusation Rejected!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  The evidence provided does not legally contradict this suspect's alibi. Re-examine the witness statements and forensic traces!
                </p>
              </div>
              <Button
                variant="gradient"
                onClick={() => setVerdictState('none')}
                className="w-full font-bold"
              >
                Re-evaluate Evidence
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
