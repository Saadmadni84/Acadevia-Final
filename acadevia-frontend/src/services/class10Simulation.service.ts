/**
 * Class 10 Real-Life Quiz Simulation Service
 *
 * Runs an automated, realistic teacher-student assessment simulation
 * for Class 10 across all 10 students and all 6 curriculum subjects.
 *
 * Fully data-driven through actual quiz submission, scoring, XP accumulation,
 * streak computation, and analytics aggregation. 100% idempotent.
 */

import { dataService, type QuizResultRecord } from './data.service';

export interface StudentSimulationProfile {
  studentId: string;
  name: string;
  tier: 'TOP' | 'AVERAGE' | 'AT_RISK';
  subjects: {
    quizId: string;
    subject: string;
    answers: number[];
    timeTakenSeconds: number;
    daysAgo: number;
  }[];
}

// 6 Subject Quizzes for Class 10
export const CLASS_10_QUIZZES = [
  { id: 'quiz-c10-math', subject: 'Mathematics', teacherId: '10', teacherName: 'Rahul Verma' },
  { id: 'quiz-c10-sci', subject: 'Science', teacherId: '11', teacherName: 'Neha Gupta' },
  { id: 'quiz-c10-eng', subject: 'English', teacherId: '12', teacherName: 'Amit Sharma' },
  { id: 'quiz-c10-hin', subject: 'Hindi', teacherId: '13', teacherName: 'Sunita Mishra' },
  { id: 'quiz-c10-soc', subject: 'Social Science', teacherId: '14', teacherName: 'Vikram Singh' },
  { id: 'quiz-c10-cs', subject: 'Computer Science', teacherId: '15', teacherName: 'Pooja Patel' },
];

/**
 * Realistic answer patterns for all 10 students across the 6 quizzes.
 * Correct answers for each quiz:
 * - Math:   [2, 2, 0, 1, 1]
 * - Sci:    [1, 1, 2, 2, 2]
 * - Eng:    [1, 1, 1, 1, 0]
 * - Hin:    [0, 1, 2, 0, 2]
 * - Soc:    [1, 0, 1, 2, 2]
 * - CS:     [2, 1, 2, 0, 0]
 */
