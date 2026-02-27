import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/common/Logo';
import { ROUTES, getDashboardRoute } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form);
      // Backend returns flat response: { userId, email, firstName, lastName, role, accessToken, refreshToken }
      const d: any = (res.data as any)?.data ? (res.data as any).data : res.data;
      const user = d.user ?? {
        id: String(d.userId ?? d.id ?? ''),
        email: d.email ?? '',
        fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.fullName || '',
        role: d.role ?? 'STUDENT',
        languagePreference: d.preferredLanguage ?? d.languagePreference ?? 'en',
      };
      setAuth(user, d.accessToken, d.refreshToken);
      navigate(getDashboardRoute(user.role));
    } catch (err: any) {
      console.error('Login error:', err?.response?.data ?? err);
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Logo />
        <h2 className="mt-6 text-2xl font-bold">Welcome back!</h2>
        <p className="mt-2 text-sm text-gray-500">Sign in to continue your learning journey</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-accent/10 text-accent text-sm">{error}</div>}
        <Input label="Email" type="email" placeholder="you@school.edu" leftIcon={<Mail className="h-4 w-4" />} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
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
