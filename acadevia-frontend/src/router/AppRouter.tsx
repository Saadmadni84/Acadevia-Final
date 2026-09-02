import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LazyRoute } from './LazyRoute';
import { ROUTES } from '@/config/routes.config';
import { DynamicPublicPage } from '@/pages/public/DynamicPublicPage.page';

// Public pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage.page'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage.page'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage.page'));
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage.page'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage.page'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage.page'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage.page'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage.page'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage.page'));

// Student pages
const DashboardPage = lazy(() => import('@/pages/student/DashboardPage.page'));
const CoursesPage = lazy(() => import('@/pages/student/CoursesPage.page'));
const CourseDetailPage = lazy(() => import('@/pages/student/CourseDetailPage.page'));
const LessonPage = lazy(() => import('@/pages/student/LessonPage.page'));
const QuizPage = lazy(() => import('@/pages/student/QuizPage.page'));
const GamesPage = lazy(() => import('@/pages/student/GamesPage.page'));
const GamePlayPage = lazy(() => import('@/pages/student/GamePlayPage.page'));
const LeaderboardPage = lazy(() => import('@/pages/student/LeaderboardPage.page'));
const ProfilePage = lazy(() => import('@/pages/student/ProfilePage.page'));
const SettingsPage = lazy(() => import('@/pages/student/SettingsPage.page'));
const DownloadsPage = lazy(() => import('@/pages/student/DownloadsPage.page'));
const BadgesPage = lazy(() => import('@/pages/student/BadgesPage.page'));
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage.page'));