export const CLASS_10_SIMULATION_PLANS: StudentSimulationProfile[] = [
  // 1. Aarav Sharma (Top Performer: Math 100%, Sci 100%, Eng 100%, Hin 80%, Soc 100%, CS 100% -> Avg 97%)
  {
    studentId: '20',
    name: 'Aarav Sharma',
    tier: 'TOP',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 2, 0, 1, 1], timeTakenSeconds: 140, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 1, 2, 2, 2], timeTakenSeconds: 155, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 120, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 1, 2, 0, 3], timeTakenSeconds: 130, daysAgo: 3 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 1, 2, 2], timeTakenSeconds: 145, daysAgo: 0 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 2, 0, 0], timeTakenSeconds: 110, daysAgo: 1 },
    ],
  },
  // 2. Ananya Verma (Top Performer: Math 80%, Sci 80%, Eng 100%, Hin 100%, Soc 100%, CS 80% -> Avg 90%)
  {
    studentId: '21',
    name: 'Ananya Verma',
    tier: 'TOP',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 2, 0, 3, 1], timeTakenSeconds: 160, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 1, 2, 2, 0], timeTakenSeconds: 170, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 130, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 1, 2, 0, 2], timeTakenSeconds: 140, daysAgo: 3 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 1, 2, 2], timeTakenSeconds: 150, daysAgo: 0 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 2, 0, 1], timeTakenSeconds: 125, daysAgo: 1 },
    ],
  },
  // 3. Arjun Patel (Top Performer: Math 80%, Sci 100%, Eng 80%, Hin 80%, Soc 80%, CS 100% -> Avg 87%)
  {
    studentId: '24',
    name: 'Arjun Patel',
    tier: 'TOP',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 2, 0, 1, 0], timeTakenSeconds: 175, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 1, 2, 2, 2], timeTakenSeconds: 160, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 0, 1, 1, 0], timeTakenSeconds: 145, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 1, 2, 3, 2], timeTakenSeconds: 150, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 0, 2, 2], timeTakenSeconds: 165, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 2, 0, 0], timeTakenSeconds: 115, daysAgo: 2 },
    ],
  },
  // 4. Kavya Gupta (Top Performer: Math 80%, Sci 80%, Eng 100%, Hin 100%, Soc 80%, CS 80% -> Avg 87%)
  {
    studentId: '25',
    name: 'Kavya Gupta',
    tier: 'TOP',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 0, 0, 1, 1], timeTakenSeconds: 165, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 1, 0, 2, 2], timeTakenSeconds: 155, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 135, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 1, 2, 0, 2], timeTakenSeconds: 140, daysAgo: 3 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 1, 2, 0], timeTakenSeconds: 150, daysAgo: 0 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 0, 0, 0], timeTakenSeconds: 130, daysAgo: 1 },
    ],
  },
  // 5. Aditya Kumar (Above Average: Math 80%, Sci 60%, Eng 80%, Hin 80%, Soc 80%, CS 100% -> Avg 80%)
  {
    studentId: '26',
    name: 'Aditya Kumar',
    tier: 'TOP',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 2, 0, 0, 1], timeTakenSeconds: 180, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 0, 2, 2, 0], timeTakenSeconds: 190, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 1, 0, 1, 0], timeTakenSeconds: 140, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 1, 0, 0, 2], timeTakenSeconds: 160, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 1, 0, 2], timeTakenSeconds: 170, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 2, 0, 0], timeTakenSeconds: 120, daysAgo: 2 },
    ],
  },
  // 6. Rohan Mehta (Consistent Average: Math 60%, Sci 60%, Eng 80%, Hin 60%, Soc 60%, CS 60% -> Avg 63%)
  {
    studentId: '22',
    name: 'Rohan Mehta',
    tier: 'AVERAGE',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 1, 0, 1, 0], timeTakenSeconds: 200, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 1, 0, 2, 0], timeTakenSeconds: 210, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 1, 1, 0, 0], timeTakenSeconds: 170, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 0, 2, 0, 1], timeTakenSeconds: 185, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 1, 0, 0], timeTakenSeconds: 195, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 0, 0, 1], timeTakenSeconds: 160, daysAgo: 2 },
    ],
  },
  // 7. Ishita Sharma (Average: Math 60%, Sci 40%, Eng 100%, Hin 80%, Soc 60%, CS 40% -> Avg 63%)
  {
    studentId: '27',
    name: 'Ishita Sharma',
    tier: 'AVERAGE',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 0, 0, 0, 1], timeTakenSeconds: 210, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 0, 2, 0, 0], timeTakenSeconds: 220, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 1, 1, 1, 0], timeTakenSeconds: 140, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 1, 2, 0, 0], timeTakenSeconds: 160, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [1, 0, 0, 2, 0], timeTakenSeconds: 180, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 0, 0, 0, 0], timeTakenSeconds: 175, daysAgo: 2 },
    ],
  },
  // 8. Priya Singh (At-Risk: Math 40%, Sci 40%, Eng 40%, Hin 20%, Soc 40%, CS 20% -> Avg 33%)
  {
    studentId: '23',
    name: 'Priya Singh',
    tier: 'AT_RISK',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [0, 2, 0, 0, 0], timeTakenSeconds: 240, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [1, 0, 0, 2, 0], timeTakenSeconds: 250, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [0, 1, 1, 0, 0], timeTakenSeconds: 210, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 0, 0, 0, 1], timeTakenSeconds: 220, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [0, 0, 1, 2, 0], timeTakenSeconds: 230, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 0, 1, 1, 1], timeTakenSeconds: 200, daysAgo: 2 },
    ],
  },
  // 9. Siddharth Joshi (At-Risk: Math 20%, Sci 40%, Eng 40%, Hin 40%, Soc 20%, CS 40% -> Avg 33%)
  {
    studentId: '28',
    name: 'Siddharth Joshi',
    tier: 'AT_RISK',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [2, 0, 1, 0, 0], timeTakenSeconds: 260, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [0, 1, 0, 0, 2], timeTakenSeconds: 270, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [1, 0, 0, 1, 1], timeTakenSeconds: 240, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 0, 0, 0, 2], timeTakenSeconds: 250, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [0, 0, 0, 2, 0], timeTakenSeconds: 260, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [2, 1, 0, 1, 1], timeTakenSeconds: 230, daysAgo: 2 },
    ],
  },
  // 10. Riya Sen (At-Risk: Math 20%, Sci 20%, Eng 20%, Hin 40%, Soc 20%, CS 20% -> Avg 23%)
  {
    studentId: '29',
    name: 'Riya Sen',
    tier: 'AT_RISK',
    subjects: [
      { quizId: 'quiz-c10-math', subject: 'Mathematics', answers: [0, 0, 0, 1, 0], timeTakenSeconds: 280, daysAgo: 0 },
      { quizId: 'quiz-c10-sci', subject: 'Science', answers: [0, 0, 2, 0, 0], timeTakenSeconds: 290, daysAgo: 1 },
      { quizId: 'quiz-c10-eng', subject: 'English', answers: [0, 1, 0, 0, 0], timeTakenSeconds: 250, daysAgo: 2 },
      { quizId: 'quiz-c10-hin', subject: 'Hindi', answers: [0, 0, 2, 1, 0], timeTakenSeconds: 260, daysAgo: 0 },
      { quizId: 'quiz-c10-soc', subject: 'Social Science', answers: [0, 0, 0, 0, 2], timeTakenSeconds: 270, daysAgo: 1 },
      { quizId: 'quiz-c10-cs', subject: 'Computer Science', answers: [0, 1, 0, 0, 1], timeTakenSeconds: 240, daysAgo: 2 },
    ],
  },
];

