import type { MathChallengeGate, MathChallengeType, ZoneId, ZoneConfig, RunnerLane } from './runnerTypes';

export const ZONES: ZoneConfig[] = [
  {
    id: 'number-village',
    name: 'Zone 1: Number Village',
    themeColor: '#10B981',
    skyGradient: 'from-emerald-900 via-teal-900 to-slate-950',
    groundColor: '#064E3B',
    obstacleTypes: ['mult-gate', 'jump-barrier', 'slide-laser'],
    minDistance: 0,
  },
  {
    id: 'mult-forest',
    name: 'Zone 2: Multiplication Forest',
    themeColor: '#F59E0B',
    skyGradient: 'from-amber-950 via-orange-950 to-slate-950',
    groundColor: '#78350F',
    obstacleTypes: ['mult-gate', 'speed-sutra', 'jump-barrier'],
    minDistance: 800,
  },
  {
    id: 'square-mountain',
    name: 'Zone 3: Square Mountain',
    themeColor: '#EC4899',
    skyGradient: 'from-rose-950 via-purple-950 to-slate-950',
    groundColor: '#831843',
    obstacleTypes: ['square-crystal', 'near100-lock', 'slide-laser'],
    minDistance: 1800,
  },
  {
    id: 'root-valley',
    name: 'Zone 4: Root Valley',
    themeColor: '#06B6D4',
    skyGradient: 'from-cyan-950 via-blue-950 to-slate-950',
    groundColor: '#164E63',
    obstacleTypes: ['root-bridge', 'cube-tower', 'jump-barrier'],
    minDistance: 3000,
  },
  {
    id: 'vedic-temple',
    name: 'Zone 5: Vedic Temple',
    themeColor: '#8B5CF6',
    skyGradient: 'from-violet-950 via-indigo-950 to-slate-950',
    groundColor: '#4C1D95',
    obstacleTypes: ['near100-lock', 'square-crystal', 'speed-sutra'],
    minDistance: 4500,
  },
  {
    id: 'infinity-arena',
    name: 'Zone 6: Infinity Arena',
    themeColor: '#E11D48',
    skyGradient: 'from-rose-950 via-slate-900 to-black',
    groundColor: '#4C0519',
    obstacleTypes: ['mult-gate', 'square-crystal', 'root-bridge', 'cube-tower', 'near100-lock'],
    minDistance: 6500,
  },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateObstacleGate(
  distance: number,
  zone: ZoneConfig,
  classGrade: number = 8
): MathChallengeGate {
  const chosenType =
    zone.obstacleTypes[getRandomInt(0, zone.obstacleTypes.length - 1)];
  const correctLane = getRandomInt(0, 2) as RunnerLane;

  let prompt = '';
  let formulaHint = '';
  let techniqueName = '';
  let correctVal = '';
  let distractor1 = '';
  let distractor2 = '';

  switch (chosenType) {
    case 'mult-gate': {
      // e.g. 96 × 11 or 48 × 5 or 24 × 25
      const subType = getRandomInt(1, 3);
      if (subType === 1) {
        // Mult by 11
        const n = classGrade <= 6 ? getRandomInt(14, 45) : getRandomInt(47, 98);
        const ans = n * 11;
        prompt = `${n} × 11`;
        formulaHint = `Split & sum: ${Math.floor(n / 10)} | (${Math.floor(n / 10)}+${n % 10}) | ${n % 10}`;
        techniqueName = 'Antyayoreva (Between Ends)';
        correctVal = String(ans);
        distractor1 = String(ans + 10);
        distractor2 = String(ans - (ans % 10 === 0 ? 9 : 1));
      } else if (subType === 2) {
        // Mult by 5
        const n = getRandomInt(12, 48) * 2;
        const ans = n * 5;
        prompt = `${n} × 5`;
        formulaHint = `Halve & add 0: (${n}/2) × 10 = ${n / 2} × 10`;
        techniqueName = 'Ardha-Gunitam (Halve & 10x)';
        correctVal = String(ans);
        distractor1 = String(ans + 20);
        distractor2 = String(ans - 20);
      } else {
        // Mult by 25
        const n = getRandomInt(4, 24) * 4;
        const ans = n * 25;
        prompt = `${n} × 25`;
        formulaHint = `Quarter & add 00: (${n}/4) × 100`;
        techniqueName = 'Chaturtha-Shatam (Quarter 100)';
        correctVal = String(ans);
        distractor1 = String(ans + 100);
        distractor2 = String(ans - 100);
      }
      break;
    }

    case 'square-crystal': {
      // Ending in 5 or near 100
      if (Math.random() > 0.5) {
        const tens = getRandomInt(2, 9);
        const n = tens * 10 + 5;
        const ans = n * n;
        prompt = `${n}²`;
        formulaHint = `${tens} × ${tens + 1} | 25 = ${tens * (tens + 1)}25`;
        techniqueName = 'Ekadhikena (By 1 More)';
        correctVal = String(ans);
        distractor1 = String((tens * tens) * 100 + 25);
        distractor2 = String(ans + 100);
      } else {
        const n = getRandomInt(92, 99);
        const ans = n * n;
        const def = 100 - n;
        prompt = `${n}²`;
        formulaHint = `Deficit ${def}: (${n}-${def}) | ${def}²`;
        techniqueName = 'Yavadunam (Base 100 Square)';
        correctVal = String(ans);
        distractor1 = String((n - def) * 100 + (def + 2));
        distractor2 = String(ans + 10);
      }
      break;
    }

    case 'root-bridge': {
      // Square roots
      const root = classGrade <= 6 ? getRandomInt(5, 15) : getRandomInt(12, 25);
      const square = root * root;
      prompt = `√${square}`;
      formulaHint = `Last digit ${square % 10} => root is ${root}`;
      techniqueName = 'Vilokanam (Unit Observation)';
      correctVal = String(root);
      distractor1 = String(root + 2);
      distractor2 = String(Math.max(2, root - 2));
      break;
    }

    case 'cube-tower': {
      // Cube roots
      const root = getRandomInt(2, 9);
      const cube = root * root * root;
      prompt = `∛${cube}`;
      formulaHint = `Unique cube ending of ${cube % 10} => ${root}`;
      techniqueName = 'Ghana Moola (Cube Ending Map)';
      correctVal = String(root);
      distractor1 = String(root + 1);
      distractor2 = String(Math.max(1, root - 1));
      break;
    }

    case 'near100-lock': {
      // 98 × 97 etc.
      const a = getRandomInt(94, 99);
      const b = getRandomInt(94, 99);
      const ans = a * b;
      const defA = 100 - a;
      const defB = 100 - b;
      prompt = `${a} × ${b}`;
      formulaHint = `[${a}-${defB}] | [${defA}×${defB}] = ${ans}`;
      techniqueName = 'Nikhilam (Near Base 100)';
      correctVal = String(ans);
      distractor1 = String(ans + 10);
      distractor2 = String(ans - 2);
      break;
    }

    case 'jump-barrier': {
      // Fast addition obstacle: "JUMP! 48 + 35"
      const n1 = getRandomInt(25, 65);
      const n2 = getRandomInt(15, 45);
      const ans = n1 + n2;
      prompt = `JUMP: ${n1} + ${n2}`;
      formulaHint = `Add tens (${Math.floor(n1 / 10) * 10}+${Math.floor(n2 / 10) * 10}) + units (${n1 % 10}+${n2 % 10})`;
      techniqueName = 'Place-Value Rapid Sum';
      correctVal = String(ans);
      distractor1 = String(ans + 10);
      distractor2 = String(ans - 5);
      break;
    }

    case 'slide-laser':
    default: {
      // Fast complement: "SLIDE: 1000 - 346"
      const sub = getRandomInt(120, 780);
      const ans = 1000 - sub;
      prompt = `SLIDE: 1000 - ${sub}`;
      formulaHint = 'All from 9, last from 10';
      techniqueName = 'Nikhilam Complements';
      correctVal = String(ans);
      distractor1 = String(ans + 10);
      distractor2 = String(ans - 10);
      break;
    }
  }

  // Assign lanes
  const laneOptions: [
    { value: string | number; isCorrect: boolean },
    { value: string | number; isCorrect: boolean },
    { value: string | number; isCorrect: boolean }
  ] = [
    { value: '', isCorrect: false },
    { value: '', isCorrect: false },
    { value: '', isCorrect: false },
  ];

  const distractors = [distractor1, distractor2];
  let distIndex = 0;

  for (let l = 0; l < 3; l++) {
    if (l === correctLane) {
      laneOptions[l] = { value: correctVal, isCorrect: true };
    } else {
      laneOptions[l] = { value: distractors[distIndex] || `${parseInt(correctVal, 10) + 1}`, isCorrect: false };
      distIndex++;
    }
  }

  return {
    id: `gate-${distance}-${Date.now()}-${getRandomInt(10, 99)}`,
    z: 100, // starts at distance 100 in front of player
    type: chosenType,
    prompt,
    formulaHint,
    techniqueName,
    lanes: laneOptions,
  };
}
