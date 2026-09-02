/**
 * Class 10 Simulation Data & Blueprint
 *
 * Defines the real 6 curriculum subject quizzes and realistic student response patterns
 * for all 10 Class 10 students. Produces exact records matching acadevia_quiz_db.
 */

export interface SimulationQuizDef {
  id: string;
  mysqlId: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  title: string;
  totalPoints: number;
  correctAnswers: number[];
}

export const CLASS_10_QUIZ_DEFS: SimulationQuizDef[] = [
  {
    id: 'quiz-c10-math',
    mysqlId: 101,
    subject: 'Mathematics',
    teacherId: '10',
    teacherName: 'Rahul Verma',
    title: 'Class 10 Real Numbers & Polynomials Practice',
    totalPoints: 50,
    correctAnswers: [2, 2, 0, 1, 1],
  },
  {
    id: 'quiz-c10-sci',
    mysqlId: 102,
    subject: 'Science',
    teacherId: '11',
    teacherName: 'Neha Gupta',
    title: 'Class 10 Chemical Reactions & Life Processes',
    totalPoints: 50,
    correctAnswers: [1, 1, 2, 2, 2],
  },
  {
    id: 'quiz-c10-eng',
    mysqlId: 103,
    subject: 'English',
    teacherId: '12',
    teacherName: 'Amit Sharma',
    title: 'Class 10 First Flight & Grammar Essentials',
    totalPoints: 50,
    correctAnswers: [1, 1, 1, 1, 0],
  },
  {
    id: 'quiz-c10-hin',
    mysqlId: 104,
    subject: 'Hindi',
    teacherId: '13',
    teacherName: 'Sunita Mishra',
    title: 'Class 10 स्पर्श एवं व्याकरण: साखी एवं पद',
    totalPoints: 50,
    correctAnswers: [0, 1, 2, 0, 2],
  },
  {
    id: 'quiz-c10-soc',
    mysqlId: 105,
    subject: 'Social Science',
    teacherId: '14',
    teacherName: 'Vikram Singh',
    title: 'Class 10 The Rise of Nationalism & Federalism',
    totalPoints: 50,
    correctAnswers: [1, 0, 1, 2, 2],
  },
  {
    id: 'quiz-c10-cs',
    mysqlId: 106,
    subject: 'Computer Science',
    teacherId: '15',
    teacherName: 'Pooja Patel',
    title: 'Class 10 Python Fundamentals & Cyber Ethics',
    totalPoints: 50,
    correctAnswers: [2, 1, 2, 0, 0],
  },
];

export interface StudentProfileBlueprint {
  studentId: string;
  name: string;
  tier: 'TOP' | 'AVERAGE' | 'AT_RISK';
  submissions: {
    quizId: string;
    answers: number[];
    timeTakenSeconds: number;
    daysAgo: number;
  }[];
}

