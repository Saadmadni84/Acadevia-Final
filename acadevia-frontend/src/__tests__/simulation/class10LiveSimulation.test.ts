import { describe, it, expect, beforeEach } from 'vitest';
import { executeClass10Simulation, CLASS_10_QUIZZES, CLASS_10_SIMULATION_PLANS } from '../../services/class10Simulation.service';
import { dataService } from '../../services/data.service';

describe('Real-Life Class 10 Quiz Simulation (10 Students, 6 Subjects, 100% Data-Driven)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies Class 10 test accounts (10 students, 6 teachers, 6 quizzes)', () => {
    // 1. All 10 Class 10 students exist
    const studentIds = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'];
    studentIds.forEach((id) => {
      const student = dataService.getUserById(id);
      expect(student).toBeDefined();
      expect(student?.role).toBe('STUDENT');
      expect(student?.classGrade).toBe(10);
    });

    // 2. All 6 teachers and subjects exist
    const teachers = [
      { id: '10', name: 'Rahul Verma', subject: 'Mathematics' },
      { id: '11', name: 'Neha Gupta', subject: 'Science' },
      { id: '12', name: 'Amit Sharma', subject: 'English' },
      { id: '13', name: 'Sunita Mishra', subject: 'Hindi' },
      { id: '14', name: 'Vikram Singh', subject: 'Social Science' },
      { id: '15', name: 'Pooja Patel', subject: 'Computer Science' },
    ];
    teachers.forEach((t) => {
      const teacher = dataService.getUserById(t.id);
      expect(teacher).toBeDefined();
      expect(teacher?.role).toBe('TEACHER');
      expect(teacher?.subject).toBe(t.subject);
    });

    // 3. 6 Class 10 quizzes exist
    expect(CLASS_10_QUIZZES.length).toBe(6);
    CLASS_10_QUIZZES.forEach((q) => {
      const quiz = dataService.getQuizById(q.id);
      expect(quiz).toBeDefined();
      expect(quiz?.classGrade).toBe(10);
      expect(quiz?.subject).toBe(q.subject);
    });
  });

  it('runs complete real-life simulation and records 60 realistic attempts', () => {
    const summary = executeClass10Simulation();

    // 10 students * 6 quizzes = 60 submissions
    expect(summary.totalStudents).toBe(10);
    expect(summary.totalQuizzes).toBe(6);
    expect(summary.totalSubmissions).toBe(60);

    // Completion rate is 100%
    expect(summary.completionRate).toBe(100);

    // Different student performance profiles
    expect(summary.topPerformers.length).toBeGreaterThan(0);
    expect(summary.atRiskStudents.length).toBeGreaterThan(0);

    // Aarav Sharma is top performer
    const aarav = summary.topPerformers.find((s) => s.id === '20');
    expect(aarav).toBeDefined();
    expect(aarav?.avgScore).toBeGreaterThanOrEqual(90);

    // Priya Singh, Siddharth Joshi, and Riya Sen are at-risk (<50%)
    const atRiskIds = summary.atRiskStudents.map((s) => s.id);
    expect(atRiskIds).toContain('23'); // Priya Singh
    expect(atRiskIds).toContain('28'); // Siddharth Joshi
    expect(atRiskIds).toContain('29'); // Riya Sen

    // Subject averages are computed
    expect(summary.subjectAverages['Mathematics']).toBeGreaterThan(0);
    expect(summary.subjectAverages['Science']).toBeGreaterThan(0);
    expect(summary.subjectAverages['English']).toBeGreaterThan(0);
    expect(summary.subjectAverages['Hindi']).toBeGreaterThan(0);
    expect(summary.subjectAverages['Social Science']).toBeGreaterThan(0);
    expect(summary.subjectAverages['Computer Science']).toBeGreaterThan(0);
  });

  it('generates real XP and calculates streaks from dates without hardcoding', () => {
    executeClass10Simulation();

    const student20 = dataService.getUserById('20');
    expect(student20).toBeDefined();
    expect(student20?.totalXP).toBeGreaterThan(1000);
    expect(student20?.currentLevel).toBeGreaterThan(1);
    expect(student20?.currentStreak).toBeGreaterThan(0);
    expect(student20?.studyMinutes).toBeGreaterThan(0);
    expect(student20?.lessonsCompleted).toBe(6); // 6 quizzes submitted

    // Check student quiz results in dataService
    const student20Results = dataService.getStudentQuizResults('20');
    expect(student20Results.length).toBe(6);
  });

  it('updates Teacher Analytics dynamically with real completion rate and scores', () => {
    executeClass10Simulation();

    // Teacher Rahul Verma (Mathematics)
    const mathAnalytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 10 });
    expect(mathAnalytics.totalStudents).toBe(10);

    // All 10 students took the Math quiz
    const mathQuizScore = mathAnalytics.quizScores.find((q) => q.id === 'quiz-c10-math');
    expect(mathQuizScore).toBeDefined();
    expect(mathQuizScore?.attempts).toBe(10);
    expect(mathQuizScore?.avg).toBeGreaterThan(50);

    // Completion rate is 100%
    const completedEntry = mathAnalytics.completionData.find((c) => c.name === 'Completed');
    expect(completedEntry?.value).toBe(100);
    expect(completedEntry?.count).toBe(10);

    // Top performers and at-risk students are reflected in teacher analytics
    expect(mathAnalytics.topPerformers.length).toBeGreaterThan(0);
    expect(mathAnalytics.atRiskStudents.length).toBeGreaterThan(0);

    // Engagement trend reflects real counts
    const totalTrendActivity = mathAnalytics.engagementTrend.reduce((acc, d) => acc + d.engagement, 0);
    expect(totalTrendActivity).toBe(10); // 10 Math submissions
  });

  it('is completely idempotent: re-running does not create duplicate attempts', () => {
    // Run 1
    const run1 = executeClass10Simulation();
    expect(run1.totalSubmissions).toBe(60);

    const initialResultsCount = dataService.getStudentQuizResults('20').length;
    expect(initialResultsCount).toBe(6);

    // Run 2
    const run2 = executeClass10Simulation();
    expect(run2.totalSubmissions).toBe(60);

    const afterSecondRunCount = dataService.getStudentQuizResults('20').length;
    expect(afterSecondRunCount).toBe(6); // Exactly 6, NO duplicates!
  });
});
