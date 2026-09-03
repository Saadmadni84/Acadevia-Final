import { describe, expect, it } from 'vitest';
import { getMissionsForWorld } from './missionGenerator';
import { VILLAGE_QUESTION_BANK, getVillageMission } from './villageCurriculum';

describe('Number Kingdom grade missions', () => {
  it.each([1, 2, 3, 4, 5] as const)('creates valid Magical Village content for Class %i', (grade) => {
    const [mission] = getMissionsForWorld('village', grade);
    expect(mission.classGrade).toBe(grade);
    if (grade === 1) expect(mission.id).toBe('c1_m1_village');
    else expect(mission.payload.options).toContain(mission.payload.correctAnswer);
  });

  it('scales later-world content through Class 5', () => {
    const [class2] = getMissionsForWorld('forest', 2);
    const [class5] = getMissionsForWorld('forest', 5);
    expect(class2.payload.correctAnswer).toBe(8);
    expect(class5.payload.correctAnswer).toBe(87);
  });

  it('gives every village prompt one valid answer and plausible alternatives', () => {
    ([2, 3, 4, 5] as const).forEach((grade) => {
      VILLAGE_QUESTION_BANK[grade].forEach((question) => {
        const options = question.payload.options ?? [];
        expect(options.filter((option) => option === question.payload.correctAnswer)).toHaveLength(1);
        expect(new Set(options).size).toBe(options.length);
      });
    });
  });

  it('uses different concepts and supports deterministic randomized variants', () => {
    expect(getVillageMission(2, () => 0).topic).toBe('subtraction');
    expect(getVillageMission(3, () => 0).topic).toBe('multiplication');
    expect(getVillageMission(4, () => 0).topic).toBe('addition');
    expect(getVillageMission(5, () => 0.99).topic).toBe('data');
  });
});
