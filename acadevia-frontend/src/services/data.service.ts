/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Acadevia Persistent Data Layer
 *
 * Real, data-driven architecture connecting Students, Teachers, Quizzes,
 * Submissions, and Learning Metrics with persistence.
 *
 * Designed to scale from demo users to thousands of students and teachers.
 */

import { apiClient } from './api.client';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatarUrl?: string;
  schoolName: string;
  stateName?: string;
  cityName?: string;

  // Registration & Contact Information
  pinCode?: string;
  pincode?: string;
  phone?: string;
  phoneNumber?: string;

  // Academic Information
  classGrade?: number; // Classes 1 through 12
  section?: string;
  studentSchoolId?: string;
  username?: string;
  location?: string;
  joinDate: string;

  // Student specific relations
  teacherId?: string; // Foreign key linking to teacher
  enrolledSubjects?: string[];
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak?: number;
  lessonsCompleted: number;
  coursesCompleted?: number;
  studyMinutes?: number;

  // Teacher specific relations
  designation?: string;
  subject?: string;
  subjectsTaught?: string[];
  classesTaught?: number[]; // Classes 1 through 12, e.g. [8, 9, 10, 11, 12]
  experience?: string;
  assignedStudentIds?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points: number;
  topic?: string;
}

export interface QuizRecord {
  id: string;
  numericId?: string;
  teacherId: string;
  teacherName: string;
  classGrade: number; // Classes 1 through 12
  subject: string;
  chapter?: string; // Chapter / Topic text
  chapterInfo?: string;
  title: string;
  description: string;
  timeLimit: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward?: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizResultRecord {
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
  timeTakenSeconds?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  userRole: 'STUDENT' | 'TEACHER';
  type: 'QUIZ_COMPLETED' | 'QUIZ_CREATED' | 'LESSON_COMPLETED' | 'MATERIAL_UPLOADED' | 'XP_EARNED' | 'BADGE_EARNED';
  title: string;
  description: string;
  timestamp: string;
  badgeText?: string;
}

export interface ClassAnalyticsData {
  classGrade: number;
  availableClasses: number[];
  subject: string;
  availableSubjects: string[];
  totalStudents: number;
  quizScores: {
    id: string;
    name: string;
    fullName: string;
    avg: number;
    attempts: number;
  }[];
  completionData: {
    name: string;
    value: number;
    count: number;
    color: string;
  }[];
  engagementTrend: {
    day: string;
    date: string;
    engagement: number;
  }[];
  topPerformers: {
    id: string;
    name: string;
    xp: number;
    score: number;
    quizzesTaken: number;
  }[];
  atRiskStudents: {
    id: string;
    name: string;
    score: number;
    lastActive: string;
  }[];
  subjectComparison: {
    subject: string;
    score: number;
    submissions: number;
  }[];
}

interface DataState {
  users: AppUser[];
  quizzes: QuizRecord[];
  results: QuizResultRecord[];
  activities: ActivityRecord[];
}

// In-Memory Reactive Cache for Shared Application Data (Independent of LocalStorage)
let memoryState: DataState | null = null;

const QUIZ_ALIAS_MAP: Record<string, string> = {
  '101': 'quiz-c10-math',
  '102': 'quiz-c10-sci',
  '103': 'quiz-c10-eng',
  '104': 'quiz-c10-hin',
  '105': 'quiz-c10-soc',
  '106': 'quiz-c10-cs',
  '107': 'quiz-10-math-1',
  '108': 'quiz-10-math-2',
};

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin + path;
  }
  return 'http://localhost:5173' + path;
}

/* ------------------------------------------------------------------ */
/*  INITIAL SEED DATA                                                  */
/* ------------------------------------------------------------------ */

