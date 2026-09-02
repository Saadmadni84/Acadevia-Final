import { describe, it, expect, beforeEach } from 'vitest';
import { dataService, calculateStreakFromDates, QuizRecord } from '../../services/data.service';

describe('Real-Life Teacher → Student → Quiz End-to-End Simulation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('executes full 23-phase simulation flow accurately', () => {
    // =========================================================================
    // PHASE 1 — IDENTIFY TEST ACCOUNTS
    // =========================================================================
    const teacher = dataService.getUserById('10');
    expect(teacher).toBeDefined();
    expect(teacher?.role).toBe('TEACHER');
    expect(teacher?.classesTaught).toContain(10);

    const student1 = dataService.getUserById('20');
    expect(student1).toBeDefined();
    expect(student1?.role).toBe('STUDENT');
    expect(student1?.fullName).toBe('Aarav Sharma');
    expect(student1?.classGrade).toBe(10);

    const student2 = dataService.getUserById('21');
    expect(student2).toBeDefined();
    expect(student2?.role).toBe('STUDENT');
    expect(student2?.fullName).toBe('Ananya Verma');

    // =========================================================================
    // PHASE 2 — TEACHER LOGIN & INITIAL METRICS
    // =========================================================================
    const initialTeacherMetrics = dataService.getTeacherMetrics('10');
    const initialTeacherQuizzesCount = initialTeacherMetrics.quizzesCreated;
    const initialTeacherSubmissions = initialTeacherMetrics.totalSubmissions;

    // Verify teacher teaches Mathematics in Class 10
    const teacherClass10Quizzes = dataService.getQuizzesByClassAndSubject(10, 'Mathematics');
    expect(teacherClass10Quizzes.length).toBeGreaterThan(0);

    // =========================================================================
    // PHASE 3 — TEACHER CREATES AND PUBLISHES A REAL QUIZ
    // =========================================================================
    const newQuizData = {
      teacherId: '10',
      teacherName: 'Rahul Verma',
      classGrade: 10,
      subject: 'Mathematics',
      title: 'Class 10 Quadratic Equations & Applications',
      description: 'Assessment on solving quadratic equations by factorization, quadratic formula, and nature of roots.',
      timeLimit: 900,
      difficulty: 'medium' as const,
      questions: [
        {
          id: 'q-quad-1',
          question: 'Find the roots of the quadratic equation x^2 - 5x + 6 = 0.',
          options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'],
          correctIndex: 0,
          explanation: 'Factoring gives (x-2)(x-3) = 0, so roots are x=2 and x=3.',
          points: 10,
          topic: 'Factorization',
        },
        {
          id: 'q-quad-2',
          question: 'What is the discriminant of the quadratic equation 2x^2 - 4x + 3 = 0?',
          options: ['8', '-8', '16', '-16'],
          correctIndex: 1,
          explanation: 'D = b^2 - 4ac = (-4)^2 - 4(2)(3) = 16 - 24 = -8.',
          points: 10,
          topic: 'Discriminant',
        },
        {
          id: 'q-quad-3',
          question: 'If the discriminant D > 0 and is a perfect square, the roots are:',
          options: ['Real, rational and unequal', 'Real, irrational and unequal', 'Real and equal', 'Complex / No real roots'],
          correctIndex: 0,
          explanation: 'When D > 0 and a perfect square, roots are real, distinct and rational.',
          points: 10,
          topic: 'Nature of Roots',
        },
        {
          id: 'q-quad-4',
          question: 'For what value of k will the equation x^2 + 4x + k = 0 have equal roots?',
          options: ['2', '4', '8', '16'],
          correctIndex: 1,
          explanation: 'For equal roots, D = 0 => 16 - 4k = 0 => k = 4.',
          points: 10,
          topic: 'Equal Roots',
        },
        {
          id: 'q-quad-5',
          question: 'Which of the following is NOT a quadratic equation?',
          options: [
            '(x - 2)^2 + 1 = 2x - 3',
            'x(x + 1) + 8 = (x + 2)(x - 2)',
            'x(2x + 3) = x^2 + 1',
            '(x + 2)^3 = x^3 - 4',
          ],
          correctIndex: 1,
          explanation: 'Expanding B gives x^2 + x + 8 = x^2 - 4 => x + 12 = 0, which is linear, not quadratic.',
          points: 10,
          topic: 'Identification',
        },
      ],
    };

    const createdQuiz = dataService.createQuiz(newQuizData);
    expect(createdQuiz.id).toBeDefined();
    expect(createdQuiz.teacherId).toBe('10');
    expect(createdQuiz.classGrade).toBe(10);
    expect(createdQuiz.subject).toBe('Mathematics');
    expect(createdQuiz.questions.length).toBe(5);

    // =========================================================================
    // PHASE 4 — VERIFY STUDENT CAN SEE THE QUIZ
    // =========================================================================
    const student1Quizzes = dataService.getQuizzesForStudent('20');
    const foundQuiz = student1Quizzes.find((q) => q.id === createdQuiz.id);
    expect(foundQuiz).toBeDefined();
    expect(foundQuiz?.title).toBe('Class 10 Quadratic Equations & Applications');

    // Profile BEFORE taking quiz
    const profileBefore = dataService.getStudentMetrics('20');
    expect(profileBefore.quizzesCompleted).toBe(0);
    expect(profileBefore.averageScore).toBe(0);
    expect(profileBefore.totalXP).toBe(0);
    expect(profileBefore.streak).toBe(0);
    expect(profileBefore.studyMinutes).toBe(0);

    // =========================================================================
    // PHASE 5 & 6 — STUDENT TAKES QUIZ WITH REALISTIC RESULT (3/5 = 60%)
    // =========================================================================
    // Question 1: Selected 0 (Correct: 0) -> CORRECT
    // Question 2: Selected 1 (Correct: 1) -> CORRECT
    // Question 3: Selected 1 (Correct: 0) -> WRONG
    // Question 4: Selected 1 (Correct: 1) -> CORRECT
    // Question 5: Selected 0 (Correct: 1) -> WRONG
    const studentAnswers = [0, 1, 1, 1, 0];
    const timeTakenSeconds = 240; // 4 minutes

    const submissionResult = dataService.submitQuizResult({
      quizId: createdQuiz.id,
      studentId: '20',
      answers: studentAnswers,
      timeTakenSeconds,
    });

    expect(submissionResult.studentId).toBe('20');
    expect(submissionResult.quizId).toBe(createdQuiz.id);
    expect(submissionResult.score).toBe(30); // 3 correct * 10 points
    expect(submissionResult.totalPoints).toBe(50);
    expect(submissionResult.percentage).toBe(60); // 30/50 = 60%
    expect(submissionResult.xpEarned).toBe(300); // 30 * 10
    expect(submissionResult.timeTakenSeconds).toBe(240);

    // =========================================================================
    // PHASE 7 — STUDENT PROFILE UPDATE VERIFICATION
    // =========================================================================
    const profileAfter = dataService.getStudentMetrics('20');

    expect(profileAfter.quizzesCompleted).toBe(1);
    expect(profileAfter.averageScore).toBe(60);
    expect(profileAfter.totalXP).toBe(300);
    expect(profileAfter.studyMinutes).toBe(4);
    expect(profileAfter.streak).toBe(1);
    expect(profileAfter.longestStreak).toBe(1);

    // =========================================================================
    // PHASE 8 — XP & GAMIFICATION
    // =========================================================================
    expect(profileAfter.totalXP).toBe(300);
    expect(profileAfter.level).toBe(1); // floor(300 / 500) + 1 = 1

    // =========================================================================
    // PHASE 9 — RECENT MILESTONES
    // =========================================================================
    const studentActivities = dataService.getRecentActivities('20', 'STUDENT');
    expect(studentActivities.length).toBe(1);
    expect(studentActivities[0].type).toBe('QUIZ_COMPLETED');
    expect(studentActivities[0].title).toBe('Completed Quiz: Class 10 Quadratic Equations & Applications');
    expect(studentActivities[0].badgeText).toBe('60% Score');

    // =========================================================================
    // PHASE 10 — SUBJECT PROGRESS
    // =========================================================================
    const mathProgress = profileAfter.subjectProgress.find((s) => s.subject === 'Mathematics');
    expect(mathProgress).toBeDefined();
    expect(mathProgress?.completedLessons).toBe(1);
    expect(mathProgress?.progress).toBeGreaterThan(0);

    // Other subjects remain 0%
    const scienceProgress = profileAfter.subjectProgress.find((s) => s.subject === 'Science');
    expect(scienceProgress?.progress).toBe(0);
    expect(scienceProgress?.completedLessons).toBe(0);

    // =========================================================================
    // PHASE 11 & 12 — STREAK AND LEARNING TIME
    // =========================================================================
    expect(profileAfter.streak).toBe(1);
    expect(profileAfter.studyMinutes).toBe(4);

    // Weekly chart includes the 4 minutes
    const weeklyActivity = dataService.getStudentWeeklyActivity('20');
    const totalWeeklyMinutes = weeklyActivity.reduce((acc, d) => acc + d.minutes, 0);
    expect(totalWeeklyMinutes).toBe(4);

    // =========================================================================
    // PHASE 13 & 14 — TEACHER SEES STUDENT RESULT & TEACHER DASHBOARD
    // =========================================================================
    const teacherResults = dataService.getTeacherQuizResults('10');
    const aaravResult = teacherResults.find(
      (r) => String(r.studentId) === '20' && r.quizId === createdQuiz.id
    );

    expect(aaravResult).toBeDefined();
    expect(aaravResult?.studentName).toBe('Aarav Sharma');
    expect(aaravResult?.score).toBe(30);
    expect(aaravResult?.totalPoints).toBe(50);
    expect(aaravResult?.percentage).toBe(60);

    const updatedTeacherMetrics = dataService.getTeacherMetrics('10');
    expect(updatedTeacherMetrics.quizzesCreated).toBe(initialTeacherQuizzesCount + 1);
    expect(updatedTeacherMetrics.totalSubmissions).toBe(initialTeacherSubmissions + 1);

    // =========================================================================
    // PHASE 16 — REFRESH / PERSISTENCE TEST
    // =========================================================================
    // Simulate full page reload by reloading from localStorage
    const profileAfterReload = dataService.getStudentMetrics('20');
    expect(profileAfterReload.quizzesCompleted).toBe(1);
    expect(profileAfterReload.averageScore).toBe(60);
    expect(profileAfterReload.totalXP).toBe(300);
    expect(profileAfterReload.studyMinutes).toBe(4);
    expect(profileAfterReload.streak).toBe(1);

    // =========================================================================
    // PHASE 17 — SECOND STUDENT ISOLATION TEST (STUDENT 21 ANANYA VERMA)
    // =========================================================================
    const student2Profile = dataService.getStudentMetrics('21');
    expect(student2Profile.quizzesCompleted).toBe(0);
    expect(student2Profile.averageScore).toBe(0);
    expect(student2Profile.totalXP).toBe(0);
    expect(student2Profile.level).toBe(1);
    expect(student2Profile.streak).toBe(0);
    expect(student2Profile.studyMinutes).toBe(0);
    expect(student2Profile.badgesEarned).toBe(0);

    const student2Activities = dataService.getRecentActivities('21', 'STUDENT');
    expect(student2Activities.length).toBe(0);

    // =========================================================================
    // PHASE 19 & 20 — TEST MULTIPLE QUIZZES & DYNAMIC SCORE CALCULATION
    // =========================================================================
    // Student 20 takes a second quiz: Quiz 101 (Mathematics)
    // 5 questions: 4 correct, 1 wrong => 40/50 = 80%
    const quiz2 = dataService.getQuizById('quiz-c10-math') || dataService.getQuizzesByClassAndSubject(10, 'Mathematics')[1];
    expect(quiz2).toBeDefined();

    const quiz2Answers = quiz2!.questions.map((q, idx) => (idx === 4 ? (q.correctIndex + 1) % 4 : q.correctIndex)); // 4 correct, 1 wrong

    const submission2 = dataService.submitQuizResult({
      quizId: quiz2!.id,
      studentId: '20',
      answers: quiz2Answers,
      timeTakenSeconds: 180, // 3 minutes
    });

    expect(submission2.percentage).toBe(80);
    expect(submission2.xpEarned).toBe(400);

    // Now Aarav has completed 2 quizzes: 60% and 80%
    // Average score MUST BE: (60 + 80) / 2 = 70%
    const profileAfterQuiz2 = dataService.getStudentMetrics('20');
    expect(profileAfterQuiz2.quizzesCompleted).toBe(2);
    expect(profileAfterQuiz2.averageScore).toBe(70);
    expect(profileAfterQuiz2.totalXP).toBe(700); // 300 + 400
    expect(profileAfterQuiz2.level).toBe(2); // floor(700 / 500) + 1 = 2
    expect(profileAfterQuiz2.studyMinutes).toBe(7); // 4 + 3

    // =========================================================================
    // PHASE 21 — PROFILE FREE OF FAKE DATA
    // =========================================================================
    expect(profileAfterQuiz2.quizzesCompleted).not.toBe(12);
    expect(profileAfterQuiz2.averageScore).not.toBe(85);
    expect(profileAfterQuiz2.studyMinutes).not.toBe(1110); // Not 18h 30m
  });
});
