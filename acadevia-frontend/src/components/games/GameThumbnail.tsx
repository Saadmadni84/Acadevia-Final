import React from 'react';
import type { GameDefinition } from './gameCatalog';

interface GameThumbnailProps {
  game: GameDefinition;
  className?: string;
  preferRaster?: boolean;
}

export const GameThumbnail: React.FC<GameThumbnailProps> = ({
  game,
  className = '',
  preferRaster = false,
}) => {
  // Render bespoke clean geometric game icon vector artwork for each game
  const renderGameIconArt = () => {
    switch (game.id) {
      /* ==================================================================== */
      /* 1. MATHEMATICS (5 Games)                                             */
      /* ==================================================================== */
      case 'number-kingdom':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="nkSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="nkGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#nkSky)" />
            {/* Cloud Hills */}
            <circle cx="80" cy="180" r="60" fill="#ffffff" opacity="0.2" />
            <circle cx="160" cy="190" r="70" fill="#ffffff" opacity="0.25" />
            <circle cx="240" cy="180" r="60" fill="#ffffff" opacity="0.2" />
            {/* Geometric Fantasy Castle (rectangles + triangle spires) */}
            <g transform="translate(180, 45)">
              <rect x="25" y="35" width="55" height="60" rx="4" fill="#e0e7ff" />
              <rect x="15" y="20" width="22" height="75" rx="3" fill="#c7d2fe" />
              <rect x="68" y="20" width="22" height="75" rx="3" fill="#c7d2fe" />
              <polygon points="26,20 15,20 26,-5" fill="#f43f5e" />
              <polygon points="79,20 68,20 79,-5" fill="#f43f5e" />
              <polygon points="52,35 25,35 52,5" fill="#e11d48" />
              <path d="M 40,95 L 40,70 A 12,12 0 0,1 65,70 L 65,95 Z" fill="#4338ca" />
            </g>
            {/* Winding Golden Path to Castle */}
            <path d="M 20,200 Q 120,170 215,130" fill="none" stroke="#fcd34d" strokeWidth="18" strokeLinecap="round" opacity="0.8" />
            <path d="M 20,200 Q 120,170 215,130" fill="none" stroke="#fef08a" strokeWidth="10" strokeLinecap="round" strokeDasharray="14 8" />
            {/* Oversized 3D Number Block "7" Hero Object */}
            <g transform="translate(60, 75)">
              <rect x="0" y="0" width="75" height="75" rx="16" fill="url(#nkGold)" filter="drop-shadow(0 12px 20px rgba(0,0,0,0.4))" />
              <rect x="6" y="6" width="63" height="63" rx="12" fill="#fbbf24" />
              <path d="M 22,25 L 53,25 L 36,58" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* Collectible Star & Coin Tokens */}
            <circle cx="165" cy="85" r="10" fill="#facc15" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
            <polygon points="165,77 168,83 174,84 170,88 171,94 165,91 159,94 160,88 156,84 162,83" fill="#fff" />
            <circle cx="140" cy="140" r="8" fill="#facc15" />
          </svg>
        );

      case 'vedic-math-master':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="vmSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="vmRoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#vmSky)" />
            {/* Speed Streak Lines */}
            <line x1="0" y1="40" x2="320" y2="70" stroke="#00f2fe" strokeWidth="2" strokeDasharray="14 10" opacity="0.4" />
            <line x1="0" y1="160" x2="320" y2="130" stroke="#ff007f" strokeWidth="2" strokeDasharray="14 10" opacity="0.4" />
            {/* Curved perspective racing track */}
            <polygon points="160,60 320,200 0,200" fill="url(#vmRoad)" />
            <line x1="160" y1="60" x2="160" y2="200" stroke="#facc15" strokeWidth="4" strokeDasharray="16 10" />
            <line x1="160" y1="60" x2="60" y2="200" stroke="#00f2fe" strokeWidth="3" />
            <line x1="160" y1="60" x2="260" y2="200" stroke="#00f2fe" strokeWidth="3" />
            {/* Large Luminous Number Gate Arch */}
            <path d="M 90,135 L 90,85 A 35,35 0 0,1 230,85 L 230,135" fill="none" stroke="#00f2fe" strokeWidth="8" strokeLinecap="round" filter="drop-shadow(0 0 15px #00f2fe)" />
            <circle cx="160" cy="72" r="16" fill="#00f2fe" />
            <polygon points="160,64 168,78 152,78" fill="#020617" />
            {/* Dynamic Runner Silhouette with Exaggerated Running Pose */}
            <g transform="translate(140, 115)">
              <circle cx="20" cy="12" r="10" fill="#ff007f" filter="drop-shadow(0 0 10px #ff007f)" />
              <rect x="14" y="20" width="12" height="24" rx="6" fill="#fff" />
              <path d="M 8,26 L 16,30 L 26,22" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              <path d="M 12,42 L 5,56 L 16,58" fill="none" stroke="#ff007f" strokeWidth="5" strokeLinecap="round" />
              <path d="M 22,42 L 32,50 L 36,62" fill="none" stroke="#ff007f" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'trigonometry-quest':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="tqBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="60%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#tqBg)" />
            {/* Geometric mountain peaks */}
            <polygon points="220,70 320,190 140,190" fill="#7c2d12" />
            <polygon points="90,90 190,190 0,190" fill="#9a3412" />
            {/* Big Right-Angled Triangle Geometry (Hero Gameplay Element) */}
            <polygon points="65,155 245,155 245,45" fill="rgba(255,255,255,0.12)" stroke="#facc15" strokeWidth="5" strokeLinejoin="round" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.5))" />
            <path d="M 105,155 A 40,40 0 0,0 95,135" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <polyline points="230,155 230,140 245,140" fill="none" stroke="#facc15" strokeWidth="3" />
            <line x1="65" y1="155" x2="245" y2="45" stroke="#fff" strokeWidth="3" strokeDasharray="6 4" />
            {/* Stylized Explorer atop triangle peak */}
            <g transform="translate(230, 20)">
              <circle cx="15" cy="10" r="8" fill="#38bdf8" />
              <rect x="9" y="18" width="12" height="15" rx="4" fill="#fff" />
              <line x1="25" y1="2" x2="25" y2="25" stroke="#facc15" strokeWidth="2.5" />
              <polygon points="25,2 38,7 25,12" fill="#ef4444" />
            </g>
          </svg>
        );

      case 'fraction-forge':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ffBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="ffGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ffBg)" />
            {/* Forge Fire Glow Halo */}
            <circle cx="160" cy="110" r="70" fill="#f97316" opacity="0.25" />
            {/* Heavy Iron Anvil */}
            <path d="M 90,145 L 230,145 L 215,185 L 105,185 Z" fill="#334155" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))" />
            <rect x="115" y="130" width="90" height="16" rx="3" fill="#475569" />
            {/* Segmented Circular Fraction Disk on Anvil (Hero Object) */}
            <g transform="translate(130, 95)">
              <circle cx="30" cy="30" r="26" fill="#64748b" />
              <path d="M 30,30 L 30,4 A 26,26 0 0,1 56,30 Z" fill="url(#ffGold)" filter="drop-shadow(0 0 12px #facc15)" />
              <line x1="30" y1="4" x2="30" y2="56" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="4" y1="30" x2="56" y2="30" stroke="#1e293b" strokeWidth="2.5" />
            </g>
            {/* Heavy Blacksmith Hammer Striking */}
            <g transform="translate(180, 50) rotate(-25)">
              <rect x="0" y="10" width="34" height="22" rx="4" fill="#94a3b8" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.5))" />
              <rect x="14" y="32" width="6" height="40" rx="3" fill="#78350f" />
            </g>
            {/* Glowing forge sparks */}
            <circle cx="155" cy="90" r="4" fill="#facc15" />
            <circle cx="170" cy="85" r="3" fill="#ff007f" />
            <circle cx="140" cy="95" r="3" fill="#facc15" />
          </svg>
        );

      case 'coordinate-quest':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="cqBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#091428" />
                <stop offset="100%" stopColor="#0a2e5c" />
              </linearGradient>
              <radialGradient id="cqRadar" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#4facfe" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cqBeacon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff007f" />
                <stop offset="100%" stopColor="#7928ca" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#cqBg)" />
            {/* Holographic coordinate grid plane */}
            <g stroke="#00f2fe" strokeWidth="1" opacity="0.25">
              <line x1="40" y1="0" x2="40" y2="200" />
              <line x1="100" y1="0" x2="100" y2="200" />
              <line x1="160" y1="0" x2="160" y2="200" strokeWidth="2" opacity="0.6" />
              <line x1="220" y1="0" x2="220" y2="200" />
              <line x1="280" y1="0" x2="280" y2="200" />
              <line x1="0" y1="40" x2="320" y2="40" />
              <line x1="0" y1="100" x2="320" y2="100" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="160" x2="320" y2="160" />
            </g>
            {/* Radar scanner glow ring */}
            <circle cx="160" cy="100" r="75" fill="url(#cqRadar)" />
            <circle cx="160" cy="100" r="75" fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
            <circle cx="160" cy="100" r="45" fill="none" stroke="#00f2fe" strokeWidth="1" opacity="0.4" />
            {/* Target waypoint marker diamond (Oversized 3D focal object) */}
            <polygon points="160,55 195,100 160,145 125,100" fill="url(#cqBeacon)" filter="drop-shadow(0 8px 16px rgba(255,0,127,0.7))" />
            <circle cx="160" cy="100" r="12" fill="#fff" filter="drop-shadow(0 0 10px #00f2fe)" />
            {/* Crosshair reticle laser lock */}
            <line x1="160" y1="35" x2="160" y2="50" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <line x1="160" y1="150" x2="160" y2="165" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <line x1="105" y1="100" x2="120" y2="100" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <line x1="200" y1="100" x2="215" y2="100" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      /* ==================================================================== */
      /* 2. SCIENCE (5 Games)                                                 */
      /* ==================================================================== */
      case 'science-lab':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="slGlow" cx="50%" cy="60%" r="60%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#042f2e" />
              </radialGradient>
              <linearGradient id="slFlask" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#slGlow)" />
            <circle cx="160" cy="120" r="65" fill="#065f46" opacity="0.3" />
            {/* Giant Glowing Erlenmeyer Flask */}
            <path
              d="M 148,45 L 172,45 L 172,75 L 215,155 Q 218,162 210,165 L 110,165 Q 102,162 105,155 L 148,75 Z"
              fill="url(#slFlask)"
              filter="drop-shadow(0 15px 25px rgba(16,185,129,0.8))"
            />
            <ellipse cx="160" cy="115" rx="35" ry="10" fill="#a7f3d0" opacity="0.9" />
            {/* Bubbling exothermic plasma particles */}
            <circle cx="150" cy="135" r="8" fill="#fff" opacity="0.8" />
            <circle cx="175" cy="145" r="6" fill="#fef08a" opacity="0.9" />
            <circle cx="160" cy="85" r="5" fill="#38bdf8" />
            <circle cx="140" cy="55" r="4" fill="#a7f3d0" />
            <circle cx="175" cy="35" r="6" fill="#34d399" />
            <path d="M 152,78 L 118,150" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          </svg>
        );

      case 'ecosystem-tycoon':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ecoBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
              <linearGradient id="ecoGlobe" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ecoBg)" />
            <circle cx="160" cy="100" r="75" fill="#eab308" opacity="0.2" />
            {/* Giant Floating Biome Terrarium Sphere */}
            <circle cx="160" cy="100" r="62" fill="url(#ecoGlobe)" filter="drop-shadow(0 15px 25px rgba(34,197,94,0.7))" />
            <path d="M 125,75 Q 145,60 170,80 Q 195,100 175,125 Q 145,135 125,115 Z" fill="#166534" />
            <path d="M 160,95 Q 185,105 195,125 Q 180,145 155,140 Z" fill="#0284c7" />
            {/* Sprouting Golden Seedling */}
            <path d="M 160,45 Q 175,30 190,40 Q 185,55 160,45 Z" fill="#facc15" filter="drop-shadow(0 4px 10px rgba(250,204,21,0.8))" />
            <path d="M 160,45 Q 145,30 130,40 Q 135,55 160,45 Z" fill="#4ade80" />
            <rect x="157" y="42" width="6" height="25" rx="3" fill="#ca8a04" />
          </svg>
        );

      case 'energy-transformer':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="etBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <radialGradient id="etCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#etBg)" />
            <circle cx="160" cy="100" r="68" fill="none" stroke="#6366f1" strokeWidth="8" opacity="0.6" />
            <circle cx="160" cy="100" r="54" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="12 6" />
            {/* Plasma Energy Core */}
            <circle cx="160" cy="100" r="38" fill="url(#etCore)" filter="drop-shadow(0 0 25px #38bdf8)" />
            {/* Lightning bolt arcs */}
            <polygon points="160,65 172,95 162,95 175,135 148,105 158,105" fill="#facc15" filter="drop-shadow(0 0 12px #facc15)" />
            <rect x="156" y="24" width="8" height="20" rx="4" fill="#38bdf8" />
            <rect x="156" y="156" width="8" height="20" rx="4" fill="#38bdf8" />
            <rect x="84" y="96" width="20" height="8" rx="4" fill="#38bdf8" />
            <rect x="216" y="96" width="20" height="8" rx="4" fill="#38bdf8" />
          </svg>
        );

      case 'optics-ray-maze':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ormBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="ormPrism" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ormBg)" />
            <line x1="20" y1="100" x2="135" y2="100" stroke="#fff" strokeWidth="4" filter="drop-shadow(0 0 8px #fff)" />
            {/* Glass Optical Prism */}
            <polygon points="160,50 205,145 115,145" fill="url(#ormPrism)" stroke="#bae6fd" strokeWidth="2" filter="drop-shadow(0 10px 20px rgba(56,189,248,0.7))" />
            {/* Refracted rainbow spectrum rays */}
            <line x1="175" y1="100" x2="300" y2="60" stroke="#ef4444" strokeWidth="3" filter="drop-shadow(0 0 6px #ef4444)" />
            <line x1="175" y1="100" x2="300" y2="85" stroke="#f59e0b" strokeWidth="3" filter="drop-shadow(0 0 6px #f59e0b)" />
            <line x1="175" y1="100" x2="300" y2="110" stroke="#10b981" strokeWidth="3" filter="drop-shadow(0 0 6px #10b981)" />
            <line x1="175" y1="100" x2="300" y2="135" stroke="#06b6d4" strokeWidth="3" filter="drop-shadow(0 0 6px #06b6d4)" />
            <line x1="175" y1="100" x2="300" y2="160" stroke="#8b5cf6" strokeWidth="3" filter="drop-shadow(0 0 6px #8b5cf6)" />
          </svg>
        );

      case 'plate-tectonics-lab':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ptBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="ptMagma" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff0000" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ptBg)" />
            <polygon points="0,110 130,110 100,190 0,190" fill="#713f12" />
            <polygon points="175,110 320,110 320,190 200,190" fill="#52525b" />
            {/* Glowing Magma Fault Rift */}
            <polygon points="120,200 170,200 190,110 145,110" fill="url(#ptMagma)" filter="drop-shadow(0 0 20px #f97316)" />
            <path d="M 160,110 Q 150,40 160,20 Q 170,40 160,110 Z" fill="url(#ptMagma)" filter="drop-shadow(0 0 15px #ef4444)" />
            <circle cx="160" cy="25" r="10" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
            <circle cx="140" cy="45" r="5" fill="#f97316" />
            <circle cx="180" cy="55" r="6" fill="#f97316" />
          </svg>
        );

      /* ==================================================================== */
      /* 3. PHYSICS (5 Games)                                                 */
      /* ==================================================================== */
      case 'projectile-master':
      case 'projectile-motion':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="pmBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#pmBg)" />
            {/* Star dots in sky */}
            <circle cx="80" cy="35" r="2" fill="#fff" opacity="0.8" />
            <circle cx="210" cy="25" r="2" fill="#fff" opacity="0.8" />
            <circle cx="280" cy="55" r="2" fill="#fff" opacity="0.8" />
            {/* Canyon Cliff Platforms */}
            <rect x="0" y="135" width="85" height="65" fill="#334155" />
            <rect x="235" y="135" width="85" height="65" fill="#334155" />
            {/* Brass Artillery Cannon tilted at 45 deg */}
            <g transform="translate(35, 120)">
              <circle cx="15" cy="18" r="14" fill="#b45309" stroke="#78350f" strokeWidth="4" />
              <rect x="12" y="-12" width="36" height="18" rx="4" fill="#d97706" transform="rotate(-40 12 -12)" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.5))" />
            </g>
            {/* Glowing Parabolic Trajectory Arc */}
            <path d="M 68,102 Q 160,20 265,130" fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="8 6" filter="drop-shadow(0 0 8px #facc15)" />
            {/* Glowing Cannonball in mid-flight */}
            <circle cx="160" cy="48" r="9" fill="#ef4444" filter="drop-shadow(0 0 12px #ef4444)" />
            {/* Bullseye Target on right cliff */}
            <g transform="translate(265, 120)">
              <circle cx="0" cy="10" r="16" fill="#ef4444" />
              <circle cx="0" cy="10" r="11" fill="#fff" />
              <circle cx="0" cy="10" r="6" fill="#ef4444" />
            </g>
          </svg>
        );

      case 'circuit-runner':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="crBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#052e16" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#crBg)" />
            {/* Gold PCB Circuit Motherboard Tracks */}
            <path d="M 30,100 L 90,100 L 130,60 L 190,60 L 220,90 L 290,90" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
            <path d="M 60,150 L 120,150 L 160,110 L 250,110" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            <circle cx="90" cy="100" r="7" fill="#facc15" />
            <circle cx="190" cy="60" r="7" fill="#facc15" />
            <circle cx="220" cy="90" r="7" fill="#facc15" />
            {/* Giant High-Voltage Capacitor / Electric Runner Spark */}
            <circle cx="160" cy="100" r="28" fill="#38bdf8" filter="drop-shadow(0 0 25px #00f2fe)" />
            <polygon points="160,78 168,98 160,98 170,122 152,102 160,102" fill="#fff" filter="drop-shadow(0 0 8px #fff)" />
          </svg>
        );

      case 'truss-bridge-builder':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="tbBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#tbBg)" />
            <polygon points="0,120 70,120 50,200 0,200" fill="#334155" />
            <polygon points="250,120 320,120 320,200 270,200" fill="#334155" />
            {/* Heavy Steel Truss Bridge Girder Framework */}
            <line x1="50" y1="120" x2="270" y2="120" stroke="#f97316" strokeWidth="6" />
            <line x1="70" y1="65" x2="250" y2="65" stroke="#f97316" strokeWidth="5" />
            <g stroke="#f97316" strokeWidth="4" strokeLinecap="round">
              <line x1="50" y1="120" x2="70" y2="65" />
              <line x1="70" y1="65" x2="115" y2="120" />
              <line x1="115" y1="120" x2="160" y2="65" />
              <line x1="160" y1="65" x2="205" y2="120" />
              <line x1="205" y1="120" x2="250" y2="65" />
              <line x1="250" y1="65" x2="270" y2="120" />
            </g>
            <circle cx="160" cy="65" r="14" fill="#22c55e" filter="drop-shadow(0 0 15px #22c55e)" />
            <circle cx="160" cy="65" r="6" fill="#fff" />
          </svg>
        );

      case 'physics-velocity-racer':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="pvrBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#pvrBg)" />
            <line x1="0" y1="30" x2="320" y2="80" stroke="#38bdf8" strokeWidth="2" strokeDasharray="16 8" opacity="0.6" />
            <line x1="0" y1="170" x2="320" y2="120" stroke="#ec4899" strokeWidth="2" strokeDasharray="16 8" opacity="0.6" />
            {/* Futuristic Hovercraft */}
            <polygon points="260,100 80,60 115,100 80,140" fill="#f43f5e" filter="drop-shadow(0 10px 20px rgba(244,63,94,0.8))" />
            <polygon points="230,100 115,80 135,100 115,120" fill="#fb7185" />
            <line x1="80" y1="100" x2="10" y2="100" stroke="#00f2fe" strokeWidth="8" strokeLinecap="round" filter="drop-shadow(0 0 12px #00f2fe)" />
            <circle cx="210" cy="100" r="10" fill="#fff" opacity="0.9" />
          </svg>
        );

      case 'gravity-orbit-lab':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="golSpace" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#030712" />
              </radialGradient>
              <radialGradient id="golPlanet" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#4c1d95" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#golSpace)" />
            {/* Massive Gravitational Planet */}
            <circle cx="160" cy="100" r="48" fill="url(#golPlanet)" filter="drop-shadow(0 0 30px #a855f7)" />
            <ellipse cx="160" cy="100" rx="85" ry="24" fill="none" stroke="#c084fc" strokeWidth="3" opacity="0.6" transform="rotate(-15 160 100)" />
            {/* Slingshot Orbital Trajectory Arc */}
            <path d="M 30,180 Q 160,20 290,160" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 6" filter="drop-shadow(0 0 10px #38bdf8)" />
            <circle cx="205" cy="52" r="7" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
            <polygon points="198,52 212,52 205,42" fill="#fff" />
          </svg>
        );

      /* ==================================================================== */
      /* 4. CHEMISTRY (5 Games)                                               */
      /* ==================================================================== */
      case 'element-factory':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="efBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#042f2e" />
                <stop offset="100%" stopColor="#134e4a" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#efBg)" />
            {/* Atomic Electron Orbital Rings */}
            <ellipse cx="160" cy="100" rx="75" ry="26" fill="none" stroke="#2dd4bf" strokeWidth="2.5" transform="rotate(30 160 100)" filter="drop-shadow(0 0 8px #2dd4bf)" />
            <ellipse cx="160" cy="100" rx="75" ry="26" fill="none" stroke="#2dd4bf" strokeWidth="2.5" transform="rotate(-30 160 100)" filter="drop-shadow(0 0 8px #2dd4bf)" />
            <ellipse cx="160" cy="100" rx="75" ry="26" fill="none" stroke="#2dd4bf" strokeWidth="2.5" transform="rotate(90 160 100)" filter="drop-shadow(0 0 8px #2dd4bf)" />
            <circle cx="215" cy="70" r="6" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
            <circle cx="105" cy="130" r="6" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
            {/* Heavy Atomic Nucleus Core */}
            <circle cx="160" cy="100" r="26" fill="#f43f5e" filter="drop-shadow(0 0 20px #f43f5e)" />
            <circle cx="155" cy="95" r="9" fill="#fb7185" />
            <circle cx="168" cy="105" r="8" fill="#fda4af" />
          </svg>
        );

      case 'molecule-crafter':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="mcBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#mcBg)" />
            {/* 3D Ball-and-Stick Chemical Bond Sticks */}
            <line x1="160" y1="70" x2="105" y2="140" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="160" y1="70" x2="215" y2="140" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="105" y1="140" x2="215" y2="140" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <circle cx="160" cy="70" r="24" fill="#ef4444" filter="drop-shadow(0 10px 18px rgba(239,68,68,0.8))" />
            <circle cx="153" cy="63" r="7" fill="#fca5a5" />
            <circle cx="105" cy="140" r="18" fill="#38bdf8" filter="drop-shadow(0 8px 15px rgba(56,189,248,0.8))" />
            <circle cx="215" cy="140" r="18" fill="#38bdf8" filter="drop-shadow(0 8px 15px rgba(56,189,248,0.8))" />
          </svg>
        );

      case 'reaction-reactor':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="rrBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b0764" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#rrBg)" />
            <rect x="110" y="50" width="100" height="110" rx="16" fill="#475569" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.7))" />
            <circle cx="160" cy="105" r="36" fill="#f97316" filter="drop-shadow(0 0 25px #f97316)" />
            <polygon points="160,80 166,98 185,102 169,112 173,130 160,118 147,130 151,112 135,102 154,98" fill="#facc15" />
            <circle cx="160" cy="35" r="14" fill="#cbd5e1" stroke="#334155" strokeWidth="3" />
            <line x1="160" y1="35" x2="167" y2="28" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'acid-base-titration':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="abtBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="abtFlask" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#abtBg)" />
            <rect x="156" y="10" width="8" height="95" rx="2" fill="#bae6fd" opacity="0.8" />
            <line x1="154" y1="105" x2="166" y2="105" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="118" r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
            <path
              d="M 148,125 L 172,125 L 195,175 Q 198,180 190,182 L 130,182 Q 122,180 125,175 Z"
              fill="url(#abtFlask)"
              filter="drop-shadow(0 10px 20px rgba(236,72,153,0.8))"
            />
          </svg>
        );

      case 'states-of-matter-lab':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="somBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#somBg)" />
            {/* Solid: Ordered Ice Crystal Cube */}
            <rect x="50" y="80" width="45" height="45" rx="6" fill="#38bdf8" opacity="0.9" filter="drop-shadow(0 8px 15px rgba(56,189,248,0.6))" />
            {/* Liquid: Fluid Wave Droplet */}
            <circle cx="160" cy="100" r="25" fill="#0284c7" filter="drop-shadow(0 8px 15px rgba(2,132,199,0.7))" />
            {/* Gas: Free Kinetic Thermal Particles */}
            <circle cx="240" cy="70" r="8" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
            <circle cx="265" cy="95" r="9" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
            <circle cx="235" cy="120" r="7" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
            <circle cx="260" cy="135" r="6" fill="#facc15" />
          </svg>
        );

      /* ==================================================================== */
      /* 5. BIOLOGY (5 Games)                                                 */
      /* ==================================================================== */
      case 'cell-defender':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="cdBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#042f2e" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#cdBg)" />
            {/* Large Friendly Living Cell with Glowing Membrane */}
            <circle cx="130" cy="100" r="65" fill="#065f46" stroke="#34d399" strokeWidth="6" filter="drop-shadow(0 0 20px #10b981)" />
            <circle cx="120" cy="95" r="24" fill="#047857" />
            <circle cx="115" cy="90" r="8" fill="#6ee7b7" />
            {/* Nanobot Defender Shield */}
            <polygon points="190,75 220,75 205,115" fill="#38bdf8" filter="drop-shadow(0 0 12px #38bdf8)" />
            {/* Deflected Spiky Virus Circles */}
            <g transform="translate(245, 60)">
              <circle cx="15" cy="15" r="12" fill="#ef4444" />
              <line x1="15" y1="-2" x2="15" y2="32" stroke="#ef4444" strokeWidth="3" />
              <line x1="-2" y1="15" x2="32" y2="15" stroke="#ef4444" strokeWidth="3" />
              <line x1="3" y1="3" x2="27" y2="27" stroke="#ef4444" strokeWidth="3" />
            </g>
            <g transform="translate(230, 125)">
              <circle cx="12" cy="12" r="9" fill="#f43f5e" />
              <line x1="12" y1="-2" x2="12" y2="26" stroke="#f43f5e" strokeWidth="2.5" />
              <line x1="-2" y1="12" x2="26" y2="12" stroke="#f43f5e" strokeWidth="2.5" />
            </g>
          </svg>
        );

      case 'dna-helix-builder':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="dnaBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#dnaBg)" />
            <path d="M 60,160 Q 110,60 160,100 Q 210,140 260,40" fill="none" stroke="#22c55e" strokeWidth="6" filter="drop-shadow(0 0 12px #22c55e)" />
            <path d="M 60,40 Q 110,140 160,100 Q 210,60 260,160" fill="none" stroke="#38bdf8" strokeWidth="6" filter="drop-shadow(0 0 12px #38bdf8)" />
            <line x1="100" y1="88" x2="100" y2="112" stroke="#facc15" strokeWidth="4" />
            <line x1="130" y1="80" x2="130" y2="120" stroke="#f43f5e" strokeWidth="4" />
            <line x1="190" y1="80" x2="190" y2="120" stroke="#a855f7" strokeWidth="4" />
            <line x1="220" y1="88" x2="220" y2="112" stroke="#facc15" strokeWidth="4" />
            <circle cx="160" cy="100" r="10" fill="#fff" filter="drop-shadow(0 0 10px #fff)" />
          </svg>
        );

      case 'evolution-island':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="eiBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#eiBg)" />
            <polygon points="160,50 250,150 70,150" fill="#78350f" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.6))" />
            <polygon points="160,50 210,150 110,150" fill="#15803d" />
            <path d="M 160,80 Q 185,60 205,75 Q 195,95 160,80 Z" fill="#facc15" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))" />
            <path d="M 0,165 Q 80,155 160,165 Q 240,175 320,165 L 320,200 L 0,200 Z" fill="#075985" />
          </svg>
        );

      case 'organ-medic':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="omBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#1c1917" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#omBg)" />
            <path d="M 20,100 L 90,100 L 110,60 L 125,140 L 140,80 L 155,100 L 300,100" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" filter="drop-shadow(0 0 10px #22c55e)" />
            <path
              d="M 160,65 C 145,45 110,45 110,75 C 110,105 160,145 160,145 C 160,145 210,105 210,75 C 210,45 175,45 160,65 Z"
              fill="#ef4444"
              filter="drop-shadow(0 0 25px #ef4444)"
              opacity="0.85"
            />
          </svg>
        );

      case 'microbe-hunter':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="mhLens" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#082f49" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="#020617" />
            <circle cx="160" cy="100" r="75" fill="url(#mhLens)" stroke="#38bdf8" strokeWidth="4" filter="drop-shadow(0 0 20px #0284c7)" />
            <circle cx="160" cy="100" r="40" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
            <path
              d="M 160,75 Q 185,80 185,105 Q 180,125 155,125 Q 135,115 140,90 Q 145,75 160,75 Z"
              fill="#a855f7"
              filter="drop-shadow(0 0 15px #a855f7)"
            />
            <circle cx="162" cy="98" r="8" fill="#facc15" />
          </svg>
        );

      /* ==================================================================== */
      /* 6. ENGLISH (5 Games)                                                 */
      /* ==================================================================== */
      case 'type-rush':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="trSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#trSky)" />
            <polygon points="160,50 310,200 10,200" fill="#020617" />
            {/* 3D Keyboard Keys Track Tiles */}
            <g transform="translate(85, 140)">
              <rect x="0" y="0" width="34" height="30" rx="6" fill="#38bdf8" filter="drop-shadow(0 6px 10px rgba(56,189,248,0.5))" />
              <rect x="42" y="0" width="34" height="30" rx="6" fill="#a855f7" filter="drop-shadow(0 6px 10px rgba(168,85,247,0.5))" />
              <rect x="84" y="0" width="34" height="30" rx="6" fill="#f43f5e" filter="drop-shadow(0 6px 10px rgba(244,63,94,0.5))" />
              <rect x="126" y="0" width="34" height="30" rx="6" fill="#facc15" filter="drop-shadow(0 6px 10px rgba(250,204,21,0.5))" />
            </g>
            {/* Speed Racing Cars */}
            <g transform="translate(110, 85)">
              <polygon points="40,25 0,15 10,25 0,35" fill="#f97316" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
              <rect x="8" y="22" width="16" height="6" rx="2" fill="#fff" />
              <polygon points="0,25 -14,21 -10,25 -14,29" fill="#00f2fe" />
            </g>
            <g transform="translate(170, 75)">
              <polygon points="35,22 0,12 8,22 0,32" fill="#06b6d4" />
              <rect x="8" y="19" width="14" height="6" rx="2" fill="#fff" />
            </g>
            <line x1="80" y1="55" x2="240" y2="55" stroke="#fff" strokeWidth="6" strokeDasharray="12 12" />
          </svg>
        );

      case 'word-runner':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="wrBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#wrBg)" />
            {/* Floating Letter Blocks */}
            <polygon points="80,110 120,90 160,110 120,130" fill="#f97316" />
            <polygon points="80,110 120,130 120,165 80,145" fill="#ea580c" />
            <polygon points="120,130 160,110 160,145 120,165" fill="#c2410c" />
            <polygon points="160,80 200,60 240,80 200,100" fill="#38bdf8" />
            <polygon points="160,80 200,100 200,135 160,115" fill="#0284c7" />
            <polygon points="200,100 240,80 240,115 200,135" fill="#0369a1" />
            {/* Leaping Parkour Runner Silhouette */}
            <circle cx="180" cy="40" r="10" fill="#fff" filter="drop-shadow(0 0 10px #facc15)" />
            <path d="M 175,50 L 195,65 L 180,85 L 165,70 Z" fill="#fff" />
          </svg>
        );

      case 'grammar-kingdom':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="gkBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#gkBg)" />
            <rect x="90" y="45" width="140" height="115" rx="8" fill="#fef3c7" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.6))" />
            <circle cx="160" cy="145" r="18" fill="#dc2626" filter="drop-shadow(0 4px 8px rgba(220,38,38,0.7))" />
            <polygon points="152,142 168,142 160,132" fill="#fef08a" />
            <line x1="100" y1="130" x2="220" y2="40" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 0 10px #f59e0b)" />
            <circle cx="220" cy="40" r="8" fill="#fff" />
          </svg>
        );

      case 'story-detective':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="sdBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#27272a" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#sdBg)" />
            <rect x="75" y="30" width="170" height="145" rx="4" fill="#f4f4f5" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.8))" />
            <rect x="155" y="55" width="65" height="24" rx="4" fill="#dc2626" opacity="0.85" />
            <circle cx="130" cy="95" r="38" fill="none" stroke="#d97706" strokeWidth="7" filter="drop-shadow(0 12px 20px rgba(0,0,0,0.6))" />
            <circle cx="130" cy="95" r="32" fill="#38bdf8" opacity="0.25" />
            <line x1="155" y1="120" x2="210" y2="175" stroke="#78350f" strokeWidth="12" strokeLinecap="round" />
          </svg>
        );

      case 'etymology-alchemist':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="eaGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#c026d3" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#18181b" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#eaGlow)" />
            <path d="M 110,95 L 210,95 L 195,160 Q 160,175 125,160 Z" fill="#334155" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))" />
            <ellipse cx="160" cy="95" rx="45" ry="14" fill="#d946ef" filter="drop-shadow(0 0 20px #d946ef)" />
            <circle cx="160" cy="55" r="8" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
            <polygon points="135,50 145,65 125,65" fill="#38bdf8" />
            <polygon points="185,50 195,65 175,65" fill="#38bdf8" />
          </svg>
        );

      /* ==================================================================== */
      /* 7. HISTORY (5 Games)                                                 */
      /* ==================================================================== */
      case 'history-quest':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="hqBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="60%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#hqBg)" />
            <path d="M 120,130 Q 160,50 200,130 Z" fill="#92400e" />
            <rect x="156" y="45" width="8" height="25" fill="#facc15" />
            <circle cx="160" cy="42" r="6" fill="#facc15" />
            <path d="M 20,185 Q 120,135 160,130 Q 220,125 300,165" fill="none" stroke="#fde68a" strokeWidth="16" strokeLinecap="round" opacity="0.6" />
            <path d="M 20,185 Q 120,135 160,130 Q 220,125 300,165" fill="none" stroke="#d97706" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 8" />
            <g transform="translate(60, 85)">
              <polygon points="10,40 50,40 55,18 38,28 30,12 22,28 5,18" fill="#facc15" stroke="#b45309" strokeWidth="3" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.6))" />
              <circle cx="30" cy="12" r="4" fill="#ef4444" />
              <circle cx="10" cy="40" r="3" fill="#38bdf8" />
              <circle cx="50" cy="40" r="3" fill="#38bdf8" />
            </g>
          </svg>
        );

      case 'indus-valley-builder':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ivbBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#164e63" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ivbBg)" />
            <path d="M 0,160 Q 160,120 320,150 L 320,200 L 0,200 Z" fill="#0284c7" />
            <g transform="translate(100, 60)">
              <rect x="40" y="55" width="80" height="40" rx="3" fill="#9a3412" filter="drop-shadow(0 8px 15px rgba(0,0,0,0.4))" />
              <rect x="55" y="30" width="50" height="25" rx="3" fill="#c2410c" />
              <rect x="70" y="12" width="20" height="18" rx="2" fill="#ea580c" />
              <rect x="20" y="70" width="45" height="25" rx="2" fill="#0369a1" stroke="#fed7aa" strokeWidth="2" />
            </g>
            <g transform="translate(50, 65)">
              <circle cx="20" cy="15" r="9" fill="#78350f" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))" />
              <rect x="16" y="24" width="8" height="36" rx="4" fill="#78350f" />
              <path d="M 16,30 L 6,42 L 14,48" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
              <path d="M 24,30 L 32,38 L 26,50" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'freedom-movement-quest':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="fmBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#fmBg)" />
            <circle cx="160" cy="85" r="42" fill="none" stroke="#1e3a8a" strokeWidth="3" opacity="0.8" />
            <circle cx="160" cy="85" r="6" fill="#1e3a8a" />
            <g stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6">
              <line x1="160" y1="45" x2="160" y2="125" />
              <line x1="120" y1="85" x2="200" y2="85" />
              <line x1="132" y1="57" x2="188" y2="113" />
              <line x1="132" y1="113" x2="188" y2="57" />
            </g>
            <g transform="translate(135, 80)">
              <circle cx="25" cy="18" r="14" fill="#0f172a" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))" />
              <path d="M 12,32 L 38,32 L 42,75 L 8,75 Z" fill="#0f172a" />
              <line x1="38" y1="15" x2="48" y2="70" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
              <circle cx="38" cy="10" r="8" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
            </g>
          </svg>
        );

      case 'emperors-court':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ecBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ecBg)" />
            <path d="M 70,200 L 70,80 Q 160,20 250,80 L 250,200 Z" fill="#b45309" opacity="0.4" />
            <circle cx="160" cy="95" r="52" fill="#facc15" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.7))" />
            <circle cx="160" cy="95" r="44" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
            <circle cx="160" cy="95" r="16" fill="#ca8a04" />
            <rect x="90" y="145" width="140" height="45" rx="6" fill="#713f12" />
            <ellipse cx="160" cy="145" rx="70" ry="12" fill="#eab308" />
          </svg>
        );

      case 'artifact-archaeologist':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="aaBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#292524" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#aaBg)" />
            <rect x="0" y="130" width="320" height="70" fill="#44403c" />
            <rect x="0" y="160" width="320" height="40" fill="#292524" />
            <rect x="110" y="70" width="90" height="90" rx="10" fill="#ea580c" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))" />
            <circle cx="155" cy="115" r="24" fill="#c2410c" />
            <polygon points="190,50 240,40 225,85" fill="#94a3b8" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))" />
            <rect x="235" y="32" width="55" height="10" rx="5" fill="#78350f" transform="rotate(35 235 32)" />
            <circle cx="185" cy="75" r="5" fill="#fed7aa" />
            <circle cx="205" cy="95" r="4" fill="#fed7aa" />
          </svg>
        );

      /* ==================================================================== */
      /* 8. GEOGRAPHY (5 Games)                                               */
      /* ==================================================================== */
      case 'world-explorer':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="weBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#weBg)" />
            <ellipse cx="160" cy="100" r="75" fill="#0284c7" opacity="0.4" />
            <ellipse cx="160" cy="100" r="55" fill="#0ea5e9" opacity="0.3" />
            <circle cx="160" cy="100" r="50" fill="#facc15" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.7))" />
            <circle cx="160" cy="100" r="42" fill="#1e293b" />
            <polygon points="160,65 170,100 160,94" fill="#ef4444" />
            <polygon points="160,135 150,100 160,106" fill="#e2e8f0" />
            <circle cx="160" cy="100" r="6" fill="#facc15" />
          </svg>
        );

      case 'climate-quest':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="cqGlobe" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="#030712" />
            <circle cx="160" cy="100" r="65" fill="url(#cqGlobe)" filter="drop-shadow(0 0 30px #38bdf8)" />
            <path d="M 160,60 Q 210,80 190,120 Q 150,150 120,110 Q 110,70 160,100" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.85" filter="drop-shadow(0 0 8px #fff)" />
            <circle cx="160" cy="100" r="10" fill="#f43f5e" />
          </svg>
        );

      case 'river-odyssey':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="roBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#roBg)" />
            <path d="M 0,40 Q 160,120 120,200 L 220,200 Q 220,100 320,20 Z" fill="#0284c7" />
            <path d="M 120,110 Q 160,140 200,105 Q 160,115 120,110 Z" fill="#78350f" filter="drop-shadow(0 8px 15px rgba(0,0,0,0.6))" />
            <path d="M 140,125 Q 160,118 180,130" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'geo-disaster-command':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="gdcBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#gdcBg)" />
            <circle cx="160" cy="100" r="75" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
            <circle cx="160" cy="100" r="50" fill="none" stroke="#f97316" strokeWidth="3" />
            <circle cx="160" cy="100" r="25" fill="#ef4444" filter="drop-shadow(0 0 20px #ef4444)" />
            <polygon points="160,82 172,110 148,110" fill="#facc15" />
            <rect x="158" y="90" width="4" height="10" rx="2" fill="#000" />
            <circle cx="160" cy="105" r="2" fill="#000" />
          </svg>
        );

      case 'resources-of-india':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="roiBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#roiBg)" />
            <polygon points="100,120 220,120 200,165 120,165" fill="#713f12" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))" />
            <circle cx="125" cy="170" r="10" fill="#475569" />
            <circle cx="195" cy="170" r="10" fill="#475569" />
            <polygon points="140,95 160,80 180,95 160,110" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
            <polygon points="120,110 135,90 150,110" fill="#10b981" />
            <polygon points="170,110 185,90 200,110" fill="#38bdf8" />
          </svg>
        );

      /* ==================================================================== */
      /* 9. COMPUTER SCIENCE (5 Games)                                        */
      /* ==================================================================== */
      case 'algorithm-arena':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="algoBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#algoBg)" />
            <line x1="160" y1="50" x2="105" y2="105" stroke="#6366f1" strokeWidth="4" />
            <line x1="160" y1="50" x2="215" y2="105" stroke="#6366f1" strokeWidth="4" />
            <line x1="105" y1="105" x2="75" y2="155" stroke="#6366f1" strokeWidth="3" />
            <line x1="105" y1="105" x2="135" y2="155" stroke="#6366f1" strokeWidth="3" />
            <line x1="215" y1="105" x2="185" y2="155" stroke="#6366f1" strokeWidth="3" />
            <line x1="215" y1="105" x2="245" y2="155" stroke="#6366f1" strokeWidth="3" />
            <circle cx="160" cy="50" r="18" fill="#ec4899" filter="drop-shadow(0 0 15px #ec4899)" />
            <circle cx="105" cy="105" r="14" fill="#38bdf8" filter="drop-shadow(0 0 12px #38bdf8)" />
            <circle cx="215" cy="105" r="14" fill="#38bdf8" filter="drop-shadow(0 0 12px #38bdf8)" />
            <circle cx="75" cy="155" r="10" fill="#22c55e" />
            <circle cx="135" cy="155" r="10" fill="#22c55e" />
            <circle cx="185" cy="155" r="10" fill="#22c55e" />
            <circle cx="245" cy="155" r="10" fill="#22c55e" />
          </svg>
        );

      case 'binary-blitz':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bbBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#052e16" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#bbBg)" />
            <line x1="80" y1="20" x2="80" y2="180" stroke="#22c55e" strokeWidth="3" strokeDasharray="12 12" opacity="0.5" />
            <line x1="140" y1="20" x2="140" y2="180" stroke="#22c55e" strokeWidth="3" strokeDasharray="8 8" opacity="0.7" />
            <line x1="200" y1="20" x2="200" y2="180" stroke="#22c55e" strokeWidth="3" strokeDasharray="16 10" opacity="0.6" />
            <line x1="260" y1="20" x2="260" y2="180" stroke="#22c55e" strokeWidth="3" strokeDasharray="10 14" opacity="0.5" />
            <polygon points="160,60 180,140 140,140" fill="#facc15" filter="drop-shadow(0 0 25px #facc15)" />
            <circle cx="160" cy="55" r="12" fill="#fff" filter="drop-shadow(0 0 15px #22c55e)" />
          </svg>
        );

      case 'code-maze':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="cmBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#cmBg)" />
            <g stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 0 10px #38bdf8)">
              <line x1="60" y1="60" x2="260" y2="60" />
              <line x1="260" y1="60" x2="260" y2="140" />
              <line x1="60" y1="60" x2="60" y2="140" />
              <line x1="60" y1="140" x2="180" y2="140" />
              <line x1="120" y1="100" x2="210" y2="100" />
            </g>
            <circle cx="160" cy="100" r="16" fill="#f43f5e" filter="drop-shadow(0 0 15px #f43f5e)" />
            <circle cx="160" cy="100" r="8" fill="#fff" />
          </svg>
        );

      case 'network-packet-route':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="nprBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#nprBg)" />
            <line x1="40" y1="100" x2="280" y2="100" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
            <circle cx="80" cy="100" r="14" fill="#38bdf8" />
            <circle cx="240" cy="100" r="14" fill="#38bdf8" />
            <polygon points="175,100 145,80 155,100 145,120" fill="#facc15" filter="drop-shadow(0 0 20px #facc15)" />
            <line x1="150" y1="100" x2="110" y2="100" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'cyber-sentinel':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="csBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="csShield" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#csBg)" />
            <polygon points="160,40 215,65 215,130 160,165 105,130 105,65" fill="url(#csShield)" filter="drop-shadow(0 0 25px #06b6d4)" />
            <polygon points="160,55 200,75 200,122 160,150 120,122 120,75" fill="#0f172a" />
            <circle cx="160" cy="95" r="12" fill="#22c55e" filter="drop-shadow(0 0 10px #22c55e)" />
            <polygon points="156,95 164,95 167,118 153,118" fill="#22c55e" />
          </svg>
        );

      /* ==================================================================== */
      /* 10. MIND & MEMORY (5 Games)                                          */
      /* ==================================================================== */
      case 'memory-vault':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="mvBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#mvBg)" />
            {/* Giant Circular Vault Door with Concentric Cog Teeth */}
            <circle cx="160" cy="100" r="70" fill="#334155" stroke="#475569" strokeWidth="8" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.7))" />
            <circle cx="160" cy="100" r="50" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" strokeDasharray="12 6" />
            {/* Center Keyhole Hub */}
            <circle cx="160" cy="100" r="25" fill="#a855f7" filter="drop-shadow(0 0 15px #a855f7)" />
            <polygon points="154,94 166,94 169,114 151,114" fill="#facc15" />
            {/* Floating Memory Symbol Tiles */}
            <rect x="70" y="45" width="28" height="28" rx="6" fill="#38bdf8" filter="drop-shadow(0 6px 10px rgba(56,189,248,0.6))" />
            <rect x="220" y="45" width="28" height="28" rx="6" fill="#facc15" filter="drop-shadow(0 6px 10px rgba(250,204,21,0.6))" />
            <rect x="225" y="130" width="28" height="28" rx="6" fill="#ec4899" filter="drop-shadow(0 6px 10px rgba(236,72,153,0.6))" />
          </svg>
        );

      case 'pattern-pulse':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="ppBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#3b0764" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ppBg)" />
            <polygon points="160,50 190,65 190,95 160,110 130,95 130,65" fill="#a855f7" filter="drop-shadow(0 0 20px #a855f7)" />
            <polygon points="110,80 140,95 140,125 110,140 80,125 80,95" fill="#ec4899" filter="drop-shadow(0 0 15px #ec4899)" />
            <polygon points="210,80 240,95 240,125 210,140 180,125 180,95" fill="#38bdf8" filter="drop-shadow(0 0 15px #38bdf8)" />
            <polygon points="160,115 190,130 190,160 160,175 130,160 130,130" fill="#facc15" filter="drop-shadow(0 0 15px #facc15)" />
            <line x1="160" y1="80" x2="110" y2="110" stroke="#fff" strokeWidth="2.5" opacity="0.8" />
            <line x1="160" y1="80" x2="210" y2="110" stroke="#fff" strokeWidth="2.5" opacity="0.8" />
          </svg>
        );

      case 'memory-maze':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="mmBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#mmBg)" />
            <path d="M 60,150 L 110,110 L 110,70 L 160,50 L 210,70 L 210,130 L 260,110" fill="none" stroke="#6366f1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 60,150 L 110,110 L 110,70 L 160,50 L 210,70 L 210,130 L 260,110" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 10px #38bdf8)" />
            <circle cx="160" cy="50" r="18" fill="#facc15" filter="drop-shadow(0 0 20px #facc15)" />
            <circle cx="160" cy="50" r="8" fill="#fff" />
          </svg>
        );

      case 'sequence-builder':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="sbBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#sbBg)" />
            {/* Arcade Simon-Says 4-Quadrant Memory Disk */}
            <path d="M 155,95 L 155,40 A 60,60 0 0,1 215,95 Z" fill="#22c55e" filter="drop-shadow(0 0 15px #22c55e)" />
            <path d="M 165,95 L 225,95 A 60,60 0 0,1 165,155 Z" fill="#eab308" filter="drop-shadow(0 0 15px #eab308)" />
            <path d="M 155,105 L 155,165 A 60,60 0 0,1 95,105 Z" fill="#ef4444" filter="drop-shadow(0 0 15px #ef4444)" />
            <path d="M 165,105 L 105,105 A 60,60 0 0,1 165,45 Z" fill="#3b82f6" filter="drop-shadow(0 0 15px #3b82f6)" />
            <circle cx="160" cy="100" r="22" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />
          </svg>
        );

      case 'focus-hunter':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="fhBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#09090b" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="url(#fhBg)" />
            <circle cx="160" cy="100" r="65" fill="none" stroke="#ef4444" strokeWidth="4" filter="drop-shadow(0 0 15px #ef4444)" />
            <circle cx="160" cy="100" r="35" fill="none" stroke="#ef4444" strokeWidth="2" />
            <line x1="160" y1="20" x2="160" y2="180" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 6" />
            <line x1="80" y1="100" x2="240" y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 6" />
            <polygon points="160,82 178,100 160,118 142,100" fill="#facc15" filter="drop-shadow(0 0 20px #facc15)" />
            <circle cx="160" cy="100" r="6" fill="#fff" />
          </svg>
        );

      /* ==================================================================== */
      /* 11. DETECTIVE & LOGIC (5 Games)                                      */
      /* ==================================================================== */
      case 'missing-artifact':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="maBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#09090b" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#maBg)" />
            <polygon points="160,10 240,170 80,170" fill="#fef08a" opacity="0.15" />
            <polygon points="120,130 200,130 215,185 105,185" fill="#450a0a" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))" />
            <ellipse cx="160" cy="130" rx="40" ry="10" fill="#991b1b" />
            <line x1="40" y1="110" x2="140" y2="110" stroke="#ef4444" strokeWidth="3" filter="drop-shadow(0 0 8px #ef4444)" />
            <line x1="180" y1="110" x2="280" y2="110" stroke="#ef4444" strokeWidth="3" filter="drop-shadow(0 0 8px #ef4444)" />
            <ellipse cx="160" cy="120" r="14" fill="#38bdf8" opacity="0.4" filter="drop-shadow(0 0 15px #38bdf8)" />
          </svg>
        );

      case 'codebreaker':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="cbBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#cbBg)" />
            <circle cx="160" cy="95" r="65" fill="#1e293b" stroke="#64748b" strokeWidth="8" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))" />
            <circle cx="160" cy="95" r="46" fill="#0f172a" stroke="#00f2fe" strokeWidth="3" />
            <g stroke="#94a3b8" strokeWidth="3" opacity="0.7">
              <line x1="160" y1="36" x2="160" y2="46" />
              <line x1="160" y1="144" x2="160" y2="154" />
              <line x1="101" y1="95" x2="111" y2="95" />
              <line x1="209" y1="95" x2="219" y2="95" />
            </g>
            <circle cx="160" cy="95" r="22" fill="#00f2fe" filter="drop-shadow(0 0 15px #00f2fe)" />
            <line x1="160" y1="95" x2="175" y2="80" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <g transform="translate(115, 168)">
              <circle cx="15" cy="0" r="6" fill="#22c55e" filter="drop-shadow(0 0 8px #22c55e)" />
              <circle cx="40" cy="0" r="6" fill="#22c55e" filter="drop-shadow(0 0 8px #22c55e)" />
              <circle cx="65" cy="0" r="6" fill="#22c55e" filter="drop-shadow(0 0 8px #22c55e)" />
              <circle cx="90" cy="0" r="6" fill="#eab308" filter="drop-shadow(0 0 8px #eab308)" />
            </g>
          </svg>
        );

      case 'detectives-office':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="doLamp" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#78350f" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1c1917" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="#1c1917" />
            <polygon points="70,10 240,190 20,190" fill="url(#doLamp)" />
            <rect x="0" y="140" width="320" height="60" fill="#292524" />
            <polygon points="120,135 210,130 220,175 110,180" fill="#d97706" filter="drop-shadow(0 8px 15px rgba(0,0,0,0.7))" />
            <circle cx="100" cy="50" r="5" fill="#ef4444" />
            <circle cx="210" cy="40" r="5" fill="#ef4444" />
            <circle cx="260" cy="80" r="5" fill="#ef4444" />
            <line x1="100" y1="50" x2="210" y2="40" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="210" y1="40" x2="260" y2="80" stroke="#ef4444" strokeWidth="2.5" />
            <g transform="translate(135, 85)">
              <circle cx="25" cy="25" r="22" fill="none" stroke="#f59e0b" strokeWidth="5" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.6))" />
              <circle cx="25" cy="25" r="18" fill="#38bdf8" opacity="0.3" />
              <line x1="42" y1="42" x2="68" y2="68" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'time-travel-mystery':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="ttmPortal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#09090b" />
              </radialGradient>
            </defs>
            <rect width="320" height="200" fill="#09090b" />
            <circle cx="160" cy="100" r="75" fill="url(#ttmPortal)" filter="drop-shadow(0 0 30px #6366f1)" />
            <circle cx="160" cy="100" r="55" fill="none" stroke="#facc15" strokeWidth="5" filter="drop-shadow(0 8px 15px rgba(0,0,0,0.6))" />
            <circle cx="160" cy="100" r="45" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="8 4" />
            <line x1="160" y1="100" x2="160" y2="68" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
            <line x1="160" y1="100" x2="185" y2="115" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="100" r="6" fill="#facc15" />
          </svg>
        );

      case 'logic-detective':
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ldBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1c1917" />
                <stop offset="100%" stopColor="#292524" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#ldBg)" />
            <rect x="65" y="55" width="55" height="75" rx="4" fill="#f4f4f5" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.8))" />
            <rect x="72" y="62" width="41" height="40" fill="#71717a" />
            <rect x="200" y="55" width="55" height="75" rx="4" fill="#f4f4f5" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.8))" />
            <rect x="207" y="62" width="41" height="40" fill="#71717a" />
            <line x1="92" y1="92" x2="227" y2="92" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" filter="drop-shadow(0 0 8px #dc2626)" />
            <circle cx="160" cy="92" r="28" fill="none" stroke="#d97706" strokeWidth="5" />
            <circle cx="160" cy="92" r="23" fill="#fef08a" opacity="0.3" />
            <line x1="178" y1="110" x2="205" y2="145" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
          </svg>
        );

      default:
        // High-contrast clean 3D stylized game icon fallback
        return (
          <svg className="w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="defBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#defBg)" />
            <circle cx="160" cy="100" r="55" fill="#6366f1" opacity="0.4" filter="drop-shadow(0 0 25px #6366f1)" />
            <polygon points="160,65 190,125 130,125" fill="#facc15" filter="drop-shadow(0 10px 20px rgba(250,204,21,0.7))" />
          </svg>
        );
    }
  };

  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-gray-950 ${className}`}
      aria-label={`${game.title} game icon`}
    >
      {preferRaster && game.thumbnail && !imgError ? (
        <img
          src={game.thumbnail}
          alt={game.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        renderGameIconArt()
      )}

      {/* Subtle depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
    </div>
  );
};