const INITIAL_USERS: AppUser[] = [
  // Legacy Demo Accounts
  {
    id: '8',
    email: 'priya.sharma@demo.acadevia.com',
    studentSchoolId: 'priya.sharma',
    fullName: 'Dr. Priya Sharma',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Senior Faculty • Mathematics & Science',
    subject: 'Mathematics',
    subjectsTaught: ['Mathematics', 'Science', 'Physics'],
    classesTaught: [8, 9, 10, 11, 12],
    experience: '10+ Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'August 2022',
    assignedStudentIds: ['9', '20', '21', '22', '23'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },
  {
    id: '9',
    email: 'aarav.sharma@demo.acadevia.com',
    studentSchoolId: 'aarav.sharma',
    fullName: 'Aarav Sharma',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'A',
    teacherId: '8',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },

  // 6 Class 10 Subject Teachers
  {
    id: '10',
    email: 'rahul.math@demo.acadevia.com',
    studentSchoolId: 'rahul.math',
    username: 'rahul.math',
    fullName: 'Rahul Verma',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Department Head • Mathematics',
    subject: 'Mathematics',
    subjectsTaught: ['Mathematics'],
    classesTaught: [10],
    experience: '8 Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'May 2023',
    assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },
  {
    id: '11',
    email: 'neha.science@demo.acadevia.com',
    studentSchoolId: 'neha.science',
    username: 'neha.science',
    fullName: 'Neha Gupta',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Senior Faculty • Science',
    subject: 'Science',
    subjectsTaught: ['Science', 'Physics', 'Chemistry'],
    classesTaught: [10],
    experience: '6 Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'July 2023',
    assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },
  {
    id: '12',
    email: 'amit.english@demo.acadevia.com',
    studentSchoolId: 'amit.english',
    username: 'amit.english',
    fullName: 'Amit Sharma',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Senior Faculty • English Language & Literature',
    subject: 'English',
    subjectsTaught: ['English'],
    classesTaught: [10],
    experience: '7 Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'September 2023',
    assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },
  {
    id: '13',
    email: 'sunita.hindi@demo.acadevia.com',
    studentSchoolId: 'sunita.hindi',
    username: 'sunita.hindi',
    fullName: 'Sunita Mishra',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Senior Faculty • Hindi',
    subject: 'Hindi',
    subjectsTaught: ['Hindi'],
    classesTaught: [10],
    experience: '9 Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'January 2023',
    assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },
  {
    id: '14',
    email: 'vikram.social@demo.acadevia.com',
    studentSchoolId: 'vikram.social',
    username: 'vikram.social',
    fullName: 'Vikram Singh',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Senior Faculty • Social Science',
    subject: 'Social Science',
    subjectsTaught: ['Social Science', 'History', 'Civics'],
    classesTaught: [10],
    experience: '8 Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'April 2023',
    assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },
  {
    id: '15',
    email: 'pooja.cs@demo.acadevia.com',
    studentSchoolId: 'pooja.cs',
    username: 'pooja.cs',
    fullName: 'Pooja Patel',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    schoolName: 'Acadevia Demo School',
    designation: 'Lead Faculty • Computer Science & AI',
    subject: 'Computer Science',
    subjectsTaught: ['Computer Science', 'Informatics Practices'],
    classesTaught: [10],
    experience: '5 Years Teaching Experience',
    location: 'New Delhi, India',
    joinDate: 'October 2023',
    assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    lessonsCompleted: 0,
  },

  // 10 Class 10 Students
  {
    id: '20',
    email: 'aarav.sharma10@demo.acadevia.com',
    studentSchoolId: 'aarav.sharma10',
    username: 'aarav.sharma10',
    fullName: 'Aarav Sharma',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'A',
    teacherId: '10',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '21',
    email: 'ananya.verma10@demo.acadevia.com',
    studentSchoolId: 'ananya.verma10',
    username: 'ananya.verma10',
    fullName: 'Ananya Verma',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'A',
    teacherId: '11',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '22',
    email: 'rohan.mehta10@demo.acadevia.com',
    studentSchoolId: 'rohan.mehta10',
    username: 'rohan.mehta10',
    fullName: 'Rohan Mehta',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'A',
    teacherId: '10',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'February 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '23',
    email: 'priya.singh10@demo.acadevia.com',
    studentSchoolId: 'priya.singh10',
    username: 'priya.singh10',
    fullName: 'Priya Singh',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'A',
    teacherId: '12',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '24',
    email: 'arjun.patel10@demo.acadevia.com',
    studentSchoolId: 'arjun.patel10',
    username: 'arjun.patel10',
    fullName: 'Arjun Patel',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'B',
    teacherId: '10',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'March 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '25',
    email: 'kavya.gupta10@demo.acadevia.com',
    studentSchoolId: 'kavya.gupta10',
    username: 'kavya.gupta10',
    fullName: 'Kavya Gupta',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'B',
    teacherId: '13',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '26',
    email: 'aditya.kumar10@demo.acadevia.com',
    studentSchoolId: 'aditya.kumar10',
    username: 'aditya.kumar10',
    fullName: 'Aditya Kumar',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'B',
    teacherId: '14',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'February 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '27',
    email: 'ishita.rao10@demo.acadevia.com',
    studentSchoolId: 'ishita.rao10',
    username: 'ishita.rao10',
    fullName: 'Ishita Rao',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'B',
    teacherId: '15',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '28',
    email: 'vihaan.joshi10@demo.acadevia.com',
    studentSchoolId: 'vihaan.joshi10',
    username: 'vihaan.joshi10',
    fullName: 'Vihaan Joshi',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'C',
    teacherId: '11',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'March 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
  {
    id: '29',
    email: 'meera.nair10@demo.acadevia.com',
    studentSchoolId: 'meera.nair10',
    username: 'meera.nair10',
    fullName: 'Meera Nair',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    schoolName: 'Acadevia Demo School',
    classGrade: 10,
    section: 'C',
    teacherId: '12',
    enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
    location: 'New Delhi, India',
    joinDate: 'January 2024',
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    studyMinutes: 0,
  },
];

const INITIAL_QUIZZES: QuizRecord[] = [
  {
    id: 'quiz-10-math-1',
    teacherId: '8',
    teacherName: 'Dr. Priya Sharma',
    classGrade: 10,
    subject: 'Mathematics',
    title: 'Quadratic Equations & Discriminants',
    description: 'Class 10 core assessment on finding roots, discriminant values, and quadratic formulas.',
    timeLimit: 300,
    difficulty: 'medium',
    createdAt: '2024-08-20T10:00:00Z',
    questions: [
      {
        id: 'q1',
        question: 'What is the discriminant of the quadratic equation x² + 5x + 6 = 0?',
        options: ['1', '25', '36', '11'],
        correctIndex: 0,
        explanation: 'Discriminant D = b² - 4ac = 25 - 4(1)(6) = 25 - 24 = 1.',
        points: 10,
        topic: 'Algebra & Equations',
      },
      {
        id: 'q2',
        question: 'Which method can be used to solve the equation x² - 9 = 0?',
        options: ['Factoring as difference of squares', 'Quadratic formula', 'Both A and B', 'None of these'],
        correctIndex: 2,
        explanation: 'Both factoring (x-3)(x+3)=0 and using the quadratic formula yield x = ±3.',
        points: 10,
        topic: 'Algebra & Equations',
      },
      {
        id: 'q3',
        question: 'If the discriminant b² - 4ac < 0, then the quadratic equation has:',
        options: ['Two distinct real roots', 'Two equal real roots', 'No real roots (imaginary)', 'Infinite roots'],
        correctIndex: 2,
        explanation: 'A negative discriminant means square root of a negative number, hence no real solutions.',
        points: 10,
        topic: 'Algebra & Equations',
      },
      {
        id: 'q4',
        question: 'What are the roots of the equation x² - 7x + 12 = 0?',
        options: ['3 and 4', '-3 and -4', '2 and 6', '1 and 12'],
        correctIndex: 0,
        explanation: '(x - 3)(x - 4) = 0 => x = 3, 4.',
        points: 10,
        topic: 'Algebra & Equations',
      },
      {
        id: 'q5',
        question: 'What is the nature of roots for 2x² - 4x + 3 = 0?',
        options: ['Real and equal', 'Real and distinct', 'No real roots', 'Rational and unequal'],
        correctIndex: 2,
        explanation: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8 (< 0), so no real roots exist.',
        points: 10,
        topic: 'Algebra & Equations',
      },
    ],
  },
  {
    id: 'quiz-10-math-2',
    teacherId: '8',
    teacherName: 'Dr. Priya Sharma',
    classGrade: 10,
    subject: 'Mathematics',
    title: 'Trigonometric Identities & Ratios',
    description: 'Fundamental identities, sin/cos relationships, and right-triangle trigonometry.',
    timeLimit: 240,
    difficulty: 'medium',
    createdAt: '2024-08-22T14:30:00Z',
    questions: [
      {
        id: 'tq1',
        question: 'What is the value of sin²(θ) + cos²(θ) for any angle θ?',
        options: ['0', '1', '2', 'Depends on θ'],
        correctIndex: 1,
        explanation: 'sin²(θ) + cos²(θ) = 1 is the fundamental Pythagorean trigonometric identity.',
        points: 10,
        topic: 'Trigonometry',
      },
      {
        id: 'tq2',
        question: 'If tan(θ) = 1 in a right triangle, what is the angle θ?',
        options: ['30°', '45°', '60°', '90°'],
        correctIndex: 1,
        explanation: 'tan(45°) = 1.',
        points: 10,
        topic: 'Trigonometry',
      },
      {
        id: 'tq3',
        question: 'Which of the following is equal to sec²(θ) - 1?',
        options: ['tan²(θ)', 'cot²(θ)', 'sin²(θ)', 'cos²(θ)'],
        correctIndex: 0,
        explanation: '1 + tan²(θ) = sec²(θ), therefore sec²(θ) - 1 = tan²(θ).',
        points: 10,
        topic: 'Trigonometry',
      },
    ],
  },
  {
    id: 'quiz-c10-math',
    teacherId: '10',
    teacherName: 'Rahul Verma',
    classGrade: 10,
    subject: 'Mathematics',
    title: 'Class 10 Real Numbers & Polynomials Practice',
    description: 'Comprehensive assessment on HCF, LCM, zeroes of polynomials, and quadratic relations.',
    timeLimit: 300,
    difficulty: 'medium',
    createdAt: '2024-08-20T10:00:00Z',
    questions: [
      { id: 'mq1', question: 'What is the HCF of 12 and 18?', options: ['2', '4', '6', '12'], correctIndex: 2, explanation: 'HCF(12,18) = 6.', points: 10 },
      { id: 'mq2', question: 'Which of the following is an irrational number?', options: ['0.333...', '√4', '√7', '22/7'], correctIndex: 2, explanation: '√7 cannot be expressed as p/q with integers.', points: 10 },
      { id: 'mq3', question: 'What are the zeroes of the quadratic polynomial x² - 5x + 6?', options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'], correctIndex: 0, explanation: '(x-2)(x-3)=0 => x = 2, 3.', points: 10 },
      { id: 'mq4', question: 'If α and β are roots of ax² + bx + c = 0, then α + β equals:', options: ['b/a', '-b/a', 'c/a', '-c/a'], correctIndex: 1, explanation: 'Sum of roots is -b/a.', points: 10 },
      { id: 'mq5', question: 'The discriminant of 2x² - 4x + 3 = 0 is:', options: ['8', '-8', '16', '-16'], correctIndex: 1, explanation: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8.', points: 10 },
    ],
  },
  {
    id: 'quiz-c10-sci',
    teacherId: '11',
    teacherName: 'Neha Gupta',
    classGrade: 10,
    subject: 'Science',
    title: 'Class 10 Chemical Reactions & Life Processes',
    description: 'Test covering chemical equations, balancing, oxidation-reduction, and cellular respiration.',
    timeLimit: 300,
    difficulty: 'medium',
    createdAt: '2024-08-21T10:00:00Z',
    questions: [
      { id: 'sq1', question: 'What type of reaction is 2Mg + O₂ → 2MgO?', options: ['Decomposition', 'Combination', 'Displacement', 'Double displacement'], correctIndex: 1, explanation: 'Two reactants combine to form a single product.', points: 10 },
      { id: 'sq2', question: 'In photosynthesis, light energy is converted into:', options: ['Mechanical energy', 'Chemical energy', 'Thermal energy', 'Nuclear energy'], correctIndex: 1, explanation: 'Chlorophyll absorbs sunlight to synthesize carbohydrates (chemical energy).', points: 10 },
      { id: 'sq3', question: 'Which organelle is called the powerhouse of the cell?', options: ['Ribosome', 'Golgi apparatus', 'Mitochondria', 'Endoplasmic reticulum'], correctIndex: 2, explanation: 'ATP synthesis takes place in the mitochondria.', points: 10 },
      { id: 'sq4', question: 'What is the SI unit of electric current?', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], correctIndex: 2, explanation: 'Electric current is measured in Amperes (A).', points: 10 },
      { id: 'sq5', question: 'The pH of an acidic solution is always:', options: ['Equal to 7', 'Greater than 7', 'Less than 7', 'Equal to 14'], correctIndex: 2, explanation: 'Acidic solutions have pH < 7.', points: 10 },
    ],
  },
  {
    id: 'quiz-c10-eng',
    teacherId: '12',
    teacherName: 'Amit Sharma',
    classGrade: 10,
    subject: 'English',
    title: 'Class 10 First Flight & Grammar Essentials',
    description: 'Literature comprehension and English grammar fundamentals for Class 10 board prep.',
    timeLimit: 300,
    difficulty: 'easy',
    createdAt: '2024-08-22T10:00:00Z',
    questions: [
      { id: 'eq1', question: 'Who is the author of "A Letter to God"?', options: ['Liam O’Flaherty', 'G.L. Fuentes', 'Nelson Mandela', 'Robert Frost'], correctIndex: 1, explanation: '"A Letter to God" was written by G.L. Fuentes.', points: 10 },
      { id: 'eq2', question: 'What did Lencho compare the raindrops to?', options: ['Gold coins', 'New coins', 'Silver pearls', 'Diamonds'], correctIndex: 1, explanation: 'Lencho compared the big drops to ten cent pieces and little ones to fives.', points: 10 },
      { id: 'eq3', question: 'Choose the correct sentence:', options: ['Neither the teacher nor the students was present.', 'Neither the teacher nor the students were present.', 'Neither the teacher or the students was present.', 'Either the teacher nor the students were present.'], correctIndex: 1, explanation: 'When subjects are connected by neither/nor, the verb agrees with the closer subject ("students were").', points: 10 },
      { id: 'eq4', question: 'What is the antonym of "affluent"?', options: ['Wealthy', 'Impoverished', 'Prosperous', 'Opulent'], correctIndex: 1, explanation: 'Affluent means rich; impoverished means poor.', points: 10 },
      { id: 'eq5', question: 'Change to passive voice: "The chef cooked a delicious meal."', options: ['A delicious meal was cooked by the chef.', 'A delicious meal is cooked by the chef.', 'A delicious meal had been cooked by the chef.', 'A delicious meal has cooked by the chef.'], correctIndex: 0, explanation: 'Simple past passive is "was/were + past participle".', points: 10 },
    ],
  },
  {
    id: 'quiz-c10-hin',
    teacherId: '13',
    teacherName: 'Sunita Mishra',
    classGrade: 10,
    subject: 'Hindi',
    title: 'Class 10 स्पर्श एवं व्याकरण: साखी एवं पद',
    description: 'कबीर की साखी, मीरा के पद और तत्पुरुष समास पर आधारित अभ्यास प्रश्न।',
    timeLimit: 300,
    difficulty: 'easy',
    createdAt: '2024-08-23T10:00:00Z',
    questions: [
      { id: 'hq1', question: 'कबीर के अनुसार ‘मीठी वाणी’ बोलने से क्या लाभ होता है?', options: ['औरों को सुख और तन को शीतलता मिलती है', 'धन की प्राप्ति होती है', 'शत्रु पराजित होते हैं', 'मान-सम्मान कम होता है'], correctIndex: 0, explanation: 'ऐसी बाणी बोलिये, मन का आपा खोइ। औरन को सीतल करै, आपहु सीतल होइ॥', points: 10 },
      { id: 'hq2', question: 'मीराबाई किसकी अनन्य भक्त थीं?', options: ['श्री राम', 'श्री कृष्ण', 'शिवजी', 'हनुमान जी'], correctIndex: 1, explanation: 'मीराबाई गिरिधर गोपाल (श्री कृष्ण) की अनन्य भक्त थीं।', points: 10 },
      { id: 'hq3', question: '‘राजपुत्र’ में कौन-सा समास है?', options: ['द्विगु समास', 'द्वंद्व समास', 'तत्पुरुष समास', 'अव्ययीभाव समास'], correctIndex: 2, explanation: 'राजा का पुत्र = तत्पुरुष समास (संबंध तत्पुरुष)।', points: 10 },
      { id: 'hq4', question: '‘अंगूठा दिखाना’ मुहावरे का सही अर्थ क्या है?', options: ['साफ मना करना', 'मदद करना', 'चिढ़ाना', 'जीत जाना'], correctIndex: 0, explanation: 'अंगूठा दिखाना अर्थात वक्त पर साफ इंकार कर देना।', points: 10 },
      { id: 'hq5', question: '‘सूर्य’ का पर्यायवाची शब्द नहीं है:', options: ['दिनकर', 'रवि', 'शशि', 'भास्कर'], correctIndex: 2, explanation: '‘शशि’ चंद्रमा का पर्यायवाची है, सूर्य का नहीं।', points: 10 },
    ],
  },
  {
    id: 'quiz-c10-soc',
    teacherId: '14',
    teacherName: 'Vikram Singh',
    classGrade: 10,
    subject: 'Social Science',
    title: 'Class 10 The Rise of Nationalism & Federalism',
    description: 'Key historical events of European nationalism, Indian federalism, and democratic institutions.',
    timeLimit: 300,
    difficulty: 'medium',
    createdAt: '2024-08-24T10:00:00Z',
    questions: [
      { id: 'ssq1', question: 'When did the French Revolution begin?', options: ['1776', '1789', '1804', '1815'], correctIndex: 1, explanation: 'The French Revolution began in 1789.', points: 10 },
      { id: 'ssq2', question: 'Who hosted the Congress of Vienna in 1815?', options: ['Duke Metternich', 'Giuseppe Mazzini', 'Otto von Bismarck', 'Napoleon Bonaparte'], correctIndex: 0, explanation: 'Austrian Chancellor Duke Metternich hosted the Congress of Vienna.', points: 10 },
      { id: 'ssq3', question: 'Black soil is also known as:', options: ['Bangar soil', 'Regur soil', 'Laterite soil', 'Alluvial soil'], correctIndex: 1, explanation: 'Black soil is called Regur soil and is ideal for growing cotton.', points: 10 },
      { id: 'ssq4', question: 'Which level of government in India has powers to legislate on the Concurrent List?', options: ['Only Union Government', 'Only State Government', 'Both Union and State Governments', 'Local Panchayats'], correctIndex: 2, explanation: 'Both Central and State governments can make laws on items in the Concurrent List.', points: 10 },
      { id: 'ssq5', question: 'Tertiary sector activities include:', options: ['Agriculture and fishing', 'Manufacturing and construction', 'Transport, banking, and communications', 'Mining and quarrying'], correctIndex: 2, explanation: 'Tertiary sector provides services such as transport, banking, and communications.', points: 10 },
    ],
  },
  {
    id: 'quiz-c10-cs',
    teacherId: '15',
    teacherName: 'Pooja Patel',
    classGrade: 10,
    subject: 'Computer Science',
    title: 'Class 10 Python Fundamentals & Cyber Ethics',
    description: 'Python variables, loop control structures, conditional branching, and digital footprint ethics.',
    timeLimit: 300,
    difficulty: 'medium',
    createdAt: '2024-08-25T10:00:00Z',
    questions: [
      { id: 'csq1', question: 'Which data type is mutable in Python?', options: ['Tuple', 'String', 'List', 'Integer'], correctIndex: 2, explanation: 'Lists can be modified after creation (mutable), unlike tuples and strings.', points: 10 },
      { id: 'csq2', question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', '5'], correctIndex: 1, explanation: '** is the exponentiation operator: 2³ = 8.', points: 10 },
      { id: 'csq3', question: 'Which keyword is used to define a function in Python?', options: ['func', 'define', 'def', 'function'], correctIndex: 2, explanation: 'In Python, functions are defined using the "def" keyword.', points: 10 },
      { id: 'csq4', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Standard Question Language', 'Simple Query Logic', 'System Query Language'], correctIndex: 0, explanation: 'SQL stands for Structured Query Language.', points: 10 },
      { id: 'csq5', question: 'A trail of data you leave behind while browsing online is called:', options: ['Digital Footprint', 'Cyber Space', 'Cookie Jar', 'Cache Trace'], correctIndex: 0, explanation: 'Digital footprint refers to the traceable trail of digital activities left behind by a user.', points: 10 },
    ],
  },
];

const INITIAL_RESULTS: QuizResultRecord[] = [];

const INITIAL_ACTIVITIES: ActivityRecord[] = [];

/* ------------------------------------------------------------------ */
/*  STREAK & TIME HELPERS                                             */
/* ------------------------------------------------------------------ */

export function calculateStreakFromDates(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDays = Array.from(
    new Set(
      dates.map((d) => {
        const dateObj = new Date(d);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      }),
    ),
  ).sort().reverse();

  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const d1 = new Date(uniqueDays[i]);
      const d2 = new Date(uniqueDays[i + 1]);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / 86400000);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  if (uniqueDays.length > 0) {
    let tempStreak = 1;
    longestStreak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const d1 = new Date(uniqueDays[i]);
      const d2 = new Date(uniqueDays[i + 1]);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/* ------------------------------------------------------------------ */
/*  STORAGE ENGINE                                                     */
/* ------------------------------------------------------------------ */

// Version tracking to avoid redundant downloads of unchanged database state
let lastKnownVersion = 0;
let isSyncInProgress = false;

function loadState(): DataState {
  if (!memoryState) {
    memoryState = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      quizzes: JSON.parse(JSON.stringify(INITIAL_QUIZZES)),
      results: JSON.parse(JSON.stringify(INITIAL_RESULTS)),
      activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)),
    };
  }
  return memoryState;
}

// Hook for test runners to reset in-memory cache when localStorage.clear() is called
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    const origClear = localStorage.clear.bind(localStorage);
    localStorage.clear = function () {
      origClear();
      memoryState = null;
      lastKnownVersion = 0;
    };
  } catch {
    /* ignore in non-browser environments */
  }
}

const subscribers = new Set<() => void>();
function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('[dataService] Subscriber error:', e);
    }
  });
}

