import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap, Briefcase, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/common/Logo';
import { ROUTES, getDashboardRoute } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';
import { dataService } from '@/services/data.service';

const DEMO_STUDENTS = [
  { username: 'aarav.sharma10', password: 'Aarav@10', name: 'Aarav Sharma', sec: 'Sec A' },
  { username: 'ananya.verma10', password: 'Ananya@10', name: 'Ananya Verma', sec: 'Sec A' },
  { username: 'rohan.mehta10', password: 'Rohan@10', name: 'Rohan Mehta', sec: 'Sec A' },
  { username: 'priya.singh10', password: 'Priya@10', name: 'Priya Singh', sec: 'Sec A' },
  { username: 'arjun.patel10', password: 'Arjun@10', name: 'Arjun Patel', sec: 'Sec B' },
  { username: 'kavya.gupta10', password: 'Kavya@10', name: 'Kavya Gupta', sec: 'Sec B' },
  { username: 'aditya.kumar10', password: 'Aditya@10', name: 'Aditya Kumar', sec: 'Sec B' },
  { username: 'ishita.rao10', password: 'Ishita@10', name: 'Ishita Rao', sec: 'Sec B' },
  { username: 'vihaan.joshi10', password: 'Vihaan@10', name: 'Vihaan Joshi', sec: 'Sec C' },
  { username: 'meera.nair10', password: 'Meera@10', name: 'Meera Nair', sec: 'Sec C' },
];

