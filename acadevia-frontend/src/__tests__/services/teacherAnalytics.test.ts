import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '../../services/data.service';

describe('Teacher Class Analytics (100% Data-Driven & Persistent)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides clean zero/empty analytics for a fresh class with no submissions', () => {
    // Teacher Rahul Verma (ID: 10, Mathematics teacher, Class 10)
    const analytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 10 });

    expect(analytics.classGrade).toBe(10);
    expect(analytics.totalStudents).toBe(10); // 10 Class 10 students

    // Completion rate for fresh class: 0% completed, 100% not started
    const completedEntry = analytics.completionData.find((c) => c.name === 'Completed');
    const notStartedEntry = analytics.completionData.find((c) => c.name === 'Not Started');
    expect(completedEntry?.value).toBe(0);
    expect(completedEntry?.count).toBe(0);
    expect(notStartedEntry?.value).toBe(100);
    expect(notStartedEntry?.count).toBe(10);

    // Engagement trend: all 30 days have 0 engagement (no fake numbers)
    expect(analytics.engagementTrend.length).toBe(30);
    analytics.engagementTrend.forEach((day) => {
      expect(day.engagement).toBe(0);
    });

    // Top performers & at-risk should be empty
    expect(analytics.topPerformers.length).toBe(0);
    expect(analytics.atRiskStudents.length).toBe(0);

    // Subject-wise comparison: all subjects must be 0% with 0 submissions (NO fake 67% or 27%)
    analytics.subjectComparison.forEach((sub) => {
      expect(sub.score).toBe(0);
      expect(sub.submissions).toBe(0);
    });

    // Quiz scores have 0 average if not attempted
    analytics.quizScores.forEach((q) => {
      expect(q.avg).toBe(0);
      expect(q.attempts).toBe(0);
    });
  });

  it('updates analytics dynamically when student submits a quiz and reflects exact scores', () => {
    // 1. Teacher creates a quiz
    const quiz = dataService.createQuiz({
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Mathematics',
      title: 'Quadratic Equations Assessment',
      description: 'Class 10 Math Test',
      timeLimit: 600,
      difficulty: 'medium',
      questions: [
        { id: 'q1', question: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0, points: 10 },
        { id: 'q2', question: 'Q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1, points: 10 },
        { id: 'q3', question: 'Q3', options: ['A', 'B', 'C', 'D'], correctIndex: 2, points: 10 },
        { id: 'q4', question: 'Q4', options: ['A', 'B', 'C', 'D'], correctIndex: 3, points: 10 },
        { id: 'q5', question: 'Q5', options: ['A', 'B', 'C', 'D'], correctIndex: 0, points: 10 },
      ],
    });

    // 2. Student Aarav Sharma submits: 3 correct, 2 wrong -> 60%
    dataService.submitQuizResult({
      quizId: quiz.id,
      studentId: '20',
      answers: [0, 1, 2, 0, 1], // Q1, Q2, Q3 correct (30/50 = 60%)
      timeTakenSeconds: 200,
    });

    // 3. Query teacher analytics
    const analytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 10 });

    // Average Score for this quiz must be exactly 60%
    const quizScoreItem = analytics.quizScores.find((q) => q.id === quiz.id);
    expect(quizScoreItem).toBeDefined();
    expect(quizScoreItem?.avg).toBe(60);
    expect(quizScoreItem?.attempts).toBe(1);

    // Completion Rate: 1 of 10 students completed = 10%
    const completed = analytics.completionData.find((c) => c.name === 'Completed');
    expect(completed?.value).toBe(10);
    expect(completed?.count).toBe(1);

    const notStarted = analytics.completionData.find((c) => c.name === 'Not Started');
    expect(notStarted?.value).toBe(90);
    expect(notStarted?.count).toBe(9);

    // Top Performers: Aarav Sharma with 60% and 300 XP
    expect(analytics.topPerformers.length).toBe(1);
    expect(analytics.topPerformers[0].name).toBe('Aarav Sharma');
    expect(analytics.topPerformers[0].score).toBe(60);
    expect(analytics.topPerformers[0].xp).toBe(300);

    // Engagement Trend: Today has 1 submission, other days have 0
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTrend = analytics.engagementTrend.find((d) => d.date === todayStr);
    expect(todayTrend?.engagement).toBe(1);

    const otherDays = analytics.engagementTrend.filter((d) => d.date !== todayStr);
    otherDays.forEach((d) => {
      expect(d.engagement).toBe(0);
    });
  });

  it('dynamically recalculates average score when multiple students submit', () => {
    const quiz = dataService.createQuiz({
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Mathematics',
      title: 'Polynomials Test',
      description: 'Polynomials chapter test',
      timeLimit: 600,
      difficulty: 'medium',
      questions: [
        { id: 'q1', question: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0, points: 10 },
        { id: 'q2', question: 'Q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1, points: 10 },
      ],
    });

    // Student 20 (Aarav): 2/2 = 100%
    dataService.submitQuizResult({
      quizId: quiz.id,
      studentId: '20',
      answers: [0, 1],
    });

    // Student 21 (Ananya): 1/2 = 50%
    dataService.submitQuizResult({
      quizId: quiz.id,
      studentId: '21',
      answers: [0, 0],
    });

    const analytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 10 });
    const quizScoreItem = analytics.quizScores.find((q) => q.id === quiz.id);

    // Expected average: (100 + 50) / 2 = 75%
    expect(quizScoreItem?.attempts).toBe(2);
    expect(quizScoreItem?.avg).toBe(75);

    // Completion rate: 2 of 10 students = 20%
    const completed = analytics.completionData.find((c) => c.name === 'Completed');
    expect(completed?.value).toBe(20);
    expect(completed?.count).toBe(2);
  });

  it('updates Science when Science quiz is submitted and classifies students below 50% as at-risk', () => {
    // 1. Science teacher creates quiz
    const sciQuiz = dataService.createQuiz({
      teacherId: '11',
      teacherName: 'Dr. Vikram Malhotra',
      classGrade: 10,
      subject: 'Science',
      title: 'Science Mechanics Test',
      description: 'Physics and Chemistry',
      timeLimit: 600,
      difficulty: 'medium',
      questions: [
        { id: 'sq1', question: 'SQ1', options: ['A', 'B', 'C', 'D'], correctIndex: 0, points: 10 },
        { id: 'sq2', question: 'SQ2', options: ['A', 'B', 'C', 'D'], correctIndex: 1, points: 10 },
      ],
    });

    // Student 22 scores 1 out of 2 (50%)
    dataService.submitQuizResult({
      quizId: sciQuiz.id,
      studentId: '22',
      answers: [0, 0], // 1 correct, 1 wrong = 50%
    });

    // Student 23 scores 0 out of 2 (0% -> below 50% passing threshold -> classified as at-risk)
    dataService.submitQuizResult({
      quizId: sciQuiz.id,
      studentId: '23',
      answers: [1, 0], // 0 correct = 0%
    });

    const sciAnalytics = dataService.getClassAnalytics({ teacherId: '11', classGrade: 10 });
    const sciSub = sciAnalytics.subjectComparison.find((s) => s.subject === 'Science');
    // Average: (50 + 0) / 2 = 25%
    expect(sciSub?.score).toBe(25);
    expect(sciSub?.submissions).toBe(2);

    // Student 23 should appear in atRiskStudents with 0%
    expect(sciAnalytics.atRiskStudents.length).toBe(1);
    expect(sciAnalytics.atRiskStudents[0].id).toBe('23');
    expect(sciAnalytics.atRiskStudents[0].score).toBe(0);

    // Other subjects for Science teacher remain 0% with 0 submissions
    const nonSciSubs = sciAnalytics.subjectComparison.filter((s) => s.subject !== 'Science');
    nonSciSubs.forEach((s) => {
      expect(s.score).toBe(0);
      expect(s.submissions).toBe(0);
    });
  });

  it('respects class filtering and isolates Class 10 from other classes', () => {
    // Class 10 has 10 students, Class 9 has 0 demo students
    const class10Analytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 10 });
    expect(class10Analytics.totalStudents).toBe(10);

    const class9Analytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 9 });
    expect(class9Analytics.totalStudents).toBe(0);
    expect(class9Analytics.quizScores.length).toBe(0);
    expect(class9Analytics.topPerformers.length).toBe(0);
  });
});
