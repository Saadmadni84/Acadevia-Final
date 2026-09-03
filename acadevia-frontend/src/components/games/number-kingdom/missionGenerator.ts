import type {
  WorldDefinition,
  InteractiveMission,
  StudentClassGrade,
  WorldId,
  PetConfig,
} from './types';
import { getVillageMission } from './villageCurriculum';

export const PET_COMPANIONS: PetConfig[] = [
  { id: 'puppy', name: 'Barnaby the Pup', avatar: '🐶', greeting: "Woof! Let's explore together!" },
  { id: 'kitty', name: 'Mochi the Cat', avatar: '🐱', greeting: "Purr! I'm ready for math magic!" },
  { id: 'fox', name: 'Rusty the Fox', avatar: '🦊', greeting: "Clever quests ahead! Let's go!" },
  { id: 'bunny', name: 'Pip the Bunny', avatar: '🐰', greeting: "Hop into adventure with me!" },
];

/** One curriculum configuration drives the shared mission engine for Classes 2–5. */
export const NUMBER_KINGDOM_GRADE_CONFIG: Record<Exclude<StudentClassGrade, 1>, {
  subtraction: { initial: number; removed: number };
  railway: { carriages: number; perCarriage: number };
  sequence: { start: number; step: number };
  bridge: { have: number; add: number };
  wall: { rows: number; columns: number };
  crownJewels: number;
}> = {
  2: { subtraction: { initial: 14, removed: 6 }, railway: { carriages: 3, perCarriage: 4 }, sequence: { start: 2, step: 2 }, bridge: { have: 7, add: 5 }, wall: { rows: 3, columns: 4 }, crownJewels: 10 },
  3: { subtraction: { initial: 25, removed: 9 }, railway: { carriages: 4, perCarriage: 5 }, sequence: { start: 5, step: 5 }, bridge: { have: 14, add: 8 }, wall: { rows: 4, columns: 5 }, crownJewels: 15 },
  4: { subtraction: { initial: 60, removed: 17 }, railway: { carriages: 5, perCarriage: 6 }, sequence: { start: 10, step: 10 }, bridge: { have: 35, add: 17 }, wall: { rows: 5, columns: 6 }, crownJewels: 20 },
  5: { subtraction: { initial: 125, removed: 38 }, railway: { carriages: 6, perCarriage: 8 }, sequence: { start: 25, step: 25 }, bridge: { have: 75, add: 38 }, wall: { rows: 6, columns: 8 }, crownJewels: 25 },
};

export const KINGDOM_WORLDS: WorldDefinition[] = [
  {
    id: 'village',
    index: 1,
    name: 'Magic Village',
    subtitle: 'Star Hunt & Number Recognition',
    icon: '🏘️',
    topic: 'numberRecognition',
    color: '#10B981', // emerald
    bgColor: '#ECFDF5',
    description: "Explore the village, recover the King's lost magical stars, and find numbered houses.",
    requiredStarsToUnlock: 0,
  },
  {
    id: 'forest',
    index: 2,
    name: 'Star Forest',
    subtitle: 'More or Less Exploration',
    icon: '🌳',
    topic: 'moreLess',
    color: '#059669', // green
    bgColor: '#D1FAE5',
    description: 'Explore the two forest paths and choose which path has MORE, LESS, or EQUAL woodland friends.',
    requiredStarsToUnlock: 1,
  },
  {
    id: 'railway',
    index: 3,
    name: 'Number Railway',
    subtitle: 'Magic Train & Counting',
    icon: '🚂',
    topic: 'counting',
    color: '#EC4899', // pink
    bgColor: '#FDF2F8',
    description: 'Help travelers board the magic locomotive so the train can depart on its royal journey!',
    requiredStarsToUnlock: 3,
  },
  {
    id: 'tower',
    index: 4,
    name: 'Wizard Tower',
    subtitle: 'Magical Star Doors',
    icon: '🧙',
    topic: 'quantity',
    color: '#6366F1', // indigo
    bgColor: '#EEF2FF',
    description: "Count the stars on the Wizard's locked doors to find the secret chamber.",
    requiredStarsToUnlock: 6,
  },
  {
    id: 'bridge',
    index: 5,
    name: 'Magic Bridge',
    subtitle: 'Addition & River Crossing',
    icon: '🌉',
    topic: 'addition',
    color: '#3B82F6', // blue
    bgColor: '#EFF6FF',
    description: 'The stone bridge across the river is missing blocks! Collect the missing stones to repair it.',
    requiredStarsToUnlock: 9,
  },
  {
    id: 'builder',
    index: 6,
    name: 'Shape House',
    subtitle: 'Shape Building & Geometry',
    icon: '🏠',
    topic: 'shapes',
    color: '#8B5CF6', // purple
    bgColor: '#F5F3FF',
    description: 'Construct a magical home using triangles, squares, rectangles, and circles.',
    requiredStarsToUnlock: 12,
  },
  {
    id: 'garden',
    index: 7,
    name: 'Pattern Garden',
    subtitle: 'Sequencing & Flower Bloom',
    icon: '🌸',
    topic: 'patterns',
    color: '#F59E0B', // amber
    bgColor: '#FEF3C7',
    description: 'Restore the magical flower sequence so the entire royal garden blooms with color!',
    requiredStarsToUnlock: 15,
  },
  {
    id: 'castle',
    index: 8,
    name: 'Royal Castle',
    subtitle: 'Grand Number Master Coronation',
    icon: '🏰',
    topic: 'multiStep',
    color: '#D4A843', // gold
    bgColor: '#FFFBEB',
    description: 'Complete the 5 royal gate trials, meet the King, and be crowned the Number Master!',
    requiredStarsToUnlock: 18,
  },
];