function saveState(state: DataState): void {
  memoryState = state;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('acadevia_data_updated'));
  }
  notifySubscribers();
}

/* ------------------------------------------------------------------ */
/*  SERVICE API                                                        */
/* ------------------------------------------------------------------ */

export const dataService = {
  /** Subscribe to data updates */
  subscribe(callback: () => void): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  /** Manually trigger listener notifications */
  notifyListeners(): void {
    notifySubscribers();
  },

  /** Get all users */
  getUsers(): AppUser[] {
    return loadState().users;
  },

  /** Find user by ID */
  getUserById(id: string): AppUser | undefined {
    const users = loadState().users;
    return users.find((u) => String(u.id) === String(id));
  },

  /** Find user by email or username */
  getUserByEmail(email: string): AppUser | undefined {
    const users = loadState().users;
    const clean = email.toLowerCase().trim();
    const username = clean.includes('@') ? clean.split('@')[0] : clean;
    return users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.studentSchoolId && u.studentSchoolId.toLowerCase() === clean) ||
        (u.studentSchoolId && u.studentSchoolId.toLowerCase() === username) ||
        (u.username && u.username.toLowerCase() === clean) ||
        (u.username && u.username.toLowerCase() === username) ||
        u.email.toLowerCase().startsWith(clean + '@')
    );
  },

  /** Upsert user */
  upsertUser(user: AppUser): void {
    const state = loadState();
    const idx = state.users.findIndex((u) => String(u.id) === String(user.id));
    if (idx >= 0) {
      state.users[idx] = { ...state.users[idx], ...user };
    } else {
      state.users.push(user);
    }
    saveState(state);
  },

  /** Set or update current active user */
  setCurrentUser(user: any): void {
    if (!user) return;
    try {
      const state = loadState();
      const idx = state.users.findIndex(
        (u) => String(u.id) === String(user.id) || (user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );
      if (idx >= 0) {
        state.users[idx] = { ...state.users[idx], ...user };
      } else {
        state.users.push(user);
      }
      saveState(state);
    } catch (e) {
      console.warn('setCurrentUser fallback warning:', e);
    }
  },

  /* ---------------------------------------------------------------- */
  /*  RELATIONSHIPS                                                   */
  /* ---------------------------------------------------------------- */

  /** Retrieve a student's assigned teacher */
  getStudentTeacher(studentId: string): AppUser | undefined {
    const student = this.getUserById(studentId);
    if (!student || !student.teacherId) return undefined;
    return this.getUserById(student.teacherId);
  },

  /** Retrieve all students taught by a teacher */
  getTeacherStudents(teacherId: string): AppUser[] {
    const state = loadState();
    const teacher = this.getUserById(teacherId);
    if (!teacher) return [];

    return state.users.filter((u) => {
      if (u.role !== 'STUDENT') return false;
      // Direct teacher assignment
      if (String(u.teacherId) === String(teacherId)) return true;
      // Or student is in teacher's assigned student list
      if (teacher.assignedStudentIds?.some((id) => String(id) === String(u.id))) return true;
      // Or student belongs to one of the classes taught by this teacher
      if (u.classGrade && teacher.classesTaught?.includes(u.classGrade)) return true;
      return false;
    });
  },

  /* ---------------------------------------------------------------- */
  /*  QUIZZES                                                         */
  /* ---------------------------------------------------------------- */

  /** Get all available quizzes */
  getQuizzes(): QuizRecord[] {
    return this.getAllQuizzes();
  },

  /** Get all available quizzes sorted newest first */
  getAllQuizzes(): QuizRecord[] {
    return loadState().quizzes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /** Get all quizzes available for a specific student based on class & relationships */
  getQuizzesForStudent(studentId: string): QuizRecord[] {
    const state = loadState();
    const student = this.getUserById(studentId);
    const classGrade = student?.classGrade || 10;
    const teacherId = student?.teacherId;

    return state.quizzes
      .filter((q) => {
        // Matches student's academic class (Classes 1-12)
        const matchesClass = Number(q.classGrade) === Number(classGrade);
        if (!matchesClass) return false;
        return true;
      })
      .sort((a, b) => {
        // Prioritize assigned teacher quizzes first, then newest
        const aFromTeacher = teacherId && String(a.teacherId) === String(teacherId) ? 1 : 0;
        const bFromTeacher = teacherId && String(b.teacherId) === String(teacherId) ? 1 : 0;
        if (aFromTeacher !== bFromTeacher) return bFromTeacher - aFromTeacher;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  /** Get quizzes available for a specific class (1-12) */
  getQuizzesByClass(classGrade: number): QuizRecord[] {
    return loadState()
      .quizzes.filter((q) => Number(q.classGrade) === Number(classGrade))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Get quizzes by class and subject (e.g. for course views) */
  getQuizzesByClassAndSubject(classGrade: number, subject?: string): QuizRecord[] {
    return loadState()
      .quizzes.filter((q) => {
        if (Number(q.classGrade) !== Number(classGrade)) return false;
        if (subject && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Get quizzes created by a teacher */
  getQuizzesByTeacher(teacherId: string): QuizRecord[] {
    return loadState()
      .quizzes.filter((q) => String(q.teacherId) === String(teacherId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Get quiz by ID */
  getQuizById(quizId: string): QuizRecord | undefined {
    const qStr = String(quizId).toLowerCase().trim();
    const mappedAlias = QUIZ_ALIAS_MAP[qStr] || '';
    const reverseNum = Object.keys(QUIZ_ALIAS_MAP).find((k) => QUIZ_ALIAS_MAP[k] === qStr) || '';
    const rawNum = qStr.replace(/^quiz-/, '');

    return loadState().quizzes.find((q) => {
      const idStr = String(q.id).toLowerCase().trim();
      const numIdStr = (q as any).numericId ? String((q as any).numericId).toLowerCase().trim() : '';

      if (idStr === qStr) return true;
      if (numIdStr && numIdStr === qStr) return true;
      if (mappedAlias && (idStr === mappedAlias.toLowerCase() || numIdStr === mappedAlias.toLowerCase())) return true;
      if (reverseNum && (idStr === reverseNum || numIdStr === reverseNum)) return true;
      if (rawNum && (idStr === rawNum || numIdStr === rawNum || idStr.replace(/^quiz-/, '') === rawNum)) return true;
      return false;
    });
  },

  /** Teacher creates and publishes a quiz */
  createQuiz(data: Omit<QuizRecord, 'id' | 'createdAt'>): QuizRecord {
    const state = loadState();
    const newQuiz: QuizRecord = {
      ...data,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    state.quizzes.unshift(newQuiz);

    // Record teacher activity
    state.activities.unshift({
      id: `act-${Date.now()}`,
      userId: data.teacherId,
      userRole: 'TEACHER',
      type: 'QUIZ_CREATED',
      title: `Created Quiz: ${data.title}`,
      description: `Published assessment with ${data.questions.length} questions for Class ${data.classGrade} ${data.subject}`,
      timestamp: 'Just now',
      badgeText: `Class ${data.classGrade}`,
    });

    saveState(state);

    // Persist to MySQL Backend API
    if (typeof window !== 'undefined') {
      fetch(getApiUrl('/api/v1/quizzes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res?.success && res?.data?.id) {
            const realId = String(res.data.id);
            newQuiz.id = realId;
            (newQuiz as any).numericId = String(res.data.numericId || realId);
            saveState(state);
          }
          if (res?.data?.stateVersion) lastKnownVersion = Number(res.data.stateVersion);
        })
        .catch((err) => {
          console.warn('[dataService] Backend quiz creation sync failed:', err);
        });
    }

    return newQuiz;
  },

  /** Teacher deletes or archives a quiz */
  async deleteQuiz(quizId: string): Promise<{ success: boolean; mode: string; message: string }> {
    const qStr = String(quizId).trim();
    const state = loadState();

    // Find quiz in local state
    const quiz = state.quizzes.find(
      (q) =>
        String(q.id).toLowerCase() === qStr.toLowerCase() ||
        String((q as any).numericId || '').toLowerCase() === qStr.toLowerCase()
    );

    // Call backend DELETE API
    let resData: any = { success: true, mode: 'DELETED', message: 'Quiz removed' };
    if (typeof window !== 'undefined') {
      const res = await apiClient.delete(`/api/v1/quizzes/${encodeURIComponent(quiz?.numericId || quiz?.id || qStr)}`);
      resData = res.data?.data || res.data || resData;
    }

    // Remove from local in-memory state
    state.quizzes = state.quizzes.filter(
      (q) =>
        String(q.id).toLowerCase() !== qStr.toLowerCase() &&
        String((q as any).numericId || '').toLowerCase() !== qStr.toLowerCase() &&
        (quiz ? String(q.id) !== String(quiz.id) : true)
    );
    saveState(state);
    this.notifyListeners();

    return resData;
  },

  /* ---------------------------------------------------------------- */
  /*  QUIZ RESULTS & SUBMISSIONS                                      */
  /* ---------------------------------------------------------------- */

  /** Get all results submitted by a student */
  getStudentQuizResults(studentId: string): QuizResultRecord[] {
    return loadState().results.filter((r) => String(r.studentId) === String(studentId));
  },

  /** Get all results submitted to a teacher's quizzes */
  getTeacherQuizResults(teacherId: string): QuizResultRecord[] {
    return loadState().results.filter((r) => String(r.teacherId) === String(teacherId));
  },

  /** Student takes and submits a quiz */
  submitQuizResult(params: {
    quizId: string;
    studentId: string;
    answers: number[];
    timeTakenSeconds?: number;
    completedAt?: string;
  }): QuizResultRecord {
    const state = loadState();

    // Idempotency: Prevent duplicate submissions for the same student + quiz
    const existing = state.results.find(
      (r) => r.quizId === params.quizId && String(r.studentId) === String(params.studentId),
    );
    if (existing) {
      return existing;
    }

    const quiz = this.getQuizById(params.quizId);
    const student = state.users.find((u) => String(u.id) === String(params.studentId));

    if (!quiz) throw new Error(`Quiz ${params.quizId} not found`);
    if (!student) throw new Error(`Student ${params.studentId} not found`);

    // Calculate score
    let score = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    quiz.questions.forEach((q, idx) => {
      const studentAnswer = params.answers[idx];
      if (studentAnswer !== undefined && studentAnswer === q.correctIndex) {
        score += q.points;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const baseReward = Number(quiz.xpReward) || 50;
    const xpEarned = Math.max(score * 10, baseReward);
    const timeTakenSeconds = params.timeTakenSeconds || 180;
    const completedAt = params.completedAt || new Date().toISOString();

    const resultRecord: QuizResultRecord = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: student.id,
      studentName: student.fullName,
      teacherId: quiz.teacherId,
      classGrade: quiz.classGrade,
      subject: quiz.subject,
      score,
      totalPoints,
      percentage,
      answers: params.answers,
      completedAt,
      xpEarned,
      timeTakenSeconds,
    };

    state.results.unshift(resultRecord);

    // Update Student stats
    student.totalXP = (student.totalXP || 0) + xpEarned;
    student.currentLevel = Math.floor(student.totalXP / 500) + 1;
    student.lessonsCompleted = (student.lessonsCompleted || 0) + 1;
    student.studyMinutes = (student.studyMinutes || 0) + Math.max(1, Math.round(timeTakenSeconds / 60));

    // Calculate dynamic streak from all student results
    const studentDates = state.results
      .filter((r) => String(r.studentId) === String(student.id))
      .map((r) => r.completedAt);
    const { currentStreak, longestStreak } = calculateStreakFromDates(studentDates);
    student.currentStreak = currentStreak;
    student.longestStreak = longestStreak;

    // Record activity for Student
    state.activities.unshift({
      id: `act-s-${Date.now()}`,
      userId: student.id,
      userRole: 'STUDENT',
      type: 'QUIZ_COMPLETED',
      title: `Completed Quiz: ${quiz.title}`,
      description: `Scored ${percentage}% (${score}/${totalPoints} points) • ${quiz.subject}`,
      timestamp: 'Just now',
      badgeText: `${percentage}% Score`,
    });

    // Record activity for Teacher
    state.activities.unshift({
      id: `act-t-${Date.now()}`,
      userId: quiz.teacherId,
      userRole: 'TEACHER',
      type: 'QUIZ_COMPLETED',
      title: `Student Submission: ${student.fullName}`,
      description: `${student.fullName} scored ${percentage}% on ${quiz.title}`,
      timestamp: 'Just now',
      badgeText: `${student.fullName} • ${percentage}%`,
    });

    saveState(state);

    // Persist to MySQL Backend API
    if (typeof window !== 'undefined') {
      fetch(getApiUrl('/api/v1/attempts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: params.quizId,
          studentId: params.studentId,
          answers: params.answers,
          timeTakenSeconds,
          completedAt,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res?.data?.stateVersion) lastKnownVersion = Number(res.data.stateVersion);
        })
        .catch((err) => {
          console.warn('[dataService] Backend attempt sync failed:', err);
        });
    }

    return resultRecord;
  },

  /* ---------------------------------------------------------------- */
  /*  CALCULATED METRICS & DYNAMIC PROGRESS                           */
  /* ---------------------------------------------------------------- */

  /** Get real subject progress for a student based on actual completion */
  getStudentSubjectProgress(studentId: string) {
    const student = this.getUserById(studentId);
    const classGrade = student?.classGrade || 10;
    const results = this.getStudentQuizResults(studentId);

    const subjects = [
      { name: 'Mathematics', title: `Mathematics Class ${classGrade}`, icon: '📐' },
      { name: 'Science', title: `Science Class ${classGrade}`, icon: '🔬' },
      { name: 'English', title: 'English Literature', icon: '📖' },
      { name: 'Hindi', title: 'Hindi Vyakaran', icon: '🏛️' },
      { name: 'Social Science', title: `Social Science Class ${classGrade}`, icon: '🌍' },
      { name: 'Computer Science', title: 'Computer Science & AI', icon: '💻' },
    ];

    return subjects.map((sub, idx) => {
      const availableQuizzes = this.getQuizzesByClassAndSubject(classGrade, sub.name);
      const completedQuizzes = results.filter(
        (r) => r.subject.toLowerCase() === sub.name.toLowerCase()
      );

      const totalCount = Math.max(availableQuizzes.length, 1);
      const completedCount = completedQuizzes.length;
      const progress = Math.min(100, Math.round((completedCount / totalCount) * 100));

      return {
        id: `subj-${idx + 1}`,
        title: sub.title,
        subject: sub.name,
        progress,
        lessonsCount: totalCount,
        completedLessons: completedCount,
        icon: sub.icon,
      };
    });
  },

  /** Get real 7-day study activity for current week (Monday - Sunday) */
  getStudentWeeklyActivity(studentId: string): { day: string; date: string; minutes: number }[] {
    const state = loadState();
    const results = state.results.filter((r) => String(r.studentId) === String(studentId));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Monday as start of week
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekData: { day: string; date: string; minutes: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];

      let dayMinutes = 0;
      results.forEach((r) => {
        if (r.completedAt && r.completedAt.startsWith(dateStr)) {
          const mins = r.timeTakenSeconds ? Math.max(1, Math.round(r.timeTakenSeconds / 60)) : 3;
          dayMinutes += mins;
        }
      });

      weekData.push({
        day: dayLabel,
        date: dateStr,
        minutes: dayMinutes,
      });
    }

    return weekData;
  },

  /** Calculate full real metrics for a student without any fake fallbacks */
  getStudentMetrics(studentId: string) {
    const student = this.getUserById(studentId);
    const results = this.getStudentQuizResults(studentId);
    const teacher = this.getStudentTeacher(studentId);

    const quizCount = results.length;
    const averageScore =
      quizCount > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / quizCount)
        : 0;

    // Real XP from authoritative user account
    const totalXP = student?.totalXP ?? 0;
    const level = Math.floor(totalXP / 500) + 1;

    // Real streak calculation from dates
    const activityDates = results.map((r) => r.completedAt).filter(Boolean);
    const { currentStreak, longestStreak } = calculateStreakFromDates(activityDates);

    // Real study time calculation
    const totalQuizSeconds = results.reduce((sum, r) => sum + (r.timeTakenSeconds || 180), 0);
    const studyMinutes = quizCount > 0 ? Math.round(totalQuizSeconds / 60) : 0;
    const hoursLearned = Math.round((studyMinutes / 60) * 10) / 10;

    const perfectQuizzesCount = results.filter((r) => r.percentage >= 100).length;

    // Subject progress
    const subjectProgress = this.getStudentSubjectProgress(studentId);
    const completedSubjects = subjectProgress.filter((s) => s.progress === 100).length;
    const overallProgress = Math.round(
      subjectProgress.reduce((sum, s) => sum + s.progress, 0) / Math.max(subjectProgress.length, 1)
    );

    // Real criteria-based badge counting
    let badgesEarned = 0;
    if (quizCount >= 1) badgesEarned++; // First Lesson/Quiz
    if (quizCount >= 10 && averageScore >= 80) badgesEarned++; // Quiz Master
    if (currentStreak >= 7) badgesEarned++; // Week Warrior
    if (level >= 10) badgesEarned++; // Scholar
    if (perfectQuizzesCount >= 5) badgesEarned++; // Perfect Score
    if (level >= 50) badgesEarned++; // Legend

    return {
      student,
      teacher,
      totalXP,
      level,
      streak: currentStreak,
      longestStreak,
      quizzesCompleted: quizCount,
      averageScore,
      studyMinutes,
      hoursLearned,
      lessonsCompleted: quizCount,
      coursesCompleted: completedSubjects,
      badgesEarned,
      perfectQuizzesCount,
      overallProgress,
      subjectProgress,
    };
  },

  /**
   * Fetch dynamic leaderboard from backend API with fallback to local state.
   * Period: 'weekly' (last 7 days), 'monthly' (last 30 days), 'alltime' (total accumulated XP)
   */
  async fetchLeaderboard(period: 'weekly' | 'monthly' | 'alltime' = 'alltime'): Promise<LeaderboardEntry[]> {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch(getApiUrl(`/api/v1/leaderboard?period=${period}`));
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      }
    } catch {
      // Network / offline fallback
    }
    return this.getLeaderboard(period);
  },

  /**
   * Get dynamic leaderboard calculated strictly from real registered student accounts and quiz attempts.
   * Period: 'weekly' (last 7 days), 'monthly' (last 30 days), 'alltime' (total accumulated XP)
   */
  getLeaderboard(period: 'weekly' | 'monthly' | 'alltime' = 'alltime'): LeaderboardEntry[] {
    const state = loadState();
    const students = state.users.filter((u) => u.role === 'STUDENT');
    const results = state.results;

    const now = Date.now();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const entries = students.map((st) => {
      let xp = 0;
      const stAttempts = results.filter((r) => String(r.studentId) === String(st.id));

      if (period === 'weekly') {
        xp = stAttempts
          .filter((r) => r.completedAt && new Date(r.completedAt) >= oneWeekAgo)
          .reduce((sum, r) => sum + (r.xpEarned || 0), 0);
      } else if (period === 'monthly') {
        xp = stAttempts
          .filter((r) => r.completedAt && new Date(r.completedAt) >= oneMonthAgo)
          .reduce((sum, r) => sum + (r.xpEarned || 0), 0);
      } else {
        xp = st.totalXP ?? 0;
      }

      const displayName = (st.fullName || st.username || `Student #${st.id}`).trim();
      const avatar =
        st.avatarUrl && st.avatarUrl !== 'NULL' && st.avatarUrl !== 'null'
          ? st.avatarUrl
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

      return {
        userId: String(st.id),
        name: displayName,
        avatar,
        level: st.currentLevel || 1,
        xp,
        streak: st.currentStreak || 0,
        change: 'same' as const,
      };
    });

    entries.sort((a, b) => b.xp - a.xp || b.level - a.level || a.name.localeCompare(b.name));

    return entries.map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));
  },

  /** Calculate full real metrics for a teacher */
  getTeacherMetrics(teacherId: string) {
    const teacher = this.getUserById(teacherId);
    const students = this.getTeacherStudents(teacherId);
    const quizzes = this.getQuizzesByTeacher(teacherId);
    const results = this.getTeacherQuizResults(teacherId);

    const averagePerformance =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0;

    return {
      teacher,
      students,
      totalStudents: students.length,
      quizzesCreated: quizzes.length,
      assignmentsCount: quizzes.length,
      totalSubmissions: results.length,
      averagePerformance,
      recentSubmissions: results.slice(0, 5),
    };
  },

  /** Calculate real data-driven analytics for a teacher and class */
  getClassAnalytics(params: { teacherId: string; classGrade?: number; subject?: string }): ClassAnalyticsData {
    const state = loadState();
    const teacher = this.getUserById(params.teacherId);

    // 1. Available Classes & Subjects
    const availableClasses = teacher?.classesTaught && teacher.classesTaught.length > 0
      ? teacher.classesTaught
      : [10];
    const selectedClass = params.classGrade || availableClasses[0] || 10;

    const classSubjects = this.getSubjectsForClass(selectedClass);
    const availableSubjects = ['All', ...classSubjects];
    const selectedSubject = params.subject && params.subject !== 'All'
      ? params.subject
      : 'All';

    // 2. Students in selected class (filtered by teacher assignments if present)
    let classStudents = state.users.filter(
      (u) => u.role === 'STUDENT' && Number(u.classGrade) === Number(selectedClass)
    );
    if (teacher?.assignedStudentIds && teacher.assignedStudentIds.length > 0) {
      const assignedSet = new Set(teacher.assignedStudentIds.map(String));
      const assignedInClass = classStudents.filter((s) => assignedSet.has(String(s.id)));
      if (assignedInClass.length > 0) {
        classStudents = assignedInClass;
      }
    }
    const totalStudents = classStudents.length;

    // 3. Quizzes in this class (filtered by class, teacher if All, or selected subject)
    const classQuizzes = state.quizzes.filter((q) => {
      const matchClass = Number(q.classGrade) === Number(selectedClass);
      const matchTeacher = !params.teacherId || String(q.teacherId) === String(params.teacherId);
      const matchSubject = selectedSubject === 'All'
        ? (params.teacherId ? matchTeacher : true)
        : q.subject.toLowerCase() === selectedSubject.toLowerCase();
      return matchClass && matchSubject;
    });

    // 4. Submissions matching these quizzes
    const classQuizIds = new Set(classQuizzes.map((q) => q.id));
    const relevantResults = state.results.filter((r) => {
      const matchQuiz = classQuizIds.has(r.quizId);
      const matchClass = Number(r.classGrade) === Number(selectedClass);
      const matchTeacher = !params.teacherId || String(r.teacherId) === String(params.teacherId);
      const matchSubject = selectedSubject === 'All'
        ? (params.teacherId ? matchTeacher : true)
        : r.subject.toLowerCase() === selectedSubject.toLowerCase();
      return matchQuiz || (matchClass && matchSubject);
    });

    // 5. Average Score by Quiz
    const quizScores = classQuizzes.map((q) => {
      const qResults = relevantResults.filter((r) => r.quizId === q.id);
      const attempts = qResults.length;
      const avg = attempts > 0
        ? Math.round(qResults.reduce((sum, r) => sum + r.percentage, 0) / attempts)
        : 0;
      return {
        id: q.id,
        name: q.title.length > 22 ? q.title.substring(0, 20) + '...' : q.title,
        fullName: q.title,
        avg,
        attempts,
      };
    });

    // 6. Completion Rate
    const submittedStudentIds = new Set(relevantResults.map((r) => String(r.studentId)));
    const completedCount = submittedStudentIds.size;
    const notStartedCount = Math.max(0, totalStudents - completedCount);
    const completedPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
    const notStartedPct = Math.max(0, 100 - completedPct);

    const completionData = [
      { name: 'Completed', value: completedPct, count: completedCount, color: '#5B2C6F' },
      { name: 'In Progress', value: 0, count: 0, color: '#f59e0b' },
      { name: 'Not Started', value: notStartedPct, count: notStartedCount, color: '#ef4444' },
    ];

    // 7. Engagement Trend (Last 30 Days)
    const now = new Date();
    const engagementTrend: { day: string; date: string; engagement: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayResults = relevantResults.filter((r) => {
        const rDate = (r.completedAt || '').split('T')[0];
        return rDate === dateStr;
      });

      engagementTrend.push({
        day: dayLabel,
        date: dateStr,
        engagement: dayResults.length,
      });
    }

    // 8. Top Performers
    const studentPerformanceMap: Record<string, { id: string; name: string; totalScore: number; count: number; totalXP: number }> = {};
    relevantResults.forEach((r) => {
      const sId = String(r.studentId);
      if (!studentPerformanceMap[sId]) {
        studentPerformanceMap[sId] = {
          id: sId,
          name: r.studentName,
          totalScore: 0,
          count: 0,
          totalXP: 0,
        };
      }
      studentPerformanceMap[sId].totalScore += r.percentage;
      studentPerformanceMap[sId].count += 1;
      studentPerformanceMap[sId].totalXP += r.xpEarned;
    });

    const topPerformers = Object.values(studentPerformanceMap)
      .map((s) => ({
        id: s.id,
        name: s.name,
        xp: s.totalXP,
        score: Math.round(s.totalScore / s.count),
        quizzesTaken: s.count,
      }))
      .sort((a, b) => b.score - a.score || b.xp - a.xp)
      .slice(0, 5);

    // 9. At-Risk Students (students with avg score < 50%)
    const atRiskStudents = Object.values(studentPerformanceMap)
      .filter((s) => Math.round(s.totalScore / s.count) < 50)
      .map((s) => ({
        id: s.id,
        name: s.name,
        score: Math.round(s.totalScore / s.count),
        lastActive: 'Recently',
      }));

    // 10. Subject-wise Comparison for this class (connected directly to the class results)
    const allClassSubjects = this.getSubjectsForClass(selectedClass);
    const subjectComparison = allClassSubjects.map((sub) => {
      const subResults = relevantResults.filter(
        (r) => Number(r.classGrade) === Number(selectedClass) && r.subject.toLowerCase() === sub.toLowerCase()
      );
      const score = subResults.length > 0
        ? Math.round(subResults.reduce((sum, r) => sum + r.percentage, 0) / subResults.length)
        : 0;
      return {
        subject: sub === 'Social Science' ? 'Social' : sub,
        score,
        submissions: subResults.length,
      };
    });

    return {
      classGrade: selectedClass,
      availableClasses,
      subject: selectedSubject,
      availableSubjects,
      totalStudents,
      quizScores,
      completionData,
      engagementTrend,
      topPerformers,
      atRiskStudents,
      subjectComparison,
    };
  },

  /** Get recent activities for a specific user */
  getRecentActivities(userId: string, role?: 'STUDENT' | 'TEACHER'): ActivityRecord[] {
    const state = loadState();
    return state.activities
      .filter((a) => {
        if (String(a.userId) !== String(userId)) return false;
        if (role && a.userRole && a.userRole !== role) return false;
        return true;
      })
      .slice(0, 8);
  },

  /** Get all academic classes (Classes 1 through 12) */
  getAcademicClasses(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  },

  /** Get curriculum subjects for a given class */
  getSubjectsForClass(classGrade: number): string[] {
    const subjects: Record<number, string[]> = {
      1: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
      2: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
      3: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
      4: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
      5: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
      6: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
      7: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
      8: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
      9: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
      10: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
      11: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy'],
      12: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy'],
    };
    return subjects[classGrade] || ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];
  },

  /** Synchronize student records and quiz attempts from backend API */
  syncStudentsFromApi(apiStudents: any[]): void {
    if (!Array.isArray(apiStudents) || apiStudents.length === 0) return;
    const state = loadState();
    apiStudents.forEach((st) => {
      const uIdx = state.users.findIndex((u) => String(u.id) === String(st.id));
      if (uIdx >= 0) {
        state.users[uIdx].totalXP = Number(st.totalXP) || 0;
        state.users[uIdx].currentLevel = Number(st.level) || Math.floor((st.totalXP || 0) / 500) + 1;
        state.users[uIdx].currentStreak = Number(st.streak) || 0;
        state.users[uIdx].lessonsCompleted = Number(st.quizzesCompleted) || 0;
        state.users[uIdx].studyMinutes = Number(st.studyMinutes) || 0;
      }
      if (Array.isArray(st.results)) {
        st.results.forEach((att: any) => {
          const rIdx = state.results.findIndex(
            (r) => r.id === att.id || (String(r.studentId) === String(att.studentId) && String(r.quizId) === String(att.quizId))
          );
          if (rIdx >= 0) {
            state.results[rIdx] = { ...state.results[rIdx], ...att };
          } else {
            state.results.push(att);
          }
        });
      }
    });
    saveState(state);
  },

  /** Fetch and sync full data state from backend API */
  async syncFromBackend(force: boolean = false): Promise<void> {
    if (isSyncInProgress) return;
    try {
      if (typeof window === 'undefined') return;
      isSyncInProgress = true;

      // Fast version check: if state version has not changed, avoid downloading full database state
      if (!force && lastKnownVersion > 0) {
        try {
          const vRes = await fetch(getApiUrl('/api/v1/data/version'));
          if (vRes.ok) {
            const vJson = await vRes.json();
            const serverVer = Number(vJson?.data?.version) || 0;
            if (serverVer > 0 && serverVer === lastKnownVersion) {
              // State is completely identical; skip full download and prevent redundant re-renders
              return;
            }
          }
        } catch {
          // If version endpoint unreachable, continue to standard sync
        }
      }

      const res = await fetch(getApiUrl('/api/v1/data/state'));
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json.data) {
          const state = loadState();
          const { users, quizzes, results, activities, stateVersion } = json.data;

          if (stateVersion) {
            lastKnownVersion = Number(stateVersion);
          }

          if (Array.isArray(users) && users.length > 0) {
            users.forEach((apiU: any) => {
              const idx = state.users.findIndex((u) => String(u.id) === String(apiU.id));
              if (idx >= 0) {
                state.users[idx] = { ...state.users[idx], ...apiU };
              } else {
                state.users.push(apiU);
              }
            });
          }

          if (Array.isArray(quizzes) && quizzes.length > 0) {
            quizzes.forEach((apiQ: any) => {
              const idx = state.quizzes.findIndex(
                (q) => String(q.id) === String(apiQ.id) || (apiQ.numericId && (q as any).numericId === apiQ.numericId)
              );
              if (idx >= 0) {
                state.quizzes[idx] = { ...state.quizzes[idx], ...apiQ };
              } else {
                state.quizzes.unshift(apiQ);
              }
            });
          }

          if (Array.isArray(results) && results.length > 0) {
            results.forEach((apiR: any) => {
              const idx = state.results.findIndex(
                (r) => String(r.id) === String(apiR.id) || (String(r.studentId) === String(apiR.studentId) && String(r.quizId) === String(apiR.quizId))
              );
              if (idx >= 0) {
                state.results[idx] = { ...state.results[idx], ...apiR };
              } else {
                state.results.push(apiR);
              }
            });
          }

          if (Array.isArray(activities) && activities.length > 0) {
            activities.forEach((apiA: any) => {
              if (!state.activities.some((a) => a.id === apiA.id)) {
                state.activities.push(apiA);
              }
            });
          }

          saveState(state);
        }
      }
    } catch {
      // Offline fallback
    } finally {
      isSyncInProgress = false;
    }
  },
};

// Initial sync in browser runtime & efficient auto-revalidation polling (30s)
if (typeof window !== 'undefined') {
  dataService.syncFromBackend(true).catch(() => { });

  window.addEventListener('focus', () => {
    dataService.syncFromBackend().catch(() => { });
  });

  setInterval(() => {
    dataService.syncFromBackend().catch(() => { });
  }, 30000);
}
