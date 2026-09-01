import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { Footer } from '@/components/footer/Footer';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <LandingNavbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      {/* Show full footer without double CTA on landing page since landing already has FinalCTA */}
      <Footer showCTA={!isLandingPage} />
    </div>
  );
};
