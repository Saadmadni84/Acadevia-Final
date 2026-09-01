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
  <div className="w-full">
    <HeroSection />
    <FeatureCards />
    <PopularCourses />
    <QuizShowcase />
    <LeaderboardShowcase />
    <PlatformStats />
    <Testimonials />
    <FinalCTA />
  </div>
);

export default LandingPage;
