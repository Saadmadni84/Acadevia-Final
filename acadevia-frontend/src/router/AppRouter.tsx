import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LazyRoute } from './LazyRoute';
import { ROUTES } from '@/config/routes.config';

// Public pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage.page'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage.page'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage.page'));
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage.page'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage.page'));

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
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<LazyRoute component={LandingPage} />} />
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
        <Route path={ROUTES.QUIZ} element={<LazyRoute component={QuizPage} />} />
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