// Teacher pages
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage.page'));
const ContentUploadPage = lazy(() => import('@/pages/teacher/ContentUploadPage.page'));
const QuizBuilderPage = lazy(() => import('@/pages/teacher/QuizBuilderPage.page'));
const StudentProgressPage = lazy(() => import('@/pages/teacher/StudentProgressPage.page'));
const ClassAnalyticsPage = lazy(() => import('@/pages/teacher/ClassAnalyticsPage.page'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage.page'));
const SchoolManagementPage = lazy(() => import('@/pages/admin/SchoolManagementPage.page'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage.page'));
const ContentModerationPage = lazy(() => import('@/pages/admin/ContentModerationPage.page'));
const PlatformAnalyticsPage = lazy(() => import('@/pages/admin/PlatformAnalyticsPage.page'));
const SystemHealthPage = lazy(() => import('@/pages/admin/SystemHealthPage.page'));

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public Pages with PublicLayout (Navbar + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<LazyRoute component={LandingPage} />} />
        <Route path={ROUTES.ABOUT} element={<LazyRoute component={AboutPage} />} />
        <Route path={ROUTES.CONTACT} element={<LazyRoute component={ContactPage} />} />
        <Route path={ROUTES.PRIVACY_POLICY} element={<LazyRoute component={PrivacyPolicyPage} />} />
        <Route path={ROUTES.TERMS} element={<LazyRoute component={TermsPage} />} />

        {/* Feature & Resource Footer Routes */}
        <Route
          path={ROUTES.SUBJECTS}
          element={
            <DynamicPublicPage
              title="K-12 Subject Catalog"
              subtitle="Comprehensive curriculum coverage for Mathematics, Science, Social Sciences, Languages, and Computational Thinking."
              badge="Curriculum"
              description="Explore structured, board-aligned subjects across Grades 1–12 with interactive lessons, chapter summaries, and multilingual explanations designed to help students master core fundamentals."
              features={[
                'Aligned with CBSE, ICSE, and Indian State Board standards',
                'Visual simulations and step-by-step concept explainers',
                'Audio-visual content accessible in 28+ Indian languages',
                'Subject-wise practice quizzes with immediate feedback',
              ]}
              ctaLabel="Browse Subjects & Courses"
              ctaRoute={ROUTES.COURSES}
            />
          }
        />
        <Route
          path={ROUTES.COMPETENCY}
          element={
            <DynamicPublicPage
              title="Competency-Based Learning"
              subtitle="Moving beyond rote memorization to true conceptual mastery."
              badge="Personalization"
              description="Acadevia’s Competency Tracking engine monitors student understanding across granular micro-skills, detecting prerequisite learning gaps and adapting question difficulty dynamically."
              features={[
                'Micro-concept skill dependency trees',
                'Automated gap diagnostic and targeted remediation',
                'Detailed mastery heatmaps for parents and educators',
                'Continuous progress assessment without exam stress',
              ]}
              ctaLabel="Start Competency Assessment"
              ctaRoute={ROUTES.REGISTER}
            />
          }
        />
        <Route
          path={ROUTES.STREAKS}
          element={
            <DynamicPublicPage
              title="Learning Streaks & Habits"
              subtitle="Building consistent, lifelong learning habits through positive reinforcement."
              badge="Gamification"
              description="Daily practice is the key to academic success. Maintain your streak, unlock milestone multipliers, and earn reward points with as little as 15 minutes of focused learning every day."
              features={[
                'Daily streak tracking with grace freeze protection',
                'Milestone multipliers for XP and badge unlocks',
                'Personalized daily practice recommendations',
                'Friendly peer competitions and classroom streaks',
              ]}
              ctaLabel="Start Your Learning Streak"
              ctaRoute={ROUTES.REGISTER}
            />
          }
        />
        <Route
          path={ROUTES.ACHIEVEMENTS}
          element={
            <DynamicPublicPage
              title="Achievements & Rewards"
              subtitle="Celebrate every learning milestone with digital badges and trophies."
              badge="Rewards"
              description="From 'Math Prodigy' to 'Speed Quizzer', earn prestigious badges and level up your learner rank as you conquer lessons, master quizzes, and help classmates."
              features={[
                'Over 50+ unlockable collectible achievement badges',
                'Learner levels ranging from Beginner to Visionary',
                'Classroom recognition and certificate generation',
                'Special challenge quests and seasonal events',
              ]}
              ctaLabel="View Achievements"
              ctaRoute={ROUTES.REGISTER}
            />
          }
        />
        <Route
          path={ROUTES.STUDY_MATERIALS}
          element={
            <DynamicPublicPage
              title="Study Materials & Notes"
              subtitle="High-quality chapter summaries, formula sheets, and concept revisions."
              badge="Resources"
              description="Access curated study guides, downloadable PDF notes, and quick revision mind maps prepared by expert educators for all grade levels."
              features={[
                'Downloadable for offline study in the Acadevia mobile app',
                'Bilingual study notes with side-by-side vernacular translations',
                'Key formulas, diagrams, and exam revision cheatsheets',
                'Free access across all core subjects and classes',
              ]}
              ctaLabel="Explore Study Materials"
              ctaRoute={ROUTES.COURSES}
            />
          }
        />
        <Route
          path={ROUTES.PRACTICE_QUESTIONS}
          element={
            <DynamicPublicPage
              title="Practice Question Bank"
              subtitle="Thousands of curated questions with step-by-step verified solutions."
              badge="Practice"
              description="Sharpen your problem-solving abilities with diverse practice questions ranging from foundational exercises to advanced conceptual challenges."
              features={[
                'Categorized by difficulty: Easy, Medium, Hard, and Olympiad',
                'Instant step-by-step hints and detailed explanations',
                'Timer-based mock test modes for exam simulation',
                'Automated error analysis and revision queues',
              ]}
              ctaLabel="Start Practicing"
              ctaRoute={ROUTES.COURSES}
            />
          }
        />
        <Route
          path={ROUTES.MCQ_PRACTICE}
          element={
            <DynamicPublicPage
              title="Smart MCQ Practice"
              subtitle="Interactive multiple-choice evaluations designed for speed and accuracy."
              badge="Assessments"
              description="Test your understanding with randomized MCQ pools, adaptive pacing, and deep analytics to prepare for school exams and competitive entrance assessments."
              features={[
                'Instant grading with conceptual explanations for wrong answers',
                'Time-per-question analysis to improve test taking speed',
                'Topic-wise MCQ filters and custom test generators',
                'Leaderboard XP boosts on high accuracy runs',
              ]}
              ctaLabel="Take an MCQ Quiz"
              ctaRoute={ROUTES.COURSES}
            />
          }
        />
        <Route
          path={ROUTES.LEARNING_GUIDES}
          element={
            <DynamicPublicPage
              title="Learning & Exam Guides"
              subtitle="Structured study plans and pedagogical guidance for students and parents."
              badge="Guidance"
              description="Discover proven study strategies, time-management frameworks, and curriculum guides designed to reduce academic stress and boost performance."
              features={[
                'Effective revision techniques and memory retention tips',
                'Parent guidebooks for supporting homework without stress',
                'Subject-wise timetable templates and goal trackers',
                'Guidance on overcoming exam anxiety and mental fatigue',
              ]}
              ctaLabel="Read Learning Guides"
              ctaRoute={ROUTES.ABOUT}
            />
          }
        />
        <Route
          path={ROUTES.AI_LEARNING}
          element={
            <DynamicPublicPage
              title="AI Study Assistant"
              subtitle="24/7 intelligent educational companion for instant doubt clearance."
              badge="AI Technology"
              description="Got stuck on a complex physics problem or grammar rule? Acadevia’s AI Study Assistant guides you step-by-step through the solution using intuitive Socratic questioning."
              features={[
                'Socratic tutoring method that fosters critical thinking',
                'Multilingual explanations in your preferred mother tongue',
                'Homework assistance without giving away direct answers',
                'Safe, children-compliant educational AI guardrails',
              ]}
              ctaLabel="Try AI Assistant"
              ctaRoute={ROUTES.REGISTER}
            />
          }
        />
        <Route
          path={ROUTES.HELP_CENTER}
          element={
            <DynamicPublicPage
              title="Acadevia Help Center"
              subtitle="Guides, troubleshooting articles, and support resources for all users."
              badge="Support"
              description="Find step-by-step answers to common platform questions, account setup guides, offline sync instructions, and teacher classroom onboarding."
              features={[
                'Searchable knowledge base and feature tutorials',
                'Offline mode and device synchronization troubleshooting',
                'Parent portal monitoring and report card guides',
                'Teacher quiz builder and classroom roster guides',
              ]}
              ctaLabel="Contact Support Team"
              ctaRoute={ROUTES.CONTACT}
            />
          }
        />
        <Route
          path={ROUTES.FAQS}
          element={
            <DynamicPublicPage
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about Acadevia, courses, and accessibility."
              badge="FAQs"
              description="Got questions about our grade coverage, multilingual support, offline access, or subscription models? Check our comprehensive FAQ directory."
              features={[
                'Is Acadevia suitable for all school boards? Yes, CBSE, ICSE, and State Boards.',
                'Can I study without active internet? Yes, via our offline sync engine.',
                'How does multilingual translation work? We support 28+ Indian languages.',
                'Is student data secure? Yes, we follow strict K-12 privacy safeguards.',
              ]}
              ctaLabel="Have More Questions? Contact Us"
              ctaRoute={ROUTES.CONTACT}
            />
          }
        />
        <Route
          path={ROUTES.CAREERS}
          element={
            <DynamicPublicPage
              title="Careers at Acadevia"
              subtitle="Join our mission to transform learning for millions of students across India."
              badge="We're Hiring"
              description="We are a passionate team of educators, engineers, AI researchers, and designers dedicated to building the most engaging and accessible educational ecosystem in the world."
              features={[
                'Remote-first and collaborative engineering culture',
                'Opportunities in AI/ML, Full-Stack Engineering, and Curriculum Design',
                'High impact on grassroots educational equity in India',
                'Competitive compensation, health benefits, and learning allowances',
              ]}
              ctaLabel="Contact Talent Team"
              ctaRoute={ROUTES.CONTACT}
            />
          }
        />
        <Route
          path={ROUTES.BLOG}
          element={
            <DynamicPublicPage
              title="Acadevia Educational Blog"
              subtitle="Insights, research, and stories on EdTech, AI in education, and student success."
              badge="Articles & News"
              description="Stay updated with our latest articles exploring cognitive science, gamified pedagogy, multilingual educational tech, and classroom case studies."
              features={[
                'Deep dives into adaptive AI learning algorithms',
                'Tips for parents on fostering intrinsic motivation',
                'Teacher spotlight stories and classroom innovation',
                'Updates on new platform features and language packs',
              ]}
              ctaLabel="Read More on Acadevia"
              ctaRoute={ROUTES.ABOUT}
            />
          }
        />
        <Route
          path={ROUTES.SUCCESS_STORIES}
          element={
            <DynamicPublicPage
              title="Student & School Success Stories"
              subtitle="Real stories of academic growth, confidence, and achievement."
              badge="Testimonials"
              description="Read how students, teachers, and schools across India leverage Acadevia to improve grades, bridge foundational gaps, and make learning exciting every day."
              features={[
                'Over 10 Lakh+ students actively learning across 28+ languages',
                'Significant improvements in student quiz accuracy and retention',
                'Empowering rural classrooms with offline-first digital learning',
                'Inspiring journeys of students mastering STEM and languages',
              ]}
              ctaLabel="Start Your Success Story"
              ctaRoute={ROUTES.REGISTER}
            />
          }
        />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LazyRoute component={LoginPage} />} />
        <Route path={ROUTES.REGISTER} element={<LazyRoute component={RegisterPage} />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<LazyRoute component={ForgotPasswordPage} />} />
      </Route>

      {/* Student routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path={ROUTES.DASHBOARD} element={<LazyRoute component={DashboardPage} />} />
        <Route path={ROUTES.COURSES} element={<LazyRoute component={CoursesPage} />} />
        <Route path={ROUTES.COURSE_DETAIL} element={<LazyRoute component={CourseDetailPage} />} />
        <Route path={ROUTES.LESSON} element={<LazyRoute component={LessonPage} />} />
        <Route path={ROUTES.QUIZZES} element={<LazyRoute component={QuizPage} />} />
        <Route path={ROUTES.QUIZ_DIRECT} element={<LazyRoute component={QuizPage} />} />
        <Route path={ROUTES.QUIZ} element={<LazyRoute component={QuizPage} />} />
        <Route path="/quiz" element={<LazyRoute component={QuizPage} />} />
        <Route path="/quiz/:quizId" element={<LazyRoute component={QuizPage} />} />
        <Route path={ROUTES.GAMES} element={<LazyRoute component={GamesPage} />} />
        <Route path={ROUTES.GAME_PLAY} element={<LazyRoute component={GamePlayPage} />} />
        <Route path={ROUTES.LEADERBOARD} element={<LazyRoute component={LeaderboardPage} />} />
        <Route path={ROUTES.PROFILE} element={<LazyRoute component={ProfilePage} />} />
        <Route path={ROUTES.BADGES} element={<LazyRoute component={BadgesPage} />} />
        <Route path={ROUTES.SETTINGS} element={<LazyRoute component={SettingsPage} />} />
        <Route path={ROUTES.DOWNLOADS} element={<LazyRoute component={DownloadsPage} />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<LazyRoute component={NotificationsPage} />} />
      </Route>

      {/* Teacher routes */}
      <Route element={<ProtectedRoute requiredRole="TEACHER"><DashboardLayout /></ProtectedRoute>}>
        <Route path={ROUTES.TEACHER_DASHBOARD} element={<LazyRoute component={TeacherDashboardPage} />} />
        <Route path={ROUTES.TEACHER_CONTENT_UPLOAD} element={<LazyRoute component={ContentUploadPage} />} />
        <Route path={ROUTES.TEACHER_QUIZ_CREATE} element={<LazyRoute component={QuizBuilderPage} />} />
        <Route path={ROUTES.TEACHER_STUDENTS} element={<LazyRoute component={StudentProgressPage} />} />
        <Route path={ROUTES.TEACHER_ANALYTICS} element={<LazyRoute component={ClassAnalyticsPage} />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute requiredRole="ADMIN"><DashboardLayout /></ProtectedRoute>}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<LazyRoute component={AdminDashboardPage} />} />
        <Route path={ROUTES.ADMIN_SCHOOLS} element={<LazyRoute component={SchoolManagementPage} />} />
        <Route path={ROUTES.ADMIN_USERS} element={<LazyRoute component={UserManagementPage} />} />
        <Route path={ROUTES.ADMIN_CONTENT} element={<LazyRoute component={ContentModerationPage} />} />
        <Route path={ROUTES.ADMIN_ANALYTICS} element={<LazyRoute component={PlatformAnalyticsPage} />} />
        <Route path={ROUTES.ADMIN_SYSTEM} element={<LazyRoute component={SystemHealthPage} />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<LazyRoute component={NotFoundPage} />} />
    </Routes>
  </BrowserRouter>
);

export { AppRouter };
