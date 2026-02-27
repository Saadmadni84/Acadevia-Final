import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  BarChart3,
  BookOpen,
  AlertTriangle,
  Upload,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TeacherStats {
  totalStudents: number;
  activeToday: number;
  avgScore: number;
  coursesPublished: number;
}

interface ClassPerformance {
  className: string;
  avgScore: number;
  studentCount: number;
}

interface QuizResult {
  id: string;
  studentName: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

interface StrugglingStudent {
  id: string;
  name: string;
  avgScore: number;
  missedAssignments: number;
  lastActive: string;
}

interface TeacherDashboardProps {
  stats?: TeacherStats;
  classPerformance?: ClassPerformance[];
  recentQuizResults?: QuizResult[];
  strugglingStudents?: StrugglingStudent[];
}

const CHART_COLORS = ['#5B2C6F', '#7B3F95', '#9B5FB8', '#B98FD1', '#D1B7E1'];

const defaultStats: TeacherStats = {
  totalStudents: 0,
  activeToday: 0,
  avgScore: 0,
  coursesPublished: 0,
};

export default function TeacherDashboard({
  stats = defaultStats,
  classPerformance = [],
  recentQuizResults = [],
  strugglingStudents = [],
}: TeacherDashboardProps) {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const statCards = [
    {
      label: t('dashboard.teacher.totalStudents', 'Total Students'),
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: t('dashboard.teacher.activeToday', 'Active Today'),
      value: stats.activeToday,
      icon: UserCheck,
      color: 'text-green-500 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/40',
    },
    {
      label: t('dashboard.teacher.avgScore', 'Avg Score'),
      value: `${stats.avgScore}%`,
      icon: BarChart3,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      label: t('dashboard.teacher.coursesPublished', 'Courses Published'),
      value: stats.coursesPublished,
      icon: BookOpen,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
    },
  ];

  const contentShortcuts = [
    { label: t('dashboard.teacher.uploadVideo', 'Upload Video'), icon: Upload },
    { label: t('dashboard.teacher.createQuiz', 'Create Quiz'), icon: BookOpen },
    { label: t('dashboard.teacher.viewReports', 'View Reports'), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
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
        {/* Class-wise Performance Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.teacher.classPerformance', 'Class-wise Performance')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.teacher.classPerformance', 'Class-wise Performance')}
          </h2>
          {classPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classPerformance} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="className"
                  tick={{ fontSize: 12 }}
                  className="fill-gray-600 dark:fill-gray-400"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className="fill-gray-600 dark:fill-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg, #fff)',
                    borderColor: 'var(--color-border, #e5e7eb)',
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="avgScore"
                  name={t('dashboard.teacher.avgScore', 'Avg Score')}
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => setSelectedClass(data.className)}
                  cursor="pointer"
                >
                  {classPerformance.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.teacher.noData', 'No performance data yet')}
            </p>
          )}
          {selectedClass && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.teacher.selectedClass', 'Selected')}: {selectedClass}
            </p>
          )}
        </motion.section>

        {/* Content Upload Shortcuts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.teacher.quickActions', 'Quick Actions')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.teacher.quickActions', 'Quick Actions')}
          </h2>
          <div className="space-y-3">
            {contentShortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <shortcut.icon className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {shortcut.label}
                </span>
              </button>
            ))}
          </div>

          {/* Engagement Metrics */}
          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              {t('dashboard.teacher.engagement', 'Engagement')}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {t('dashboard.teacher.quizCompletion', 'Quiz Completion')}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">78%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: '78%' }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {t('dashboard.teacher.assignmentSubmission', 'Assignment Submission')}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-[#5B2C6F]" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quiz Results */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.teacher.recentQuizResults', 'Recent Quiz Results')}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.teacher.recentQuizResults', 'Recent Quiz Results')}
          </h2>
          {recentQuizResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">
                      {t('dashboard.teacher.student', 'Student')}
                    </th>
                    <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">
                      {t('dashboard.teacher.quiz', 'Quiz')}
                    </th>
                    <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                      {t('dashboard.teacher.score', 'Score')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentQuizResults.map((result) => {
                    const pct = Math.round((result.score / result.maxScore) * 100);
                    return (
                      <tr key={result.id}>
                        <td className="py-2 text-gray-900 dark:text-white">{result.studentName}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-300">{result.quizTitle}</td>
                        <td className="py-2 text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                              pct >= 80
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                : pct >= 50
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            }`}
                          >
                            {result.score}/{result.maxScore}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.teacher.noQuizResults', 'No recent results')}
            </p>
          )}
        </motion.section>

        {/* Struggling Students Alerts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label={t('dashboard.teacher.strugglingStudents', 'Students Needing Attention')}
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            {t('dashboard.teacher.strugglingStudents', 'Students Needing Attention')}
          </h2>
          {strugglingStudents.length > 0 ? (
            <ul className="space-y-3" role="list">
              {strugglingStudents.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('dashboard.teacher.avgScoreLabel', 'Avg')}: {student.avgScore}% ·{' '}
                      {student.missedAssignments}{' '}
                      {t('dashboard.teacher.missed', 'missed')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {student.lastActive}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-gray-400 dark:text-gray-500">
              {t('dashboard.teacher.allGood', 'All students are on track!')}
            </p>
          )}
        </motion.section>
      </div>
    </div>
  );
}
