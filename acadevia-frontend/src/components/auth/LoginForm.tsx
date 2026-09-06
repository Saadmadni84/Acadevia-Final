import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Search,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ROUTES, getDashboardRoute } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';
import { dataService } from '@/services/data.service';

const DEMO_STUDENTS = [
  { username: 'aarav.sharma10', password: 'Aarav@10', name: 'Aarav Sharma', sec: 'Sec A', rank: '#1', xp: '720 XP' },
  { username: 'ananya.verma10', password: 'Ananya@10', name: 'Ananya Verma', sec: 'Sec A', rank: '#2', xp: '680 XP' },
  { username: 'rohan.mehta10', password: 'Rohan@10', name: 'Rohan Mehta', sec: 'Sec A', rank: '#3', xp: '640 XP' },
  { username: 'priya.singh10', password: 'Priya@10', name: 'Priya Singh', sec: 'Sec A', rank: '#4', xp: '610 XP' },
  { username: 'arjun.patel10', password: 'Arjun@10', name: 'Arjun Patel', sec: 'Sec B', rank: '#5', xp: '590 XP' },
  { username: 'kavya.gupta10', password: 'Kavya@10', name: 'Kavya Gupta', sec: 'Sec B', rank: '#6', xp: '570 XP' },
  { username: 'aditya.kumar10', password: 'Aditya@10', name: 'Aditya Kumar', sec: 'Sec B', rank: '#7', xp: '540 XP' },
  { username: 'ishita.rao10', password: 'Ishita@10', name: 'Ishita Rao', sec: 'Sec B', rank: '#8', xp: '520 XP' },
  { username: 'vihaan.joshi10', password: 'Vihaan@10', name: 'Vihaan Joshi', sec: 'Sec C', rank: '#9', xp: '490 XP' },
  { username: 'meera.nair10', password: 'Meera@10', name: 'Meera Nair', sec: 'Sec C', rank: '#10', xp: '460 XP' },
];

