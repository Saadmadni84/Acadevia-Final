export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;

  schoolId?: string;
  schoolName?: string;

  stateId?: string;
  stateName?: string;

  cityId?: string;
  cityName?: string;

  pinCode?: string;
  pincode?: string;

  className?: string;
  classGrade?: number;
  section?: string;

  phone?: string;
  phoneNumber?: string;

  board?: string;
  languagePreference?: string;

  xp?: number;
  level?: number;
  streak?: number;
  coursesCompleted?: number;
  quizzesTaken?: number;
  hoursLearned?: number;

  joinedAt?: string;
}

export interface UserPreferences {
  languagePreference: string;
  notificationEnabled: boolean;
  downloadQuality: string;
  dataSaverMode: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
  autoSync: boolean;
  dailyGoal: number;
}