const DEMO_TEACHERS = [
  { username: 'rahul.math', password: 'Rahul@Math10', name: 'Rahul Verma', sub: 'Mathematics' },
  { username: 'neha.science', password: 'Neha@Sci10', name: 'Neha Gupta', sub: 'Science' },
  { username: 'amit.english', password: 'Amit@Eng10', name: 'Amit Sharma', sub: 'English' },
  { username: 'sunita.hindi', password: 'Sunita@Hin10', name: 'Sunita Mishra', sub: 'Hindi' },
  { username: 'vikram.social', password: 'Vikram@SST10', name: 'Vikram Singh', sub: 'Social Science' },
  { username: 'pooja.cs', password: 'Pooja@CS10', name: 'Pooja Patel', sub: 'Computer Science' },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMoreDemo, setShowMoreDemo] = useState(false);

  const executeLogin = async (credentials: { email: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      let userRecord: any;
      let accessToken = 'demo-token';
      let refreshToken = 'demo-refresh-token';

      const normalizedEmail = credentials.email.includes('@')
        ? credentials.email.trim()
        : `${credentials.email.trim()}@demo.acadevia.com`;

      try {
        const res = await authService.login({
          email: normalizedEmail,
          password: credentials.password,
        });
        const d: any = (res.data as any)?.data ? (res.data as any).data : res.data;
        userRecord = d.user ?? {
          id: String(d.userId ?? d.id ?? ''),
          email: d.email ?? normalizedEmail,
          fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.fullName || '',
          role: d.role ?? 'STUDENT',
          languagePreference: d.preferredLanguage ?? d.languagePreference ?? 'en',
          schoolName: d.schoolName || 'Acadevia Demo School',
          classGrade: d.classGrade ?? (d.className ? parseInt(d.className.replace(/\D/g, '')) : undefined),
          className: d.classGrade ? `Class ${d.classGrade}` : d.className,
        };
        accessToken = d.accessToken;
        refreshToken = d.refreshToken;
      } catch (apiErr) {
        console.warn('Backend API login failed, falling back to data layer:', apiErr);
        // Fallback to data service user store
        const storedUser = dataService.getUserByEmail(credentials.email) || dataService.getUserByEmail(normalizedEmail);
        if (storedUser) {
          userRecord = {
            id: storedUser.id,
            email: storedUser.email,
            fullName: storedUser.fullName,
            role: storedUser.role,
            avatarUrl: storedUser.avatarUrl,
            schoolName: storedUser.schoolName,
            classGrade: storedUser.classGrade,
            className: storedUser.classGrade ? `Class ${storedUser.classGrade}` : undefined,
            languagePreference: 'en',
          };
        } else {
          throw apiErr;
        }
      }

      // Sync data layer with logged in user
      const existingUser = dataService.getUserById(userRecord.id) || dataService.getUserByEmail(normalizedEmail);
      if (existingUser) {
        userRecord = {
          ...userRecord,
          avatarUrl: userRecord.avatarUrl || existingUser.avatarUrl,
          classGrade: userRecord.classGrade || existingUser.classGrade,
          className: userRecord.className || (existingUser.classGrade ? `Class ${existingUser.classGrade}` : undefined),
        };
      } else {
        dataService.upsertUser({
          id: userRecord.id,
          email: userRecord.email,
          fullName: userRecord.fullName,
          role: userRecord.role as any,
          avatarUrl: userRecord.avatarUrl,
          schoolName: userRecord.schoolName || 'Acadevia Demo School',
          classGrade: userRecord.classGrade || (userRecord.className ? parseInt(userRecord.className.replace(/\D/g, '')) || 10 : undefined),
          joinDate: 'January 2024',
          totalXP: 0,
          currentLevel: 1,
          currentStreak: 0,
          lessonsCompleted: 0,
        });
      }

      setAuth(userRecord, accessToken, refreshToken);
      // Route is determined strictly by the user's stored role
      navigate(getDashboardRoute(userRecord.role));
    } catch (err: any) {
      console.error('Login error:', err?.response?.data ?? err);
      setError(err?.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(form);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Logo />
        <h2 className="mt-6 text-2xl font-bold">Welcome back!</h2>
        <p className="mt-2 text-sm text-gray-500">Sign in to continue your learning journey</p>
      </div>

      {/* Demo Accounts Quick Login Box */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-[#5B2C6F]/5 to-secondary/10 border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary dark:text-[#D4A843]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Class 10 Demo Logins</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMoreDemo((p) => !p)}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
          >
            <span>{showMoreDemo ? 'Less' : 'All Accounts (16)'}</span>
            {showMoreDemo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Primary 1-Click Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => executeLogin({ email: 'aarav.sharma10', password: 'Aarav@10' })}
            disabled={loading}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:border-primary/50 text-left transition hover:shadow-xs disabled:opacity-50 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-primary">
                Demo Student
              </p>
              <p className="text-[10px] text-gray-500 truncate">Aarav (Class 10)</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => executeLogin({ email: 'rahul.math', password: 'Rahul@Math10' })}
            disabled={loading}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:border-primary/50 text-left transition hover:shadow-xs disabled:opacity-50 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-primary">
                Demo Teacher
              </p>
              <p className="text-[10px] text-gray-500 truncate">Rahul Verma (Math)</p>
            </div>
          </button>
        </div>

        {/* Expandable List of All 16 Demo Accounts */}
        <AnimatePresence>
          {showMoreDemo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2 border-t border-primary/10 overflow-hidden"
            >
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Class 10 Subject Teachers:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_TEACHERS.map((t) => (
                    <button
                      key={t.username}
                      type="button"
                      onClick={() => executeLogin({ email: t.username, password: t.password })}
                      disabled={loading}
                      className="p-1.5 text-left rounded-lg bg-white/80 dark:bg-card-dark/80 border border-gray-200 dark:border-gray-700 hover:border-primary text-[11px] truncate cursor-pointer transition"
                    >
                      <span className="font-semibold block truncate text-gray-800 dark:text-gray-200">{t.name}</span>
                      <span className="text-[10px] text-primary">{t.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Class 10 Students (10 Accounts):
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_STUDENTS.map((s) => (
                    <button
                      key={s.username}
                      type="button"
                      onClick={() => executeLogin({ email: s.username, password: s.password })}
                      disabled={loading}
                      className="p-1.5 text-left rounded-lg bg-white/80 dark:bg-card-dark/80 border border-gray-200 dark:border-gray-700 hover:border-primary text-[11px] truncate cursor-pointer transition"
                    >
                      <span className="font-semibold block truncate text-gray-800 dark:text-gray-200">{s.name}</span>
                      <span className="text-[10px] text-gray-500">{s.sec} • {s.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-background-dark px-2 text-gray-400">
            Or sign in with username or email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-accent/10 text-accent text-sm">{error}</div>}
        <Input
          label="Username or Email"
          type="text"
          placeholder="e.g. aarav.sharma10 or rahul.math"
          leftIcon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" variant="gradient" className="w-full" isLoading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary font-medium hover:underline">Sign Up</Link>
      </p>
    </motion.div>
  );
};

export default LoginForm;
