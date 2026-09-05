import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, Award, Sparkles, Compass, MapPin, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { gameService } from '@/services/game.service';
import { ROUTES } from '@/config/routes.config';

interface GeoLocation {
  id: string;
  name: string;
  country: string;
  lat: number; // -90 to +90
  lng: number; // -180 to +180
  timeZoneOffset: number; // hours relative to UTC
  hint: string;
  funFact: string;
}

const CITIES: GeoLocation[] = [
  { id: 'delhi', name: 'New Delhi', country: 'India', lat: 28.6, lng: 77.2, timeZoneOffset: 5.5, hint: 'Located in the Northern Hemisphere, crossed by the Yamuna River.', funFact: 'Indian Standard Time (IST) is calculated from the 82.5°E longitude meridian in Mirzapur!' },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5, lng: -0.1, timeZoneOffset: 0, hint: 'Home of the Royal Observatory where the Prime Meridian (0° Longitude) passes.', funFact: 'Greenwich Mean Time (GMT) is the foundational global baseline for all 24 time zones.' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.7, lng: 139.7, timeZoneOffset: 9, hint: 'Island nation in the Far East near the International Date Line.', funFact: 'Japan is known as the "Land of the Rising Sun" because it is among the earliest to see dawn.' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0, lng: 31.2, timeZoneOffset: 2, hint: 'Crossed by the River Nile just north of the Tropic of Cancer.', funFact: 'The Great Pyramid of Giza was built with remarkable alignment to true cardinal geographic North.' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.9, lng: 151.2, timeZoneOffset: 10, hint: 'Deep in the Southern Hemisphere, east of the 150°E meridian.', funFact: 'When it is winter in New Delhi (December), it is mid-summer in Sydney due to Earth’s axial tilt!' },
  { id: 'rio', name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9, lng: -43.2, timeZoneOffset: -3, hint: 'Atlantic coastal city in the Southern and Western Hemispheres.', funFact: 'Located just south of the Tropic of Capricorn in the tropical climate belt.' },
];

