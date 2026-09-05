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

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  region?: string;
  popular?: boolean;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', popular: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', region: 'North / Central', popular: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', region: 'West Bengal & East', popular: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', region: 'Andhra & Telangana', popular: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', region: 'Tamil Nadu & South', popular: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', region: 'Maharashtra', popular: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', region: 'Gujarat', popular: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', region: 'Karnataka', popular: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', region: 'Kerala', popular: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', region: 'Punjab & North', popular: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr', region: 'Odisha', popular: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', dir: 'ltr', region: 'Assam & Northeast' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', region: 'Pan-India', popular: true },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', dir: 'ltr', region: 'Classical' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', dir: 'ltr', region: 'Sikkim & North' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', dir: 'ltr', region: 'Bihar & East' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', dir: 'ltr', region: 'Bihar & UP' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', dir: 'ltr', region: 'Goa & West Coast' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', dir: 'rtl', region: 'Pan-India' },
  { code: 'dog', name: 'Dogri', nativeName: 'डोगरी', dir: 'ltr', region: 'Jammu & Kashmir' },
  { code: 'mni-Mtei', name: 'Manipuri', nativeName: 'মৈতৈলোন্', dir: 'ltr', region: 'Manipur' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo ṭawng', dir: 'ltr', region: 'Mizoram' },
] as const;