export const getMissionsForWorld = (
  worldId: WorldId,
  classGrade: StudentClassGrade
): InteractiveMission[] => {
  // CLASS 1 RESCUE ADVENTURE CAMPAIGN
  if (classGrade === 1) {
    switch (worldId) {
      case 'village': {
        return [
          {
            id: 'c1_m1_village',
            worldId: 'village',
            classGrade: 1,
            title: '⭐ Magic Star Hunt & House Search',
            instruction: "Explore the village with arrows or touch to collect stars and visit House #4!",
            topic: 'numberRecognition',
            prompt: "The King's magic stars disappeared! Walk around, collect stars, and enter House 4.",
            mathExplanation: "You found House 4 and recovered the King's lost magic star!",
            payload: {
              targetHouseNumber: 4,
              houseNumbers: [2, 4, 6],
              starsInArea: 3,
              correctAnswer: 4,
            },
          },
        ];
      }

      case 'forest': {
        return [
          {
            id: 'c1_m2_forest',
            worldId: 'forest',
            classGrade: 1,
            title: '🐰 More or Less Forest Paths',
            instruction: 'Two paths lead through the enchanted forest. Which path has MORE rabbits?',
            topic: 'moreLess',
            prompt: 'Path A has 2 rabbits. Path B has 4 rabbits. Which path has MORE?',
            mathExplanation: 'Path B with 4 rabbits has MORE than Path A with 2 rabbits! (4 > 2)',
            payload: {
              pathA: { icon: '🐰', count: 2 },
              pathB: { icon: '🐰', count: 4 },
              comparisonType: 'MORE',
              correctAnswer: 'Path B',
            },
          },
        ];
      }

      case 'railway': {
        return [
          {
            id: 'c1_m3_railway',
            worldId: 'railway',
            classGrade: 1,
            title: '🚂 Magic Train Passenger Boarding',
            instruction: 'The steam locomotive needs exactly 3 passengers to depart for the capital.',
            topic: 'counting',
            prompt: 'Interact with 3 waiting travelers on the platform to board the train.',
            mathExplanation: '3 passengers boarded safely (1, 2, 3)! The magic train is rolling!',
            payload: {
              neededPassengers: 3,
              availablePassengers: 5,
              correctAnswer: 3,
            },
          },
        ];
      }

      case 'tower': {
        return [
          {
            id: 'c1_m4_tower',
            worldId: 'tower',
            classGrade: 1,
            title: "🧙 Wizard's Star Chamber",
            instruction: 'Count the glowing stars on each magical door to open the chamber with 4 stars.',
            topic: 'quantity',
            prompt: 'The Wizard says: "Find and touch the door with exactly 4 stars!"',
            mathExplanation: 'You counted the door with 4 stars (⭐⭐⭐⭐)! The Wizard opens the door!',
            payload: {
              doorStars: [2, 3, 4, 5],
              targetDoorStars: 4,
              correctAnswer: 4,
            },
          },
        ];
      }

      case 'bridge': {
        return [
          {
            id: 'c1_m5_bridge',
            worldId: 'bridge',
            classGrade: 1,
            title: '🌉 Repair the Magic Bridge (3 + 2 = 5)',
            instruction: 'The stone bridge needs 5 blocks. 3 blocks are already in place. Add 2 more!',
            topic: 'addition',
            prompt: '3 blocks + 2 blocks = 5 blocks in total.',
            mathExplanation: '3 + 2 = 5! You placed 2 missing stones and repaired the bridge!',
            payload: {
              haveQuantity: 3,
              neededTotal: 5,
              targetQuantity: 2,
              correctAnswer: 2,
            },
          },
        ];
      }

      case 'builder': {
        return [
          {
            id: 'c1_m6_builder',
            worldId: 'builder',
            classGrade: 1,
            title: '🏠 Build the Shape House',
            instruction: 'Build the magical house by placing Triangle (roof), Square (body), and Rectangle (door).',
            topic: 'shapes',
            prompt: 'Place the geometric shapes in the blueprint slots to build the house.',
            mathExplanation: 'Roof: 🔺 Triangle | Wall: 🟦 Square | Door: ▭ Rectangle. House built!',
            payload: {
              targetShapes: [
                { id: 'roof', name: 'Triangle', icon: '🔺', slot: 'roof' },
                { id: 'body', name: 'Square', icon: '🟦', slot: 'body' },
                { id: 'door', name: 'Rectangle', icon: '🚪', slot: 'door' },
                { id: 'window', name: 'Circle', icon: '🟡', slot: 'window' },
              ],
              correctAnswer: 'House Built',
            },
          },
        ];
      }

      case 'garden': {
        return [
          {
            id: 'c1_m7_garden',
            worldId: 'garden',
            classGrade: 1,
            title: '🌸 Pattern Garden Bloom',
            instruction: 'Complete the magical garden path pattern: ⭐ 🔵 ⭐ 🔵 ?',
            topic: 'patterns',
            prompt: 'What comes next in the sequence: ⭐ 🔵 ⭐ 🔵 ?',
            mathExplanation: 'The repeating pattern is Star, Blue Circle, Star, Blue Circle, Star (⭐)!',
            payload: {
              patternSequence: ['⭐', '🔵', '⭐', '🔵', '?'],
              patternOptions: ['⭐', '🔵', '🟢', '❤️'],
              patternMissingIndex: 4,
              correctAnswer: '⭐',
            },
          },
        ];
      }

      case 'castle': {
        return [
          {
            id: 'c1_m8_castle',
            worldId: 'castle',
            classGrade: 1,
            title: '🏰 Royal Castle Trials & Coronation',
            instruction: 'Unlock the 5 Royal Castle Gates to meet the King and save Number Kingdom!',
            topic: 'multiStep',
            prompt: 'Complete the royal trials: number match, more/less, addition, shapes, and patterns.',
            mathExplanation: 'All 5 Royal Gate Trials mastered! The King crowns you Number Master!',
            payload: {
              targetQuantity: 5,
              correctAnswer: 5,
            },
          },
        ];
      }

      default:
        return [];
    }
  }

  // CLASSES 2–5 ADAPTIVE MISSIONS
  switch (classGrade) {
    case 2:
      return [
        {
          id: `c2_m_${worldId}`,
          worldId,
          classGrade: 2,
          title: '🌉 Number Bridge: Mathematical Repair',
          instruction: 'Collect, arrange, and place missing number stones to complete the bridge and cross safely.',
          topic: 'addition',
          prompt: 'Repair the royal bridge using place value, skip counting, and ascending sequence stones.',
          mathExplanation: 'All bridge stones placed in correct mathematical order! Bridge restored!',
          payload: {
            correctAnswer: 'Bridge Repaired',
            targetQuantity: 6,
          },
        },
      ];

    case 3:
      return [
        {
          id: `c3_m_${worldId}`,
          worldId,
          classGrade: 3,
          title: '🐉 Dragon Delivery: Equal Cargo Dispatch',
          instruction: 'Load equal item crates onto the Dragon Delivery Cart and calculate required totals.',
          topic: 'multiplication',
          prompt: 'Evenly pack crystals and grain sacks for the royal guilds and bakeries.',
          mathExplanation: 'Cargo balanced and verified! Dragon cart successfully dispatched!',
          payload: {
            correctAnswer: 'Delivery Dispatched',
            targetQuantity: 24,
          },
        },
      ];

    case 4:
      return [
        {
          id: `c4_m_${worldId}`,
          worldId,
          classGrade: 4,
          title: "🧪 Wizard's Potion Lab: Volumetric Distribution",
          instruction: 'Measure, dispense, and distribute enchanted elixirs equally into laboratory crystal vials.',
          topic: 'division',
          prompt: 'Distribute 864 ml equally among vials to complete the alchemical brew.',
          mathExplanation: 'All vials filled with exact mathematical measurements! Potion brewed!',
          payload: {
            correctAnswer: 'Potion Brewed',
            targetQuantity: 108,
          },
        },
      ];

    case 5:
      return [
        {
          id: `c5_m_${worldId}`,
          worldId,
          classGrade: 5,
          title: '🏰 Kingdom Builder: Architectural & Treasury Master',
          instruction: 'Manage multi-step construction expenses and calibrate perimeter & area grid dimensions.',
          topic: 'multiStep',
          prompt: 'Expand the citadel while maintaining financial balance and geometric dimensions.',
          mathExplanation: 'Treasury verified and citadel walls built to exact perimeter and area specifications!',
          payload: {
            correctAnswer: 'Kingdom Built',
            targetQuantity: 1160,
          },
        },
      ];

    default:
      return [];
  }
};
