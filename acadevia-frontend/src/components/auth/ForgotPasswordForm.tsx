import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/config/routes.config';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Logo />
        <h2 className="mt-6 text-2xl font-bold">{sent ? 'Check your email' : 'Forgot password?'}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {sent ? `We sent a reset link to ${email}` : "Enter your email and we'll send you a reset link"}
        </p>
      </div>
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-secondary" />
          </div>
          <Link to={ROUTES.LOGIN}><Button variant="gradient" className="w-full mt-4">Back to Login</Button></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@school.edu" />
          <Button type="submit" variant="gradient" className="w-full" isLoading={loading} rightIcon={<Send className="h-4 w-4" />}>
            Send Reset Link
          </Button>
        </form>
      )}
      {!sent && (
        <Link to={ROUTES.LOGIN} className="flex items-center justify-center gap-1 mt-6 text-sm text-gray-500 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
      )}
    </motion.div>
  );
};

export default ForgotPasswordForm;
