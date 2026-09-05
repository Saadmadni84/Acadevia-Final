import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#5B2C6F]/15 selection:text-[#5B2C6F] relative overflow-x-hidden">
      {/* Ultra-subtle architectural warm dot matrix overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#D8D2C5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 60%, transparent 100%)',
        }}
      />

      {/* Organic ambient light blooms */}
      <div className="absolute -top-36 -left-36 w-[38rem] h-[38rem] bg-[#F2ECE0]/80 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-36 w-[40rem] h-[40rem] bg-[#EFE7D8]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 left-1/4 w-[34rem] h-[34rem] bg-[#F4EFE6]/80 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-7 pb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6A3280] to-[#4C215E] text-white flex items-center justify-center shadow-md shadow-[#5B2C6F]/20 group-hover:scale-[0.98] transition-transform">
            <span className="font-extrabold text-lg tracking-tight">A</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-xl tracking-tight text-stone-900">
              Acadevia
            </span>
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-[#5B2C6F]/10 text-[#5B2C6F] border border-[#5B2C6F]/15">
              Classes 1–12
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="text-xs font-semibold text-stone-600 hover:text-[#5B2C6F] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-[#E8E2D7] shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#5B2C6F]" />
            <span>Curriculum Catalog</span>
          </Link>
          <div className="h-4 w-px bg-[#E5E0D5] hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-[#E8E2D7] text-xs text-stone-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CBSE & State Boards Synced</span>
          </div>
        </div>
      </header>

      {/* Main Centered Content Canvas */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-xl">
          <Outlet />
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 border-t border-[#EAE5DA] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <ShieldCheck className="h-4 w-4 text-[#5B2C6F]" />
            CBSE & State Board Aligned • Classes 1–12
          </span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-stone-500 hidden sm:inline">
            Interactive NCERT Solutions & Lectures
          </span>
        </div>

        <div className="flex items-center gap-5 text-stone-500">
          <Link to="/about" className="hover:text-stone-900 transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
          <span className="text-stone-400 font-mono text-[11px]">© 2026 Acadevia</span>
        </div>
      </footer>
    </div>
  );
};

export { AuthLayout };
