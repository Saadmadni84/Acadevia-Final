import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Activity,
  TrendingUp,
  GraduationCap,
  MapPin,
  Trophy,
  Building2,
} from 'lucide-react';

// --- Mock data ---
const dauWauMau = Array.from({ length: 30 }, (_, i) => ({
  day: `Feb ${i + 1}`,
  DAU: Math.floor(Math.random() * 3000) + 5000,
  WAU: Math.floor(Math.random() * 5000) + 15000,
  MAU: Math.floor(Math.random() * 10000) + 45000,
}));

const funnelData = [
  { stage: 'Enrolled', count: 12000 },
  { stage: 'Started', count: 9500 },
  { stage: '50% Done', count: 6200 },
  { stage: '75% Done', count: 4100 },
  { stage: 'Completed', count: 2800 },
];

const topCourses = [
  { name: 'Algebra Fundamentals', enrollments: 2450 },
  { name: 'Introduction to Physics', enrollments: 2120 },
  { name: 'English Grammar', enrollments: 1980 },
  { name: 'Indian History', enrollments: 1750 },
  { name: 'Chemical Bonding', enrollments: 1620 },
];

const topSchools = [
  { name: 'DPS Bangalore', students: 450, avgScore: 88 },
  { name: 'KV New Delhi', students: 380, avgScore: 85 },
  { name: 'DAV Chennai', students: 340, avgScore: 83 },
  { name: 'Ryan Mumbai', students: 320, avgScore: 82 },
  { name: 'Vidya Mandir Pune', students: 290, avgScore: 80 },
];

const stateHeatmap = [
  { state: 'Maharashtra', users: 12500, color: 'bg-indigo-600' },
  { state: 'Karnataka', users: 9800, color: 'bg-indigo-500' },
  { state: 'Tamil Nadu', users: 8600, color: 'bg-indigo-500' },
  { state: 'Delhi', users: 7200, color: 'bg-indigo-400' },
  { state: 'Uttar Pradesh', users: 6500, color: 'bg-indigo-400' },
  { state: 'Gujarat', users: 5100, color: 'bg-indigo-300' },
  { state: 'Rajasthan', users: 4200, color: 'bg-indigo-300' },
  { state: 'Kerala', users: 3800, color: 'bg-indigo-200 dark:bg-indigo-700' },
  { state: 'West Bengal', users: 3100, color: 'bg-indigo-200 dark:bg-indigo-700' },
  { state: 'Telangana', users: 2700, color: 'bg-indigo-100 dark:bg-indigo-800' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const AnimatedCounter: React.FC<{ target: number; label: string }> = ({ target, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
        {count.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
};

const PlatformAnalytics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.analytics.title', 'Platform Analytics')}
      </h2>

      {/* Real-time counters */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { icon: <Activity className="h-6 w-6 text-green-500" />, target: 1842, label: t('admin.analytics.activeNow', 'Active Now') },
          { icon: <Users className="h-6 w-6 text-blue-500" />, target: 67500, label: t('admin.analytics.totalUsers', 'Total Users') },
          { icon: <GraduationCap className="h-6 w-6 text-purple-500" />, target: 342, label: t('admin.analytics.totalCourses', 'Total Courses') },
          { icon: <Building2 className="h-6 w-6 text-amber-500" />, target: 156, label: t('admin.analytics.totalSchools', 'Total Schools') },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-2"
          >
            {stat.icon}
            <AnimatedCounter target={stat.target} label={stat.label} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* DAU/WAU/MAU Chart */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            {t('admin.analytics.dauWauMau', 'DAU / WAU / MAU')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dauWauMau}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" interval={4} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="DAU" stroke="#5B2C6F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="WAU" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="MAU" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Completion Funnel */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.analytics.funnel', 'Course Completion Funnel')}
          </h3>
          <div className="space-y-3">
            {funnelData.map((item, idx) => {
              const widthPercent = (item.count / funnelData[0].count) * 100;
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.stage}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-6 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `hsl(${240 - idx * 15}, 70%, ${55 + idx * 5}%)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* State-wise Heatmap (List) */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <MapPin className="h-5 w-5 text-red-500" />
            {t('admin.analytics.stateWise', 'State-wise Users')}
          </h3>
          <div className="space-y-2">
            {stateHeatmap.map((item) => (
              <div key={item.state} className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded ${item.color}`} />
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.state}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.users.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Courses */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <GraduationCap className="h-5 w-5 text-purple-500" />
            {t('admin.analytics.topCourses', 'Top Courses by Enrollment')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCourses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
              <Bar dataKey="enrollments" fill="#7B3F95" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Schools */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Trophy className="h-5 w-5 text-amber-500" />
            {t('admin.analytics.topSchools', 'Top Performing Schools')}
          </h3>
          <ul className="space-y-3" role="list">
            {topSchools.map((school, idx) => (
              <li key={school.name} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{school.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{school.students} students</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{school.avgScore}%</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { PlatformAnalytics };
export default PlatformAnalytics;
