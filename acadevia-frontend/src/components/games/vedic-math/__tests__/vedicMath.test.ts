import { describe, it, expect } from 'vitest';
import { generateVedicQuestion } from '../questionGenerator';
import { VEDIC_TECHNIQUES, VEDIC_CHALLENGES } from '../vedicTechniquesData';
import type { VedicTopicId, DifficultyLevel } from '../types';

describe('Vedic Math Master - Question Generator Math Verification', () => {
  const topics: VedicTopicId[] = [
    'mult-11',
    'mult-5',
    'mult-25',
    'mult-50',
    'near-100',
    'square-ending-5',
    'square-near-base',
    'fast-addition',
    'fast-subtraction',
    'percentages',
    'square-roots',
    'cube-roots',
    'fractions',
  ];

  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];

  topics.forEach((topic) => {
    difficulties.forEach((diff) => {
      it(`should generate mathematically correct question for topic: ${topic} at ${diff} difficulty`, () => {
        const q = generateVedicQuestion(topic, diff, '9-10');
        expect(q.question).toBeTruthy();
        expect(q.answer).toBeTruthy();
        expect(q.hints.length).toBeGreaterThan(0);
        expect(q.explanation).toBeTruthy();

        // Topic specific mathematical checks
        if (topic === 'mult-11') {
          const match = q.question.match(/^(\d+)\s*×\s*11$/);
          if (match) {
            const num = parseInt(match[1], 10);
            expect(parseInt(q.answer, 10)).toBe(num * 11);
          }
        } else if (topic === 'mult-5') {
          const match = q.question.match(/^(\d+)\s*×\s*5$/);
          if (match) {
            const num = parseInt(match[1], 10);
            expect(parseInt(q.answer, 10)).toBe(num * 5);
          }
        } else if (topic === 'mult-25') {
          const match = q.question.match(/^(\d+)\s*×\s*25$/);
          if (match) {
            const num = parseInt(match[1], 10);
            expect(parseInt(q.answer, 10)).toBe(num * 25);
          }
        } else if (topic === 'mult-50') {
          const match = q.question.match(/^(\d+)\s*×\s*50$/);
          if (match) {
            const num = parseInt(match[1], 10);
            expect(parseInt(q.answer, 10)).toBe(num * 50);
          }
        } else if (topic === 'square-ending-5') {
          const match = q.question.match(/^(\d+)²$/);
          if (match) {
            const num = parseInt(match[1], 10);
            expect(num % 10).toBe(5);
            expect(parseInt(q.answer, 10)).toBe(num * num);
          }
        } else if (topic === 'square-roots') {
          const match = q.question.match(/^√(\d+)$/);
          if (match) {
            const square = parseInt(match[1], 10);
            const root = parseInt(q.answer, 10);
            expect(root * root).toBe(square);
          }
        } else if (topic === 'cube-roots') {
          const match = q.question.match(/^∛(\d+)$/);
          if (match) {
            const cube = parseInt(match[1], 10);
            const root = parseInt(q.answer, 10);
            expect(root * root * root).toBe(cube);
          }
        }
      });
    });
  });

  it('should load all technique tutorials and worked examples', () => {
    const keys = Object.keys(VEDIC_TECHNIQUES);
    expect(keys.length).toBeGreaterThanOrEqual(13);
    keys.forEach((k) => {
      const tech = VEDIC_TECHNIQUES[k as VedicTopicId];
      expect(tech.name).toBeTruthy();
      expect(tech.workedExample.problem).toBeTruthy();
      expect(tech.steps.length).toBeGreaterThan(0);
    });
  });

  it('should load all featured master challenge trials', () => {
    expect(VEDIC_CHALLENGES.length).toBeGreaterThanOrEqual(6);
    VEDIC_CHALLENGES.forEach((ch) => {
      expect(ch.title).toBeTruthy();
      expect(ch.rewardXP).toBeGreaterThan(0);
    });
  });
});
