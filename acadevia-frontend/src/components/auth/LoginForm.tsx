import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
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

const GoogleGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

const fieldLabelClass =
  'mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500';
const fieldInputClass =
  'w-full rounded-none border border-neutral-300 bg-white px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-0';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showMoreDemo, setShowMoreDemo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const executeLogin = async (credentials: { email: string; password: string }) => {
    setError('');
    setInfo('');
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
            phone: storedUser.phone || storedUser.phoneNumber || undefined,
            phoneNumber: storedUser.phone || storedUser.phoneNumber || undefined,
            schoolName: storedUser.schoolName,
            stateName: storedUser.stateName,
            cityName: storedUser.cityName,
            pinCode: storedUser.pinCode || storedUser.pincode || undefined,
            pincode: storedUser.pinCode || storedUser.pincode || undefined,
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
          phone: userRecord.phone || userRecord.phoneNumber || existingUser.phone || existingUser.phoneNumber,
          phoneNumber: userRecord.phone || userRecord.phoneNumber || existingUser.phone || existingUser.phoneNumber,
          schoolName: userRecord.schoolName || existingUser.schoolName,
          stateName: userRecord.stateName || existingUser.stateName,
          cityName: userRecord.cityName || existingUser.cityName,
          pinCode: userRecord.pinCode || userRecord.pincode || existingUser.pinCode || existingUser.pincode,
          pincode: userRecord.pinCode || userRecord.pincode || existingUser.pinCode || existingUser.pincode,
          classGrade: userRecord.classGrade ?? existingUser.classGrade,
          className: userRecord.className || (existingUser.classGrade ? `Class ${existingUser.classGrade}` : undefined),
        };
      } else {
        dataService.upsertUser({
          id: userRecord.id,
          email: userRecord.email,
          fullName: userRecord.fullName,
          role: userRecord.role as any,
          avatarUrl: userRecord.avatarUrl,
          phone: userRecord.phone,
          phoneNumber: userRecord.phone,
          schoolName: userRecord.schoolName,
          stateName: userRecord.stateName,
          cityName: userRecord.cityName,
          pinCode: userRecord.pinCode || userRecord.pincode,
          pincode: userRecord.pinCode || userRecord.pincode,
          classGrade: userRecord.classGrade ?? (userRecord.className ? parseInt(userRecord.className.replace(/\D/g, '')) || undefined : undefined),
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
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

  const handleGoogleClick = () => {
    setInfo('Google sign-in is not enabled yet. Use one of the Class 10 quick-access accounts above.');
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center bg-neutral-900 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="leading-none">
          <span className="block text-[15px] font-bold tracking-[0.28em] text-neutral-900">
            ACADEVIA
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
            Student portal
          </span>
        </div>
      </div>

      <h2 className="mt-8 font-serif text-3xl tracking-tight text-neutral-900">Welcome back.</h2>
      <p className="mt-2 text-sm text-neutral-500">
        Sign in to pick up your learning streak where you left off.
      </p>

      {/* Demo accounts — quick access */}
      <section className="mt-8 border border-neutral-300 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-700">
            Class 10 · Quick access
          </p>
          <button
            type="button"
            onClick={() => setShowMoreDemo((p) => !p)}
            className="flex cursor-pointer items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-neutral-900"
          >
            {showMoreDemo ? 'Collapse' : 'All 16 accounts'}
            {showMoreDemo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => executeLogin({ email: 'aarav.sharma10', password: 'Aarav@10' })}
            disabled={loading}
            className="group flex cursor-pointer items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 disabled:opacity-50 sm:border-b-0 sm:border-r"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-neutral-900">
                Aarav Sharma{' '}
                <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-wider text-neutral-400">
                  Sec A
                </span>
              </span>
              <span className="mt-0.5 block truncate font-mono text-[11px] text-neutral-500">
                aarav.sharma10 / Aarav@10
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-900" />
          </button>

          <button
            type="button"
            onClick={() => executeLogin({ email: 'rahul.math', password: 'Rahul@Math10' })}
            disabled={loading}
            className="group flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-neutral-900">
                Rahul Verma{' '}
                <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-wider text-neutral-400">
                  Teacher
                </span>
              </span>
              <span className="mt-0.5 block truncate font-mono text-[11px] text-neutral-500">
                rahul.math / Rahul@Math10
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-900" />
          </button>
        </div>

        {showMoreDemo && (
          <div className="border-t border-neutral-200 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Subject teachers
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {DEMO_TEACHERS.map((t) => (
                <button
                  key={t.username}
                  type="button"
                  onClick={() => executeLogin({ email: t.username, password: t.password })}
                  disabled={loading}
                  className="cursor-pointer border border-neutral-200 px-2.5 py-2 text-left transition-colors hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
                >
                  <span className="block truncate text-xs font-semibold text-neutral-900">{t.name}</span>
                  <span className="block truncate font-mono text-[10px] text-neutral-500">{t.sub}</span>
                </button>
              ))}
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Students — Class 10
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {DEMO_STUDENTS.map((s) => (
                <button
                  key={s.username}
                  type="button"
                  onClick={() => executeLogin({ email: s.username, password: s.password })}
                  disabled={loading}
                  className="cursor-pointer border border-neutral-200 px-2.5 py-2 text-left transition-colors hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
                >
                  <span className="block truncate text-xs font-semibold text-neutral-900">{s.name}</span>
                  <span className="block truncate font-mono text-[10px] text-neutral-500">
                    {s.sec} · {s.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="my-8 flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          or sign in manually
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-username" className={fieldLabelClass}>
            Username or email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="login-username"
              type="text"
              placeholder="aarav.sharma10 or rahul.math"
              className={`${fieldInputClass} pl-10`}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className={fieldLabelClass}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${fieldInputClass} pl-10 pr-10`}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex cursor-pointer select-none items-center gap-2 text-neutral-600">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 cursor-pointer rounded-none border-neutral-400 accent-neutral-900"
            />
            Remember me
          </label>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 hover:decoration-neutral-900"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 bg-neutral-900 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleGoogleClick}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 border border-neutral-300 bg-white px-4 py-3.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
        >
          <GoogleGlyph />
          Continue with Google
        </button>

        {info && (
          <p className="flex items-start gap-2 border border-neutral-300 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
            {info}
          </p>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        New to Acadevia?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
