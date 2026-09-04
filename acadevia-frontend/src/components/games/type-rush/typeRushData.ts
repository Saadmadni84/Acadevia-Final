export type TypeRushGrade = '1-2' | '3-5' | '6-8' | '9-10' | '11-12';

export interface TypeRushPassage {
  id: string;
  category: string;
  text: string;
  targetWPM: number;
}

export const TYPERUSH_PASSAGES: Record<TypeRushGrade, TypeRushPassage[]> = {
  '1-2': [
    { id: 'p1', category: 'Letters & Phonics', text: 'cat dog run sun red blue big hop sky star', targetWPM: 15 },
    { id: 'p2', category: 'Animals & Nature', text: 'the frog can jump high in the pond', targetWPM: 18 },
    { id: 'p3', category: 'Everyday Words', text: 'we play with a happy green ball today', targetWPM: 20 },
    { id: 'p4', category: 'Sky & Space', text: 'look at the bright moon shining in the night', targetWPM: 22 },
  ],
  '3-5': [
    { id: 'p5', category: 'Solar System', text: 'The Earth revolves around the Sun once every year and rotates on its axis.', targetWPM: 28 },
    { id: 'p6', category: 'Plant Life', text: 'Plants absorb water from soil through their roots and make food using sunlight.', targetWPM: 30 },
    { id: 'p7', category: 'Animal Kingdom', text: 'Birds have lightweight hollow bones and aerodynamic feathers that help them soar.', targetWPM: 32 },
    { id: 'p8', category: 'Healthy Living', text: 'Drinking clean water and eating fresh fruits keeps our body strong and energetic.', targetWPM: 35 },
  ],
  '6-8': [
    { id: 'p9', category: 'Curiosity Physics', text: 'Magnets exert non-contact magnetic forces, attracting iron and steel while repelling like poles.', targetWPM: 38 },
    { id: 'p10', category: 'Hydrological Science', text: 'Evaporation turns liquid water into steam at boiling point, which condenses into rain clouds.', targetWPM: 42 },
    { id: 'p11', category: 'Ancient Civilization', text: 'The Mauryan Empire established major royal highways connecting Magadha, Kosala, and Avanti.', targetWPM: 45 },
    { id: 'p12', category: 'Computer Logic', text: 'Algorithms execute systematic sequences of instructions to solve complex mathematical problems.', targetWPM: 48 },
  ],
  '9-10': [
    { id: 'p13', category: 'Trigonometry & Geometry', text: 'Trigonometric ratios relate the angles of a right triangle to the ratios of its perpendicular sides.', targetWPM: 52 },
    { id: 'p14', category: 'Cellular Biology', text: 'Mitochondria generate chemical energy in the form of adenosine triphosphate to power biological cells.', targetWPM: 55 },
    { id: 'p15', category: 'Chemical Reactions', text: 'Exothermic reactions release thermal energy, forming stable chemical bonds between reactant molecules.', targetWPM: 58 },
    { id: 'p16', category: 'World Literature', text: 'Persuasive rhetoric combines logical reasoning, emotional resonance, and ethical credibility.', targetWPM: 60 },
  ],
  '11-12': [
    { id: 'p17', category: 'Quantum Mechanics', text: 'Wave-particle duality illustrates that subatomic particles exhibit both continuous wave and discrete particle properties.', targetWPM: 65 },
    { id: 'p18', category: 'Calculus & Optimization', text: 'Derivatives quantify instantaneous rates of change, enabling optimization of continuous mathematical functions.', targetWPM: 68 },
    { id: 'p19', category: 'Data Structures & Algorithms', text: 'Binary search trees maintain logarithmic search efficiency when balanced through rotational transformations.', targetWPM: 72 },
    { id: 'p20', category: 'Macroeconomics', text: 'Fiscal and monetary policies regulate economic equilibrium, balancing inflation, employment, and capital growth.', targetWPM: 75 },
  ],
};

export interface AICarProfile {
  id: string;
  name: string;
  color: string;
  avatar: string;
  speedMultiplier: number;
}

export const AI_RACERS: AICarProfile[] = [
  { id: 'ai-turbo', name: 'Turbo Titan', color: 'from-red-500 to-rose-700', avatar: '🏎️', speedMultiplier: 0.95 },
  { id: 'ai-bolt', name: 'Cyber Bolt', color: 'from-purple-500 to-indigo-700', avatar: '🚗', speedMultiplier: 0.88 },
  { id: 'ai-flash', name: 'Solar Flash', color: 'from-amber-400 to-orange-600', avatar: '🏎️', speedMultiplier: 0.80 },
  { id: 'ai-phantom', name: 'Neon Phantom', color: 'from-emerald-400 to-teal-700', avatar: '🏎️', speedMultiplier: 0.72 },
];
