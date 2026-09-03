import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  School,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/config/routes.config';
import { authService } from '@/services/auth.service';

import { INDIAN_STATES, getCitiesForState } from '@/data/indiaLocations';

interface StepProps {
  form: Record<string, string>;
  setField: (key: string, val: string) => void;
}

const steps = ['Personal Info', 'Location', 'School', 'Account'];

/* -------------------------------------------------------------------------- */
/* STEP 1: PERSONAL INFO                                                      */
/* -------------------------------------------------------------------------- */

const Step1: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input
      label="Full Name"
      leftIcon={<User className="h-4 w-4" />}
      value={form.name || ''}
      onChange={(e) => setField('name', e.target.value)}
      required
      placeholder="Your full name"
    />

    <Input
      label="Phone"
      type="tel"
      leftIcon={<Phone className="h-4 w-4" />}
      value={form.phone || ''}
      onChange={(e) => setField('phone', e.target.value)}
      required
      placeholder="Enter phone number"
    />

    <div>
      <label className="block text-sm font-medium mb-1.5">
        Role
      </label>

      <select
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
        value={form.role || 'STUDENT'}
        onChange={(e) => setField('role', e.target.value)}
      >
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
      </select>
    </div>

    {form.role === 'STUDENT' && (
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Class
        </label>

        <select
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
          value={form.grade || ''}
          onChange={(e) => setField('grade', e.target.value)}
        >
          <option value="">Select class</option>

          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={String(i + 1)}>
              Class {i + 1}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>
);

/* -------------------------------------------------------------------------- */
/* STEP 2: LOCATION                                                           */
/* -------------------------------------------------------------------------- */

const Step2: React.FC<StepProps> = ({ form, setField }) => {
  const selectedState = form.state || '';
  const availableCities = selectedState
    ? getCitiesForState(selectedState)
    : [];

  const handleStateChange = (newState: string) => {
    setField('state', newState);

    // Clear city whenever state changes
    setField('city', '');
  };

  return (
    <div className="space-y-4">
      {/* STATE */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          State <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            required
          >
            <option value="">Select state</option>

            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* CITY */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          City <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary appearance-none cursor-pointer disabled:bg-gray-100 dark:disabled:bg-gray-800/40 disabled:cursor-not-allowed disabled:text-gray-400"
            value={form.city || ''}
            onChange={(e) => setField('city', e.target.value)}
            disabled={!selectedState}
            required
          >
            <option value="">
              {selectedState ? 'Select city' : 'Select state first'}
            </option>

            {availableCities.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* PIN CODE */}
      <div>
        <Input
          label="PIN Code"
          value={form.pinCode || ''}
          onChange={(e) => {
            // Allow numbers only and maximum 6 digits
            const digitsOnly = e.target.value
              .replace(/\D/g, '')
              .slice(0, 6);

            setField('pinCode', digitsOnly);
          }}
          placeholder="6-digit PIN code (e.g. 233001)"
          maxLength={6}
          required
        />

        <p className="text-[11px] text-gray-500 mt-1">
          Must be exactly 6 numeric digits.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* STEP 3: SCHOOL                                                             */
/* -------------------------------------------------------------------------- */

const Step3: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input
      label="School Name"
      leftIcon={<School className="h-4 w-4" />}
      value={form.schoolName || ''}
      onChange={(e) => setField('schoolName', e.target.value)}
      required
      placeholder="Search for your school"
    />

    <Input
      label="Board"
      value={form.board || ''}
      onChange={(e) => setField('board', e.target.value)}
      placeholder="CBSE / ICSE / State Board"
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/* STEP 4: ACCOUNT                                                            */
/* -------------------------------------------------------------------------- */

const Step4: React.FC<StepProps> = ({ form, setField }) => (
  <div className="space-y-4">
    <Input
      label="Email"
      type="email"
      leftIcon={<Mail className="h-4 w-4" />}
      value={form.email || ''}
      onChange={(e) => setField('email', e.target.value)}
      required
      placeholder="you@example.com"
    />

    <Input
      label="Password"
      type="password"
      leftIcon={<Lock className="h-4 w-4" />}
      value={form.password || ''}
      onChange={(e) => setField('password', e.target.value)}
      required
      placeholder="At least 8 characters"
    />

    <Input
      label="Confirm Password"
      type="password"
      leftIcon={<Lock className="h-4 w-4" />}
      value={form.confirmPassword || ''}
      onChange={(e) => setField('confirmPassword', e.target.value)}
      required
      placeholder="Confirm your password"
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/* REGISTER FORM                                                              */
/* -------------------------------------------------------------------------- */

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState<Record<string, string>>({
    role: 'STUDENT',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ------------------------------------------------------------------------ */
  /* UPDATE FORM FIELD                                                        */
  /* ------------------------------------------------------------------------ */

  const setField = (key: string, val: string) => {
    setError('');

    setForm((previousForm) => ({
      ...previousForm,
      [key]: val,
    }));
  };

  /* ------------------------------------------------------------------------ */
  /* VALIDATION                                                               */
  /* ------------------------------------------------------------------------ */

  const validateStep = (currStep: number): boolean => {
    /* STEP 1 */
    if (currStep === 0) {
      if (!form.name?.trim()) {
        setError('Full name is required.');
        return false;
      }

      if (!form.phone?.trim()) {
        setError('Phone number is required.');
        return false;
      }

      if (form.role === 'STUDENT' && !form.grade) {
        setError('Please select your class.');
        return false;
      }
    }

    /* STEP 2 */
    else if (currStep === 1) {
      if (!form.state?.trim()) {
        setError('Please select your state.');
        return false;
      }

      if (!form.city?.trim()) {
        setError('Please select your city.');
        return false;
      }

      if (!form.pinCode?.trim()) {
        setError('PIN Code is required.');
        return false;
      }

      if (!/^\d{6}$/.test(form.pinCode.trim())) {
        setError('PIN Code must contain exactly 6 digits.');
        return false;
      }
    }

    /* STEP 3 */
    else if (currStep === 2) {
      if (!form.schoolName?.trim()) {
        setError('School Name is required.');
        return false;
      }
    }

    return true;
  };

  /* ------------------------------------------------------------------------ */
  /* SUBMIT / NEXT                                                            */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async () => {
    setError('');

    /* Continue to next step */
    if (step < 3) {
      if (!validateStep(step)) {
        return;
      }

      setStep((currentStep) => currentStep + 1);
      return;
    }

    /* Validate all previous steps before final registration */
    if (!validateStep(0)) {
      return;
    }

    if (!validateStep(1)) {
      return;
    }

    if (!validateStep(2)) {
      return;
    }

    /* Email validation */
    if (!form.email?.trim()) {
      setError('Email is required.');
      return;
    }

    /* Password length */
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    /* Password strength */
    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;

    if (!pwRegex.test(form.password)) {
      setError(
        'Password must contain uppercase, lowercase, digit, and special character (@$!%*?&).'
      );
      return;
    }

    /* Confirm password */
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      /*
       * IMPORTANT:
       * The complete form object is sent to the backend.
       *
       * This includes:
       * name
       * phone
       * role
       * grade
       * state
       * city
       * pinCode
       * schoolName
       * board
       * email
       * password
       * confirmPassword
       */
      await authService.register(form);

      navigate(ROUTES.LOGIN, {
        state: {
          registered: true,
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);

      const data = err?.response?.data;

      const msg =
        data?.message ||
        data?.error ||
        data?.detail ||
        (data?.errors
          ? Object.values(data.errors).join(', ')
          : null) ||
        (typeof data === 'string' ? data : null) ||
        err?.message ||
        'Registration failed.';

      setError(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* CURRENT STEP COMPONENT                                                   */
  /* ------------------------------------------------------------------------ */

  const StepComponent = [Step1, Step2, Step3, Step4][step];

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* HEADER */}
      <div className="text-center mb-8">
        <Logo />

        <h2 className="mt-6 text-2xl font-bold">
          Create your account
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Step {step + 1} of 4: {steps[step]}
        </p>
      </div>

      {/* PROGRESS STEPS */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < step
                  ? 'bg-secondary text-white'
                  : i === step
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {i < step ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>

            {i < 3 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  i < step
                    ? 'bg-secondary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-accent/10 text-accent text-sm">
          {error}
        </div>
      )}

      {/* STEP CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <StepComponent
            form={form}
            setField={setField}
          />
        </motion.div>
      </AnimatePresence>

      {/* BUTTONS */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() =>
              setStep((currentStep) => currentStep - 1)
            }
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>
        )}

        <Button
          variant="gradient"
          className="flex-1"
          onClick={handleSubmit}
          isLoading={loading}
          rightIcon={
            step < 3 ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )
          }
        >
          {step < 3 ? 'Continue' : 'Create Account'}
        </Button>
      </div>

      {/* LOGIN LINK */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="text-primary font-medium hover:underline"
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  );
};

export default RegisterForm;