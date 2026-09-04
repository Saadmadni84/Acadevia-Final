import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Auth shell for login / register / forgot-password.
 *
 * Editorial black-and-white "study sheet" look: hairline rules,
 * an engineering-paper grid on the left column and a plain form
 * column on the right. No gradients, no glow, no stock AI styling.
 */
const AuthLayout: React.FC = () => (
  <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased [font-variant-numeric:tabular-nums]">
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row lg:border-x lg:border-neutral-200">
      {/* Left column — programme notes (desktop only) */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden border-b border-neutral-200 bg-white p-10 lg:flex lg:w-[44%] lg:border-b-0 lg:border-r xl:p-14"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Pin-hole details, like a sheet of punched paper */}
        <span aria-hidden="true" className="absolute left-6 top-6 h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span aria-hidden="true" className="absolute right-6 top-6 h-1.5 w-1.5 rounded-full bg-neutral-300" />

        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            Acadevia · Session notes
          </p>
          <h1 className="mt-8 font-serif text-4xl leading-[1.15] tracking-tight text-neutral-900 xl:text-5xl">
            Learn like it&rsquo;s a habit.
            <br />
            <span className="text-neutral-400">Win like it&rsquo;s a game.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-600">
            Small, consistent study sessions — tracked, scored and rewarded. Log in and pick up
            exactly where you left off.
          </p>
        </header>

        {/* Today's plan */}
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            Today&rsquo;s plan
          </p>
          <ol className="mt-6">
            {[
              ['01', 'Sign in with your class account'],
              ['02', 'Finish today\u2019s lesson — about 20 minutes'],
              ['03', 'Answer the recap quiz to bank your XP'],
            ].map(([num, label], i) => (
              <li key={num} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-neutral-800 font-mono text-[11px] font-semibold text-neutral-900">
                    {num}
                  </span>
                  {i < 2 && <span aria-hidden="true" className="my-1 w-px flex-1 bg-neutral-300" />}
                </div>
                <p className="pb-7 pt-1 text-sm text-neutral-700">{label}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="text-xs text-neutral-500">
          <p className="font-mono uppercase tracking-[0.2em]">Need help?</p>
          <p className="mt-2">
            Ask your teacher, or write to{' '}
            <span className="text-neutral-800 underline underline-offset-2">
              support@acadevia.in
            </span>
          </p>
        </footer>
      </aside>

      {/* Right column — form */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export { AuthLayout };