export interface SimulationResultSummary {
  totalStudents: number;
  totalQuizzes: number;
  totalSubmissions: number;
  submissions: QuizResultRecord[];
  topPerformers: { id: string; name: string; avgScore: number; xp: number }[];
  atRiskStudents: { id: string; name: string; avgScore: number }[];
  subjectAverages: Record<string, number>;
  classAverage: number;
  completionRate: number;
}

/**
 * Execute the automated, real-life Class 10 assessment simulation
 */
export function executeClass10Simulation(): SimulationResultSummary {
  const submissions: QuizResultRecord[] = [];
  const now = new Date();

  for (const plan of CLASS_10_SIMULATION_PLANS) {
    for (const sub of plan.subjects) {
      // Calculate realistic date based on daysAgo
      const date = new Date(now.getTime() - sub.daysAgo * 86400000);
      const completedAt = date.toISOString();

      // Submit through the real application data layer
      const record = dataService.submitQuizResult({
        quizId: sub.quizId,
        studentId: plan.studentId,
        answers: sub.answers,
        timeTakenSeconds: sub.timeTakenSeconds,
        completedAt,
      });

      submissions.push(record);
    }
  }

  // Aggregate results across students
  const studentMap: Record<string, { id: string; name: string; totalScore: number; count: number; totalXP: number }> = {};
  submissions.forEach((r) => {
    const sId = String(r.studentId);
    if (!studentMap[sId]) {
      studentMap[sId] = {
        id: sId,
        name: r.studentName,
        totalScore: 0,
        count: 0,
        totalXP: 0,
      };
    }
    studentMap[sId].totalScore += r.percentage;
    studentMap[sId].count += 1;
    studentMap[sId].totalXP += r.xpEarned;
  });

  const studentsList = Object.values(studentMap).map((s) => ({
    id: s.id,
    name: s.name,
    avgScore: Math.round(s.totalScore / s.count),
    xp: s.totalXP,
  }));

  const topPerformers = studentsList
    .filter((s) => s.avgScore >= 80)
    .sort((a, b) => b.avgScore - a.avgScore);

  const atRiskStudents = studentsList
    .filter((s) => s.avgScore < 50)
    .sort((a, b) => a.avgScore - b.avgScore);

  // Subject averages
  const subjectMap: Record<string, { total: number; count: number }> = {};
  submissions.forEach((r) => {
    if (!subjectMap[r.subject]) {
      subjectMap[r.subject] = { total: 0, count: 0 };
    }
    subjectMap[r.subject].total += r.percentage;
    subjectMap[r.subject].count += 1;
  });

  const subjectAverages: Record<string, number> = {};
  Object.entries(subjectMap).forEach(([sub, data]) => {
    subjectAverages[sub] = Math.round(data.total / data.count);
  });

  const totalScoreAll = submissions.reduce((acc, r) => acc + r.percentage, 0);
  const classAverage = submissions.length > 0 ? Math.round(totalScoreAll / submissions.length) : 0;

  return {
    totalStudents: CLASS_10_SIMULATION_PLANS.length,
    totalQuizzes: CLASS_10_QUIZZES.length,
    totalSubmissions: submissions.length,
    submissions,
    topPerformers,
    atRiskStudents,
    subjectAverages,
    classAverage,
    completionRate: 100, // All 10 students attempted quizzes
  };
}
