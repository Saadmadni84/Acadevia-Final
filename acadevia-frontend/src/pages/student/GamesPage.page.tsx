import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GAME_CATALOG,
  getGameById,
  type AcademicSubjectName,
  type GameDefinition,
} from '@/components/games/gameCatalog';
import { GameCard } from '@/components/game/GameCard';
import { GameThumbnail } from '@/components/games/GameThumbnail';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Button } from '@/components/ui/Button';
import {
  Search,
  X,
  Sparkles,
  Trophy,
  Flame,
  Play,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Star,
  Gamepad2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface SubjectTab {
  id: string;
  label: string;
  subject?: AcademicSubjectName;
  icon: string;
  activeColor: string;
}

const SUBJECT_TABS: SubjectTab[] = [
  { id: 'all', label: 'All Games', icon: '🎮', activeColor: 'bg-amber-500 text-white shadow-amber-500/30' },
  { id: 'Mathematics', label: 'Mathematics', subject: 'Mathematics', icon: '📐', activeColor: 'bg-orange-500 text-white shadow-orange-500/30' },
  { id: 'Science', label: 'Science', subject: 'Science', icon: '🔬', activeColor: 'bg-emerald-500 text-white shadow-emerald-500/30' },
  { id: 'Physics', label: 'Physics', subject: 'Physics', icon: '⚡', activeColor: 'bg-blue-500 text-white shadow-blue-500/30' },
  { id: 'Chemistry', label: 'Chemistry', subject: 'Chemistry', icon: '🧪', activeColor: 'bg-teal-500 text-white shadow-teal-500/30' },
  { id: 'Biology', label: 'Biology', subject: 'Biology', icon: '🧬', activeColor: 'bg-rose-500 text-white shadow-rose-500/30' },
  { id: 'English', label: 'English', subject: 'English', icon: '📚', activeColor: 'bg-indigo-500 text-white shadow-indigo-500/30' },
  { id: 'History', label: 'History', subject: 'History', icon: '🏺', activeColor: 'bg-amber-600 text-white shadow-amber-600/30' },
  { id: 'Geography', label: 'Geography', subject: 'Geography', icon: '🌍', activeColor: 'bg-cyan-600 text-white shadow-cyan-600/30' },
  { id: 'Computer Science', label: 'Computer Science', subject: 'Computer Science', icon: '💻', activeColor: 'bg-violet-600 text-white shadow-violet-600/30' },
  { id: 'Mind & Memory', label: 'Mind & Memory', subject: 'Mind & Memory', icon: '🧠', activeColor: 'bg-purple-600 text-white shadow-purple-600/30' },
  { id: 'Detective & Logic', label: 'Detective & Logic', subject: 'Detective & Logic', icon: '🔎', activeColor: 'bg-rose-600 text-white shadow-rose-600/30' },
];

const CLASS_OPTIONS = [
  { id: 'all', label: 'All Classes' },
  { id: 'primary', label: 'Primary (Cl. 1–5)', grades: [1, 2, 3, 4, 5] },
  { id: 'middle', label: 'Middle (Cl. 6–8)', grades: [6, 7, 8] },
  { id: 'secondary', label: 'Secondary (Cl. 9–10)', grades: [9, 10] },
  { id: 'senior', label: 'Senior (Cl. 11–12)', grades: [11, 12] },
];

const GENRE_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Genres' },
  { id: 'Arcade & Racing', label: '🏃 Arcade & Racing' },
  { id: 'Simulation & Lab', label: '🔬 Simulation & Lab' },
  { id: 'Strategy & Building', label: '🏗️ Strategy & Building' },
  { id: 'Puzzle & Logic', label: '🧩 Puzzle & Logic' },
  { id: 'Adventure & Quest', label: '🗺️ Adventure & Quest' },
];

const DIFFICULTY_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Difficulties' },
  { id: 'easy', label: '🟢 Easy' },
  { id: 'medium', label: '🟡 Medium' },
  { id: 'hard', label: '🔴 Hard' },
];

// Sample continue playing game references (only real existing game IDs)
const CONTINUE_PLAYING_SAMPLE = [
  { gameId: 'vedic-math-master', progressPercent: 70, lastPlayed: 'Today' },
  { gameId: 'projectile-master', progressPercent: 45, lastPlayed: 'Yesterday' },
  { gameId: 'memory-vault', progressPercent: 90, lastPlayed: '2 days ago' },
];