const DEMO_TEACHERS = [
  { username: 'rahul.math', password: 'Rahul@Math10', name: 'Rahul Verma', sub: 'Mathematics', role: 'Head Faculty' },
  { username: 'neha.science', password: 'Neha@Sci10', name: 'Neha Gupta', sub: 'Science', role: 'Faculty' },
  { username: 'amit.english', password: 'Amit@Eng10', name: 'Amit Sharma', sub: 'English', role: 'Faculty' },
  { username: 'sunita.hindi', password: 'Sunita@Hin10', name: 'Sunita Mishra', sub: 'Hindi', role: 'Faculty' },
  { username: 'vikram.social', password: 'Vikram@SST10', name: 'Vikram Singh', sub: 'Social Science', role: 'Faculty' },
  { username: 'pooja.cs', password: 'Pooja@CS10', name: 'Pooja Patel', sub: 'Computer Science', role: 'Faculty' },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMoreDemo, setShowMoreDemo] = useState(false);
  const [demoTab, setDemoTab] = useState<'students' | 'teachers'>('students');
  const [demoSearch, setDemoSearch] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const executeLogin = async (credentials: { email: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      let userRecord: any;
      let accessToken = '';
      let refreshToken = '';

      const normalizedEmail = credentials.email.includes('@')
        ? credentials.email.trim()
        : `${credentials.email.trim()}@demo.acadevia.com`;

      try {
        const res = await authService.login({
          email: normalizedEmail,
          password: credentials.password,
        });
        const d: any = (res.data as any)?.data ? (res.data as any).data : res.data;
        const storedUser = dataService.getUserByEmail(credentials.email) || dataService.getUserByEmail(normalizedEmail);
        userRecord = d.user ?? {
          id: String(d.userId ?? d.id ?? storedUser?.id ?? ''),
          email: d.email ?? normalizedEmail,
          fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.fullName || storedUser?.fullName || '',
          role: d.role ?? storedUser?.role ?? 'STUDENT',
          languagePreference: d.preferredLanguage ?? d.languagePreference ?? 'en',
          phone: d.phone || d.phoneNumber || storedUser?.phone || storedUser?.phoneNumber || undefined,
          phoneNumber: d.phone || d.phoneNumber || storedUser?.phone || storedUser?.phoneNumber || undefined,
          schoolName: d.schoolName || storedUser?.schoolName || undefined,
          stateName: d.stateName || storedUser?.stateName || undefined,
          cityName: d.cityName || storedUser?.cityName || undefined,
          pinCode: d.pinCode || d.pincode || storedUser?.pinCode || storedUser?.pincode || undefined,
          pincode: d.pinCode || d.pincode || storedUser?.pinCode || storedUser?.pincode || undefined,
          classGrade: d.classGrade ?? (d.className ? parseInt(d.className.replace(/\D/g, '')) : storedUser?.classGrade),
          className: d.className || (d.classGrade ? `Class ${d.classGrade}` : (storedUser?.classGrade ? `Class ${storedUser.classGrade}` : undefined)),
        };
        accessToken = d.accessToken;
        refreshToken = d.refreshToken;
      } catch (apiErr: any) {
        console.warn('Backend API login failed, checking persistent database user lookup:', apiErr);
        const storedUser = dataService.getUserByEmail(credentials.email) || dataService.getUserByEmail(normalizedEmail);
        if (storedUser) {
          userRecord = storedUser;
          accessToken = 'demo-token';
          refreshToken = 'demo-refresh-token';
        } else {
          throw apiErr;
        }
      }

      if (!accessToken) {
        throw new Error('No access token received from authentication server.');
      }

      if (typeof (dataService as any)?.setCurrentUser === 'function') {
        (dataService as any).setCurrentUser(userRecord);
      } else if (typeof (dataService as any)?.upsertUser === 'function') {
        (dataService as any).upsertUser(userRecord);
      }

      setAuth(userRecord, accessToken, refreshToken);

      const targetRoute = getDashboardRoute(userRecord.role);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      console.error('Login process error:', err);
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout');
      const errorMessage = isTimeout
        ? 'Login request timed out. Please check your network connection and try again.'
        : err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter both your email/username and password.');
      return;
    }
    executeLogin(form);
  };

  const filteredStudents = DEMO_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(demoSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(demoSearch.toLowerCase()) ||
      s.sec.toLowerCase().includes(demoSearch.toLowerCase())
  );

  const filteredTeachers = DEMO_TEACHERS.filter(
    (t) =>
      t.name.toLowerCase().includes(demoSearch.toLowerCase()) ||
      t.username.toLowerCase().includes(demoSearch.toLowerCase()) ||
      t.sub.toLowerCase().includes(demoSearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Elevated Luxury Light Cream Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E7E2D6] shadow-[0_20px_50px_-16px_rgba(50,40,25,0.08),0_2px_6px_rgba(0,0,0,0.02)] p-6 sm:p-10 text-left">
        {/* Header section */}
        <div className="mb-7">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-stone-900 tracking-tight leading-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-500 leading-relaxed">
            Sign in to access your learning dashboard, interactive courses, and quests across Classes 1–12.
          </p>
        </div>

        {/* 1-Click Fast Pass Section (Dedicated to Class 10 Interactive Demo) */}
        <div className="mb-6 rounded-2xl border border-[#E8E2D7] bg-[#FAF8F5] p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5B2C6F]/10 text-[#5B2C6F] text-[11px] font-bold border border-[#5B2C6F]/15">
                <Sparkles className="h-3 w-3" />
                Class 10 Demo Pass
              </span>
              <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                1-Click Instant Sign In
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreDemo((p) => !p)}
              className="flex items-center gap-1 text-xs font-semibold text-[#5B2C6F] hover:text-[#4A205A] transition-colors cursor-pointer"
            >
              <span>{showMoreDemo ? 'Close directory' : 'All accounts (16)'}</span>
              {showMoreDemo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Primary Quick Demo User Cards (Stacked layout so names NEVER truncate) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Aarav Sharma (Student) */}
            <button
              type="button"
              onClick={() => executeLogin({ email: 'aarav.sharma10', password: 'Aarav@10' })}
              disabled={loading}
              className="group p-3.5 rounded-2xl border border-[#E7E2D6] bg-white hover:border-[#5B2C6F]/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-left cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6A3280] to-[#4C215E] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                  AS
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <Zap className="h-2.5 w-2.5 fill-current" />
                  720 XP
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900 group-hover:text-[#5B2C6F] transition-colors">
                Aarav Sharma
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Student • Class 10-A
              </p>
            </button>

            {/* Rahul Verma (Teacher) */}
            <button
              type="button"
              onClick={() => executeLogin({ email: 'rahul.math', password: 'Rahul@Math10' })}
              disabled={loading}
              className="group p-3.5 rounded-2xl border border-[#E7E2D6] bg-white hover:border-[#5B2C6F]/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-left cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-stone-700 to-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                  RV
                </div>
                <span className="text-[10px] font-semibold text-[#5B2C6F] bg-[#F5EFF8] border border-[#5B2C6F]/20 px-2 py-0.5 rounded-full">
                  Faculty
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900 group-hover:text-[#5B2C6F] transition-colors">
                Rahul Verma
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Mathematics Lead
              </p>
            </button>
          </div>

          {/* Expandable Directory */}
          <AnimatePresence>
            {showMoreDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-3 border-t border-[#EAE4D8] space-y-2.5 overflow-hidden"
              >
                {/* Segmented control tabs */}
                <div className="flex items-center gap-1.5 bg-[#EFECE5] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDemoTab('students')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      demoTab === 'students'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    Students ({DEMO_STUDENTS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab('teachers')}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      demoTab === 'teachers'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    Faculty ({DEMO_TEACHERS.length})
                  </button>
                </div>

                {/* Search filter input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder={`Search ${demoTab}...`}
                    value={demoSearch}
                    onChange={(e) => setDemoSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E0DAD0] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5B2C6F] text-stone-900 placeholder:text-stone-400"
                  />
                </div>

                {/* Accounts list */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {demoTab === 'students' ? (
                    filteredStudents.map((s) => (
                      <button
                        key={s.username}
                        type="button"
                        onClick={() => executeLogin({ email: s.username, password: s.password })}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-[#EAE4D8] bg-white hover:border-[#5B2C6F]/40 text-left transition text-xs cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-stone-900 block truncate">{s.name}</span>
                          <span className="text-[10px] text-stone-500">{s.sec} • {s.username}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#5B2C6F]">
                          {s.xp}
                        </span>
                      </button>
                    ))
                  ) : (
                    filteredTeachers.map((t) => (
                      <button
                        key={t.username}
                        type="button"
                        onClick={() => executeLogin({ email: t.username, password: t.password })}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-[#EAE4D8] bg-white hover:border-[#5B2C6F]/40 text-left transition text-xs cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-stone-900 block truncate">{t.name}</span>
                          <span className="text-[10px] text-stone-500">{t.role} • {t.username}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#5B2C6F]">
                          {t.sub}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EAE4D8]" />
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold tracking-wider uppercase">
            <span className="bg-white px-3 text-stone-400">
              or sign in with credentials
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Username or Email Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-stone-700">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                required
                placeholder="e.g. your.username or name@school.edu"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DDD3] bg-[#FAF9F6] text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5B2C6F]/15 focus:border-[#5B2C6F] transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-stone-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#E2DDD3] bg-[#FAF9F6] text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5B2C6F]/15 focus:border-[#5B2C6F] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe((p) => !p)}
                className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                  rememberMe
                    ? 'bg-[#5B2C6F] border-[#5B2C6F] text-white'
                    : 'border-[#D5CEC2] bg-white'
                }`}
              >
                {rememberMe && <Check className="h-3 w-3" />}
              </button>
              <span className="text-stone-600">Remember this device</span>
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="font-medium text-[#5B2C6F] hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6A3280] to-[#4C215E] hover:from-[#58296B] hover:to-[#3E1A4E] active:scale-[0.99] transition shadow-[0_4px_14px_rgba(91,44,111,0.25)] hover:shadow-[0_6px_18px_rgba(91,44,111,0.32)] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div className="mt-7 pt-5 border-t border-[#EAE5DA] text-center text-xs text-stone-500 space-y-1.5">
          <p>
            Don't have an account yet?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-[#5B2C6F] hover:underline"
            >
              Create free account
            </Link>
          </p>
          <p className="text-[11px] text-stone-400">
            CBSE & State Boards Synced • Classes 1–12 • End-to-End Encrypted
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
