import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '@/services/data.service';

describe('Dynamic Student School Name, Class, and State Profile Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly persists and retrieves School Name, Class, and State for Student A (SFPS, Class 9, Uttar Pradesh)', () => {
    const studentA = {
      id: 'student-sfps-01',
      email: 'studentA@example.com',
      fullName: 'Student A',
      role: 'STUDENT' as const,
      schoolName: 'SFPS',
      classGrade: 9,
      stateName: 'Uttar Pradesh',
      cityName: 'Ghazipur',
      totalXP: 1500,
      currentLevel: 4,
      currentStreak: 5,
      lessonsCompleted: 12,
    };

    dataService.upsertUser(studentA);
    const retrieved = dataService.getUserById('student-sfps-01');

    expect(retrieved).toBeDefined();
    expect(retrieved?.fullName).toBe('Student A');
    expect(retrieved?.schoolName).toBe('SFPS');
    expect(retrieved?.classGrade).toBe(9);
    expect(retrieved?.stateName).toBe('Uttar Pradesh');
    expect(retrieved?.cityName).toBe('Ghazipur');
  });

  it('correctly persists and retrieves distinct School Name, Class, and State for Student B (ABC Public School, Class 7, Maharashtra)', () => {
    const studentB = {
      id: 'student-abc-02',
      email: 'studentB@example.com',
      fullName: 'Student B',
      role: 'STUDENT' as const,
      schoolName: 'ABC Public School',
      classGrade: 7,
      stateName: 'Maharashtra',
      cityName: 'Mumbai',
      totalXP: 450,
      currentLevel: 2,
      currentStreak: 1,
      lessonsCompleted: 3,
    };

    dataService.upsertUser(studentB);
    const retrieved = dataService.getUserById('student-abc-02');

    expect(retrieved).toBeDefined();
    expect(retrieved?.fullName).toBe('Student B');
    expect(retrieved?.schoolName).toBe('ABC Public School');
    expect(retrieved?.classGrade).toBe(7);
    expect(retrieved?.stateName).toBe('Maharashtra');
    expect(retrieved?.cityName).toBe('Mumbai');
  });

  it('ensures distinct student accounts do not leak school name, class, or state data to each other', () => {
    const user1 = {
      id: 's1',
      email: 'user1@school.com',
      fullName: 'User One',
      role: 'STUDENT' as const,
      schoolName: 'SFPS',
      classGrade: 9,
      stateName: 'Uttar Pradesh',
      totalXP: 100,
      currentLevel: 1,
      currentStreak: 0,
      lessonsCompleted: 0,
    };

    const user2 = {
      id: 's2',
      email: 'user2@school.com',
      fullName: 'User Two',
      role: 'STUDENT' as const,
      schoolName: 'ABC Public School',
      classGrade: 7,
      stateName: 'Maharashtra',
      totalXP: 200,
      currentLevel: 2,
      currentStreak: 1,
      lessonsCompleted: 2,
    };

    dataService.upsertUser(user1);
    dataService.upsertUser(user2);

    expect(dataService.getUserById('s1')?.schoolName).toBe('SFPS');
    expect(dataService.getUserById('s1')?.classGrade).toBe(9);
    expect(dataService.getUserById('s1')?.stateName).toBe('Uttar Pradesh');

    expect(dataService.getUserById('s2')?.schoolName).toBe('ABC Public School');
    expect(dataService.getUserById('s2')?.classGrade).toBe(7);
    expect(dataService.getUserById('s2')?.stateName).toBe('Maharashtra');
  });

  it('validates that all 28 Indian States & 8 Union Territories are present with correct cities', async () => {
    const { INDIAN_STATES, getCitiesForState, INDIAN_STATES_AND_CITIES } = await import('@/data/indiaLocations');

    // 28 States + 8 UTs = 36 total territories
    expect(INDIAN_STATES.length).toBeGreaterThanOrEqual(36);
    expect(INDIAN_STATES).toContain('Uttar Pradesh');
    expect(INDIAN_STATES).toContain('Maharashtra');
    expect(INDIAN_STATES).toContain('Delhi');
    expect(INDIAN_STATES).toContain('Tamil Nadu');
    expect(INDIAN_STATES).toContain('Karnataka');
    expect(INDIAN_STATES).toContain('West Bengal');

    // City cascading
    const upCities = getCitiesForState('Uttar Pradesh');
    expect(upCities).toContain('Ghazipur');
    expect(upCities).toContain('Lucknow');
    expect(upCities).toContain('Varanasi');
    expect(upCities).not.toContain('Mumbai');

    const mhCities = getCitiesForState('Maharashtra');
    expect(mhCities).toContain('Mumbai');
    expect(mhCities).toContain('Pune');
    expect(mhCities).not.toContain('Ghazipur');

    const empty = getCitiesForState('NonExistentState');
    expect(empty).toEqual([]);
  });

  it('validates that student-specific courses directly resolve from authenticated classGrade without intermediate selectors', async () => {
    const { contentService } = await import('@/services/content.service');

    // Student A in Class 9:
    const class9Subjects = await contentService.getSubjectsForClass(9);
    expect(class9Subjects.length).toBeGreaterThan(0);
    const subjectNames9 = class9Subjects.map(s => s.name);
    expect(subjectNames9).toContain('Science');
    expect(subjectNames9).toContain('Mathematics');

    // Student B in Class 7:
    const class7Subjects = await contentService.getSubjectsForClass(7);
    expect(class7Subjects.length).toBeGreaterThan(0);
    const subjectNames7 = class7Subjects.map(s => s.name);
    expect(subjectNames7).toContain('Science');
    expect(subjectNames7).toContain('Mathematics');

    // Chapters for Class 9 Science vs Class 10 Science
    const chaps9 = await contentService.getChapters(9, 'Science');
    const chaps10 = await contentService.getChapters(10, 'Science');
    expect(chaps9.map(c => c.title)).toContain('Matter in Our Surroundings');
    expect(chaps10.map(c => c.title)).toContain('Chemical Reactions and Equations');
    expect(chaps9.map(c => c.title)).not.toContain('Chemical Reactions and Equations');
  });
});
