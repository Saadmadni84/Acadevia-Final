import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Building2,
  GraduationCap,
  Users,
  Activity,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PlatformStats {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  dau: number;
}

interface UserActivityData {
  date: string;
  dau: number;
  wau: number;
  mau: number;
}

interface StateActivity {
  state: string;
  users: number;
  level: 'high' | 'medium' | 'low';
}

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
}

interface AdminDashboardProps {
  stats?: PlatformStats;
  userActivity?: UserActivityData[];
  stateActivities?: StateActivity[];
  moderationQueueCount?: number;
  systemHealth?: SystemHealth[];
  recentActivity?: ActivityItem[];
}

const defaultStats: PlatformStats = {
  totalSchools: 0,
  totalTeachers: 0,
  totalStudents: 0,
  dau: 0,
};

const statusIcon = {
  healthy: <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />,
  degraded: <AlertCircle className="h-4 w-4 text-yellow-500" aria-hidden="true" />,
  down: <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />,
};

const statusLabel = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

const activityTypeIcon = {
  info: <Activity className="h-4 w-4 text-blue-500" aria-hidden="true" />,
  warning: <AlertCircle className="h-4 w-4 text-yellow-500" aria-hidden="true" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />,
  error: <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />,
};

const heatLevelColors = {
  high: 'bg-green-500 dark:bg-green-600',
  medium: 'bg-yellow-400 dark:bg-yellow-500',
  low: 'bg-gray-300 dark:bg-gray-600',
};

export default function AdminDashboard({
  stats = defaultStats,
  userActivity = [],
  stateActivities = [],
  moderationQueueCount = 0,
  systemHealth = [],
  recentActivity = [],
}: AdminDashboardProps) {
  const { t } = useTranslation();

  const statCards = [
    {
      label: t('dashboard.admin.totalSchools', 'Total Schools'),
      value: stats.totalSchools.toLocaleString(),
      icon: Building2,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: t('dashboard.admin.totalTeachers', 'Teachers'),
      value: stats.totalTeachers.toLocaleString(),
      icon: GraduationCap,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: t('dashboard.admin.totalStudents', 'Students'),
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      label: t('dashboard.admin.dau', 'Daily Active Users'),
      value: stats.dau.toLocaleString(),
      icon: Activity,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* DAU/WAU/MAU Line Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.admin.userEngagement', 'User Engagement Trends')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.admin.userEngagement', 'User Engagement Trends')}
          </h2>
          {userActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="dau" stroke="#5B2C6F" strokeWidth={2} dot={false} name="DAU" />
                <Line type="monotone" dataKey="wau" stroke="#7B3F95" strokeWidth={2} dot={false} name="WAU" />
                <Line type="monotone" dataKey="mau" stroke="#B98FD1" strokeWidth={2} dot={false} name="MAU" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.admin.noActivityData', 'No activity data available')}
            </p>
          )}
        </motion.section>

        {/* State-wise Activity Heatmap (Simplified) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.admin.stateActivity', 'State-wise Activity')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.admin.stateActivity', 'State-wise Activity')}
          </h2>
          {stateActivities.length > 0 ? (
            <ul className="space-y-2" role="list">
              {stateActivities.map((sa) => (
                <li key={sa.state} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${heatLevelColors[sa.level]}`}
                      aria-hidden="true"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{sa.state}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sa.users.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.admin.noStates', 'No state data')}
            </p>
          )}

          {/* Moderation Queue */}
          <div className="mt-6 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('dashboard.admin.modQueue', 'Content Moderation Queue')}
                </span>
              </div>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {moderationQueueCount}
              </span>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.admin.systemHealth', 'System Health')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.admin.systemHealth', 'System Health')}
          </h2>
          {systemHealth.length > 0 ? (
            <ul className="space-y-3" role="list">
              {systemHealth.map((svc) => (
                <li
                  key={svc.service}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    {statusIcon[svc.status]}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{svc.service}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {svc.latency != null && <span>{svc.latency}ms</span>}
                    <span
                      className={`font-semibold ${
                        svc.status === 'healthy'
                          ? 'text-green-600 dark:text-green-400'
                          : svc.status === 'degraded'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {t(`dashboard.admin.status.${svc.status}`, statusLabel[svc.status])}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.admin.noHealth', 'No health data')}
            </p>
          )}
        </motion.section>

        {/* Recent Activity Feed */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.admin.recentActivity', 'Recent Activity')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.admin.recentActivity', 'Recent Activity')}
          </h2>
          {recentActivity.length > 0 ? (
            <ul className="space-y-3" role="list">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5">{activityTypeIcon[item.type]}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.message}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {item.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.admin.noRecentActivity', 'No recent activity')}
            </p>
          )}
        </motion.section>
      </div>
    </div>
  );
}