// Curated flagship featured games per category (History Quest is default for All Games)
const CATEGORY_FEATURED_IDS: Record<string, string[]> = {
  all: [
    'history-quest',
    'vedic-math-master',
    'type-rush',
    'projectile-master',
    'memory-vault',
    'missing-artifact',
    'indus-valley-builder',
    'fraction-forge',
    'cell-defender',
  ],
  Mathematics: [
    'vedic-math-master',
    'number-kingdom',
    'fraction-forge',
    'trigonometry-quest',
    'coordinate-quest',
  ],
  Science: [
    'science-lab',
    'ecosystem-tycoon',
    'energy-transformer',
    'optics-ray-maze',
    'plate-tectonics-lab',
  ],
  Physics: [
    'projectile-master',
    'circuit-runner',
    'truss-bridge-builder',
    'physics-velocity-racer',
    'gravity-orbit-lab',
  ],
  Chemistry: [
    'element-factory',
    'molecule-crafter',
    'reaction-reactor',
    'acid-base-titration',
    'states-of-matter-lab',
  ],
  Biology: [
    'cell-defender',
    'dna-helix-builder',
    'evolution-island',
    'organ-medic',
    'microbe-hunter',
  ],
  English: [
    'type-rush',
    'word-runner',
    'grammar-kingdom',
    'story-detective',
    'etymology-alchemist',
  ],
  History: [
    'history-quest',
    'indus-valley-builder',
    'freedom-movement-quest',
    'emperors-court',
    'artifact-archaeologist',
  ],
  Geography: [
    'world-explorer',
    'climate-quest',
    'river-odyssey',
    'geo-disaster-command',
    'resources-of-india',
  ],
  'Computer Science': [
    'algorithm-arena',
    'binary-blitz',
    'code-maze',
    'network-packet-route',
    'cyber-sentinel',
  ],
  'Mind & Memory': [
    'memory-vault',
    'pattern-pulse',
    'memory-maze',
    'sequence-builder',
    'focus-hunter',
  ],
  'Detective & Logic': [
    'codebreaker',
    'detectives-office',
    'missing-artifact',
    'time-travel-mystery',
    'logic-detective',
  ],
};

