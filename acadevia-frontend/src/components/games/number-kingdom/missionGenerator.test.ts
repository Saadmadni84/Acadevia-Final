import { describe, expect, it } from 'vitest';
import { getMissionsForWorld } from './missionGenerator';

describe('Number Kingdom grade missions', () => {
  it.each([1, 2, 3, 4, 5] as const)('creates valid content and missions for Class %i', (grade) => {
    const [mission] = getMissionsForWorld('village', grade);
    expect(mission.classGrade).toBe(grade);
    if (grade === 1) {
      expect(mission.id).toBe('c1_m1_village');
    } else {
      expect(mission.id).toBe(`c${grade}_m_village`);
      expect(mission.title).toBeDefined();
      expect(mission.instruction).toBeDefined();
    }
  });

  it('provides distinct, dedicated real-game concepts for Classes 2 through 5', () => {
    const [class2] = getMissionsForWorld('village', 2);
    const [class3] = getMissionsForWorld('village', 3);
    const [class4] = getMissionsForWorld('village', 4);
    const [class5] = getMissionsForWorld('village', 5);

    expect(class2.title).toContain('Number Bridge');
    expect(class3.title).toContain('Dragon Delivery');
    expect(class4.title).toContain("Wizard's Potion Lab");
    expect(class5.title).toContain('Kingdom Builder');

    // Confirm that titles & concepts are distinct
    expect(class2.title).not.toEqual(class3.title);
    expect(class3.title).not.toEqual(class4.title);
    expect(class4.title).not.toEqual(class5.title);
  });
});
