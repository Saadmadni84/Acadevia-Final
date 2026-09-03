import type { LucideIcon } from 'lucide-react';
import { Atom, Bot, BookOpen, Calculator, Landmark, Rocket, Sparkles, Target } from 'lucide-react';

export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameMechanic = 'blaster' | 'wizard' | 'lab' | 'timeline' | 'code' | 'space';

export interface GameQuestion {
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
  visual?: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: GameDifficulty;
  classes: string;
  xpReward: number;
  estimatedTime: string;
  rating: number;
  playersCount: number;
  mechanic?: GameMechanic;
  icon: LucideIcon;
  colors: string;
  learning: string[];
  howToPlay: string[];
  stages: string[];
  questions?: GameQuestion[];
}

export const GAME_CATALOG: GameDefinition[] = [
  { id: 'number-kingdom', title: 'Number Kingdom', description: 'Unlock magical worlds with number sense, arithmetic and fractions.', subject: 'Mathematics', difficulty: 'easy', classes: '1–5', xpReward: 150, estimatedTime: '10–15 min', rating: 5, playersCount: 64200, icon: Sparkles, colors: 'from-amber-400 via-orange-400 to-rose-500', learning: ['Number sense', 'Arithmetic', 'Fractions', 'Mental maths'], howToPlay: ['Choose your class and companion.', 'Clear missions to unlock each kingdom world.', 'Collect stars, gems and XP.'], stages: ['Number Forest', 'Addition Village', 'Multiplication Mountain', 'Fraction Castle', 'Number Kingdom'] },
  { id: 'trigonometry-quest', title: 'Trigonometry Quest', description: 'Master sin, cos, tan and the unit circle through a seven-stage quest.', subject: 'Mathematics', difficulty: 'hard', classes: '9–12', xpReward: 150, estimatedTime: '10–15 min', rating: 4.9, playersCount: 58400, icon: Target, colors: 'from-violet-600 via-indigo-500 to-cyan-400', learning: ['Trigonometric ratios', 'Standard angles', 'Unit circle', 'Identities'], howToPlay: ['Choose the best answer for each quest.', 'Build a combo to earn bonus points.', 'Defeat the final boss challenge.'], stages: ['Ratios Ridge', 'Angle Valley', 'Unit Circle', 'Identity Keep', 'Quest Finale'] },
  { id: 'math-blaster', title: 'Math Blaster', description: 'Blast asteroids by solving fast-paced maths challenges.', subject: 'Mathematics', difficulty: 'medium', classes: '6–8', xpReward: 90, estimatedTime: '8–12 min', rating: 4.7, playersCount: 45200, mechanic: 'blaster', icon: Calculator, colors: 'from-fuchsia-600 via-violet-600 to-blue-600', learning: ['Integers and fractions', 'Percentages', 'Algebra basics', 'Geometry'], howToPlay: ['Pick the correct answer before the timer runs down.', 'Each correct answer blasts an asteroid.', 'Keep your shield up and build a combo.'], stages: ['Asteroid Belt', 'Equation Nebula', 'Percentage Planet'], questions: [
    { prompt: 'An asteroid shows: −8 + 15. What is the blast code?', options: ['7', '−7', '23', '120'], answer: '7', hint: 'Start at −8 and move 15 steps right.', visual: '☄️' },
    { prompt: 'What is 3/4 written as a decimal?', options: ['0.34', '0.75', '0.25', '0.80'], answer: '0.75', hint: 'Divide 3 by 4.', visual: '🎯' },
    { prompt: 'A shield costs ₹240 after a 20% discount. What was the discount amount?', options: ['₹24', '₹48', '₹60', '₹80'], answer: '₹60', hint: '20% of 300 is 60; the sale price is 240.', visual: '🛡️' },
    { prompt: 'Solve: 3x + 5 = 20', options: ['x = 3', 'x = 5', 'x = 8', 'x = 15'], answer: 'x = 5', hint: 'Subtract 5, then divide by 3.', visual: '🚀' },
    { prompt: 'What is the area of a rectangle 8 cm by 5 cm?', options: ['13 cm²', '26 cm²', '40 cm²', '80 cm²'], answer: '40 cm²', hint: 'Area = length × width.', visual: '💥' },
  ] },
  { id: 'word-wizard', title: 'Word Wizard', description: 'Charge spells while building vocabulary in a magical academy.', subject: 'English', difficulty: 'easy', classes: '3–6', xpReward: 80, estimatedTime: '8–12 min', rating: 4.5, playersCount: 32100, mechanic: 'wizard', icon: BookOpen, colors: 'from-purple-600 via-fuchsia-500 to-pink-400', learning: ['Word meanings', 'Synonyms', 'Antonyms', 'Sentence completion'], howToPlay: ['Read the enchanted word or sentence.', 'Choose the spell with the right meaning.', 'Fill the magic meter to unlock a new spell.'], stages: ['Spellbook Basics', 'Forest of Words', 'Castle of Synonyms'], questions: [
    { prompt: 'Which word means “very happy”?', options: ['Gloomy', 'Delighted', 'Sleepy', 'Silent'], answer: 'Delighted', hint: 'Think of how you feel when you receive wonderful news.', visual: '🪄' },
    { prompt: 'Choose a synonym for “brave”.', options: ['Courageous', 'Tiny', 'Noisy', 'Angry'], answer: 'Courageous', hint: 'A synonym has a similar meaning.', visual: '📖' },
    { prompt: 'Choose the antonym of “ancient”.', options: ['Old', 'Modern', 'Historic', 'Broken'], answer: 'Modern', hint: 'An antonym has the opposite meaning.', visual: '✨' },
    { prompt: 'The wizard spoke so ___ that everyone could hear.', options: ['quietly', 'loudly', 'slowly', 'sadly'], answer: 'loudly', hint: 'Everyone hearing needs a strong sound.', visual: '🔮' },
    { prompt: 'Which spelling is correct?', options: ['becaus', 'becose', 'because', 'beacause'], answer: 'because', hint: 'It has “cause” at the end.', visual: '🧙' },
  ] },
  { id: 'science-lab', title: 'Science Lab', description: 'Run safe virtual experiments and make observations.', subject: 'Science', difficulty: 'medium', classes: '6–8', xpReward: 100, estimatedTime: '10–15 min', rating: 4.8, playersCount: 28400, mechanic: 'lab', icon: Atom, colors: 'from-cyan-500 via-teal-500 to-emerald-500', learning: ['Physical and chemical changes', 'Electricity', 'Force and motion', 'Ecosystems'], howToPlay: ['Follow the lab safety checklist.', 'Select the apparatus that completes the experiment.', 'Record the observation, then answer the challenge.'], stages: ['Matter Station', 'Circuit Bench', 'Ecosystem Dome'], questions: [
    { prompt: 'Experiment: ice melts into water. What kind of change is this?', options: ['Physical change', 'Chemical change', 'Combustion', 'Rusting'], answer: 'Physical change', hint: 'The substance is still water after melting.', visual: '🧊 → 💧' },
    { prompt: 'Build the circuit: which item must connect to both ends of a cell to light a bulb?', options: ['A wire', 'A ruler', 'A magnet', 'A leaf'], answer: 'A wire', hint: 'Electric current needs a complete conducting path.', visual: '🔋 ─ 💡' },
    { prompt: 'Vinegar reacts with baking soda and makes bubbles. What is evidence of?', options: ['A chemical change', 'Only a colour change', 'Freezing', 'A physical change'], answer: 'A chemical change', hint: 'A new gas is formed.', visual: '🧪' },
    { prompt: 'Which force slows a rolling ball on the ground?', options: ['Friction', 'Gravity only', 'Magnetism', 'Light'], answer: 'Friction', hint: 'It acts between touching surfaces.', visual: '⚽' },
    { prompt: 'In a food chain, which organism makes its own food?', options: ['Green plant', 'Tiger', 'Mushroom', 'Eagle'], answer: 'Green plant', hint: 'It uses sunlight to make food.', visual: '🌱' },
  ] },
  { id: 'history-quest', title: 'History Quest', description: 'Explore India’s past by rebuilding timelines and uncovering artifacts.', subject: 'Social Studies', difficulty: 'medium', classes: '6–10', xpReward: 85, estimatedTime: '10–15 min', rating: 4.3, playersCount: 19300, mechanic: 'timeline', icon: Landmark, colors: 'from-orange-500 via-amber-500 to-yellow-400', learning: ['Ancient India', 'Empires and achievements', 'Freedom movement', 'Timeline reasoning'], howToPlay: ['Inspect the map, clue or artifact.', 'Place events in the right historical context.', 'Unlock the next location on the expedition map.'], stages: ['Indus Valley', 'Mauryan Empire', 'Freedom Trail'], questions: [
    { prompt: 'Which civilization is known for planned cities such as Harappa and Mohenjo-daro?', options: ['Indus Valley Civilization', 'Gupta Empire', 'Mughal Empire', 'Mauryan Empire'], answer: 'Indus Valley Civilization', hint: 'It grew around the Indus River.', visual: '🏛️' },
    { prompt: 'Put these in order: Mauryan Empire, Gupta Empire, Mughal Empire. Which comes first?', options: ['Mauryan Empire', 'Gupta Empire', 'Mughal Empire', 'They began together'], answer: 'Mauryan Empire', hint: 'Ashoka belonged to this early empire.', visual: '📜' },
    { prompt: 'Who is associated with the Kalinga War and later spreading dhamma?', options: ['Ashoka', 'Akbar', 'Shivaji', 'Gandhi'], answer: 'Ashoka', hint: 'He was a Mauryan emperor.', visual: '🦁' },
    { prompt: 'The Dandi March was part of which movement?', options: ['Indian freedom movement', 'Indus Valley trade', 'Gupta science', 'Vedic rituals'], answer: 'Indian freedom movement', hint: 'It protested the salt tax.', visual: '🧂' },
    { prompt: 'What does a timeline help a historian understand?', options: ['The order of events', 'Only map colours', 'Weather today', 'Future inventions'], answer: 'The order of events', hint: 'It arranges events from earlier to later.', visual: '🗺️' },
  ] },
  { id: 'code-runner', title: 'Code Runner', description: 'Guide a friendly robot through puzzles using programming logic.', subject: 'Computer Science', difficulty: 'hard', classes: '6–12', xpReward: 120, estimatedTime: '12–20 min', rating: 4.9, playersCount: 15600, mechanic: 'code', icon: Bot, colors: 'from-slate-700 via-blue-700 to-cyan-500', learning: ['Sequencing', 'Conditions and loops', 'Debugging', 'Algorithmic thinking'], howToPlay: ['Read the robot’s mission.', 'Choose the correct code block or output.', 'Clear bugs to open the next gate—no code is executed.'], stages: ['Logic Lane', 'Loop Lab', 'Debug Dungeon'], questions: [
    { prompt: 'Robot starts at 0. Commands: MOVE 2, MOVE 3. Where does it finish?', options: ['3', '5', '6', '0'], answer: '5', hint: 'Follow each command in sequence.', visual: '🤖 → → → → → 🏁' },
    { prompt: 'Which loop repeats an action 4 times?', options: ['REPEAT 4 { move() }', 'IF 4 { move() }', 'STOP 4', 'MOVE = 4'], answer: 'REPEAT 4 { move() }', hint: 'A loop repeats a set of instructions.', visual: '🔁' },
    { prompt: 'What is the output? score = 7; score = score + 3;', options: ['3', '7', '10', '73'], answer: '10', hint: 'The second line updates score.', visual: '⌨️' },
    { prompt: 'A gate opens only if hasKey is true. Which is the condition?', options: ['if (hasKey)', 'repeat (hasKey)', 'print(hasKey)', 'hasKey = false'], answer: 'if (hasKey)', hint: 'A condition checks whether something is true.', visual: '🔐' },
    { prompt: 'Which step best fixes a program that does not do what you expect?', options: ['Test and inspect each step', 'Run unknown code', 'Delete every line', 'Guess without checking'], answer: 'Test and inspect each step', hint: 'Debugging means finding the cause carefully.', visual: '🐞' },
  ] },
  { id: 'grammar-galaxy', title: 'Grammar Galaxy', description: 'Pilot a spaceship through grammar planets and repair the ship.', subject: 'English', difficulty: 'easy', classes: '4–8', xpReward: 75, estimatedTime: '8–12 min', rating: 4.4, playersCount: 22800, mechanic: 'space', icon: Rocket, colors: 'from-indigo-700 via-purple-600 to-pink-500', learning: ['Parts of speech', 'Tenses', 'Subject–verb agreement', 'Punctuation'], howToPlay: ['Scan each grammar planet for a signal.', 'Choose the correct repair module.', 'Answer correctly to power your spaceship.'], stages: ['Planet of Nouns', 'Tense Nebula', 'Punctuation Station'], questions: [
    { prompt: 'Which word is a noun in “The astronaut waved”?', options: ['astronaut', 'waved', 'the', 'quickly'], answer: 'astronaut', hint: 'A noun names a person, place, thing or idea.', visual: '🪐' },
    { prompt: 'Choose the correct verb: “The stars ___ brightly.”', options: ['shine', 'shines', 'shining', 'shoneing'], answer: 'shine', hint: '“Stars” is plural.', visual: '⭐' },
    { prompt: 'Choose the sentence with correct punctuation.', options: ['Where are we going?', 'where are we going.', 'Where are we going.', 'where are we going?'], answer: 'Where are we going?', hint: 'Questions end with a question mark and start with a capital letter.', visual: '🚀' },
    { prompt: 'Which is an adjective in “The blue planet spins”?', options: ['blue', 'planet', 'spins', 'the'], answer: 'blue', hint: 'An adjective describes a noun.', visual: '🌍' },
    { prompt: 'Choose the correct article: “___ Earth orbits the Sun.”', options: ['The', 'A', 'An', 'Some'], answer: 'The', hint: 'We use “the” for a unique object such as Earth.', visual: '☀️' },
  ] },
];

export const getGameById = (id: string) => GAME_CATALOG.find((game) => game.id === id);
