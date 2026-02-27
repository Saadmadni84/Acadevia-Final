export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:courseId',
  LESSON: '/courses/:courseId/lessons/:lessonId',
  QUIZ: '/courses/:courseId/quiz/:quizId',
  GAMES: '/games',
  GAME_PLAY: '/games/:gameId',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  BADGES: '/profile/badges',
  SETTINGS: '/settings',
  DOWNLOADS: '/downloads',
  NOTIFICATIONS: '/notifications',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_CONTENT_UPLOAD: '/teacher/content/upload',
  TEACHER_QUIZ_CREATE: '/teacher/quiz/create',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_ANALYTICS: '/teacher/analytics',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SCHOOLS: '/admin/schools',
  ADMIN_USERS: '/admin/users',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SYSTEM: '/admin/system',
} as const;

/** Return the correct dashboard route for a given role. */
export function getDashboardRoute(role?: string): string {
  const r = (role || '').toUpperCase();
  if (r === 'TEACHER') return ROUTES.TEACHER_DASHBOARD;
  if (r === 'ADMIN') return ROUTES.ADMIN_DASHBOARD;
  return ROUTES.DASHBOARD;
}
