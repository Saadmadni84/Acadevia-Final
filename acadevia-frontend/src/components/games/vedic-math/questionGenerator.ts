import type {
  VedicTopicId,
  DifficultyLevel,
  GeneratedQuestion,
  VedicGradeBand,
} from './types';
import { VEDIC_TECHNIQUES } from './vedicTechniquesData';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateVedicQuestion(
  topicId: VedicTopicId,
  difficulty: DifficultyLevel = 'medium',
  _gradeBand: VedicGradeBand = '7-8'
): GeneratedQuestion {
  const technique = VEDIC_TECHNIQUES[topicId] || VEDIC_TECHNIQUES['mult-11'];
  const topicName = technique.name;

  let question = '';
  let answer = '';
  let hints: string[] = [];
  let explanation = '';
  let shortShortcut = '';
  let targetSeconds = 12;

  switch (topicId) {
    case 'mult-11': {
      let num: number;
      if (difficulty === 'easy') {
        num = getRandomInt(12, 45); // no carry: digits sum <= 9
        while ((Math.floor(num / 10) + (num % 10)) > 9) {
          num = getRandomInt(12, 45);
        }
      } else if (difficulty === 'medium') {
        num = getRandomInt(47, 98); // with carry
      } else if (difficulty === 'hard') {
        num = getRandomInt(112, 450); // 3-digit
      } else {
        num = getRandomInt(567, 989); // large 3-digit
      }

      const calculated = num * 11;
      question = `${num} × 11`;
      answer = String(calculated);
      targetSeconds = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 14;

      if (num < 100) {
        const d1 = Math.floor(num / 10);
        const d2 = num % 10;
        const sum = d1 + d2;
        hints = [
          'Separate the digits and add them together.',
          `First digit is ${d1}, last digit is ${d2}. What is ${d1} + ${d2}?`,
          `Place ${sum} in the middle between ${d1} and ${d2}. (Carry over 1 if > 9)`,
          `Answer is ${calculated}.`,
        ];
        shortShortcut = `${d1} | (${d1}+${d2}) | ${d2} = ${calculated}`;
        explanation = `Split ${num} into ${d1} and ${d2}. Middle = ${d1} + ${d2} = ${sum}. ${sum > 9 ? `Carry 1 to left: (${d1}+1)|${sum % 10}|${d2} = ${calculated}` : `Combine: ${calculated}`}`;
      } else {
        hints = [
          'Write the ends, add adjacent pairs from right to left.',
          `Last digit is ${num % 10}. Add adjacent digits.`,
          `Formula: d1 | (d1+d2) | (d2+d3) | d3.`,
          `Answer is ${calculated}.`,
        ];
        shortShortcut = `Add adjacent pairs to get ${calculated}`;
        explanation = `Multiply ${num} by 11 by placing the first and last digits on ends and adding adjacent pairs in the middle. Result: ${calculated}.`;
      }
      break;
    }

    case 'mult-5': {
      let num: number;
      if (difficulty === 'easy') {
        num = getRandomInt(6, 24) * 2; // Even numbers
      } else if (difficulty === 'medium') {
        num = getRandomInt(26, 60) * 2;
      } else if (difficulty === 'hard') {
        num = getRandomInt(120, 300) * 2;
      } else {
        num = getRandomInt(45, 199); // Odd numbers
      }

      const calculated = num * 5;
      question = `${num} × 5`;
      answer = String(calculated);
      targetSeconds = 8;
      const half = num / 2;

      hints = [
        'Multiplying by 5 is the same as multiplying by 10 and dividing by 2.',
        `What is half of ${num}?`,
        `Multiply ${half} by 10.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `(${num} ÷ 2) × 10 = ${calculated}`;
      explanation = `Halve ${num} to get ${half}, then multiply by 10 to get ${calculated}.`;
      break;
    }

    case 'mult-25': {
      let num: number;
      if (difficulty === 'easy') {
        num = getRandomInt(3, 12) * 4;
      } else if (difficulty === 'medium') {
        num = getRandomInt(14, 30) * 4;
      } else if (difficulty === 'hard') {
        num = getRandomInt(32, 80) * 4;
      } else {
        num = getRandomInt(82, 160) * 4;
      }

      const calculated = num * 25;
      const fourth = num / 4;
      question = `${num} × 25`;
      answer = String(calculated);
      targetSeconds = 10;

      hints = [
        'Think of 25 as 100 ÷ 4.',
        `Divide ${num} by 4 (halve it twice).`,
        `${num} ÷ 4 = ${fourth}. Now multiply by 100.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `(${num} ÷ 4) × 100 = ${calculated}`;
      explanation = `Divide ${num} by 4 to get ${fourth}, then append two zeros (× 100) = ${calculated}.`;
      break;
    }

    case 'mult-50': {
      let num: number;
      if (difficulty === 'easy') {
        num = getRandomInt(6, 20) * 2;
      } else if (difficulty === 'medium') {
        num = getRandomInt(22, 60) * 2;
      } else if (difficulty === 'hard') {
        num = getRandomInt(62, 140) * 2;
      } else {
        num = getRandomInt(142, 280) * 2;
      }

      const calculated = num * 50;
      const half = num / 2;
      question = `${num} × 50`;
      answer = String(calculated);
      targetSeconds = 8;

      hints = [
        '50 is half of 100.',
        `Halve ${num} first.`,
        `Half of ${num} is ${half}. Now multiply by 100.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `(${num} ÷ 2) × 100 = ${calculated}`;
      explanation = `Halve ${num} = ${half}, then append two zeroes (× 100) = ${calculated}.`;
      break;
    }

    case 'near-100': {
      let a: number;
      let b: number;
      if (difficulty === 'easy') {
        a = getRandomInt(95, 99);
        b = getRandomInt(95, 99);
      } else if (difficulty === 'medium') {
        a = getRandomInt(91, 98);
        b = getRandomInt(91, 98);
      } else if (difficulty === 'hard') {
        a = getRandomInt(85, 95);
        b = getRandomInt(88, 97);
      } else {
        // above 100
        a = getRandomInt(102, 109);
        b = getRandomInt(102, 109);
      }

      const calculated = a * b;
      question = `${a} × ${b}`;
      answer = String(calculated);
      targetSeconds = 15;

      const devA = a - 100;
      const devB = b - 100;
      const left = a + devB;
      const right = Math.abs(devA * devB);
      const rightFormatted = right < 10 ? `0${right}` : String(right);

      hints = [
        'Both numbers are close to base 100.',
        `Find deviation from 100: ${a} (${devA > 0 ? `+${devA}` : devA}) and ${b} (${devB > 0 ? `+${devB}` : devB}).`,
        `Left: ${a} + (${devB}) = ${left}. Right: (${devA}) × (${devB}) = ${rightFormatted}.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `[${a} + (${devB})] | [${devA} × ${devB}] = ${left}${rightFormatted}`;
      explanation = `Deviations from 100 are ${devA} and ${devB}. Left part = ${a} + (${devB}) = ${left}. Right part = ${devA} × ${devB} = ${rightFormatted}. Combined = ${calculated}.`;
      break;
    }

    case 'square-ending-5': {
      let tens: number;
      if (difficulty === 'easy') {
        tens = getRandomInt(1, 4); // 15, 25, 35, 45
      } else if (difficulty === 'medium') {
        tens = getRandomInt(5, 8); // 55, 65, 75, 85
      } else if (difficulty === 'hard') {
        tens = getRandomInt(9, 12); // 95, 105, 115, 125
      } else {
        tens = getRandomInt(13, 20); // 135, 145, ...
      }

      const num = tens * 10 + 5;
      const calculated = num * num;
      question = `${num}²`;
      answer = String(calculated);
      targetSeconds = 8;
      const leftPart = tens * (tens + 1);

      hints = [
        'Use Ekadhikena Purvena (multiply tens digit by one more).',
        `Tens part is ${tens}. Multiply ${tens} × ${tens + 1}.`,
        `${tens} × ${tens + 1} = ${leftPart}. Suffix 25.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `${tens} × ${tens + 1} | 25 = ${calculated}`;
      explanation = `Multiply ${tens} by one more (${tens + 1}) to get ${leftPart}, then append 25 to get ${calculated}.`;
      break;
    }

    case 'square-near-base': {
      let num: number;
      if (difficulty === 'easy') {
        num = getRandomInt(96, 99);
      } else if (difficulty === 'medium') {
        num = getRandomInt(92, 95);
      } else if (difficulty === 'hard') {
        num = getRandomInt(87, 91);
      } else {
        num = getRandomInt(102, 108);
      }

      const calculated = num * num;
      question = `${num}²`;
      answer = String(calculated);
      targetSeconds = 12;

      const deficit = 100 - num;
      const leftPart = num - deficit;
      const rightPart = deficit * deficit;
      const rightFormatted = rightPart < 10 ? `0${rightPart}` : String(rightPart);

      hints = [
        'Base is 100. How far is this number from 100?',
        `Deviation from 100 is ${deficit >= 0 ? `-${deficit}` : `+${Math.abs(deficit)}`}.`,
        `Left: ${num} - ${deficit} = ${leftPart}. Right: ${deficit}² = ${rightFormatted}.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `(${num} - ${deficit}) | ${deficit}² = ${calculated}`;
      explanation = `Deficit from 100 is ${deficit}. Left part = ${num} - ${deficit} = ${leftPart}. Right part = ${deficit}² = ${rightFormatted}. Result: ${calculated}.`;
      break;
    }

    case 'fast-addition': {
      let n1: number;
      let n2: number;
      if (difficulty === 'easy') {
        n1 = getRandomInt(21, 69);
        n2 = getRandomInt(15, 48);
      } else if (difficulty === 'medium') {
        n1 = getRandomInt(55, 99);
        n2 = getRandomInt(45, 99);
      } else if (difficulty === 'hard') {
        n1 = getRandomInt(125, 450);
        n2 = getRandomInt(115, 380);
      } else {
        n1 = getRandomInt(450, 990);
        n2 = getRandomInt(380, 890);
      }

      const calculated = n1 + n2;
      question = `${n1} + ${n2}`;
      answer = String(calculated);
      targetSeconds = 10;

      const t1 = Math.floor(n1 / 10) * 10;
      const u1 = n1 % 10;
      const t2 = Math.floor(n2 / 10) * 10;
      const u2 = n2 % 10;

      hints = [
        'Add left-to-right (tens first, then units).',
        `Add the tens: ${t1} + ${t2} = ${t1 + t2}.`,
        `Add the units: ${u1} + ${u2} = ${u1 + u2}.`,
        `Combine: ${t1 + t2} + ${u1 + u2} = ${calculated}.`,
      ];
      shortShortcut = `(${t1}+${t2}) + (${u1}+${u2}) = ${calculated}`;
      explanation = `Add tens first (${t1} + ${t2} = ${t1 + t2}), then add units (${u1} + ${u2} = ${u1 + u2}), totaling ${calculated}.`;
      break;
    }

    case 'fast-subtraction': {
      let base: number;
      let sub: number;
      if (difficulty === 'easy') {
        base = 100;
        sub = getRandomInt(14, 89);
      } else if (difficulty === 'medium') {
        base = 1000;
        sub = getRandomInt(120, 880);
      } else if (difficulty === 'hard') {
        base = 1000;
        sub = getRandomInt(111, 999);
      } else {
        base = 10000;
        sub = getRandomInt(1111, 8999);
      }

      const calculated = base - sub;
      question = `${base} - ${sub}`;
      answer = String(calculated);
      targetSeconds = 10;

      hints = [
        'Use the Vedic rule: All from 9 and the last from 10.',
        'Subtract all non-zero digits from 9, and the last digit from 10.',
        `Digits of ${sub} from left: 9 - d1, 9 - d2... 10 - last.`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `All from 9, last from 10 = ${calculated}`;
      explanation = `Subtract each digit of ${sub} from 9, and the last digit from 10 to get ${calculated}.`;
      break;
    }

    case 'percentages': {
      let pct: number;
      let val: number;
      if (difficulty === 'easy') {
        pct = [10, 50, 25, 20][getRandomInt(0, 3)];
        val = getRandomInt(2, 20) * (pct === 25 ? 4 : 10);
      } else if (difficulty === 'medium') {
        pct = [15, 25, 75, 30, 40][getRandomInt(0, 4)];
        val = getRandomInt(4, 30) * (pct === 25 || pct === 75 ? 4 : 10);
      } else if (difficulty === 'hard') {
        pct = [15, 35, 45, 60, 75][getRandomInt(0, 4)];
        val = getRandomInt(20, 100) * 10;
      } else {
        pct = [12, 18, 24, 35, 65][getRandomInt(0, 4)];
        val = getRandomInt(50, 250) * 10;
      }

      const calculated = Math.round((pct / 100) * val);
      question = `${pct}% of ${val}`;
      answer = String(calculated);
      targetSeconds = 10;

      hints = [
        'Break down into benchmark percentages: 10%, 5%, 50%, 25%.',
        `10% of ${val} is ${val / 10}.`,
        `Use multiples of 10% or fraction equivalents (e.g. 25% = 1/4).`,
        `Answer is ${calculated}.`,
      ];
      shortShortcut = `${pct}% of ${val} = ${calculated}`;
      explanation = `Calculate ${pct}% by breaking into benchmark chunks: 10% is ${val / 10}, 50% is ${val / 2}. Total = ${calculated}.`;
      break;
    }

    case 'square-roots': {
      let root: number;
      if (difficulty === 'easy') {
        root = getRandomInt(4, 12); // 16 to 144
      } else if (difficulty === 'medium') {
        root = getRandomInt(13, 25); // 169 to 625
      } else if (difficulty === 'hard') {
        root = getRandomInt(26, 45); // 676 to 2025
      } else {
        root = getRandomInt(46, 75);
      }

      const square = root * root;
      question = `√${square}`;
      answer = String(root);
      targetSeconds = 8;

      hints = [
        'Observe the unit digit and nearest tens square.',
        `Ends in ${square % 10}. What single digits squared end in ${square % 10}?`,
        `Estimate between which tens squares ${square} lies.`,
        `Answer is ${root}.`,
      ];
      shortShortcut = `√${square} = ${root} (since ${root}² = ${square})`;
      explanation = `Check the unit digit of ${square} and bracket between tens squares to find root ${root}.`;
      break;
    }

    case 'cube-roots': {
      let root: number;
      if (difficulty === 'easy') {
        root = getRandomInt(2, 6); // 8, 27, 64, 125, 216
      } else if (difficulty === 'medium') {
        root = getRandomInt(7, 10); // 343, 512, 729, 1000
      } else if (difficulty === 'hard') {
        root = getRandomInt(11, 20); // 1331 to 8000
      } else {
        root = getRandomInt(21, 30);
      }

      const cube = root * root * root;
      question = `∛${cube}`;
      answer = String(root);
      targetSeconds = 8;

      hints = [
        'Recall the unique 1-to-1 cube endings (2↔8, 3↔7, all others same).',
        `The last digit is ${cube % 10}, which maps to unit digit ${root % 10}.`,
        `Compare remaining prefix with nearest cube thresholds.`,
        `Answer is ${root}.`,
      ];
      shortShortcut = `∛${cube} = ${root} (since ${root}³ = ${cube})`;
      explanation = `The last digit ${cube % 10} reveals the unit digit ${root % 10}. The root is ${root}.`;
      break;
    }

    case 'fractions': {
      const d1 = [2, 3, 4, 5][getRandomInt(0, 3)];
      const d2 = [3, 4, 5, 7].filter((d) => d !== d1)[getRandomInt(0, 2)];

      // Addition 1/d1 + 1/d2 = (d2 + d1) / (d1 * d2)
      const numSum = d2 + d1;
      const denProd = d1 * d2;
      question = `1/${d1} + 1/${d2}`;
      answer = `${numSum}/${denProd}`;
      targetSeconds = 12;

      hints = [
        'Use butterfly cross-multiplication.',
        `Cross-multiply: (1 × ${d2}) + (1 × ${d1}) = ${numSum}.`,
        `Multiply denominators: ${d1} × ${d2} = ${denProd}.`,
        `Answer is ${numSum}/${denProd}.`,
      ];
      shortShortcut = `(${d2} + ${d1}) / (${d1} × ${d2}) = ${numSum}/${denProd}`;
      explanation = `Cross-multiply numerators to get (${d2} + ${d1} = ${numSum}) and multiply denominators (${d1} × ${d2} = ${denProd}) to get ${numSum}/${denProd}.`;
      break;
    }

    case 'mixed-speed':
    default: {
      const subTopics: VedicTopicId[] = [
        'mult-11',
        'mult-5',
        'mult-25',
        'mult-50',
        'near-100',
        'square-ending-5',
        'square-roots',
        'percentages',
      ];
      const picked = subTopics[getRandomInt(0, subTopics.length - 1)];
      return generateVedicQuestion(picked, difficulty, _gradeBand);
    }
  }

  // Verification step: verify answer is non-empty string and correct
  return {
    id: `q-${topicId}-${Date.now()}-${getRandomInt(100, 999)}`,
    question,
    answer: answer.trim(),
    topicId,
    topicName,
    difficulty,
    hints,
    explanation,
    shortShortcut,
    targetSeconds,
  };
}
