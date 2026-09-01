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

import { Footer } from '@/components/footer/Footer';

const LandingPage: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
    <LandingNavbar />
    <main className="flex-grow">
      <HeroSection />
      <FeatureCards />
      <PopularCourses />
      <QuizShowcase />
      <LeaderboardShowcase />
      <PlatformStats />
      <Testimonials />
      <FinalCTA />
    </main>
    <Footer showCTA={false} />
  </div>
);

export default LandingPage;
