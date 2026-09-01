import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface UnitCirclePoint {
  deg: number;
  rad: string;
  cosVal: string;
  sinVal: string;
  tanVal: string;
  x: number; // calculated cos(deg)
  y: number; // calculated sin(deg)
  quadrant: 'I' | 'II' | 'III' | 'IV' | 'Axis';
}

export const UNIT_CIRCLE_ANGLES: UnitCirclePoint[] = [
  { deg: 0, rad: '0', cosVal: '1', sinVal: '0', tanVal: '0', x: 1, y: 0, quadrant: 'Axis' },
  { deg: 30, rad: 'π/6', cosVal: '√3/2', sinVal: '1/2', tanVal: '√3/3', x: Math.sqrt(3) / 2, y: 1 / 2, quadrant: 'I' },
  { deg: 45, rad: 'π/4', cosVal: '√2/2', sinVal: '√2/2', tanVal: '1', x: Math.SQRT2 / 2, y: Math.SQRT2 / 2, quadrant: 'I' },
  { deg: 60, rad: 'π/3', cosVal: '1/2', sinVal: '√3/2', tanVal: '√3', x: 1 / 2, y: Math.sqrt(3) / 2, quadrant: 'I' },
  { deg: 90, rad: 'π/2', cosVal: '0', sinVal: '1', tanVal: 'Undefined', x: 0, y: 1, quadrant: 'Axis' },
  { deg: 120, rad: '2π/3', cosVal: '-1/2', sinVal: '√3/2', tanVal: '-√3', x: -1 / 2, y: Math.sqrt(3) / 2, quadrant: 'II' },
  { deg: 135, rad: '3π/4', cosVal: '-√2/2', sinVal: '√2/2', tanVal: '-1', x: -Math.SQRT2 / 2, y: Math.SQRT2 / 2, quadrant: 'II' },
  { deg: 150, rad: '5π/6', cosVal: '-√3/2', sinVal: '1/2', tanVal: '-√3/3', x: -Math.sqrt(3) / 2, y: 1 / 2, quadrant: 'II' },
  { deg: 180, rad: 'π', cosVal: '-1', sinVal: '0', tanVal: '0', x: -1, y: 0, quadrant: 'Axis' },
  { deg: 210, rad: '7π/6', cosVal: '-√3/2', sinVal: '-1/2', tanVal: '√3/3', x: -Math.sqrt(3) / 2, y: -1 / 2, quadrant: 'III' },
  { deg: 225, rad: '5π/4', cosVal: '-√2/2', sinVal: '-√2/2', tanVal: '1', x: -Math.SQRT2 / 2, y: -Math.SQRT2 / 2, quadrant: 'III' },
  { deg: 240, rad: '4π/3', cosVal: '-1/2', sinVal: '-√3/2', tanVal: '√3', x: -1 / 2, y: -Math.sqrt(3) / 2, quadrant: 'III' },
  { deg: 270, rad: '3π/2', cosVal: '0', sinVal: '-1', tanVal: 'Undefined', x: 0, y: -1, quadrant: 'Axis' },
  { deg: 300, rad: '5π/3', cosVal: '1/2', sinVal: '-√3/2', tanVal: '-√3', x: 1 / 2, y: -Math.sqrt(3) / 2, quadrant: 'IV' },
  { deg: 315, rad: '7π/4', cosVal: '√2/2', sinVal: '-√2/2', tanVal: '-1', x: Math.SQRT2 / 2, y: -Math.SQRT2 / 2, quadrant: 'IV' },
  { deg: 330, rad: '11π/6', cosVal: '√3/2', sinVal: '-1/2', tanVal: '-√3/3', x: Math.sqrt(3) / 2, y: -1 / 2, quadrant: 'IV' },
  { deg: 360, rad: '2π', cosVal: '1', sinVal: '0', tanVal: '0', x: 1, y: 0, quadrant: 'Axis' },
];

interface UnitCircleSVGProps {
  selectedAngle?: number;
  onSelectAngle?: (point: UnitCirclePoint) => void;
  interactive?: boolean;
  highlightAngle?: number;
}