export const CLASS_10_STUDENT_BLUEPRINTS: StudentProfileBlueprint[] = [
  // 1. Aarav Sharma (Top Performer: Math 100%, Sci 100%, Eng 100%, Hin 80%, Soc 100%, CS 100% -> Avg 97%)
  {
    studentId: '20',
    name: 'Aarav Sharma',
    tier: 'TOP',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 2, 0, 1, 1], timeTakenSeconds: 140, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 1, 2, 2, 2], timeTakenSeconds: 155, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 120, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 1, 2, 0, 3], timeTakenSeconds: 130, daysAgo: 3 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 1, 2, 2], timeTakenSeconds: 145, daysAgo: 0 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 2, 0, 0], timeTakenSeconds: 110, daysAgo: 1 },
    ],
  },
  // 2. Ananya Verma (Top Performer: Math 80%, Sci 80%, Eng 100%, Hin 100%, Soc 100%, CS 80% -> Avg 90%)
  {
    studentId: '21',
    name: 'Ananya Verma',
    tier: 'TOP',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 2, 0, 3, 1], timeTakenSeconds: 160, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 1, 2, 2, 0], timeTakenSeconds: 170, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 130, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 1, 2, 0, 2], timeTakenSeconds: 140, daysAgo: 3 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 1, 2, 2], timeTakenSeconds: 150, daysAgo: 0 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 2, 0, 1], timeTakenSeconds: 125, daysAgo: 1 },
    ],
  },
  // 3. Arjun Patel (Top Performer: Math 80%, Sci 100%, Eng 80%, Hin 80%, Soc 80%, CS 100% -> Avg 87%)
  {
    studentId: '24',
    name: 'Arjun Patel',
    tier: 'TOP',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 2, 0, 1, 0], timeTakenSeconds: 175, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 1, 2, 2, 2], timeTakenSeconds: 160, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 0, 1, 1, 0], timeTakenSeconds: 145, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 1, 2, 3, 2], timeTakenSeconds: 150, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 0, 2, 2], timeTakenSeconds: 165, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 2, 0, 0], timeTakenSeconds: 115, daysAgo: 2 },
    ],
  },
  // 4. Kavya Gupta (Top Performer: Math 80%, Sci 80%, Eng 100%, Hin 100%, Soc 80%, CS 80% -> Avg 87%)
  {
    studentId: '25',
    name: 'Kavya Gupta',
    tier: 'TOP',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 0, 0, 1, 1], timeTakenSeconds: 165, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 1, 0, 2, 2], timeTakenSeconds: 155, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 135, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 1, 2, 0, 2], timeTakenSeconds: 140, daysAgo: 3 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 1, 2, 0], timeTakenSeconds: 150, daysAgo: 0 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 0, 0, 0], timeTakenSeconds: 130, daysAgo: 1 },
    ],
  },
  // 5. Aditya Kumar (Above Average: Math 80%, Sci 60%, Eng 80%, Hin 80%, Soc 80%, CS 100% -> Avg 80%)
  {
    studentId: '26',
    name: 'Aditya Kumar',
    tier: 'TOP',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 2, 0, 0, 1], timeTakenSeconds: 180, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 0, 2, 2, 0], timeTakenSeconds: 190, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 1, 0, 1, 0], timeTakenSeconds: 140, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 1, 0, 0, 2], timeTakenSeconds: 160, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 1, 0, 2], timeTakenSeconds: 170, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 2, 0, 0], timeTakenSeconds: 120, daysAgo: 2 },
    ],
  },
  // 6. Rohan Mehta (Consistent Average: Math 60%, Sci 60%, Eng 80%, Hin 60%, Soc 60%, CS 60% -> Avg 63%)
  {
    studentId: '22',
    name: 'Rohan Mehta',
    tier: 'AVERAGE',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 1, 0, 1, 0], timeTakenSeconds: 200, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 1, 0, 2, 0], timeTakenSeconds: 210, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 1, 1, 0, 0], timeTakenSeconds: 170, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 0, 2, 0, 1], timeTakenSeconds: 185, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 1, 0, 0], timeTakenSeconds: 195, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 0, 0, 1], timeTakenSeconds: 160, daysAgo: 2 },
    ],
  },
  // 7. Ishita Sharma (Average: Math 60%, Sci 40%, Eng 100%, Hin 80%, Soc 60%, CS 40% -> Avg 63%)
  {
    studentId: '27',
    name: 'Ishita Sharma',
    tier: 'AVERAGE',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 0, 0, 0, 1], timeTakenSeconds: 210, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 0, 2, 0, 0], timeTakenSeconds: 220, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 140, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 1, 2, 0, 0], timeTakenSeconds: 160, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [1, 0, 0, 2, 0], timeTakenSeconds: 180, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [2, 0, 0, 0, 0], timeTakenSeconds: 175, daysAgo: 2 },
    ],
  },
  // 8. Priya Singh (At-Risk: Math 40%, Sci 40%, Eng 40%, Hin 20%, Soc 40%, CS 20% -> Avg 33%)
  {
    studentId: '23',
    name: 'Priya Singh',
    tier: 'AT_RISK',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [0, 2, 0, 0, 0], timeTakenSeconds: 240, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [1, 0, 0, 2, 0], timeTakenSeconds: 250, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [0, 1, 1, 0, 0], timeTakenSeconds: 210, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 0, 0, 0, 1], timeTakenSeconds: 220, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [0, 0, 1, 2, 0], timeTakenSeconds: 230, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [2, 0, 1, 1, 1], timeTakenSeconds: 200, daysAgo: 2 },
    ],
  },
  // 9. Siddharth Joshi (At-Risk: Math 20%, Sci 40%, Eng 40%, Hin 40%, Soc 20%, CS 40% -> Avg 33%)
  {
    studentId: '28',
    name: 'Siddharth Joshi',
    tier: 'AT_RISK',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [2, 0, 1, 0, 0], timeTakenSeconds: 260, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [0, 1, 0, 0, 2], timeTakenSeconds: 270, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [1, 0, 0, 1, 1], timeTakenSeconds: 240, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 0, 0, 0, 2], timeTakenSeconds: 250, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [0, 0, 0, 2, 0], timeTakenSeconds: 260, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [2, 1, 0, 1, 1], timeTakenSeconds: 230, daysAgo: 2 },
    ],
  },
  // 10. Riya Sen (At-Risk: Math 20%, Sci 20%, Eng 20%, Hin 40%, Soc 20%, CS 20% -> Avg 23%)
  {
    studentId: '29',
    name: 'Riya Sen',
    tier: 'AT_RISK',
    submissions: [
      { quizId: 'quiz-c10-math', answers: [0, 0, 0, 1, 0], timeTakenSeconds: 280, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', answers: [0, 0, 2, 0, 0], timeTakenSeconds: 290, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', answers: [0, 1, 0, 0, 0], timeTakenSeconds: 250, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', answers: [0, 0, 2, 1, 0], timeTakenSeconds: 260, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', answers: [0, 0, 0, 0, 2], timeTakenSeconds: 270, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', answers: [0, 1, 0, 0, 1], timeTakenSeconds: 240, daysAgo: 2 },
    ],
  },
];

