import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '@/services/data.service';

describe('Dynamic Database-Driven Leaderboard Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves real registered student accounts and sorts them by XP descending', () => {
    // Submit quiz for student 20 (Aarav Sharma) -> 500 XP
    dataService.submitQuizResult({
      quizId: 'quiz-c10-math',
      studentId: '20',
      answers: [2, 2, 0, 1, 1],
      timeTakenSeconds: 120,
      completedAt: new Date().toISOString(),
    });

    // Submit quiz for student 21 (Ananya Verma) -> 300 XP
    dataService.submitQuizResult({
      quizId: 'quiz-c10-sci',
      studentId: '21',
      answers: [1, 1, 2, 2, 2],
      timeTakenSeconds: 150,
      completedAt: new Date().toISOString(),
    });

    const leaderboard = dataService.getLeaderboard('alltime');

    expect(leaderboard.length).toBeGreaterThanOrEqual(10);

    // Verify Rank 1 is the highest XP student (Aarav Sharma)
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].userId).toBe('20');
    expect(leaderboard[0].name).toBe('Aarav Sharma');
    expect(leaderboard[0].xp).toBeGreaterThan(0);

    // Verify Rank 2 is Ananya Verma
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].userId).toBe('21');
    expect(leaderboard[1].name).toBe('Ananya Verma');
    expect(leaderboard[0].xp).toBeGreaterThanOrEqual(leaderboard[1].xp);

    // Verify all ranks are strictly descending or equal
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].xp).toBeGreaterThanOrEqual(leaderboard[i + 1].xp);
      expect(leaderboard[i].rank).toBe(i + 1);
    }
  });

  it('contains NO fake/demo users or hardcoded values', () => {
    const leaderboard = dataService.getLeaderboard('alltime');

    // Confirm that the old hardcoded values DO NOT exist
    expect(leaderboard.some((e) => e.xp === 12400)).toBe(false);
    expect(leaderboard.some((e) => e.xp === 11800)).toBe(false);
    expect(leaderboard.some((e) => e.xp === 10500)).toBe(false);
    expect(leaderboard.some((e) => e.name === 'Rahul Kumar')).toBe(false);
    expect(leaderboard.some((e) => e.name === 'Meera Iyer')).toBe(false);
    expect(leaderboard.some((e) => e.name === 'Amit Singh')).toBe(false);
    expect(leaderboard.some((e) => e.name === 'Kavitha Nair')).toBe(false);
  });

  it('correctly calculates weekly and monthly XP based on attempt timestamps', () => {
    // Submit an attempt today
    dataService.submitQuizResult({
      quizId: 'quiz-c10-math',
      studentId: '24',
      answers: [2, 2, 0, 1, 1],
      timeTakenSeconds: 120,
      completedAt: new Date().toISOString(),
    });

    const weekly = dataService.getLeaderboard('weekly');
    const monthly = dataService.getLeaderboard('monthly');
    const alltime = dataService.getLeaderboard('alltime');

    expect(weekly.length).toBe(alltime.length);
    expect(monthly.length).toBe(alltime.length);

    // Weekly XP should be <= Monthly XP <= All Time XP
    weekly.forEach((wEntry) => {
      const mEntry = monthly.find((m) => m.userId === wEntry.userId);
      const aEntry = alltime.find((a) => a.userId === wEntry.userId);

      expect(mEntry).toBeDefined();
      expect(aEntry).toBeDefined();

      expect(wEntry.xp).toBeLessThanOrEqual(mEntry!.xp);
      expect(mEntry!.xp).toBeLessThanOrEqual(aEntry!.xp);
    });
  });

  it('automatically updates rank and XP when a student submits a new quiz', () => {
    const initialLb = dataService.getLeaderboard('alltime');
    const initialStudent = initialLb.find((e) => e.userId === '20');
    const initialXP = initialStudent ? initialStudent.xp : 0;

    dataService.submitQuizResult({
      quizId: 'quiz-c10-eng',
      studentId: '20',
      answers: [0, 1, 2, 0, 1],
      timeTakenSeconds: 120,
      completedAt: new Date().toISOString(),
    });

    const updatedLb = dataService.getLeaderboard('alltime');
    const updatedStudent = updatedLb.find((e) => e.userId === '20');

    expect(updatedStudent).toBeDefined();
    expect(updatedStudent!.xp).toBeGreaterThan(initialXP);
  });

  it('strictly uses users.totalXP as the authoritative source for all-time XP and getStudentMetrics', () => {
    // Verify getStudentMetrics matches user.totalXP
    const student = dataService.getUserById('20');
    expect(student).toBeDefined();

    const metrics = dataService.getStudentMetrics('20');
    expect(metrics.totalXP).toBe(student!.totalXP ?? 0);

    const alltime = dataService.getLeaderboard('alltime');
    const entry = alltime.find((e) => e.userId === '20');
    expect(entry).toBeDefined();
    expect(entry!.xp).toBe(student!.totalXP ?? 0);
    expect(entry!.xp).toBe(metrics.totalXP);
  });

  it('correctly ranks zero-XP students without using attempt fallbacks for all-time', () => {
    const alltime = dataService.getLeaderboard('alltime');
    const zeroXpEntries = alltime.filter((e) => e.xp === 0);

    // If zero-XP students exist, they must be ranked at the bottom
    if (zeroXpEntries.length > 0) {
      const minPositiveXp = Math.min(...alltime.filter((e) => e.xp > 0).map((e) => e.xp));
      zeroXpEntries.forEach((z) => {
        expect(z.xp).toBe(0);
        // Rank of zero-XP student must be lower than any positive-XP student
        if (Number.isFinite(minPositiveXp) && minPositiveXp > 0) {
          const positiveStudent = alltime.find((e) => e.xp === minPositiveXp);
          if (positiveStudent) {
            expect(z.rank).toBeGreaterThan(positiveStudent.rank);
          }
        }
      });
    }
  });
});
