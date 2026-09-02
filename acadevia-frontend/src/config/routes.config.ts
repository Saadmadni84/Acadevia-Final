export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:courseId',
  LESSON: '/courses/:courseId/lessons/:lessonId',
  QUIZZES: '/quizzes',
  QUIZ: '/courses/:courseId/quiz/:quizId',
  QUIZ_DIRECT: '/quizzes/:quizId',
  GAMES: '/games',
  GAME_PLAY: '/games/:gameId',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  BADGES: '/profile/badges',
  SETTINGS: '/settings',
  DOWNLOADS: '/downloads',
  NOTIFICATIONS: '/notifications',
  // Teacher routes
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_CONTENT_UPLOAD: '/teacher/content/upload',
  TEACHER_QUIZ_CREATE: '/teacher/quiz/create',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_ANALYTICS: '/teacher/analytics',
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SCHOOLS: '/admin/schools',
  ADMIN_USERS: '/admin/users',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SYSTEM: '/admin/system',
  // Public & Footer Routes
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS: '/terms',
  SUBJECTS: '/subjects',
  COMPETENCY: '/competency',
  STREAKS: '/streaks',
  ACHIEVEMENTS: '/achievements',
  STUDY_MATERIALS: '/study-materials',
  PRACTICE_QUESTIONS: '/practice-questions',
  MCQ_PRACTICE: '/mcq-practice',
  LEARNING_GUIDES: '/learning-guides',
  AI_LEARNING: '/ai-learning',
  HELP_CENTER: '/help-center',
  FAQS: '/faqs',
  CAREERS: '/careers',
  BLOG: '/blog',
  SUCCESS_STORIES: '/success-stories',
} as const;

/** Return the correct dashboard route for a given role. */
export function getDashboardRoute(role?: string): string {
  const r = (role || '').toUpperCase();
  if (r === 'TEACHER') return ROUTES.TEACHER_DASHBOARD;
  if (r === 'ADMIN') return ROUTES.ADMIN_DASHBOARD;
  return ROUTES.DASHBOARD;
}
