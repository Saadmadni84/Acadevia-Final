import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { getDashboardRoute } from '@/config/routes.config';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

const DashboardPage = () => {
    const user = useAuthStore((s) => s.user);
    const role = (user?.role || '').toUpperCase();

    // If a teacher or admin lands on /dashboard, redirect them to their own dashboard
    if (role === 'TEACHER' || role === 'ADMIN') {
        return <Navigate to={getDashboardRoute(role)} replace />;
    }

    return <StudentDashboard />;
};

export default DashboardPage;
