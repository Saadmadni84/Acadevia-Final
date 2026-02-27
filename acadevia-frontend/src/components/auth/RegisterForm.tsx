import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, School, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/config/routes.config';
import { authService } from '@/services/auth.service';

interface StepProps {
  form: Record<string, string>;
  setField: (key: string, val: string) => void;
}

const steps = ['Personal Info', 'Location', 'School', 'Account'];

const Step1: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input label="Full Name" leftIcon={<User className="h-4 w-4" />} value={form.name || ''} onChange={e => setField('name', e.target.value)} required placeholder="Your full name" />
    <Input label="Phone" type="tel" leftIcon={<Phone className="h-4 w-4" />} value={form.phone || ''} onChange={e => setField('phone', e.target.value)} required placeholder="+91 XXXXX XXXXX" />
    <div>
      <label className="block text-sm font-medium mb-1.5">Role</label>
      <select className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary" value={form.role || 'STUDENT'} onChange={e => setField('role', e.target.value)}>
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
      </select>
    </div>
    {form.role === 'STUDENT' && (
      <div>
        <label className="block text-sm font-medium mb-1.5">Class</label>
        <select className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary" value={form.grade || ''} onChange={e => setField('grade', e.target.value)}>
          <option value="">Select class</option>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)}
        </select>
      </div>
    )}
  </div>
);

const Step2: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input label="State" leftIcon={<MapPin className="h-4 w-4" />} value={form.state || ''} onChange={e => setField('state', e.target.value)} required placeholder="Select state" />
    <Input label="City" leftIcon={<MapPin className="h-4 w-4" />} value={form.city || ''} onChange={e => setField('city', e.target.value)} required placeholder="Your city" />
    <Input label="Pin Code" value={form.pinCode || ''} onChange={e => setField('pinCode', e.target.value)} placeholder="6-digit pin code" />
  </div>
);

const Step3: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input label="School Name" leftIcon={<School className="h-4 w-4" />} value={form.schoolName || ''} onChange={e => setField('schoolName', e.target.value)} required placeholder="Search for your school" />
    <Input label="Board" value={form.board || ''} onChange={e => setField('board', e.target.value)} placeholder="CBSE / ICSE / State Board" />
  </div>
);

const Step4: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} value={form.email || ''} onChange={e => setField('email', e.target.value)} required placeholder="you@example.com" />
    <Input label="Password" type="password" leftIcon={<Lock className="h-4 w-4" />} value={form.password || ''} onChange={e => setField('password', e.target.value)} required placeholder="At least 8 characters" />
    <Input label="Confirm Password" type="password" leftIcon={<Lock className="h-4 w-4" />} value={form.confirmPassword || ''} onChange={e => setField('confirmPassword', e.target.value)} required placeholder="Confirm your password" />
  </div>
);

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({ role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (step < 3) { setStep(s => s + 1); return; }
    if (!form.name?.trim()) { setError('Full name is required.'); return; }
    if (!form.email?.trim()) { setError('Email is required.'); return; }
    if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
    if (!pwRegex.test(form.password)) { setError('Password must contain uppercase, lowercase, digit, and special character (@$!%*?&).'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.register(form);
      navigate(ROUTES.LOGIN, { state: { registered: true } });
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);
      const data = err?.response?.data;
      const msg = data?.message || data?.error || data?.detail || 
                  (data?.errors ? Object.values(data.errors).join(', ') : null) ||
                  (typeof data === 'string' ? data : null) ||
                  err?.message || 'Registration failed.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const StepComponent = [Step1, Step2, Step3, Step4][step];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Logo />
        <h2 className="mt-6 text-2xl font-bold">Create your account</h2>
        <p className="mt-2 text-sm text-gray-500">Step {step + 1} of 4: {steps[step]}</p>
      </div>

      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${i < step ? 'bg-secondary text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-secondary' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-accent/10 text-accent text-sm">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          <StepComponent form={form} setField={setField} />
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
            Back
          </Button>
        )}
        <Button variant="gradient" className="flex-1" onClick={handleSubmit} isLoading={loading} rightIcon={step < 3 ? <ChevronRight className="h-4 w-4" /> : <Check className="h-4 w-4" />}>
          {step < 3 ? 'Continue' : 'Create Account'}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary font-medium hover:underline">Sign In</Link>
      </p>
    </motion.div>
  );
};

export default RegisterForm;
