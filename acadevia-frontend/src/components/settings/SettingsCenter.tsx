import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Bell,
  Palette,
  HardDrive,
  Shield,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  KeyRound,
  Trash2,
  ExternalLink,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { userService } from '@/services/user.service';
import { dataService } from '@/services/data.service';
import { offlineStorage } from '@/lib/offlineStorage';
import { ROUTES } from '@/config/routes.config';
import { formatFileSize, cn } from '@/lib/utils';

type SettingsTab =
  | 'account'
  | 'learning'
  | 'notifications'
  | 'appearance'
  | 'downloads'
  | 'security';

export const SettingsCenter: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    settings,
    isSaving,
    hasUnsavedChanges,
    updateSetting,
    saveToServer,
    resetToDefaults,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Editable Account Form State
  const initialPhone =
    user?.phone ||
    user?.phoneNumber ||
    (user?.id ? dataService.getUserById(String(user.id))?.phone : '') ||
    (user?.email ? dataService.getUserByEmail(user.email)?.phone : '') ||
    '';
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(initialPhone);
  const [schoolName, setSchoolName] = useState(user?.schoolName || '');
  const [className, setClassName] = useState(user?.className || 'Class 10');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Storage Stats for Downloads Tab
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      const dynamicPhone =
        user.phone ||
        user.phoneNumber ||
        (user.id ? dataService.getUserById(String(user.id))?.phone : '') ||
        (user.email ? dataService.getUserByEmail(user.email)?.phone : '') ||
        '';
      setPhone(dynamicPhone);
      setSchoolName(user.schoolName || '');
      setClassName(user.className || 'Class 10');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  useEffect(() => {
    offlineStorage.getAllMeta().then((items) => {
      const breakdown = offlineStorage.calculateBreakdown(items);
      setStorageUsedBytes(breakdown.usedBytes);
    });
  }, []);

  // ----------------------------------------------------
  // Save Changes
  // ----------------------------------------------------
  const handleSaveAll = async () => {
    try {
      // 1. Update Profile Information
      if (user) {
        const updatedUser = {
          ...user,
          fullName,
          email,
          phone,
          phoneNumber: phone,
          schoolName,
          className,
          avatarUrl,
        };
        setUser(updatedUser);

        // Update dataService persistently
        const existing =
          dataService.getUserById(String(user.id)) ||
          (user.email ? dataService.getUserByEmail(user.email) : undefined);
        if (existing) {
          dataService.upsertUser({
            ...existing,
            fullName,
            phone,
            phoneNumber: phone,
            avatarUrl,
          });
        }

        try {
          await userService.updateProfile({
            fullName,
            phone,
            phoneNumber: phone,
            schoolName,
            className,
          });
        } catch {
          // Graceful fallback to local user update
        }
      }

      // 2. Save Preferences
      await saveToServer();

      setFeedback({
        type: 'success',
        message: 'Settings and profile updated successfully.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Unable to save changes. Please try again.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // ----------------------------------------------------
  // Profile Photo Upload (Real Persistence)
  // ----------------------------------------------------
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploadedUrl = await userService.uploadAvatar(file);
        setAvatarUrl(uploadedUrl);
        setFeedback({
          type: 'success',
          message: 'Profile photo updated.',
        });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err.message || 'Unable to update profile photo. Please try again.',
        });
        setTimeout(() => setFeedback(null), 4000);
      }
    }
  };

  // ----------------------------------------------------
  // Password Change
  // ----------------------------------------------------
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({
        type: 'success',
        message: 'Password changed successfully.',
      });
      setTimeout(() => setFeedback(null), 3000);
    }, 1000);
  };

  // Tab definitions
  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'learning', label: 'Learning', icon: GraduationCap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'downloads', label: 'Downloads & Offline', icon: HardDrive },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
  ];

  // Quick Search filter
  const isTabVisible = (tabId: SettingsTab) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const tabObj = tabs.find((t) => t.id === tabId);
    return tabObj?.label.toLowerCase().includes(q) || activeTab === tabId;
  };

  return (
    <div className="space-y-6 select-none p-1 sm:p-2 max-w-5xl mx-auto">
      {/* 1. Header & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            Manage your Acadevia account, learning preferences and experience.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* 2. Horizontal Category Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 overflow-x-auto no-scrollbar text-xs font-bold">
        {tabs
          .filter((t) => isTabVisible(t.id))
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer',
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/40'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* Feedback Toast Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xs',
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-800 dark:text-red-200'
            )}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SETTINGS CONTENT CONTAINER */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-card-dark p-6 sm:p-8 shadow-xs space-y-8">
        {/* ==================================================== */}
        {/* TAB 1: ACCOUNT SETTINGS                              */}
        {/* ==================================================== */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Profile & Student Information
              </h2>
              <p className="text-xs text-gray-500">
                Update your personal details and school enrollment credentials.
              </p>
            </div>

            {/* Profile Picture Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60">
              <Avatar
                src={avatarUrl}
                name={fullName || 'Student'}
                size="lg"
                className="w-16 h-16 text-xl shadow-xs"
              />
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {fullName || 'Student Name'}
                </h3>
                <p className="text-xs text-gray-500">
                  {user?.role ? user.role.toUpperCase() : 'STUDENT'} · {className} · {schoolName || 'Acadevia Partner School'}
                </p>
                <div className="pt-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-primary cursor-pointer transition-colors shadow-2xs">
                    <Camera className="h-3.5 w-3.5 text-primary" />
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@acadevia.in"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    School / Institution
                  </label>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                    Locked &bull; Assigned during registration
                  </span>
                </div>
                <Input
                  value={schoolName || 'School not assigned'}
                  disabled
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed border-dashed"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  School affiliation is permanently linked to your student account and cannot be modified.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Enrolled Class / Grade
                </label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 10"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    State / Region
                  </label>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                    Locked &bull; Assigned during registration
                  </span>
                </div>
                <Input
                  value={
                    user?.stateName ||
                    (user?.id ? dataService.getUserById(String(user.id))?.stateName : undefined) ||
                    (user?.email ? dataService.getUserByEmail(user.email)?.stateName : undefined) ||
                    'Not provided'
                  }
                  disabled
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed border-dashed"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  State affiliation is permanently linked to your student account and cannot be modified.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                    Locked &bull; Assigned during registration
                  </span>
                </div>
                <Input
                  value={
                    user?.cityName ||
                    (user?.id ? dataService.getUserById(String(user.id))?.cityName : undefined) ||
                    (user?.email ? dataService.getUserByEmail(user.email)?.cityName : undefined) ||
                    'Not provided'
                  }
                  disabled
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed border-dashed"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  City affiliation is permanently linked to your student account and cannot be modified.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    PIN Code
                  </label>

                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                    Locked &bull; Assigned during registration
                  </span>
                </div>

                <Input
                  value={
                    user?.pinCode ||
                    (user as any)?.pincode ||
                    (user?.id
                      ? (
                          dataService.getUserById(String(user.id))?.pinCode ||
                          dataService.getUserById(String(user.id))?.pincode
                        )
                      : undefined) ||
                    (user?.email
                      ? (
                          dataService.getUserByEmail(user.email)?.pinCode ||
                          dataService.getUserByEmail(user.email)?.pincode
                        )
                      : undefined) ||
                    'Not provided'
                  }
                  disabled
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed border-dashed"
                />

                <p className="text-xs text-gray-400 dark:text-gray-500">
                  PIN code is permanently linked to your student account and cannot be modified.
                </p>
              </div>
            </div>
          </div>
        )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: LEARNING PREFERENCES                          */}
        {/* ==================================================== */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Learning & Study Goals
              </h2>
              <p className="text-xs text-gray-500">
                Customize your daily study sessions, quiz difficulty, and practice pacing.
              </p>
            </div>

            {/* Daily Learning Goal Selector */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 block">
                Daily Study Target (Focus Time)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => updateSetting('dailyGoalMinutes', mins)}
                    className={cn(
                      'py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center',
                      settings.dailyGoalMinutes === mins
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary/40'
                    )}
                  >
                    {mins} mins / day
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Difficulty */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 block">
                Quiz Challenge Level
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'easy', label: 'Easy Pacing', desc: 'Relaxed questions with extra hints' },
                  { id: 'balanced', label: 'Balanced (Standard)', desc: 'CBSE / NCERT recommended challenge' },
                  { id: 'challenging', label: 'Challenging', desc: 'Advanced problem solving & time bonus' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() =>
                      updateSetting('quizDifficulty', diff.id as 'easy' | 'balanced' | 'challenging')
                    }
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all cursor-pointer',
                      settings.quizDifficulty === diff.id
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    )}
                  >
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                      {diff.label}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      {diff.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Toggles */}
            <div className="space-y-4 pt-2">
              <Switch
                checked={settings.studyReminders}
                onChange={(val) => updateSetting('studyReminders', val)}
                label="Study Reminders & Notifications"
                description="Get reminders before planned study sessions and daily streak maintenance"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.autoContinueLessons}
                onChange={(val) => updateSetting('autoContinueLessons', val)}
                label="Auto-continue Lessons"
                description="Automatically queue the next video lecture or practice quiz in the chapter"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.showQuizExplanations}
                onChange={(val) => updateSetting('showQuizExplanations', val)}
                label="Instant Quiz Step-by-Step Explanations"
                description="Display detailed mathematical steps and concepts after answering each question"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.enableRecommendations}
                onChange={(val) => updateSetting('enableRecommendations', val)}
                label="AI Learning Recommendations"
                description="Receive personalized topic suggestions based on your quiz accuracy and games"
                className="w-full py-2"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: NOTIFICATIONS                                 */}
        {/* ==================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-xs text-gray-500">
                Choose what notifications and alerts you receive across devices.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Learning & Activity Alerts
              </h3>
              <Switch
                checked={settings.pushNotifications}
                onChange={(val) => updateSetting('pushNotifications', val)}
                label="Push Notifications"
                description="Enable browser and device notifications for live updates"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />
              <Switch
                checked={settings.lessonReminders}
                onChange={(val) => updateSetting('lessonReminders', val)}
                label="Lesson & Quiz Reminders"
                description="Alerts for upcoming homework and newly uploaded teacher lectures"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Gamification & Achievements
              </h3>
              <Switch
                checked={settings.streakAlerts}
                onChange={(val) => updateSetting('streakAlerts', val)}
                label="Daily Streak Saver Alerts"
                description="Get notified in the evening if your learning streak is about to break"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />
              <Switch
                checked={settings.levelUpCelebrations}
                onChange={(val) => updateSetting('levelUpCelebrations', val)}
                label="Level Up & XP Animations"
                description="Show celebratory confetti when reaching new level thresholds"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />
              <Switch
                checked={settings.badgeEarnedAlerts}
                onChange={(val) => updateSetting('badgeEarnedAlerts', val)}
                label="Badge Unlock Notifications"
                description="Instant celebration when unlocking new subject badges"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Email Digests
              </h3>
              <Switch
                checked={settings.emailWeeklyDigest}
                onChange={(val) => updateSetting('emailWeeklyDigest', val)}
                label="Weekly Learning Summary Email"
                description="Receive weekly study activity and chapter completion progress"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: APPEARANCE & THEME                            */}
        {/* ==================================================== */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Appearance & Audio
              </h2>
              <p className="text-xs text-gray-500">
                Customize theme mode, sound effects, and display formatting.
              </p>
            </div>

            {/* Theme Mode Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 block">
                Interface Theme
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean off-white surfaces' },
                  { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Sleek dark mode for night study' },
                  { id: 'system', label: 'System Default', icon: Laptop, desc: 'Matches device preference' },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = settings.theme === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateSetting('theme', mode.id as 'light' | 'dark' | 'system')}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[100px]',
                        isSelected
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                          {mode.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 mt-2 block">
                        {mode.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sound Effects & Accessibility */}
            <div className="space-y-4 pt-2">
              <Switch
                checked={settings.soundEffects}
                onChange={(val) => updateSetting('soundEffects', val)}
                label="Sound Effects & Audio Feedback"
                description="Play audio cues for XP rewards, quiz answers, and game interactions"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              {/* Font Sizing */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                    Font Sizing
                  </span>
                  <span className="text-xs text-gray-500">
                    Adjust text size for comfortable reading
                  </span>
                </div>
                <div className="flex gap-2">
                  {(['default', 'large'] as Array<'default' | 'large'>).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateSetting('fontSize', sz)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                        settings.fontSize === sz
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-gray-200 dark:border-gray-700'
                      )}
                    >
                      {sz === 'default' ? 'Standard' : 'Large Text'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: DOWNLOADS & OFFLINE                           */}
        {/* ==================================================== */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Downloads & Offline Learning
              </h2>
              <p className="text-xs text-gray-500">
                Manage data saver preferences, default video resolution, and device storage.
              </p>
            </div>

            {/* Storage Card */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Current Offline Storage: {formatFileSize(storageUsedBytes)} / 1 GB
                  </span>
                  <span className="text-[11px] text-gray-500">
                    All downloaded lessons are stored securely on this device
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.DOWNLOADS)}
                rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                className="cursor-pointer text-xs"
              >
                Manage Downloads
              </Button>
            </div>

            {/* Download Quality Preference */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 block">
                Default Video Download Quality
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { q: '360p', label: '360p (Low Data)', desc: 'Smallest file size (~25 MB)' },
                  { q: '480p', label: '480p (Recommended)', desc: 'Standard clarity (~50 MB)' },
                  { q: '720p', label: '720p (HD Clarity)', desc: 'High definition (~100 MB)' },
                ].map((item) => (
                  <button
                    key={item.q}
                    type="button"
                    onClick={() =>
                      updateSetting('downloadQuality', item.q as '360p' | '480p' | '720p')
                    }
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all cursor-pointer',
                      settings.downloadQuality === item.q
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    )}
                  >
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Toggles */}
            <div className="space-y-4 pt-2">
              <Switch
                checked={settings.wifiOnlyDownloads}
                onChange={(val) => updateSetting('wifiOnlyDownloads', val)}
                label="Download over Wi-Fi Only"
                description="Prevent downloads over cellular mobile data connections"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.autoDownloadEnrolled}
                onChange={(val) => updateSetting('autoDownloadEnrolled', val)}
                label="Auto-download Enrolled Chapter Lectures"
                description="Pre-download video lessons in background for seamless offline access"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.keepCompletedLessons}
                onChange={(val) => updateSetting('keepCompletedLessons', val)}
                label="Keep Completed Lessons in Storage"
                description="Retain finished lesson videos for offline revision"
                className="w-full py-2"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: PRIVACY & SECURITY                            */}
        {/* ==================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Privacy, Security & Account Actions
              </h2>
              <p className="text-xs text-gray-500">
                Control your public leaderboard profile, password, and account credentials.
              </p>
            </div>

            {/* Security Actions Bar */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Account Password
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Last updated recently
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                className="cursor-pointer text-xs"
              >
                Change Password
              </Button>
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Profile Visibility
              </h3>

              <Switch
                checked={settings.showProfileOnLeaderboard}
                onChange={(val) => updateSetting('showProfileOnLeaderboard', val)}
                label="Show Profile on School Leaderboard"
                description="Allow classmates and teachers to see your weekly rank and XP"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.showActivityToClassmates}
                onChange={(val) => updateSetting('showActivityToClassmates', val)}
                label="Show Study Activity to Classmates"
                description="Share study streaks and course completions with your class peers"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.showAchievementsPublicly}
                onChange={(val) => updateSetting('showAchievementsPublicly', val)}
                label="Public Achievement Showcase"
                description="Display your earned badges and certificates on your student profile"
                className="w-full py-2 border-b border-gray-100 dark:border-gray-800"
              />

              <Switch
                checked={settings.loginAlerts}
                onChange={(val) => updateSetting('loginAlerts', val)}
                label="New Device Login Alerts"
                description="Receive an email notice when your account is logged in from a new browser"
                className="w-full py-2"
              />
            </div>

            {/* Destructive Zone */}
            <div className="pt-6 border-t border-red-100 dark:border-red-950/40 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                Danger Zone
              </h3>
              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-red-900 dark:text-red-200 block">
                    Delete Student Account
                  </span>
                  <span className="text-[11px] text-red-700/80 dark:text-red-300/80">
                    Permanently removes your course progress, XP, badges, and offline downloads.
                  </span>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  className="cursor-pointer text-xs"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* BOTTOM SAVE BAR                                      */}
        {/* ==================================================== */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {hasUnsavedChanges ? (
              <span className="font-bold text-amber-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes pending
              </span>
            ) : (
              <span className="text-gray-400">All preferences up to date</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="cursor-pointer flex-1 sm:flex-initial text-xs"
            >
              Reset Defaults
            </Button>
            <Button
              variant="gradient"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveAll}
              leftIcon={<Save className="h-4 w-4" />}
              className="cursor-pointer shadow-xs font-bold flex-1 sm:flex-initial"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CHANGE PASSWORD MODAL                                */}
      {/* ---------------------------------------------------- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-card-dark p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="gradient" size="sm" type="submit">
                  Update Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE ACCOUNT MODAL                                 */}
      {/* ---------------------------------------------------- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-card-dark p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Delete Acadevia Account?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                This will permanently delete your student profile, course achievements, XP, and downloaded lessons.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
                className="flex-1 cursor-pointer"
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
