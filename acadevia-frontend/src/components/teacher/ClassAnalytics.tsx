import React, { useMemo, useState, useEffect } from 'react';
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
  Filter,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService } from '@/services/data.service';
import { executeClass10Simulation } from '@/services/class10Simulation.service';

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
  const user = useAuthStore((s) => s.user);
  const teacherId = user?.id || '10';

  const [selectedClass, setSelectedClass] = useState<number>(user?.classGrade || 10);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [apiAnalytics, setApiAnalytics] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/v1/teacher/analytics?classGrade=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json?.success && json.data) {
          setApiAnalytics(json.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [selectedClass, selectedSubject]);

  // Real-time data-driven analytics directly from live API or persistent data store
  const analytics = useMemo(() => {
    if (apiAnalytics && Number(apiAnalytics.classGrade) === Number(selectedClass) && apiAnalytics.subject === selectedSubject) {
      return apiAnalytics;
    }
    return dataService.getClassAnalytics({
      teacherId,
      classGrade: selectedClass,
      subject: selectedSubject,
    });
  }, [apiAnalytics, teacherId, selectedClass, selectedSubject]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header with Class and Subject Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('teacher.analytics.title', 'Class Analytics')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real performance analytics for {analytics.totalStudents} enrolled students in Class {selectedClass}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Class:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {analytics.availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          {analytics.availableSubjects.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Subject:
              </span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {analytics.availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {import.meta.env.DEV && (
            <button
              onClick={() => {
                executeClass10Simulation();
                window.location.reload();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-dashed border-primary/30 transition-colors"
            >
              ⚡ Run Class 10 Simulation
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Average Score Bar Chart */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              {t('teacher.analytics.avgScore', 'Average Score by Quiz')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {analytics.quizScores.length} {analytics.quizScores.length === 1 ? 'Quiz' : 'Quizzes'}
            </span>
          </div>

          {analytics.quizScores.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4">
              <BookOpen className="h-10 w-10 text-gray-400 mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No quizzes found for Class {selectedClass}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Create and publish a quiz to start tracking average scores.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.quizScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.attempts} attempts)`,
                    'Average Score',
                  ]}
                  labelFormatter={(label: any, items: any[]) =>
                    items?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="avg" fill="#5B2C6F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Completion Donut */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('teacher.analytics.completion', 'Completion Rate')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {analytics.totalStudents} Assigned Students
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={analytics.completionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {analytics.completionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${val}% (${item.payload.count} students)`,
                  name,
                ]}
              />
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t('teacher.analytics.engagement', 'Engagement Trend (30 Days)')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Daily quiz submissions
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                interval={4}
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                formatter={(value: any) => [`${value} Submissions`, 'Engagement']}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Award className="h-5 w-5 text-amber-500" />
              {t('teacher.analytics.topPerformers', 'Top Performers')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {analytics.topPerformers.length} Active
            </span>
          </div>

          {analytics.topPerformers.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center p-4">
              <Award className="h-10 w-10 text-gray-400 mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No quiz submissions yet for this class
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Student scores will rank here once assessments are completed.
              </p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {analytics.topPerformers.map((student, idx) => (
                <li
                  key={student.id}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.xp.toLocaleString()} XP &bull; {student.quizzesTaken} {student.quizzesTaken === 1 ? 'quiz' : 'quizzes'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{student.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* At-Risk Students */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t('teacher.analytics.atRisk', 'At-Risk Students')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Passing threshold: 50%
            </span>
          </div>

          {analytics.atRiskStudents.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center p-4">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {t('teacher.analytics.noAtRisk', 'No at-risk students')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                All assessed students are performing at or above the 50% threshold.
              </p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {analytics.atRiskStudents.map((student) => (
                <li
                  key={student.id}
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
              {analytics.subjectComparison.map((sub) => (
                <div key={sub.subject} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-600 dark:text-gray-400 truncate">{sub.subject}</span>
                  <div className="flex-1 h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
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
