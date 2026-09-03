import type { InteractiveMission, MathTopic, SchoolClass, VillageInteraction } from './types';

type VillageQuestion = Omit<InteractiveMission, 'id' | 'worldId' | 'classGrade'>;

const choice = (
  title: string,
  instruction: string,
  topic: MathTopic,
  prompt: string,
  answer: number | string,
  options: Array<number | string>,
  explanation: string,
  companionHint: string,
  interactionType: VillageInteraction = 'choice',
  visualData?: Array<{ label: string; value: number }>,
): VillageQuestion => ({
  title,
  instruction,
  topic,
  prompt,
  mathExplanation: explanation,
  payload: { correctAnswer: answer, options, interactionType, companionHint, visualData },
});

/**
 * Curriculum-rich Magical Village prompts. The problems use familiar contexts and
 * increase concepts—not merely number size—between Classes 2 and 5.
 */
const VILLAGE_QUESTION_BANK: Record<Exclude<SchoolClass, 1>, VillageQuestion[]> = {
  2: [
    choice('Festival Lanterns', 'Help hang the missing lanterns before the village festival.', 'subtraction', 'There are 24 lanterns. 8 are already hanging. How many more are needed?', 16, [16, 18, 32, 14], '24 − 8 = 16 lanterns are still needed.', 'Count on from 8 until you reach 24.'),
    choice('Baker’s Baskets', 'Arrange magical cupcakes into equal baskets.', 'multiplication', 'There are 4 baskets with 5 cupcakes in each. How many cupcakes are there altogether?', 20, [9, 15, 20, 25], '4 equal groups of 5 make 20.', 'Try counting 5, 10, 15, 20.'),
    choice('Royal Market Change', 'Give the visitor the correct change at the market.', 'money', 'A toy costs ₹35. The visitor pays ₹50. How much change should they receive?', '₹15', ['₹10', '₹15', '₹20', '₹25'], '₹50 − ₹35 = ₹15 change.', 'Start with ₹35 and count up to ₹50.'),
    choice('Sharing Berry Tarts', 'Share the tarts fairly among village friends.', 'division', '12 berry tarts are shared equally among 3 friends. How many tarts does each friend get?', 4, [3, 4, 6, 9], '12 split into 3 equal groups gives 4 in each group.', 'Make three equal groups from 12.'),
  ],
  3: [
    choice('Village Bakery', 'Pack the magical buns into trays for the morning market.', 'multiplication', 'The baker made 6 trays. Each tray has 8 magical buns. How many buns did the baker make?', 48, [42, 48, 54, 56], '6 groups of 8 make 48 buns.', 'Use the 8-times table: 8, 16, 24…'),
    choice('Royal Delivery', 'Track the coins left after the village guard receives supplies.', 'subtraction', 'A messenger has 347 gold coins. He gives 125 coins to the village guard. How many coins remain?', 222, [212, 222, 232, 472], '347 − 125 = 222 coins.', 'Subtract hundreds, tens and ones carefully.'),
    choice('Potion Bottles', 'Distribute the potion equally for the village healers.', 'division', '36 bottles must be placed equally into 4 baskets. How many bottles go into each basket?', 9, [6, 8, 9, 12], '36 ÷ 4 = 9 bottles in each basket.', 'Ask: 4 times which number makes 36?'),
    choice('Rose Garden Fractions', 'Choose the garden that has three of four equal beds planted with roses.', 'fractions', 'Which fraction means 3 out of 4 equal garden beds are planted with roses?', '3/4', ['1/4', '2/4', '3/4', '4/3'], 'Three shaded equal parts out of four is 3/4.', 'The top number counts planted beds; the bottom counts all equal beds.', 'fraction'),
  ],
  4: [
    choice('Royal Treasury', 'Add the treasure deliveries arriving at the castle.', 'addition', 'The kingdom collected 2,475 gold coins and then 1,368 more. How many coins are there now?', '3,843', ['3,743', '3,833', '3,843', '4,843'], '2,475 + 1,368 = 3,843.', 'Add ones, tens, hundreds and thousands in columns.'),
    choice('Wizard’s Potion', 'Pour the potion equally into enchanted bottles.', 'division', 'A wizard has 864 ml of potion. He pours it equally into 8 bottles. How much potion goes into each bottle?', '108 ml', ['98 ml', '108 ml', '118 ml', '128 ml'], '864 ÷ 8 = 108 ml.', 'Split 800 and 64 into parts divisible by 8.'),
    choice('Magic Bridge Repair', 'Work out how many bridge blocks have already been repaired.', 'fractions', 'A bridge has 48 stone blocks. 3/4 of them have already been repaired. How many blocks are repaired?', 36, [12, 24, 36, 42], 'One quarter of 48 is 12, so three quarters is 36.', 'Find one quarter first, then use three groups of it.', 'fraction'),
    choice('Clock Tower', 'Plan the bell-ringing schedule for the village.', 'measurement', 'The clock tower starts ringing at 2:35 PM and rings for 45 minutes. When does it stop?', '3:20 PM', ['3:10 PM', '3:20 PM', '3:30 PM', '3:35 PM'], '25 minutes takes us to 3:00; 20 more minutes makes 3:20 PM.', 'Break 45 minutes into the time needed to reach the next hour and the rest.'),
  ],
  5: [
    choice('Royal Market Budget', 'Make a strategic spending decision for the village festival.', 'multiStep', 'The kingdom has ₹2,500. It spends ₹875 on food and ₹465 on decorations. How much money is left?', '₹1,160', ['₹1,060', '₹1,160', '₹1,260', '₹1,360'], 'First add ₹875 + ₹465 = ₹1,340. Then ₹2,500 − ₹1,340 = ₹1,160.', 'Combine both expenses before subtracting from the budget.'),
    choice('Magic Bakery Fractions', 'Track the flour left for tomorrow’s enchanted bread.', 'fractions', 'A baker has 3/4 kg of flour and uses 1/4 kg. How much flour remains?', '1/2 kg', ['1/4 kg', '1/2 kg', '2/4 kg', '3/4 kg'], '3/4 − 1/4 = 2/4, which is equal to 1/2.', 'The denominators match, so subtract the top numbers and simplify.', 'fraction'),
    choice('Royal Map Expedition', 'Choose the route that reaches the hidden treasure.', 'spatial', 'From the castle, the treasure is 4 squares east and 3 squares north. Which route reaches it?', '4 east, then 3 north', ['4 east, then 3 north', '4 north, then 3 east', '3 east, then 4 north', '4 west, then 3 south'], 'Moving east first by 4 and north by 3 lands exactly on the treasure.', 'East is right on the map; north is up.', 'map'),
    choice('Castle Angles', 'Choose the path that makes a perfect right-angle turn at the gate.', 'angles', 'Which magical path represents a right angle?', 'The L-shaped path (90°)', ['The straight path (180°)', 'The L-shaped path (90°)', 'The narrow turn (45°)', 'The wide turn (120°)'], 'A right angle is a quarter turn: 90°.', 'Picture the corner of a square or a book.', 'angle'),
    choice('Royal Farm Data', 'Read the farm ledger to help plan the market carts.', 'data', 'The farm collected baskets: Mon 24, Tue 31, Wed 27, Thu 38. Which day had the greatest harvest?', 'Thursday', ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], '38 is the largest number in the ledger, so Thursday had the greatest harvest.', 'Compare the height or value for each day.', 'data', [{ label: 'Mon', value: 24 }, { label: 'Tue', value: 31 }, { label: 'Wed', value: 27 }, { label: 'Thu', value: 38 }]),
  ],
};

export const getVillageMission = (grade: Exclude<SchoolClass, 1>, random = Math.random): InteractiveMission => {
  const bank = VILLAGE_QUESTION_BANK[grade];
  const question = bank[Math.min(bank.length - 1, Math.floor(random() * bank.length))];
  return { ...question, id: `village_c${grade}_${question.topic}`, worldId: 'village', classGrade: grade };
};

export { VILLAGE_QUESTION_BANK };