export const UnitCircleSVG: React.FC<UnitCircleSVGProps> = ({
  selectedAngle = 30,
  onSelectAngle,
  interactive = true,
  highlightAngle,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<UnitCirclePoint | null>(null);

  const activeAngle = highlightAngle !== undefined ? highlightAngle : selectedAngle;
  const currentPoint =
    UNIT_CIRCLE_ANGLES.find((p) => p.deg === activeAngle) ||
    UNIT_CIRCLE_ANGLES.find((p) => p.deg === 30)!;

  const center = 200;
  const radius = 130;

  // Convert unit coordinates (x, y) to SVG coordinates
  const toSvgX = (unitX: number) => center + unitX * radius;
  const toSvgY = (unitY: number) => center - unitY * radius; // SVG y is inverted

  const pointX = toSvgX(currentPoint.x);
  const pointY = toSvgY(currentPoint.y);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto select-none">
      <div className="relative w-full aspect-square max-w-[380px] sm:max-w-[420px] rounded-2xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 p-2 shadow-xs">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full overflow-visible"
          aria-label="Interactive Trigonometric Unit Circle"
        >
          {/* Subtle Grid Background */}
          <defs>
            <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(91, 44, 111, 0.08)" />
              <stop offset="100%" stopColor="rgba(91, 44, 111, 0.0)" />
            </radialGradient>
          </defs>

          {/* Glowing Circle Area */}
          <circle cx={center} cy={center} r={radius} fill="url(#circleGlow)" />

          {/* Unit Circle Outline */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-primary/30 dark:text-primary/40"
            strokeWidth="2.5"
          />

          {/* Coordinate Axes */}
          <line
            x1="20"
            y1={center}
            x2="380"
            y2={center}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-700"
            strokeWidth="1.5"
          />
          <line
            x1={center}
            y1="20"
            x2={center}
            y2="380"
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-700"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text x="388" y={center + 4} className="text-[11px] font-bold fill-gray-500">
            X
          </text>
          <text x={center - 4} y="15" className="text-[11px] font-bold fill-gray-500">
            Y
          </text>

          {/* Quadrant Watermarks */}
          <text x={center + 50} y={center - 50} className="text-[10px] font-bold fill-primary/20">
            Quadrant I (All +)
          </text>
          <text x={center - 110} y={center - 50} className="text-[10px] font-bold fill-primary/20">
            Quadrant II (Sin +)
          </text>
          <text x={center - 110} y={center + 60} className="text-[10px] font-bold fill-primary/20">
            Quadrant III (Tan +)
          </text>
          <text x={center + 45} y={center + 60} className="text-[10px] font-bold fill-primary/20">
            Quadrant IV (Cos +)
          </text>

          {/* Right Angle Triangle Projection for Active Point */}
          {currentPoint.deg > 0 && currentPoint.deg < 360 && (
            <>
              {/* Cosine component (horizontal base) */}
              <line
                x1={center}
                y1={center}
                x2={pointX}
                y2={center}
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray="4 2"
              />
              {/* Sine component (vertical height) */}
              <line
                x1={pointX}
                y1={center}
                x2={pointX}
                y2={pointY}
                stroke="#A855F7"
                strokeWidth="3"
                strokeDasharray="4 2"
              />
              {/* Hypotenuse (radius = 1) */}
              <line
                x1={center}
                y1={center}
                x2={pointX}
                y2={pointY}
                stroke="#D4A843"
                strokeWidth="2.5"
              />
            </>
          )}

          {/* Angle Nodes across Unit Circle */}
          {UNIT_CIRCLE_ANGLES.filter((p) => p.deg < 360).map((p) => {
            const px = toSvgX(p.x);
            const py = toSvgY(p.y);
            const isSelected = p.deg === currentPoint.deg;

            // Offset for labels
            const labelDist = radius + 22;
            const radAngle = (p.deg * Math.PI) / 180;
            const lx = center + Math.cos(radAngle) * labelDist;
            const ly = center - Math.sin(radAngle) * labelDist + 4;

            return (
              <g
                key={p.deg}
                className={interactive ? 'cursor-pointer group' : ''}
                onClick={() => {
                  if (interactive && onSelectAngle) {
                    onSelectAngle(p);
                  }
                }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Radial reference guide */}
                <line
                  x1={center}
                  y1={center}
                  x2={px}
                  y2={py}
                  stroke="currentColor"
                  className={
                    isSelected
                      ? 'text-secondary opacity-60'
                      : 'text-gray-200 dark:text-gray-800 opacity-40'
                  }
                  strokeWidth="1"
                />

                {/* Point Node Circle */}
                <circle
                  cx={px}
                  cy={py}
                  r={isSelected ? 6 : 4}
                  className={
                    isSelected
                      ? 'fill-secondary stroke-white dark:stroke-gray-900 stroke-2'
                      : 'fill-primary dark:fill-primary-light hover:scale-125 transition-all'
                  }
                />

                {/* Degree & Radian Label */}
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  className={`text-[9px] sm:text-[10px] font-bold transition-colors ${
                    isSelected
                      ? 'fill-primary font-extrabold'
                      : 'fill-gray-600 dark:fill-gray-400 group-hover:fill-primary'
                  }`}
                >
                  {p.deg}°
                </text>
              </g>
            );
          })}

          {/* Active Center Dot */}
          <circle cx={center} cy={center} r="3" fill="#5B2C6F" />
        </svg>
      </div>

      {/* Real-time Angle Inspector Card */}
      <motion.div
        key={currentPoint.deg}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 p-3.5 text-xs text-center grid grid-cols-4 gap-2"
      >
        <div>
          <span className="text-gray-400 block font-medium">Angle θ</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {currentPoint.deg}° ({currentPoint.rad})
          </span>
        </div>
        <div>
          <span className="text-blue-500 block font-semibold">cos θ (x)</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {currentPoint.cosVal}
          </span>
        </div>
        <div>
          <span className="text-purple-500 block font-semibold">sin θ (y)</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {currentPoint.sinVal}
          </span>
        </div>
        <div>
          <span className="text-amber-500 block font-semibold">tan θ (y/x)</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {currentPoint.tanVal}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
