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
});