export const WorldExplorer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [pinnedCoord, setPinnedCoord] = useState<{ lat: number; lng: number; xPct: number; yPct: number } | null>(null);
  const [selectedTimeZoneHour, setSelectedTimeZoneHour] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [isRoundEvaluated, setIsRoundEvaluated] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const city = CITIES[currentIdx];

  // Convert click coordinates on map to geographic Latitude and Longitude
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRoundEvaluated) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    // Mapping: xPct (0% to 100%) -> lng (-180 to +180)
    const lng = (xPct / 100) * 360 - 180;
    // Mapping: yPct (0% to 100%) -> lat (+90 to -90)
    const lat = 90 - (yPct / 100) * 180;

    setPinnedCoord({ lat, lng, xPct, yPct });
    setFeedback(null);
  };

  // Evaluate distance error and time zone calculation
  const handleConfirmGuess = () => {
    if (!pinnedCoord) return;

    // Approximate distance error in degrees
    const latDiff = Math.abs(pinnedCoord.lat - city.lat);
    const lngDiff = Math.abs(pinnedCoord.lng - city.lng);
    const degreeDistance = Math.hypot(latDiff, lngDiff);

    // Calculate approximate kilometers (1 degree ≈ 111 km)
    const kmDistance = Math.round(degreeDistance * 111);

    const isCoordClose = kmDistance < 1800; // within reasonable geographical radius on world map
    const gmtBaseTime = 12; // Assume 12:00 PM GMT
    const expectedLocalTime = (gmtBaseTime + city.timeZoneOffset + 24) % 24;
    const isTimeClose = Math.abs(selectedTimeZoneHour - expectedLocalTime) <= 1;

    setIsRoundEvaluated(true);

    if (isCoordClose) {
      const earned = Math.max(100, 300 - Math.floor(kmDistance / 10)) + (isTimeClose ? 100 : 0);
      setScore((s) => s + earned);
      setFeedback({
        text: `🎯 Impressive Navigation! You landed within ${kmDistance} km of ${city.name}! ${isTimeClose ? 'Time Zone calculation accurate!' : ''} (+${earned} pts)`,
        success: true,
      });

      gameService.submitScore('world-explorer', { score: earned, timeTaken: 30 }).catch(() => {});
    } else {
      setFeedback({
        text: `📍 Off course by ${kmDistance} km. ${city.name} is at ${city.lat > 0 ? `${city.lat}°N` : `${Math.abs(city.lat)}°S`}, ${city.lng > 0 ? `${city.lng}°E` : `${Math.abs(city.lng)}°W`}.`,
        success: false,
      });
    }
  };

  const handleNextCity = () => {
    if (currentIdx + 1 < CITIES.length) {
      setCurrentIdx((c) => c + 1);
      setPinnedCoord(null);
      setFeedback(null);
      setIsRoundEvaluated(false);
    } else {
      navigate(ROUTES.GAMES);
    }
  };

  const handleExit = () => {
    navigate(ROUTES.GAMES);
  };

  // Convert real city coordinates to map percentage for answer reveal
  const actualX = ((city.lng + 180) / 360) * 100;
  const actualY = ((90 - city.lat) / 180) * 100;

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
            <Globe className="h-4 w-4 text-cyan-500" />
            <span>World Explorer: Coordinate Navigator</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-semibold">
              Mission {currentIdx + 1} of {CITIES.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Target Mission Card */}
      <div className="bg-gradient-to-r from-blue-900 via-cyan-950 to-slate-900 p-6 rounded-3xl text-white border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
            Target Destination to Plot on the Globe:
          </span>
          <div className="flex items-baseline justify-center md:justify-start gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{city.name}</h1>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-400/30 text-cyan-200">
              {city.country}
            </span>
          </div>
          <p className="text-xs text-cyan-200 max-w-lg mt-1">{city.hint}</p>
        </div>

        {/* Time Zone Mission Component */}
        <div className="bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center space-y-2">
          <span className="text-[11px] font-mono text-cyan-300 uppercase block font-bold flex items-center justify-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>When GMT is 12:00 PM, what is local time?</span>
          </span>
          <div className="flex items-center justify-center gap-2">
            <select
              value={selectedTimeZoneHour}
              disabled={isRoundEvaluated}
              onChange={(e) => setSelectedTimeZoneHour(Number(e.target.value))}
              className="bg-gray-800 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-700"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {h === 0 ? '12:00 AM (Midnight)' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM (Noon)' : `${h - 12}:00 PM`}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-gray-400 block font-mono">
            Offset: {city.timeZoneOffset >= 0 ? `+${city.timeZoneOffset}` : city.timeZoneOffset} hrs from Greenwich
          </span>
        </div>
      </div>

      {/* World Map Interactive Coordinate Canvas */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
          <span>Click on the world map to drop your navigation pin:</span>
          {pinnedCoord && (
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              Pinned: {pinnedCoord.lat > 0 ? `${pinnedCoord.lat.toFixed(1)}°N` : `${Math.abs(pinnedCoord.lat).toFixed(1)}°S`}, {pinnedCoord.lng > 0 ? `${pinnedCoord.lng.toFixed(1)}°E` : `${Math.abs(pinnedCoord.lng).toFixed(1)}°W`}
            </span>
          )}
        </div>

        {/* The World Map Surface */}
        <div
          ref={mapRef}
          onClick={handleMapClick}
          className="relative w-full h-[320px] sm:h-[420px] rounded-2xl border border-cyan-500/40 overflow-hidden bg-slate-950 cursor-crosshair shadow-inner"
        >
          {/* Subtle World Map Silhouette (SVG paths) */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="none">
            {/* Grid Equator (0 deg) */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 6" />
            {/* Tropic of Cancer (+23.5 deg) */}
            <line x1="0" y1="185" x2="1000" y2="185" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" />
            {/* Tropic of Capricorn (-23.5 deg) */}
            <line x1="0" y1="315" x2="1000" y2="315" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" />
            {/* Prime Meridian (0 deg Longitude) */}
            <line x1="500" y1="0" x2="500" y2="500" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 6" />
            {/* Date line */}
            <line x1="998" y1="0" x2="998" y2="500" stroke="#6366f1" strokeWidth="1" />
            <line x1="2" y1="0" x2="2" y2="500" stroke="#6366f1" strokeWidth="1" />

            {/* Continents outlines */}
            <path d="M 150 120 Q 220 100 280 140 Q 320 200 240 260 Q 180 280 150 180 Z" fill="#1e293b" stroke="#334155" />
            <path d="M 280 260 Q 350 300 320 420 Q 280 440 270 320 Z" fill="#1e293b" stroke="#334155" />
            <path d="M 460 120 Q 520 90 580 150 Q 520 250 480 200 Z" fill="#1e293b" stroke="#334155" />
            <path d="M 460 210 Q 560 220 540 380 Q 480 390 450 280 Z" fill="#1e293b" stroke="#334155" />
            <path d="M 580 100 Q 820 90 850 240 Q 750 320 620 220 Z" fill="#1e293b" stroke="#334155" />
            <path d="M 760 320 Q 860 310 840 400 Q 770 410 750 340 Z" fill="#1e293b" stroke="#334155" />
          </svg>

          {/* Meridian Labels */}
          <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none">
            North Pole (+90°)
          </div>
          <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-mono text-cyan-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none">
            Equator (0°)
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none">
            South Pole (-90°)
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-blue-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none">
            Prime Meridian (0° Longitude)
          </div>

          {/* User's Dropped Pin */}
          {pinnedCoord && (
            <motion.div
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              style={{ left: `${pinnedCoord.xPct}%`, top: `${pinnedCoord.yPct}%` }}
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-20"
            >
              <MapPin className="h-8 w-8 text-amber-400 fill-amber-400 filter drop-shadow-md" />
            </motion.div>
          )}

          {/* Actual Destination Revealed after Guess */}
          {isRoundEvaluated && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ left: `${actualX}%`, top: `${actualY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center"
            >
              <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white animate-ping absolute" />
              <div className="h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-10">
                ✓
              </div>
              <span className="text-[11px] font-extrabold text-white bg-black/80 px-2 py-0.5 rounded-md border border-emerald-400 whitespace-nowrap mt-1">
                {city.name} ({city.lat > 0 ? `${city.lat}°N` : `${Math.abs(city.lat)}°S`}, {city.lng > 0 ? `${city.lng}°E` : `${Math.abs(city.lng)}°W`})
              </span>
            </motion.div>
          )}
        </div>

        {/* Feedback and Fun Fact */}
        {feedback && (
          <div className={`p-4 rounded-2xl text-xs space-y-1.5 ${feedback.success ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 text-emerald-800 dark:text-emerald-200' : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 text-amber-800 dark:text-amber-200'}`}>
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <span>{feedback.text}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs italic">
              🌍 Geographic Insight: {city.funFact}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isRoundEvaluated ? (
            <Button
              onClick={handleNextCity}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg"
            >
              {currentIdx + 1 < CITIES.length ? 'Next Geographic Destination →' : 'Complete Expedition!'}
            </Button>
          ) : (
            <Button
              onClick={handleConfirmGuess}
              disabled={!pinnedCoord}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-cyan-600/25"
            >
              Confirm Navigation Coordinates
            </Button>
          )}
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exit World Explorer?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your expedition score of {score} pts will be saved to your profile.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Keep Exploring
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
