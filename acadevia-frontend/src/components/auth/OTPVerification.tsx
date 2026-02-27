import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck } from 'lucide-react';

interface OTPVerificationProps {
  phone?: string;
  email?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ phone, email, onVerify, onResend }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const interval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    try { await onVerify(code); } finally { setLoading(false); }
  };

  const handleResend = async () => {
    await onResend();
    setTimer(30);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto text-center">
      <Logo />
      <div className="w-16 h-16 mx-auto mt-6 rounded-full bg-primary/10 flex items-center justify-center">
        <ShieldCheck className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-bold">Verify OTP</h2>
      <p className="mt-2 text-sm text-gray-500">
        Enter the 6-digit code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{phone || email}</span>
      </p>
      <div className="flex justify-center gap-2 mt-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        ))}
      </div>
      <Button variant="gradient" className="w-full mt-8" isLoading={loading} onClick={handleSubmit}>
        Verify
      </Button>
      <p className="mt-4 text-sm text-gray-500">
        {timer > 0 ? `Resend in ${timer}s` : (
          <button className="text-primary font-medium hover:underline" onClick={handleResend}>Resend Code</button>
        )}
      </p>
    </motion.div>
  );
};

export default OTPVerification;
