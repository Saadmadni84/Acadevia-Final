export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Acadevia',
  DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  ENABLE_SOUNDS: import.meta.env.VITE_ENABLE_SOUNDS === 'true',
  ENABLE_OFFLINE: import.meta.env.VITE_ENABLE_OFFLINE === 'true',
  MAX_DOWNLOAD_SIZE_MB: Number(import.meta.env.VITE_MAX_DOWNLOAD_SIZE_MB) || 5120,
  STALE_TIME: { COURSES: 5 * 60 * 1000, LEADERBOARD: 30 * 1000, NOTIFICATIONS: 60 * 1000 },
  XP_THRESHOLDS: [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 7000, 9000, 11500, 14500, 18000, 22000, 27000, 33000, 40000],
  LEVEL_NAMES: ['Beginner', 'Explorer', 'Learner', 'Scholar', 'Achiever', 'Thinker', 'Analyst', 'Innovator', 'Expert', 'Master', 'Sage', 'Guru', 'Champion', 'Legend', 'Prodigy', 'Genius', 'Virtuoso', 'Maestro', 'Luminary', 'Visionary'],
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
] as const;
