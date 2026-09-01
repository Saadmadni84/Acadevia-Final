import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';

const quizScores = [
  { name: 'Quiz 1', avg: 78 },
  { name: 'Quiz 2', avg: 82 },
  { name: 'Quiz 3', avg: 65 },
  { name: 'Quiz 4', avg: 91 },
  { name: 'Quiz 5', avg: 74 },
  { name: 'Quiz 6', avg: 88 },
];

const completionData = [
  { name: 'Completed', value: 68, color: '#5B2C6F' },
  { name: 'In Progress', value: 22, color: '#f59e0b' },
  { name: 'Not Started', value: 10, color: '#ef4444' },
];

const engagementTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  engagement: Math.floor(Math.random() * 30) + 50 + Math.floor(i * 0.5),
}));

const topPerformers = [
  { name: 'Riya Sharma', xp: 4850, score: 96 },
  { name: 'Arjun Patel', xp: 4620, score: 94 },
  { name: 'Priya Nair', xp: 4510, score: 93 },
  { name: 'Vikram Singh', xp: 4300, score: 91 },
  { name: 'Ananya Gupta', xp: 4150, score: 90 },
];

const atRiskStudents = [
  { name: 'Rahul Kumar', lastActive: '5 days ago', score: 42 },
  { name: 'Sneha Joshi', lastActive: '7 days ago', score: 38 },
  { name: 'Deepak Verma', lastActive: '4 days ago', score: 45 },
];

const subjectComparison = [
  { subject: 'Math', score: 82 },
  { subject: 'Science', score: 76 },
  { subject: 'English', score: 88 },
  { subject: 'Hindi', score: 84 },
  { subject: 'Social', score: 71 },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const ClassAnalytics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('teacher.analytics.title', 'Class Analytics')}
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Average Score Bar Chart */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            {t('teacher.analytics.avgScore', 'Average Score by Quiz')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={quizScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Bar dataKey="avg" fill="#5B2C6F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Completion Donut */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('teacher.analytics.completion', 'Completion Rate')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {completionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Engagement Trend */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {t('teacher.analytics.engagement', 'Engagement Trend (30 Days)')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                interval={4}
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Award className="h-5 w-5 text-amber-500" />
            {t('teacher.analytics.topPerformers', 'Top Performers')}
          </h3>
          <ul className="space-y-3" role="list">
            {topPerformers.map((student, idx) => (
              <li
                key={student.name}
                className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : idx === 1
                        ? 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.xp.toLocaleString()} XP</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{student.score}%</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* At-Risk Students */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('teacher.analytics.atRisk', 'At-Risk Students')}
          </h3>
          {atRiskStudents.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t('teacher.analytics.noAtRisk', 'No at-risk students')}
            </p>
          ) : (
            <ul className="space-y-3" role="list">
              {atRiskStudents.map((student) => (
                <li
                  key={student.name}
                  className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('teacher.analytics.lastActive', 'Last active')}: {student.lastActive}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">{student.score}%</span>
                </li>
              ))}
            </ul>
          )}

          {/* Subject Comparison */}
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              {t('teacher.analytics.subjectWise', 'Subject-wise Performance')}
            </h4>
            <div className="space-y-2">
              {subjectComparison.map((sub) => (
                <div key={sub.subject} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-gray-600 dark:text-gray-400">{sub.subject}</span>
                  <div className="flex-1 h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                    {sub.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { ClassAnalytics };
export default ClassAnalytics;
export { ClassAnalytics };
