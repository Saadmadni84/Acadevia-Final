import type {
  WorldDefinition,
  InteractiveMission,
  StudentClassGrade,
  WorldId,
  PetConfig,
} from './types';

export const PET_COMPANIONS: PetConfig[] = [
  { id: 'puppy', name: 'Barnaby the Pup', avatar: '🐶', greeting: "Woof! Let's explore together!" },
  { id: 'kitty', name: 'Mochi the Cat', avatar: '🐱', greeting: "Purr! I'm ready for math magic!" },
  { id: 'fox', name: 'Rusty the Fox', avatar: '🦊', greeting: "Clever quests ahead! Let's go!" },
  { id: 'bunny', name: 'Pip the Bunny', avatar: '🐰', greeting: "Hop into adventure with me!" },
];

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

  // CLASSES 2, 3, 4 ADAPTIVE MISSIONS
  switch (worldId) {
    case 'village': {
      const target = classGrade === 2 ? 12 : 15;
      return [
        {
          id: `v_c${classGrade}_1`,
          worldId: 'village',
          classGrade,
          title: `Harvest ${target} Apples`,
          instruction: `Collect ${target} fresh apples into the harvest crate.`,
          topic: 'counting',
          prompt: `Gather ${target} apples.`,
          mathExplanation: `${target} apples counted and ready!`,
          payload: { targetQuantity: target, initialQuantity: target + 4, correctAnswer: target },
        },
      ];
    }
    case 'forest': {
      const init = classGrade === 2 ? 14 : 25;
      const sub = classGrade === 2 ? 6 : 9;
      const rem = init - sub;
      return [
        {
          id: `f_c${classGrade}_1`,
          worldId: 'forest',
          classGrade,
          title: `${init} Berries - ${sub} Picked`,
          instruction: `${init} berries grew in the grove. ${sub} were picked. Move the remaining ${rem}.`,
          topic: 'subtraction',
          prompt: `${init} - ${sub} = ?`,
          mathExplanation: `${init} - ${sub} = ${rem} berries remain!`,
          payload: { initialQuantity: init, subtractedQuantity: sub, correctAnswer: rem },
        },
      ];
    }
    case 'railway': {
      const carriages = classGrade === 2 ? 3 : 4;
      const perCarriage = classGrade === 2 ? 4 : 5;
      const total = carriages * perCarriage;
      return [
        {
          id: `r_c${classGrade}_1`,
          worldId: 'railway',
          classGrade,
          title: `Load ${carriages} Trains × ${perCarriage} Travelers`,
          instruction: `Load ${total} travelers equally into ${carriages} train cars (${perCarriage} each).`,
          topic: 'multiplication',
          prompt: `${carriages} × ${perCarriage} = ?`,
          mathExplanation: `${carriages} × ${perCarriage} = ${total} travelers boarded!`,
          payload: { trainCarriages: carriages, passengersPerCarriage: perCarriage, targetQuantity: total, correctAnswer: total },
        },
      ];
    }
    case 'tower': {
      const step = classGrade === 2 ? 2 : classGrade === 3 ? 5 : 10;
      const start = classGrade === 2 ? 2 : classGrade === 3 ? 5 : 10;
      const seq = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
      const missing = seq[3];
      return [
        {
          id: `t_c${classGrade}_1`,
          worldId: 'tower',
          classGrade,
          title: `Magic Pattern (+${step})`,
          instruction: `Place the missing crystal: ${seq[0]} → ${seq[1]} → ${seq[2]} → ? → ${seq[4]}`,
          topic: 'patterns',
          prompt: `What number comes next adding ${step}?`,
          mathExplanation: `${seq[2]} + ${step} = ${missing}!`,
          payload: {
            sequence: [seq[0], seq[1], seq[2], null, seq[4]],
            missingIndex: 3,
            missingOptions: [missing - 1, missing, missing + 2, missing + step].sort(() => Math.random() - 0.5),
            correctAnswer: missing,
          },
        },
      ];
    }
    case 'bridge': {
      const have = classGrade === 2 ? 7 : 14;
      const need = classGrade === 2 ? 5 : 8;
      const total = have + need;
      return [
        {
          id: `b_c${classGrade}_1`,
          worldId: 'bridge',
          classGrade,
          title: `Repair Bridge: ${have} + ${need} = ${total}`,
          instruction: `The bridge requires ${total} stones. You have ${have}. Add ${need} more!`,
          topic: 'addition',
          prompt: `${have} + ${need} = ?`,
          mathExplanation: `${have} + ${need} = ${total} stones. Bridge repaired!`,
          payload: { haveQuantity: have, neededTotal: total, targetQuantity: need, correctAnswer: need },
        },
      ];
    }
    case 'builder': {
      const rows = classGrade === 2 ? 3 : 4;
      const cols = classGrade === 2 ? 4 : 5;
      const total = rows * cols;
      return [
        {
          id: `bd_c${classGrade}_1`,
          worldId: 'builder',
          classGrade,
          title: `Build Wall: ${rows} Rows × ${cols} Columns`,
          instruction: `Place ${total} blocks to build a wall of ${rows} rows with ${cols} blocks each.`,
          topic: 'geometry',
          prompt: `${rows} × ${cols} = ?`,
          mathExplanation: `${rows} × ${cols} = ${total} blocks placed!`,
          payload: { gridRows: rows, gridCols: cols, targetQuantity: total, correctAnswer: total },
        },
      ];
    }
    case 'garden': {
      return [
        {
          id: `g_c${classGrade}_1`,
          worldId: 'garden',
          classGrade,
          title: '🌸 Royal Pattern Garden',
          instruction: 'Complete the pattern: 🔴 🟡 🔴 🟡 ?',
          topic: 'patterns',
          prompt: 'What comes next in the garden sequence?',
          mathExplanation: 'The pattern continues with 🔴!',
          payload: {
            patternSequence: ['🔴', '🟡', '🔴', '🟡', '?'],
            patternOptions: ['🔴', '🟡', '🟢', '🔵'],
            patternMissingIndex: 4,
            correctAnswer: '🔴',
          },
        },
      ];
    }
    case 'castle': {
      return [
        {
          id: `c_c${classGrade}_1`,
          worldId: 'castle',
          classGrade,
          title: '🏰 The Royal Coronation Quest',
          instruction: 'Place the 10 royal crown jewels onto the grand throne to complete your Number Kingdom journey!',
          topic: 'multiStep',
          prompt: 'Complete the royal crown jewel alignment.',
          mathExplanation: 'All crown jewels in place! You are officially crowned the Number Master!',
          payload: { targetQuantity: 10, correctAnswer: 10 },
        },
      ];
    }
    default:
      return [];
  }
};