const GamesPage: React.FC = () => {
  const { user } = useAuthStore();
  const gamification = useGamificationStore();
  const studentGrade = user?.classGrade || 10;
  const streak = gamification.streak || 7;
  const xp = gamification.xp || 2450;
  const badges = gamification.badges || [];

  // Filter & Search State
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [selectedClassRange, setSelectedClassRange] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Featured game rotation
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);

  // Category horizontal scroll controls
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const allGamesList = useMemo(() => GAME_CATALOG, []);

  // Featured flagship list based on active category (All Games defaults to History Quest)
  const featuredGamesList = useMemo(() => {
    const listIds = CATEGORY_FEATURED_IDS[activeSubject] || CATEGORY_FEATURED_IDS.all;
    const games = listIds.map((id) => getGameById(id)).filter(Boolean) as GameDefinition[];
    if (games.length > 0) return games;
    return [getGameById('history-quest')].filter(Boolean) as GameDefinition[];
  }, [activeSubject]);

  const featuredGame = useMemo(() => {
    if (featuredGamesList.length === 0) return allGamesList[0];
    return featuredGamesList[featuredIndex % featuredGamesList.length];
  }, [featuredGamesList, featuredIndex, allGamesList]);

  // Update category scroll arrows
  const checkScrollArrows = () => {
    if (tabsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollArrows();
    const el = tabsScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollArrows);
    window.addEventListener('resize', checkScrollArrows);
    return () => {
      el.removeEventListener('scroll', checkScrollArrows);
      window.removeEventListener('resize', checkScrollArrows);
    };
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsScrollRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    tabsScrollRef.current.scrollBy({
      left: offset,
      behavior: 'smooth',
    });
  };

  const handleSelectTab = (tabId: string, buttonEl: HTMLButtonElement | null) => {
    setActiveSubject(tabId);
    setFeaturedIndex(0);
    if (buttonEl && typeof buttonEl.scrollIntoView === 'function') {
      buttonEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  // User has applied a search query or secondary filter dropdown
  const hasSpecificFilters =
    selectedClassRange !== 'all' ||
    selectedGenre !== 'all' ||
    selectedDifficulty !== 'all' ||
    searchQuery.trim().length > 0;

  // Active filtering logic for main game cards display
  const isFilteringActive = activeSubject !== 'all' || hasSpecificFilters;

  const filteredGames = useMemo(() => {
    return allGamesList.filter((game) => {
      // 1. Subject filter
      if (activeSubject !== 'all' && game.subject !== activeSubject) {
        return false;
      }

      // 2. Class filter
      if (selectedClassRange !== 'all') {
        const classCfg = CLASS_OPTIONS.find((c) => c.id === selectedClassRange);
        if (classCfg?.grades && !classCfg.grades.some((g) => game.classGrades.includes(g))) {
          return false;
        }
      }

      // 3. Genre filter
      if (selectedGenre !== 'all' && game.genre !== selectedGenre) {
        return false;
      }

      // 4. Difficulty filter
      if (selectedDifficulty !== 'all' && game.difficulty !== selectedDifficulty) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesDesc = game.description.toLowerCase().includes(query);
        const matchesSubject = game.subject.toLowerCase().includes(query);
        const matchesLearning = game.learning.some((l) => l.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesSubject && !matchesLearning) {
          return false;
        }
      }

      return true;
    });
  }, [activeSubject, selectedClassRange, selectedGenre, selectedDifficulty, searchQuery, allGamesList]);

  const resetFilters = () => {
    setActiveSubject('all');
    setSelectedClassRange('all');
    setSelectedGenre('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
    setFeaturedIndex(0);
  };

  // Curated collections for the home sections
  const trendingGames = useMemo(() => {
    return [...allGamesList].sort((a, b) => b.playersCount - a.playersCount).slice(0, 4);
  }, [allGamesList]);

  const mindMemoryGames = useMemo(() => {
    return allGamesList.filter((g) => g.subject === 'Mind & Memory').slice(0, 4);
  }, [allGamesList]);

  const detectiveGames = useMemo(() => {
    return allGamesList.filter((g) => g.subject === 'Detective & Logic').slice(0, 4);
  }, [allGamesList]);

  const continuePlayingGames = useMemo(() => {
    return CONTINUE_PLAYING_SAMPLE.map((item) => {
      const g = getGameById(item.gameId);
      return g ? { ...g, progressPercent: item.progressPercent, lastPlayed: item.lastPlayed } : null;
    }).filter(Boolean) as (GameDefinition & { progressPercent: number; lastPlayed: string })[];
  }, []);

  const subjectCards = [
    { subject: 'Mathematics', icon: '📐', count: 5, color: 'from-amber-500/10 via-orange-500/15 to-amber-500/5 border-amber-300/80 dark:border-amber-700/60 text-amber-700 dark:text-amber-300' },
    { subject: 'Science', icon: '🔬', count: 5, color: 'from-emerald-500/10 via-teal-500/15 to-emerald-500/5 border-emerald-300/80 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300' },
    { subject: 'Physics', icon: '⚡', count: 5, color: 'from-blue-500/10 via-cyan-500/15 to-blue-500/5 border-blue-300/80 dark:border-blue-700/60 text-blue-700 dark:text-blue-300' },
    { subject: 'Chemistry', icon: '🧪', count: 5, color: 'from-teal-500/10 via-green-500/15 to-teal-500/5 border-teal-300/80 dark:border-teal-700/60 text-teal-700 dark:text-teal-300' },
    { subject: 'Biology', icon: '🧬', count: 5, color: 'from-rose-500/10 via-pink-500/15 to-rose-500/5 border-rose-300/80 dark:border-rose-700/60 text-rose-700 dark:text-rose-300' },
    { subject: 'English', icon: '📚', count: 5, color: 'from-purple-500/10 via-indigo-500/15 to-purple-500/5 border-purple-300/80 dark:border-purple-700/60 text-purple-700 dark:text-purple-300' },
    { subject: 'History', icon: '🏺', count: 5, color: 'from-amber-600/10 via-yellow-600/15 to-amber-600/5 border-amber-400/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300' },
    { subject: 'Geography', icon: '🌍', count: 5, color: 'from-cyan-500/10 via-sky-500/15 to-cyan-500/5 border-cyan-300/80 dark:border-cyan-700/60 text-cyan-700 dark:text-cyan-300' },
    { subject: 'Computer Science', icon: '💻', count: 5, color: 'from-indigo-500/10 via-violet-500/15 to-indigo-500/5 border-indigo-300/80 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300' },
  ];

  return (
    <div className="relative w-full max-w-full overflow-x-hidden space-y-10 pb-20">
      {/* Subtle ambient decorative game elements in the background */}
      <div className="absolute top-8 left-1/4 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-80 h-80 bg-rose-200/20 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. BRIGHT, WELCOMING GAME ARENA HEADER (Compact & Cheerful) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-rose-50/60 dark:from-gray-900 dark:via-purple-950/40 dark:to-gray-900 border border-amber-200/70 dark:border-purple-800/40 shadow-xs p-5 sm:p-6 text-gray-900 dark:text-white">
        {/* Soft decorative elements */}
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-gradient-to-br from-amber-300/20 to-orange-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Welcome Title & Tagline */}
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Game Arena
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Learn • Play • Level Up
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Acadevia Student Arena
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
              55+ educational, cognitive, and detective games • Your class • Your adventure
            </p>
          </div>

          {/* Playful Floating Gamification Badges */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 dark:bg-gray-800/80 border border-orange-200/80 dark:border-gray-700 shadow-xs">
              <Flame className="w-4 h-4 text-orange-500" />
              <div className="text-left">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-bold">Streak</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">{streak > 0 ? `${streak} Days` : '7 Days'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 dark:bg-gray-800/80 border border-amber-200/80 dark:border-gray-700 shadow-xs">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div className="text-left">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-bold">Total XP</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">{xp > 0 ? xp.toLocaleString() : '2,450'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 dark:bg-gray-800/80 border border-yellow-200/80 dark:border-gray-700 shadow-xs">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <div className="text-left">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-bold">Badges</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">{badges.length > 0 ? badges.length : '12'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 dark:bg-gray-800/80 border border-blue-200/80 dark:border-gray-700 shadow-xs">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-bold">Class</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">Grade {studentGrade}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BRIGHT FEATURED GAME SHOWCASE (Dominant Artwork) */}
      {!hasSpecificFilters && featuredGame && (
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-amber-200/80 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px]">
            {/* Left: Large Artwork (60% visual prominence) */}
            <div className="lg:col-span-6 relative h-64 sm:h-72 lg:h-auto overflow-hidden bg-gray-950 flex items-center justify-center p-3 sm:p-5">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner relative group">
                <GameThumbnail game={featuredGame} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Right: Featured Info & Bold Play Button */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 dark:from-gray-900 dark:to-gray-900">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Featured Game
                  </span>

                  <button
                    type="button"
                    onClick={() => setFeaturedIndex((prev) => prev + 1)}
                    className="text-xs font-bold text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Next Featured</span>
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {featuredGame.title}
                </h2>

                {featuredGame.tagline && (
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    "{featuredGame.tagline}"
                  </p>
                )}

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-xl font-medium">
                  {featuredGame.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {featuredGame.subject}
                  </span>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {featuredGame.genre.split('&')[0].trim()}
                  </span>
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-500 text-white shadow-xs">
                    +{featuredGame.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Action Bar with Bold PLAY NOW button */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                <Link to={`/games/${featuredGame.id}`}>
                  <Button
                    variant="gradient"
                    size="lg"
                    leftIcon={<Play className="w-4 h-4 fill-white" />}
                    className="px-8 py-3.5 font-black text-sm shadow-lg shadow-orange-500/25 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:scale-105 transition-all text-white rounded-2xl"
                  >
                    PLAY NOW
                  </Button>
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  {featuredGame.estimatedTime} • Cl. {featuredGame.classes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GAME WORLDS CATEGORY NAVIGATION CHIPS (Compact & Horizontal Scroll) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🗺️</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Game Worlds
            </h3>
          </div>
          {isFilteringActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

        <div className="relative w-full max-w-full">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable category chips */}
          <div
            ref={tabsScrollRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth py-1 px-1"
          >
            <div className="flex items-center gap-2.5 min-w-max pb-1">
              {SUBJECT_TABS.map((tab) => {
                const isActive = activeSubject === tab.id;
                const count =
                  tab.id === 'all'
                    ? allGamesList.length
                    : allGamesList.filter((g) => g.subject === tab.subject).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => handleSelectTab(tab.id, e.currentTarget)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap shrink-0 shadow-xs ${
                      isActive
                        ? `${tab.activeColor} scale-105 shadow-md`
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/90 dark:border-gray-700 hover:bg-amber-50/50 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive
                          ? 'bg-black/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. LIGHTWEIGHT SEARCH AND FILTER BAR (No Giant Box) */}
        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-3 rounded-2xl border border-amber-200/60 dark:border-gray-800 shadow-xs">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skill, or keyword..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <select
              value={selectedClassRange}
              onChange={(e) => setSelectedClassRange(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT: FILTERED CATALOGUE OR CURATED OPEN SECTIONS */}
      {isFilteringActive ? (
        /* FILTERED RESULTS MODE */
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing <strong className="text-gray-900 dark:text-white font-bold">{filteredGames.length}</strong> matching games
            </span>
            {activeSubject !== 'all' && (
              <span className="font-bold text-amber-600 dark:text-amber-400">Category: {activeSubject}</span>
            )}
          </div>

          {filteredGames.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-amber-200 dark:border-gray-800 p-12 text-center text-gray-400 bg-white/60 dark:bg-gray-900/60">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50 text-amber-500" />
              <p className="text-base font-bold text-gray-700 dark:text-gray-300">
                No games match your current filter settings
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try resetting your search keyword or expanding class and genre options.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-amber-500 text-white text-xs font-black hover:bg-amber-600 transition shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CURATED OPEN BREATHING SECTIONS ARENA MODE */
        <div className="space-y-12">
          {/* SECTION A: CONTINUE PLAYING */}
          {continuePlayingGames.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">▶️</span>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Continue Playing
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Pick up right where you left off
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {continuePlayingGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/games/${game.id}`}
                    className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-amber-200/60 dark:border-gray-800 hover:border-amber-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-xs">
                        <GameThumbnail game={game} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                          {game.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 block font-medium">
                          Played {game.lastPlayed}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-gray-500">Mastery</span>
                        <span className="text-amber-600 font-black">{game.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full"
                          style={{ width: `${game.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: TRENDING IN ARENA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔥</span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Trending in Arena
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Most played challenges across classrooms this week
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          </div>

          {/* SECTION C: BRAIN LAB (MIND & MEMORY) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🧠</span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Brain Lab • Mind & Memory
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Sharpen visual memory, spatial recall, and cognitive focus
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubject('Mind & Memory')}
                className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                View All ({allGamesList.filter((g) => g.subject === 'Mind & Memory').length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mindMemoryGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          </div>

          {/* SECTION D: MYSTERY HOUSE (DETECTIVE & LOGIC) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔎</span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Mystery House • Detective & Logic
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Crack secret ciphers, investigate historical mysteries, and solve logic puzzles
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubject('Detective & Logic')}
                className="text-xs font-black text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
              >
                View All ({allGamesList.filter((g) => g.subject === 'Detective & Logic').length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {detectiveGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          </div>

          {/* SECTION E: EXPLORE SUBJECT WORLDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📚</span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Explore Subject Worlds
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Curriculum-aligned adventures across all core academic disciplines
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {subjectCards.map((card) => (
                <button
                  key={card.subject}
                  type="button"
                  onClick={() => setActiveSubject(card.subject)}
                  className={`p-4 rounded-2xl border text-left bg-gradient-to-br ${card.color} hover:scale-105 hover:shadow-md transition-all flex flex-col justify-between min-h-[96px] shadow-xs`}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <div className="pt-2">
                    <h5 className="text-xs font-black">{card.subject}</h5>
                    <span className="text-[10px] font-bold opacity-75">{card.count} Games</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION F: COMPLETE 55-GAME ARENA CATALOGUE */}
          <div className="space-y-4 pt-4 border-t border-gray-200/80 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎮</span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Complete Game Library ({allGamesList.length})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    All 55 interactive titles ready to play
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allGamesList.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesPage;
