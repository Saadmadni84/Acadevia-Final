import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E8E3D8] shadow-[0_8px_32px_-8px_rgba(40,30,20,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-9 text-left">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-stone-900 tracking-tight leading-tight">
            {sent ? 'Check your email' : 'Reset your password'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            {sent
              ? `We have sent password reset instructions to ${email}`
              : "Enter the email associated with your account and we'll send you a recovery link."}
          </p>
        </div>

        {sent ? (
          <div className="space-y-6 pt-2">
            <div className="p-4 rounded-2xl bg-[#F4EFF7] border border-[#5B2C6F]/15 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#5B2C6F] shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700 leading-relaxed">
                If an account exists for <span className="font-semibold text-stone-900">{email}</span>, you will receive a password reset email shortly. Please also check your spam folder.
              </div>
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#5B2C6F] hover:bg-[#4C245D] active:scale-[0.99] transition shadow-[0_4px_14px_rgba(91,44,111,0.2)] hover:shadow-[0_6px_18px_rgba(91,44,111,0.28)]"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. aarav.sharma10@demo.acadevia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DDD3] bg-[#FAF9F6] text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5B2C6F]/15 focus:border-[#5B2C6F] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#5B2C6F] hover:bg-[#4C245D] active:scale-[0.99] transition shadow-[0_4px_14px_rgba(91,44,111,0.2)] hover:shadow-[0_6px_18px_rgba(91,44,111,0.28)] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Link...
                </span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#5B2C6F] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;