export interface GeneratedQuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  classGrade: number;
  subject: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: number[];
  completedAt: string;
  xpEarned: number;
  timeTakenSeconds: number;
}

/**
 * Generates the full set of 60 simulation results
 */
export function buildClass10SimulationResults(): GeneratedQuizResult[] {
  const quizMap = new Map(CLASS_10_QUIZ_DEFS.map((q) => [q.id, q]));
  const results: GeneratedQuizResult[] = [];
  const baseDate = new Date('2026-09-02T12:00:00.000Z');

  for (const student of CLASS_10_STUDENT_BLUEPRINTS) {
    for (const sub of student.submissions) {
      const quiz = quizMap.get(sub.quizId);
      if (!quiz) continue;

      let score = 0;
      quiz.correctAnswers.forEach((ans, idx) => {
        if (sub.answers[idx] === ans) {
          score += 10;
        }
      });

      const percentage = Math.round((score / quiz.totalPoints) * 100);
      const xpEarned = Math.max(score * 10, 50);
      const completedDate = new Date(baseDate.getTime() - sub.daysAgo * 86400000);

      results.push({
        id: `res-sim-${quiz.mysqlId}-${student.studentId}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentId: student.studentId,
        studentName: student.name,
        teacherId: quiz.teacherId,
        classGrade: 10,
        subject: quiz.subject,
        score,
        totalPoints: quiz.totalPoints,
        percentage,
        answers: sub.answers,
        completedAt: completedDate.toISOString(),
        xpEarned,
        timeTakenSeconds: sub.timeTakenSeconds,
      });
    }
  }

  return results;
}

export const GENERATED_CLASS_10_RESULTS = buildClass10SimulationResults();
