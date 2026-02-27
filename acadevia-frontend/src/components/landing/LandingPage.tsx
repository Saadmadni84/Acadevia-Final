import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { FeatureCards } from './FeatureCards';
import { PopularCourses } from './PopularCourses';
import { QuizShowcase } from './QuizShowcase';
import { LeaderboardShowcase } from './LeaderboardShowcase';
import { PlatformStats } from './PlatformStats';
import { Testimonials } from './Testimonials';
import { FinalCTA } from './FinalCTA';

const LandingPage: React.FC = () => (
  <div className="min-h-screen">
    <LandingNavbar />
    <HeroSection />
    <FeatureCards />
    <PopularCourses />
    <QuizShowcase />
    <LeaderboardShowcase />
    <PlatformStats />
    <Testimonials />
    <FinalCTA />
    <footer className="bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 Acadevia. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Support</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
