import { describe, it, expect, beforeEach } from 'vitest';
import { dataService, calculateStreakFromDates } from '../../services/data.service';

describe('Student Metrics & Statistics (Data-Driven System)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies that a fresh student starts with zero fake statistics', () => {
    // Student 20 (Aarav Sharma)
    const metrics = dataService.getStudentMetrics('20');

    expect(metrics.quizzesCompleted).toBe(0);
    expect(metrics.averageScore).toBe(0);
    expect(metrics.totalXP).toBe(0);
    expect(metrics.level).toBe(1);
    expect(metrics.streak).toBe(0);
    expect(metrics.longestStreak).toBe(0);
    expect(metrics.studyMinutes).toBe(0);
    expect(metrics.hoursLearned).toBe(0);
    expect(metrics.lessonsCompleted).toBe(0);
    expect(metrics.coursesCompleted).toBe(0);
    expect(metrics.badgesEarned).toBe(0);
    expect(metrics.perfectQuizzesCount).toBe(0);
    expect(metrics.overallProgress).toBe(0);

    // Verify all enrolled subjects start at 0%
    expect(metrics.subjectProgress.length).toBeGreaterThanOrEqual(6);
    metrics.subjectProgress.forEach((sub) => {
      expect(sub.progress).toBe(0);
      expect(sub.completedLessons).toBe(0);
    });

    // Verify weekly activity has 0 minutes across all days
    const weekly = dataService.getStudentWeeklyActivity('20');
    expect(weekly.length).toBe(7);
    weekly.forEach((day) => {
      expect(day.minutes).toBe(0);
    });

    // Verify recent activities is empty
    const activities = dataService.getRecentActivities('20', 'STUDENT');
    expect(activities.length).toBe(0);
  });

  it('verifies available quizzes do not count as taken quizzes', () => {
    const available = dataService.getQuizzesForStudent('20');
    const taken = dataService.getStudentQuizResults('20');

    expect(available.length).toBeGreaterThanOrEqual(6);
    expect(taken.length).toBe(0);
  });

  it('updates metrics dynamically when a quiz is submitted and maintains strict student isolation', () => {
    // Student 20 takes the Class 10 Math quiz
    const quiz = dataService.getQuizzesByClassAndSubject(10, 'Mathematics')[0];
    expect(quiz).toBeDefined();

    // All correct answers
    const correctAnswers = quiz.questions.map((q) => q.correctIndex);
    const result = dataService.submitQuizResult({
      quizId: quiz.id,
      studentId: '20',
      answers: correctAnswers,
      timeTakenSeconds: 180, // 3 minutes
    });

    expect(result.score).toBe(quiz.questions.reduce((sum, q) => sum + q.points, 0));
    expect(result.percentage).toBe(100);

    // Check Student 20 metrics after quiz
    const student20Metrics = dataService.getStudentMetrics('20');
    expect(student20Metrics.quizzesCompleted).toBe(1);
    expect(student20Metrics.averageScore).toBe(100);
    expect(student20Metrics.totalXP).toBeGreaterThan(0);
    expect(student20Metrics.studyMinutes).toBe(3);
    expect(student20Metrics.streak).toBe(1);
    expect(student20Metrics.badgesEarned).toBe(1); // Earned "First Lesson"

    // Verify Mathematics progress reflects 1 completed out of 3 available (33%), but others remain 0%
    const mathSub = student20Metrics.subjectProgress.find((s) => s.subject === 'Mathematics');
    expect(mathSub?.lessonsCount).toBe(3);
    expect(mathSub?.completedLessons).toBe(1);
    expect(mathSub?.progress).toBe(33);

    const scienceSub = student20Metrics.subjectProgress.find((s) => s.subject === 'Science');
    expect(scienceSub?.progress).toBe(0);
    expect(scienceSub?.completedLessons).toBe(0);

    // Verify Student 21 (Ananya Verma) remains untouched
    const student21Metrics = dataService.getStudentMetrics('21');
    expect(student21Metrics.quizzesCompleted).toBe(0);
    expect(student21Metrics.averageScore).toBe(0);
    expect(student21Metrics.totalXP).toBe(0);
    expect(student21Metrics.streak).toBe(0);
    expect(student21Metrics.badgesEarned).toBe(0);
  });

  it('correctly calculates consecutive days streak and inactive days', () => {
    // 0 dates
    expect(calculateStreakFromDates([])).toEqual({ currentStreak: 0, longestStreak: 0 });

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    // Activity today
    expect(calculateStreakFromDates([todayStr])).toEqual({ currentStreak: 1, longestStreak: 1 });

    // Activity yesterday and today = 2 day streak
    expect(calculateStreakFromDates([todayStr, yesterdayStr])).toEqual({ currentStreak: 2, longestStreak: 2 });

    // Activity 2 days ago, yesterday, and today = 3 day streak
    expect(calculateStreakFromDates([todayStr, yesterdayStr, twoDaysAgoStr])).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });

    // Activity only 5 days ago = 0 current streak
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0];
    expect(calculateStreakFromDates([fiveDaysAgoStr])).toEqual({ currentStreak: 0, longestStreak: 1 });
  });
});