import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronRight,
  Filter,
  Flame,
  Trophy,
  X,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  avatar: string;
  className: string;
  section: string;
  totalXP: number;
  quizzesCompleted: number;
  avgScore: number;
  streak: number;
}

const mockStudents: Student[] = Array.from({ length: 25 }, (_, i) => ({
  id: `s-${i + 1}`,
  name: `Student ${i + 1}`,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Student${i + 1}`,
  className: `Class ${Math.floor(Math.random() * 4) + 6}`,
  section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
  totalXP: Math.floor(Math.random() * 5000) + 500,
  quizzesCompleted: Math.floor(Math.random() * 30) + 1,
  avgScore: Math.floor(Math.random() * 40) + 60,
  streak: Math.floor(Math.random() * 30),
}));

type SortKey = keyof Pick<Student, 'name' | 'totalXP' | 'quizzesCompleted' | 'avgScore' | 'streak'>;
type SortDir = 'asc' | 'desc';

const StudentProgress: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalXP');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const classes = useMemo(() => [...new Set(mockStudents.map((s) => s.className))].sort(), []);
  const sections = useMemo(() => [...new Set(mockStudents.map((s) => s.section))].sort(), []);

  const filtered = useMemo(() => {
    let result = mockStudents.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filterClass) result = result.filter((s) => s.className === filterClass);
    if (filterSection) result = result.filter((s) => s.section === filterSection);

    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [search, filterClass, filterSection, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon: React.FC<{ column: SortKey }> = ({ column }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-indigo-500" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-indigo-500" />
    );
  };

  const exportCSV = () => {
    const headers = ['Name', 'Class', 'Section', 'Total XP', 'Quizzes Completed', 'Avg Score', 'Streak'];
    const rows = filtered.map((s) => [s.name, s.className, s.section, s.totalXP, s.quizzesCompleted, s.avgScore, s.streak]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_progress.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('teacher.progress.title', 'Student Progress')}
        </h2>
        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          {t('teacher.progress.exportCSV', 'Export CSV')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('teacher.progress.search', 'Search students...')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            aria-label={t('teacher.progress.search', 'Search students')}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-8 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
              aria-label={t('teacher.progress.filterClass', 'Filter by class')}
            >
              <option value="">{t('teacher.progress.allClasses', 'All Classes')}</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
            aria-label={t('teacher.progress.filterSection', 'Filter by section')}
          >
            <option value="">{t('teacher.progress.allSections', 'All Sections')}</option>
            {sections.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full min-w-[700px] text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              {([
                ['name', t('teacher.progress.name', 'Student')],
                ['totalXP', t('teacher.progress.xp', 'Total XP')],
                ['quizzesCompleted', t('teacher.progress.quizzes', 'Quizzes')],
                ['avgScore', t('teacher.progress.avgScore', 'Avg Score')],
                ['streak', t('teacher.progress.streak', 'Streak')],
              ] as [SortKey, string][]).map(([key, label]) => (
                <th key={key} className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {label}
                    <SortIcon column={key} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, i) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedStudent(student)}
                className="border-b border-gray-100 dark:border-gray-700/50 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelectedStudent(student);
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.className} - {student.section}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Trophy className="h-3.5 w-3.5" />
                    {student.totalXP.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{student.quizzesCompleted}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      student.avgScore >= 80
                        ? 'text-green-600 dark:text-green-400'
                        : student.avgScore >= 60
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {student.avgScore}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-orange-500">
                    <Flame className="h-3.5 w-3.5" />
                    {student.streak}d
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            {t('teacher.progress.noResults', 'No students found')}
          </div>
        )}
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/30"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl p-6 overflow-y-auto"
              role="dialog"
              aria-label={t('teacher.progress.studentDetail', 'Student detail')}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('teacher.progress.studentDetail', 'Student Detail')}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={t('common.close', 'Close')}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img src={selectedStudent.avatar} alt="" className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedStudent.className} - Section {selectedStudent.section}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('teacher.progress.xp', 'Total XP'), value: selectedStudent.totalXP.toLocaleString(), color: 'text-amber-600 dark:text-amber-400' },
                  { label: t('teacher.progress.quizzes', 'Quizzes Done'), value: selectedStudent.quizzesCompleted, color: 'text-blue-600 dark:text-blue-400' },
                  { label: t('teacher.progress.avgScore', 'Avg Score'), value: `${selectedStudent.avgScore}%`, color: 'text-green-600 dark:text-green-400' },
                  { label: t('teacher.progress.streak', 'Streak'), value: `${selectedStudent.streak} days`, color: 'text-orange-500' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentProgress;
export { StudentProgress };
