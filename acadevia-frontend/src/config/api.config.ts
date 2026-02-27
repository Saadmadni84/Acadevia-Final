const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE}/api/v1/auth`,
  USERS: `${API_BASE}/api/v1/users`,
  COURSES: `${API_BASE}/api/v1/courses`,
  LESSONS: `${API_BASE}/api/v1/lessons`,
  QUIZZES: `${API_BASE}/api/v1/quizzes`,
  GAMES: `${API_BASE}/api/v1/games`,
  GAMIFICATION: `${API_BASE}/api/v1/gamification`,
  LEADERBOARD: `${API_BASE}/api/v1/leaderboard`,
  NOTIFICATIONS: `${API_BASE}/api/v1/notifications`,
  ANALYTICS: `${API_BASE}/api/v1/analytics`,
  SCHOOLS: `${API_BASE}/api/v1/schools`,
  SYNC: `${API_BASE}/api/v1/sync`,
  DOWNLOADS: `${API_BASE}/api/v1/downloads`,
} as const;

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';
export const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || '';
