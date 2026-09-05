import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Users,
  CheckCircle2,
  Search,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  Clock,
  ChevronRight,
  RefreshCw,
  GraduationCap,
  SlidersHorizontal,
  X,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService, type ClassAnalyticsData } from '@/services/data.service';
import { ROUTES } from '@/config/routes.config';

type DateRangeOption = '7' | '30' | '90' | 'all';
type MetricView = 'score' | 'submissions';
type StudentFilter = 'ALL' | 'EXCELLING' | 'ON_TRACK' | 'NEEDS_ATTENTION' | 'NOT_STARTED';

const ClassAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const teacherId = user?.id ? String(user.id) : '10';

  const [selectedClass, setSelectedClass] = useState<number>(user?.classGrade || 10);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRangeOption>('30');
  const [trendMetric, setTrendMetric] = useState<MetricView>('score');
  const [quizSearch, setQuizSearch] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<StudentFilter>('ALL');
  const [sortField, setSortField] = useState<'score' | 'submissions' | 'name'>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [apiAnalytics, setApiAnalytics] = useState<ClassAnalyticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [version, setVersion] = useState<number>(0);

  // Subject Mastery Drill-down states
  const [selectedMasterySubject, setSelectedMasterySubject] = useState<string | null>(null);
  const [masteryDetail, setMasteryDetail] = useState<any | null>(null);
  const [isLoadingMasteryDetail, setIsLoadingMasteryDetail] = useState<boolean>(false);
  const [drilldownQuizFilter, setDrilldownQuizFilter] = useState<string>('ALL');
  const [drilldownStudentSearch, setDrilldownStudentSearch] = useState<string>('');

  const handleOpenSubjectDetail = (subName: string) => {
    setSelectedMasterySubject(subName);
    setIsLoadingMasteryDetail(true);
    setDrilldownQuizFilter('ALL');
    setDrilldownStudentSearch('');

    fetch(`/api/v1/teacher/analytics/subject-drilldown?subject=${encodeURIComponent(subName)}&classGrade=${selectedClass}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data) {
          setMasteryDetail(json.data);
        }
      })
      .catch((err) => console.error('[SubjectDetail] fetch error:', err))
      .finally(() => setIsLoadingMasteryDetail(false));
  };

  // Subscribe to live data updates across the application
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setVersion((v) => v + 1);
      setLastUpdated(new Date());
    });
    return unsubscribe;
  }, []);

  // Fetch from live database API with fallback to local persistent data
  useEffect(() => {
    let mounted = true;
    const loadAnalytics = async () => {
      try {
        const res = await fetch(
          `/api/v1/teacher/analytics?classGrade=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}&dateRange=${dateRange}`
        );
        if (res.ok) {
          const json = await res.json();
          if (mounted && json?.success && json.data) {
            setApiAnalytics(json.data);
            setLastUpdated(new Date());
          }
        }
      } catch {
        // Fall back gracefully to local persistent data store
      }
    };

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [selectedClass, selectedSubject, dateRange, version]);

  // Compute 100% data-driven analytics directly from live API or persistent data store
  const analytics: ClassAnalyticsData = useMemo(() => {
    if (
      apiAnalytics &&
      Number(apiAnalytics.classGrade) === Number(selectedClass) &&
      apiAnalytics.subject === selectedSubject &&
      (!apiAnalytics.dateRange || apiAnalytics.dateRange === dateRange)
    ) {
      return apiAnalytics;
    }
    return dataService.getClassAnalytics({
      teacherId,
      classGrade: selectedClass,
      subject: selectedSubject,
      dateRange,
    });
  }, [apiAnalytics, teacherId, selectedClass, selectedSubject, dateRange]);

  // 1. KPI Metric Calculations
  const totalStudents = analytics.totalStudents || 0;
  const activeStudents = analytics.activeStudents !== undefined
    ? analytics.activeStudents
    : (analytics.completionData?.find((c) => c.name === 'Completed')?.count || 0);
  const completionRate = analytics.completionRate !== undefined
    ? analytics.completionRate
    : (totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0);

  const classAvg = analytics.classAverage !== undefined
    ? analytics.classAverage
    : analytics.quizScores && analytics.quizScores.length > 0
    ? Math.round(
        analytics.quizScores.reduce((sum, q) => sum + (q.avg * q.attempts), 0) /
        Math.max(1, analytics.quizScores.reduce((sum, q) => sum + q.attempts, 0))
      )
    : 0;

  const totalSubmissions = analytics.totalSubmissions !== undefined
    ? analytics.totalSubmissions
    : analytics.quizScores?.reduce((sum, q) => sum + q.attempts, 0) || 0;

  const evaluatedQuizzesCount = analytics.quizScores?.filter((q) => q.attempts > 0).length || 0;
  const atRiskCount = analytics.atRiskStudents?.length || 0;

  // 2. Timeline Trend Data (100% Real Submissions and Scores from Database)
  const timelineData = useMemo(() => {
    const raw = analytics.engagementTrend || [];
    return raw.map((d) => ({
      day: d.day,
      date: d.date,
      submissions: d.submissions !== undefined ? d.submissions : d.engagement,
      score: d.score !== undefined ? d.score : (classAvg > 0 ? classAvg : 0),
    }));
  }, [analytics.engagementTrend, classAvg]);

  // 3. Quiz Performance Table (with sorting and search)
  const filteredQuizzes = useMemo(() => {
    const list = (analytics.detailedQuizzes || analytics.quizScores.map((q) => ({
      id: q.id,
      title: q.fullName || q.name,
      subject: selectedSubject === 'All' ? 'Curriculum' : selectedSubject,
      chapterInfo: undefined,
      avgScore: q.avg,
      attempts: q.attempts,
      completionPct: totalStudents > 0 ? Math.round((q.attempts / totalStudents) * 100) : 0,
      status: (q.avg >= 75 ? 'STRONG' : q.avg >= 50 ? 'SATISFACTORY' : 'NEEDS_ATTENTION') as 'STRONG' | 'SATISFACTORY' | 'NEEDS_ATTENTION',
    }))).filter((q) => {
      if (!quizSearch) return true;
      const term = quizSearch.toLowerCase();
      return q.title.toLowerCase().includes(term) || q.subject.toLowerCase().includes(term);
    });

    return list.sort((a, b) => {
      if (sortField === 'score') return sortAsc ? a.avgScore - b.avgScore : b.avgScore - a.avgScore;
      if (sortField === 'submissions') return sortAsc ? a.attempts - b.attempts : b.attempts - a.attempts;
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });
  }, [analytics.detailedQuizzes, analytics.quizScores, quizSearch, sortField, sortAsc, selectedSubject, totalStudents]);

  // 4. Student Performance Roster (Search & Filter from Real Database Roster)
  const studentList = useMemo(() => {
    const roster = analytics.studentRoster || [];

    return roster.filter((s) => {
      if (studentFilter === 'EXCELLING' && s.status !== 'EXCELLING') return false;
      if (studentFilter === 'ON_TRACK' && s.status !== 'ON_TRACK') return false;
      if (studentFilter === 'NEEDS_ATTENTION' && s.status !== 'NEEDS_ATTENTION') return false;
      if (studentFilter === 'NOT_STARTED' && s.status !== 'NOT_STARTED') return false;
      if (studentSearch) {
        return s.name.toLowerCase().includes(studentSearch.toLowerCase());
      }
      return true;
    });
  }, [analytics.studentRoster, studentFilter, studentSearch]);

  // 5. Actionable Insights
  const insights = useMemo(() => {
    if (analytics.actionableInsights && analytics.actionableInsights.length > 0) {
      return analytics.actionableInsights;
    }
    const items: {
      id: string;
      type: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'POSITIVE';
      title: string;
      description: string;
      metric?: string;
      actionLabel?: string;
      actionType?: 'VIEW_STUDENTS' | 'VIEW_QUIZZES' | 'VIEW_SUBJECT';
    }[] = [];

    if (atRiskCount > 0) {
      items.push({
        id: 'ins-1',
        type: 'CRITICAL',
        title: 'Academic Support Recommended',
        description: `${atRiskCount} student${atRiskCount > 1 ? 's are' : ' is'} averaging below the 50% passing threshold.`,
        metric: `${atRiskCount} Students`,
        actionLabel: 'View Students',
        actionType: 'VIEW_STUDENTS',
      });
    }

    const weakestSubject = analytics.subjectComparison
      ?.filter((s) => s.submissions > 0)
      .sort((a, b) => a.score - b.score)[0];
    if (weakestSubject && weakestSubject.score < 70) {
      items.push({
        id: 'ins-2',
        type: 'WARNING',
        title: 'Curriculum Focus Area',
        description: `${weakestSubject.subject} has the lowest average mastery score (${weakestSubject.score}%) in Class ${selectedClass}.`,
        metric: `${weakestSubject.score}% Avg`,
        actionLabel: 'Filter by Subject',
        actionType: 'VIEW_SUBJECT',
      });
    }

    if (classAvg >= 75 && totalSubmissions > 0) {
      items.push({
        id: 'ins-3',
        type: 'POSITIVE',
        title: 'Strong Overall Mastery',
        description: `Class average is high (${classAvg}%) across active assignments with steady participation.`,
        metric: `${classAvg}%`,
      });
    }

    return items;
  }, [analytics.actionableInsights, atRiskCount, analytics.subjectComparison, classAvg, selectedClass, totalSubmissions]);

  const filteredDrilldownStudents = useMemo(() => {
    if (!masteryDetail?.students) return [];
    let list = masteryDetail.students;
    if (drilldownQuizFilter !== 'ALL') {
      list = list.filter(
        (s: any) =>
          String(s.quizId) === String(drilldownQuizFilter) ||
          String(s.numericQuizId) === String(drilldownQuizFilter)
      );
    }
    if (drilldownStudentSearch.trim()) {
      const q = drilldownStudentSearch.toLowerCase().trim();
      list = list.filter(
        (s: any) =>
          s.studentName.toLowerCase().includes(q) ||
          s.quizTitle.toLowerCase().includes(q) ||
          s.status.toLowerCase().includes(q)
      );
    }
    return list;
  }, [masteryDetail, drilldownQuizFilter, drilldownStudentSearch]);

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('teacher.analytics.title', 'Class Analytics')}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Class {selectedClass} &bull; {selectedSubject === 'All' ? 'All Subjects' : selectedSubject} &bull; {totalStudents} Enrolled Students
            </p>
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="class-select" className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Class:
              </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 px-3 py-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {(analytics.availableClasses || [10]).map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="subject-select" className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Subject:
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 px-3 py-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {(analytics.availableSubjects || ['All']).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1 border border-gray-200 dark:border-gray-700">
              {(
                [
                  { id: '7', label: '7D' },
                  { id: '30', label: '30D' },
                  { id: '90', label: '90D' },
                  { id: 'all', label: 'All' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setDateRange(btn.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    dateRange === btn.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Quick Refresh Button */}
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                setVersion((v) => v + 1);
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              title="Refresh Analytics"
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sync Timestamp Metadata */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800/80 pt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <span className="text-gray-400">
            Reporting period: {dateRange === '7' ? 'Past 7 Days' : dateRange === '30' ? 'Past 30 Days' : dateRange === '90' ? 'Past 90 Days' : 'Full Academic Year'}
          </span>
        </div>
      </div>

      {/* 2. SECTION 1: COMPACT KPI SUMMARY CARDS (5 METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Class Average */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Class Average</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {classAvg}%
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                classAvg >= 75
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : classAvg >= 50
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              {classAvg >= 75 ? 'Strong' : classAvg >= 50 ? 'On Track' : 'Needs Focus'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Across {evaluatedQuizzesCount} {evaluatedQuizzesCount === 1 ? 'quiz' : 'quizzes'} evaluated
          </p>
        </div>

        {/* KPI 2: Completion Rate */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {completionRate}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({activeStudents}/{totalStudents})
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enrolled students who submitted
          </p>
        </div>

        {/* KPI 3: Active Learners */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Students</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {activeStudents}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              / {totalStudents} enrolled
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Active quiz takers in period
          </p>
        </div>

        {/* KPI 4: Total Submissions */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {totalSubmissions}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              attempts
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Recorded quiz submissions
          </p>
        </div>

        {/* KPI 5: Students Needing Attention */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Needs Attention</span>
            <div
              className={`p-2 rounded-xl ${
                atRiskCount > 0
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                atRiskCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {atRiskCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {atRiskCount === 1 ? 'student' : 'students'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {atRiskCount > 0 ? 'Average score below 50%' : 'All students on track (≥50%)'}
          </p>
        </div>
      </div>

      {/* 3. SECTION 2: ACTIONABLE INSIGHTS (WHAT SHOULD THE TEACHER DO?) */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Class Insights & Recommendations
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Data-backed observations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className={`p-4 rounded-xl border transition-all ${
                  ins.type === 'CRITICAL'
                    ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20'
                    : ins.type === 'WARNING'
                    ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20'
                    : ins.type === 'POSITIVE'
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      ins.type === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        : ins.type === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : ins.type === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                    }`}
                  >
                    {ins.type === 'CRITICAL' ? 'Priority Attention' : ins.type === 'WARNING' ? 'Curriculum Focus' : ins.type === 'POSITIVE' ? 'Milestone' : 'Observation'}
                  </span>
                  {ins.metric && (
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {ins.metric}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {ins.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {ins.description}
                </p>
                {ins.actionLabel && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (ins.actionType === 'VIEW_STUDENTS') {
                          setStudentFilter('NEEDS_ATTENTION');
                          const el = document.getElementById('student-roster-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        } else if (ins.actionType === 'VIEW_INACTIVE') {
                          setStudentFilter('NOT_STARTED');
                          const el = document.getElementById('student-roster-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        } else if (ins.actionType === 'VIEW_QUIZZES') {
                          const el = document.getElementById('quiz-performance-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        } else if (ins.actionType === 'VIEW_SUBJECT') {
                          setSelectedSubject('Science');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <span>{ins.actionLabel}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SECTION 3: CLASS PERFORMANCE TREND OVER TIME (INTERACTIVE CHART) */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Class Performance & Submission Timeline
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tracking assessment submissions and average mastery trajectory
            </p>
          </div>

          {/* Metric Switcher */}
          <div className="flex items-center rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTrendMetric('score')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                trendMetric === 'score'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Average Score (%)
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('submissions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                trendMetric === 'submissions'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Submissions Count
            </button>
          </div>
        </div>

        {totalSubmissions === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
            <BookOpen className="h-10 w-10 text-gray-400 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No Quiz Submissions Yet for Class {selectedClass}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              Once students attempt assigned quizzes, performance trends and submissions will map here over time.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendMetric === 'score' ? '#5B2C6F' : '#10b981'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={trendMetric === 'score' ? '#5B2C6F' : '#10b981'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval="preserveStartEnd"
                  stroke="#9ca3af"
                />
                <YAxis
                  domain={trendMetric === 'score' ? [0, 100] : ['auto', 'auto']}
                  unit={trendMetric === 'score' ? '%' : ''}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  stroke="#9ca3af"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: any) => [
                    trendMetric === 'score' ? `${value}%` : `${value} Submissions`,
                    trendMetric === 'score' ? 'Class Mastery' : 'Daily Submissions',
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric === 'score' ? 'score' : 'submissions'}
                  stroke={trendMetric === 'score' ? '#5B2C6F' : '#10b981'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. SECTIONS 4 & 5: DEDICATED QUIZ PERFORMANCE & SUBJECT MASTERY SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 4: DETAILED QUIZ PERFORMANCE TABLE (2 COLS) */}
        <div id="quiz-performance-section" className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Curriculum Quiz Performance
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Detailed assessment results, mastery scores, and class completion
              </p>
            </div>

            {/* Quiz Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter quizzes..."
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 pl-8 pr-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <BookOpen className="h-8 w-8 text-gray-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                No quizzes match your filter
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try selecting &ldquo;All&rdquo; subjects or clearing your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-semibold uppercase tracking-wider">
                    <th
                      className="pb-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={() => {
                        setSortField('name');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Quiz & Chapter
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3">Subject</th>
                    <th
                      className="pb-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={() => {
                        setSortField('score');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Class Avg
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="pb-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={() => {
                        setSortField('submissions');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Submissions
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition">
                      <td className="py-3.5 pr-3">
                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[220px]">
                          {quiz.title}
                        </p>
                        {(quiz as any).chapterInfo && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[220px]">
                            {(quiz as any).chapterInfo}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-medium">
                          {quiz.subject}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white w-8">
                            {quiz.avgScore}%
                          </span>
                          <div className="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                quiz.avgScore >= 75
                                  ? 'bg-emerald-500'
                                  : quiz.avgScore >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${quiz.avgScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 text-gray-600 dark:text-gray-300">
                        {quiz.attempts} / {totalStudents}
                        {(quiz as any).completionPct !== undefined && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            ({(quiz as any).completionPct}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {((quiz as any).status || quiz.avgScore >= 75 ? 'STRONG' : quiz.avgScore >= 50 ? 'SATISFACTORY' : 'NEEDS_ATTENTION') === 'STRONG' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Strong
                          </span>
                        ) : ((quiz as any).status || (quiz.avgScore >= 50 ? 'SATISFACTORY' : 'NEEDS_ATTENTION')) === 'SATISFACTORY' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Satisfactory
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            Needs Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 5: SUBJECT MASTERY BREAKDOWN (1 COL) */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
                  Subject Mastery
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Click any subject to view student attempts & retests</p>
              </div>
              <span className="text-xs text-gray-400">Class {selectedClass}</span>
            </div>

            <div className="space-y-3 mt-4">
              {(analytics.subjectComparison || []).map((sub) => (
                <div
                  key={sub.subject}
                  onClick={() => handleOpenSubjectDetail(sub.subject)}
                  title={`Click to view ${sub.subject} student drill-down and retest details`}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {sub.subject}
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">
                        {sub.submissions} {sub.submissions === 1 ? 'attempt' : 'attempts'}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {sub.score}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        sub.score >= 75
                          ? 'bg-emerald-500'
                          : sub.score >= 50
                          ? 'bg-indigo-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${sub.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>Passing Benchmark: 50%</span>
            <button
              type="button"
              onClick={() => setSelectedSubject('All')}
              className="text-primary hover:underline font-semibold"
            >
              Reset to All Subjects
            </button>
          </div>
        </div>
      </div>

      {/* 6. SECTIONS 6 & 7: FULL STUDENT ROSTER & STUDENTS NEEDING ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 6: STUDENT PERFORMANCE ROSTER (2 COLS) */}
        <div id="student-roster-section" className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Performance Roster
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Class {selectedClass} roster &bull; {studentList.length} students shown
              </p>
            </div>

            {/* Student Search & Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[170px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 pl-8 pr-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center rounded-xl bg-gray-100 dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 flex-wrap">
                {(
                  [
                    { id: 'ALL', label: 'All' },
                    { id: 'EXCELLING', label: 'Excelling' },
                    { id: 'ON_TRACK', label: 'On Track' },
                    { id: 'NEEDS_ATTENTION', label: 'Needs Help' },
                    { id: 'NOT_STARTED', label: 'Not Started' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStudentFilter(tab.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      studentFilter === tab.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {studentList.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Users className="h-8 w-8 text-gray-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                No students match your criteria
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try selecting &ldquo;All&rdquo; or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 w-10">Rank</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Average Score</th>
                    <th className="pb-3">Quizzes</th>
                    <th className="pb-3">Total XP</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {studentList.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition">
                      <td className="py-3.5 font-bold text-gray-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              ID: {student.id} &bull; {student.className || `Class ${selectedClass}`} &bull; Sec {student.section || 'A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3">
                        {student.quizzesCompleted === 0 ? (
                          <span className="text-gray-400 text-xs font-medium italic">Not Started</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white w-8">
                              {student.avgScore}%
                            </span>
                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  student.avgScore >= 75
                                    ? 'bg-emerald-500'
                                    : student.avgScore >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${student.avgScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 text-gray-600 dark:text-gray-300 font-medium">
                        {student.quizzesCompleted === 0 ? (
                          <span className="text-gray-400 text-xs">0 completed</span>
                        ) : (
                          <span>{student.quizzesCompleted} completed</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 text-gray-600 dark:text-gray-300 font-medium">
                        {student.totalXP.toLocaleString()} XP
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`${ROUTES.TEACHER_STUDENTS}?studentId=${student.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/15 transition"
                        >
                          <span>Profile</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 7: STUDENTS NEEDING ATTENTION (INTERVENTION LIST - 1 COL) */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                {t('teacher.analytics.atRisk', 'Students Needing Attention')}
              </h3>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                {atRiskCount} Flagged
              </span>
            </div>

            {atRiskCount === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center p-4 border border-dashed border-emerald-200 dark:border-emerald-800/40 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {t('teacher.analytics.noAtRisk', 'No students currently at risk')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
                  All assessed students in Class {selectedClass} are meeting or exceeding the 50% passing threshold.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {analytics.atRiskStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200 flex items-center justify-center text-xs font-bold uppercase">
                          {st.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                          {st.name}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                        {st.score}% avg
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-normal">
                      Scoring below 50% benchmark. Requires concept review in core quizzes.
                    </p>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`${ROUTES.TEACHER_STUDENTS}?studentId=${st.id}`)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline"
                      >
                        <span>Open Student Progress</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            Passing threshold is set to 50% average quiz accuracy.
          </div>
        </div>
      </div>

      {/* 7. CLEAN SYSTEM FOOTER */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <span>Acadevia Academic Analytics Engine &bull; Live Database Persistence</span>
        <span>Class {selectedClass} &bull; Graded Curriculum Assessments</span>
      </div>

      {/* 8. SUBJECT MASTERY STUDENT DRILL-DOWN PANEL */}
      <AnimatePresence>
        {selectedMasterySubject && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-3xl bg-white dark:bg-card-dark shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedMasterySubject} Mastery & Retests
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                          Class {selectedClass}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Authoritative participation, attempt histories & student retest details
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMasterySubject(null)}
                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {isLoadingMasteryDetail ? (
                  <div className="py-16 text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
                    <p className="text-xs text-gray-400">Loading student attempts & retest data...</p>
                  </div>
                ) : masteryDetail ? (
                  <>
                    {/* Performance Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Students Attempted</p>
                        <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                          {masteryDetail.uniqueStudentsCount} <span className="text-xs font-normal text-gray-400">/ {masteryDetail.totalEnrolledStudents}</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Quiz Attempts</p>
                        <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                          {masteryDetail.totalQuizAttempts} <span className="text-xs font-normal text-gray-400">total</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Retests Logged</p>
                        <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                          {masteryDetail.totalRetestAttempts} <span className="text-xs font-normal text-gray-400">retests ({masteryDetail.studentsWithRetestsCount} std)</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mastery & Accuracy</p>
                        <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                          {masteryDetail.avgScore}% <span className="text-xs font-normal text-gray-400">({masteryDetail.accuracy}% acc)</span>
                        </p>
                      </div>
                    </div>

                    {/* Quiz Breakdown & Filters */}
                    {masteryDetail.quizzes && masteryDetail.quizzes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Filter by Quiz ({masteryDetail.quizzes.length} available):
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          <button
                            type="button"
                            onClick={() => setDrilldownQuizFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                              drilldownQuizFilter === 'ALL'
                                ? 'bg-primary text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            All Quizzes ({masteryDetail.students.length} attempts)
                          </button>
                          {masteryDetail.quizzes.map((q: any) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => setDrilldownQuizFilter(String(q.id))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                                String(drilldownQuizFilter) === String(q.id)
                                  ? 'bg-primary text-white shadow-xs'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span>{q.title}</span>
                              <span className="text-[10px] opacity-75 font-mono">
                                ({q.studentsAttempted} att{q.studentsRetested > 0 ? ` · ${q.studentsRetested} ret` : ''})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Search */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={drilldownStudentSearch}
                          onChange={(e) => setDrilldownStudentSearch(e.target.value)}
                          placeholder="Search student name, quiz or status..."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {filteredDrilldownStudents.length} entries shown
                      </span>
                    </div>

                    {/* Students Performance Drill-down Table */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            <tr>
                              <th className="py-2.5 px-3.5 font-bold">Student</th>
                              <th className="py-2.5 px-3 font-bold">Quiz</th>
                              <th className="py-2.5 px-3 font-bold text-center">1st Attempt</th>
                              <th className="py-2.5 px-3 font-bold text-center">Retests</th>
                              <th className="py-2.5 px-3 font-bold text-center">Best</th>
                              <th className="py-2.5 px-3 font-bold text-center">Latest</th>
                              <th className="py-2.5 px-3 font-bold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredDrilldownStudents.map((item: any, idx: number) => (
                              <tr
                                key={`${item.studentId}-${item.quizId}-${idx}`}
                                className="hover:bg-primary/5 transition"
                              >
                                <td className="py-2.5 px-3.5">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        item.avatar && item.avatar !== 'NULL' && item.avatar !== 'null'
                                          ? item.avatar
                                          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.studentName)}`
                                      }
                                      alt=""
                                      className="h-7 w-7 rounded-full object-cover ring-1 ring-primary/20"
                                    />
                                    <div>
                                      <p className="font-bold text-gray-900 dark:text-white leading-tight">
                                        {item.studentName}
                                      </p>
                                      <p className="text-[10px] text-gray-400">
                                        {item.className} &bull; Sec {item.section}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 max-w-[180px]">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={item.quizTitle}>
                                    {item.quizTitle}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-mono">
                                    {item.subject}
                                  </p>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-gray-700 dark:text-gray-300">
                                  {item.firstAttemptScore}%
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {item.retestsCount > 0 ? (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                                      {item.retestsCount} {item.retestsCount === 1 ? 'retest' : 'retests'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 font-mono">0</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {item.bestScore}%
                                </td>
                                <td className="py-2.5 px-3 text-center font-extrabold text-primary dark:text-[#D4A843]">
                                  {item.latestScore}%
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  {item.status === 'Improved' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                      <TrendingUp className="h-3 w-3" />
                                      Improved
                                    </span>
                                  ) : item.status === 'Consistent' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Consistent
                                    </span>
                                  ) : item.status === 'Mastered' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                                      <Trophy className="h-3 w-3" />
                                      Mastered
                                    </span>
                                  ) : item.status === 'Needs Help' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                                      <AlertTriangle className="h-3 w-3" />
                                      Needs Help
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                      On Track
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredDrilldownStudents.length === 0 && (
                        <div className="py-8 text-center text-xs text-gray-400">
                          No student attempts found matching selected filters.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No data available for this subject.
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                <span>Subject Mastery Audit &bull; Real Database Records</span>
                <button
                  type="button"
                  onClick={() => setSelectedMasterySubject(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold transition cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { ClassAnalytics };
export default ClassAnalytics;

