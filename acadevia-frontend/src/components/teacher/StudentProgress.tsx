import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Flame,
  X,
  GraduationCap,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService, type QuizResultRecord, type ActivityRecord } from '@/services/data.service';
import { Progress } from '@/components/ui/Progress';

interface StudentViewItem {
  id: string;
  name: string;
  avatar: string;
  className: string;
  section: string;
  totalXP: number;
  quizzesCompleted: number;
  avgScore: number;
  streak: number;
  progress: number;
  results: QuizResultRecord[];
  activities: ActivityRecord[];
}

type SortKey = keyof Pick<StudentViewItem, 'name' | 'totalXP' | 'quizzesCompleted' | 'avgScore' | 'streak'>;
type SortDir = 'asc' | 'desc';

const StudentProgress: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetStudentId = searchParams.get('studentId') || searchParams.get('id');

  const user = useAuthStore((s) => s.user);
  const teacherId = user?.id || '10';

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalXP');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentViewItem | null>(null);
  const [apiStudents, setApiStudents] = useState<StudentViewItem[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/v1/teacher/students?classGrade=10')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setApiStudents(json.data);
          dataService.syncStudentsFromApi(json.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Retrieve actual students from live API or persistent data layer
  const students: StudentViewItem[] = useMemo(() => {
    if (apiStudents && apiStudents.length > 0) {
      return apiStudents;
    }
    const rawStudents = dataService.getTeacherStudents(teacherId);

    // If no students assigned yet, ensure demo student Aarav is included
    const studentList = rawStudents.length > 0 ? rawStudents : [dataService.getUserById('9')!].filter(Boolean);

    return studentList.map((st) => {
      const metrics = dataService.getStudentMetrics(st.id);
      const results = dataService.getStudentQuizResults(st.id);
      const activities = dataService.getRecentActivities(st.id, 'STUDENT');

      return {
        id: st.id,
        name: st.fullName,
        avatar: st.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(st.fullName)}`,
        className: `Class ${st.classGrade || 10}`,
        section: st.section || 'A',
        totalXP: metrics.totalXP,
        quizzesCompleted: metrics.quizzesCompleted,
        avgScore: metrics.averageScore,
        streak: metrics.streak,
        progress: metrics.overallProgress,
        results,
        activities,
      };
    });
  }, [teacherId, apiStudents]);

  // Auto-open selected student if requested via URL query params
  useEffect(() => {
    if (targetStudentId && students.length > 0) {
      const match = students.find((s) => String(s.id) === String(targetStudentId));
      if (match) {
        setSelectedStudent(match);
      }
    }
  }, [targetStudentId, students]);

  const classes = useMemo(() => [...new Set(students.map((s) => s.className))].sort(), [students]);
  const sections = useMemo(() => [...new Set(students.map((s) => s.section))].sort(), [students]);

  const filtered = useMemo(() => {
    let result = students.filter((s) =>
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
  }, [students, search, filterClass, filterSection, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-1 sm:p-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enrolled Students
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time academic performance, quiz completion, and study progress
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-xs font-semibold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-xs font-semibold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Sections</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Student Name {getSortIcon('name')}
                </div>
              </th>
              <th className="py-3.5 px-4">Class & Section</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('totalXP')}
              >
                <div className="flex items-center gap-2">
                  Total XP {getSortIcon('totalXP')}
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('quizzesCompleted')}
              >
                <div className="flex items-center gap-2">
                  Quizzes {getSortIcon('quizzesCompleted')}
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('avgScore')}
              >
                <div className="flex items-center gap-2">
                  Avg Score {getSortIcon('avgScore')}
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('streak')}
              >
                <div className="flex items-center gap-2">
                  Streak {getSortIcon('streak')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((student) => (
              <tr
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400">ID: {student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {student.className}
                  </span>
                  <span className="text-xs text-gray-400 ml-1.5">
                    &bull; Sec {student.section}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-primary dark:text-[#D4A843]">
                  {student.totalXP.toLocaleString()} XP
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                    {student.quizzesCompleted} Done
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`font-bold text-sm ${
                      student.avgScore >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600'
                    }`}
                  >
                    {student.avgScore}%
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 font-semibold text-orange-500">
                    <Flame className="h-4 w-4 fill-orange-500" />
                    <span>{student.streak}d</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No students found matching filters.
          </div>
        )}
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-lg bg-white dark:bg-card-dark shadow-2xl p-6 overflow-y-auto space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Student Academic Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Student Identity Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-[#5B2C6F]/5 to-secondary/10 border border-primary/20">
                <img
                  src={selectedStudent.avatar}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-white dark:ring-card-dark shadow"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedStudent.name}
                  </h4>
                  <p className="text-xs font-semibold text-primary dark:text-[#D4A843]">
                    {selectedStudent.className} &bull; Section {selectedStudent.section}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Acadevia Demo School &bull; Enrolled
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">Total XP</p>
                  <p className="text-xl font-bold text-primary dark:text-[#D4A843]">
                    {selectedStudent.totalXP.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">Quizzes Completed</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedStudent.quizzesCompleted}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">Average Score</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {selectedStudent.avgScore}%
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">Daily Streak</p>
                  <p className="text-xl font-bold text-orange-500">
                    {selectedStudent.streak} Days
                  </p>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Curriculum Completion</span>
                  <span className="text-primary">{selectedStudent.progress}%</span>
                </div>
                <Progress value={selectedStudent.progress} size="md" gradient />
              </div>

              {/* Quiz Submissions History */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Quiz Submissions ({selectedStudent.results.length})
                </h4>
                {selectedStudent.results.length > 0 ? (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {selectedStudent.results.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {res.quizTitle}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {res.subject} &bull; {new Date(res.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            {res.percentage}%
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {res.score}/{res.totalPoints} pts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No quiz submissions recorded yet.</p>
                )}
              </div>

              {/* Recent Activity Log */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Recent Student Activity
                </h4>
                {selectedStudent.activities.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.activities.slice(0, 4).map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 text-xs"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{act.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No recent activity recorded.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export { StudentProgress };
export default StudentProgress;
