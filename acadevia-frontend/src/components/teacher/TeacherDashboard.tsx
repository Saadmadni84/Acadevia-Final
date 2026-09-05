import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService } from '@/services/data.service';
import { contentService, type ContentItemRecord } from '@/services/content.service';

// Modular High-Fidelity Teacher Dashboard Subcomponents
import { TeacherDashboardHeader } from './dashboard/TeacherDashboardHeader';
import { TeacherStatsGrid } from './dashboard/TeacherStatsGrid';
import { TeacherClassPerformanceHub } from './dashboard/TeacherClassPerformanceHub';
import { TeacherRecentSubmissions } from './dashboard/TeacherRecentSubmissions';
import { TeacherDoubtsInbox } from './dashboard/TeacherDoubtsInbox';
import { TeacherPublishedContentGrid } from './dashboard/TeacherPublishedContentGrid';
import { TeacherQuickActions } from './dashboard/TeacherQuickActions';
import { TeacherSubmissionModal } from './dashboard/TeacherSubmissionModal';
import { TeacherVideoModal } from './dashboard/TeacherVideoModal';
import type { QuizResultRecord } from '@/services/data.service';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const teacherId = user?.id ? String(user.id) : '10';

  const [dataVersion, setDataVersion] = useState(0);
  const [publishedContent, setPublishedContent] = useState<ContentItemRecord[]>([]);
  const [commentsInbox, setCommentsInbox] = useState<any[]>([]);

  // Modals state for rich interaction
  const [activeSubmission, setActiveSubmission] = useState<QuizResultRecord | null>(null);
  const [activeVideo, setActiveVideo] = useState<ContentItemRecord | null>(null);

  // 1. Resolve Teacher Metadata from Persistent Data Service
  const teacherRecord = useMemo(() => {
    return dataService.getUserById(teacherId) || user;
  }, [teacherId, user, dataVersion]);

  const teacherName = teacherRecord?.fullName || user?.fullName || 'Rahul Verma';
  const designation = teacherRecord?.designation || 'Department Head • Mathematics';
  const schoolName = teacherRecord?.schoolName || 'Acadevia Demo School';
  const avatarUrl = teacherRecord?.avatarUrl || user?.avatarUrl;

  const classesTaught = useMemo(() => {
    if (teacherRecord?.classesTaught && teacherRecord.classesTaught.length > 0) {
      return teacherRecord.classesTaught;
    }
    return [8, 9, 10, 11, 12];
  }, [teacherRecord]);

  const subjectsTaught = useMemo(() => {
    if (teacherRecord?.subjectsTaught && teacherRecord.subjectsTaught.length > 0) {
      return teacherRecord.subjectsTaught;
    }
    if (teacherRecord?.subject) {
      return [teacherRecord.subject];
    }
    return ['Mathematics', 'Science'];
  }, [teacherRecord]);

  // 2. Class & Subject Filter State
  const [selectedClass, setSelectedClass] = useState<number>(() => {
    return classesTaught.includes(10) ? 10 : classesTaught[0] || 10;
  });
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // 3. Live Backend Sync & Event Listeners
  const loadRemoteData = useCallback(async () => {
    try {
      await dataService.syncFromBackend(true);
    } catch {
      // Offline fallback
    }

    try {
      const [videos, comments] = await Promise.all([
        contentService.getTeacherPublishedContent(),
        contentService.getTeacherCommentsInbox(),
      ]);
      setPublishedContent(videos);
      setCommentsInbox(comments);
    } catch {
      // Silent error fallback
    }
  }, []);

  useEffect(() => {
    loadRemoteData();
    const handleUpdate = () => {
      setDataVersion((v) => v + 1);
    };
    window.addEventListener('acadevia_data_updated', handleUpdate);
    return () => window.removeEventListener('acadevia_data_updated', handleUpdate);
  }, [loadRemoteData]);

  // 4. Dynamic Analytics & Metrics Calculation (ZERO HARDCODING)
  const teacherMetrics = useMemo(() => {
    return dataService.getTeacherMetrics(teacherId);
  }, [teacherId, dataVersion]);

  const classAnalytics = useMemo(() => {
    return dataService.getClassAnalytics({
      teacherId,
      classGrade: selectedClass,
      subject: selectedSubject,
    });
  }, [teacherId, selectedClass, selectedSubject, dataVersion]);

  // All student results filtered for teacher
  const allTeacherResults = useMemo(() => {
    return dataService.getTeacherQuizResults(teacherId);
  }, [teacherId, dataVersion]);

  const filteredResults = useMemo(() => {
    return allTeacherResults.filter((r) => {
      const matchClass = !selectedClass || Number(r.classGrade) === Number(selectedClass);
      const matchSubject =
        selectedSubject === 'All' ||
        r.subject?.toLowerCase() === selectedSubject.toLowerCase();
      return matchClass && matchSubject;
    });
  }, [allTeacherResults, selectedClass, selectedSubject]);

  // Dynamic KPI Aggregations
  const totalStudents = classAnalytics.totalStudents || teacherMetrics.totalStudents || 0;
  const activeCoursesCount = useMemo(() => {
    // Count distinct published videos plus distinct chapters for this teacher
    const videosForClass = publishedContent.filter(
      (c) => !selectedClass || Number(c.classNumber) === Number(selectedClass)
    );
    const uniqueChapters = new Set(videosForClass.map((c) => c.chapterName).filter(Boolean));
    return Math.max(videosForClass.length, uniqueChapters.size, 1);
  }, [publishedContent, selectedClass]);

  const totalQuizzesCount = classAnalytics.quizScores.length || teacherMetrics.quizzesCreated || 0;
  const totalSubmissionsCount = filteredResults.length;

  const averageScore = useMemo(() => {
    if (filteredResults.length > 0) {
      return Math.round(
        filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length
      );
    }
    return classAnalytics.averageScore || teacherMetrics.averagePerformance || 0;
  }, [filteredResults, classAnalytics.averageScore, teacherMetrics.averagePerformance]);

  // Dynamic Performance Tiers
  const performanceTiers = useMemo(() => {
    const total = filteredResults.length;
    if (total === 0) {
      return [
        { label: '90–100% Mastery', count: 0, percentage: 0, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
        { label: '75–89% Proficient', count: 0, percentage: 0, color: 'text-blue-500', bgColor: 'bg-blue-500' },
        { label: '50–74% Developing', count: 0, percentage: 0, color: 'text-amber-500', bgColor: 'bg-amber-500' },
        { label: '<50% Needs Support', count: 0, percentage: 0, color: 'text-rose-500', bgColor: 'bg-rose-500' },
      ];
    }

    const c90 = filteredResults.filter((r) => r.percentage >= 90).length;
    const c75 = filteredResults.filter((r) => r.percentage >= 75 && r.percentage < 90).length;
    const c50 = filteredResults.filter((r) => r.percentage >= 50 && r.percentage < 75).length;
    const cLess = filteredResults.filter((r) => r.percentage < 50).length;

    return [
      { label: '90–100% Mastery', count: c90, percentage: Math.round((c90 / total) * 100), color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
      { label: '75–89% Proficient', count: c75, percentage: Math.round((c75 / total) * 100), color: 'text-blue-500', bgColor: 'bg-blue-500' },
      { label: '50–74% Developing', count: c50, percentage: Math.round((c50 / total) * 100), color: 'text-amber-500', bgColor: 'bg-amber-500' },
      { label: '<50% Needs Support', count: cLess, percentage: Math.round((cLess / total) * 100), color: 'text-rose-500', bgColor: 'bg-rose-500' },
    ];
  }, [filteredResults]);

  // Dynamic Top Performers
  const topPerformers = useMemo(() => {
    if (classAnalytics.topPerformers && classAnalytics.topPerformers.length > 0) {
      return classAnalytics.topPerformers.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        quizzesTaken: p.quizzesTaken || 1,
      }));
    }

    const studentMap = new Map<string, { name: string; scores: number[] }>();
    filteredResults.forEach((r) => {
      const existing = studentMap.get(r.studentId) || { name: r.studentName, scores: [] };
      existing.scores.push(r.percentage);
      studentMap.set(r.studentId, existing);
    });

    return Array.from(studentMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        quizzesTaken: data.scores.length,
      }))
      .filter((s) => s.score >= 75)
      .sort((a, b) => b.score - a.score);
  }, [classAnalytics.topPerformers, filteredResults]);

  // Dynamic At-Risk Students
  const atRiskStudents = useMemo(() => {
    if (classAnalytics.atRiskStudents && classAnalytics.atRiskStudents.length > 0) {
      return classAnalytics.atRiskStudents.map((s) => ({
        id: s.id,
        name: s.name,
        score: s.score,
        weakTopics: s.weakTopics || [],
      }));
    }

    const studentMap = new Map<string, { name: string; scores: number[]; quizzes: string[] }>();
    filteredResults.forEach((r) => {
      const existing = studentMap.get(r.studentId) || { name: r.studentName, scores: [], quizzes: [] };
      existing.scores.push(r.percentage);
      if (r.percentage < 60) existing.quizzes.push(r.quizTitle);
      studentMap.set(r.studentId, existing);
    });

    return Array.from(studentMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        weakTopics: data.quizzes.slice(0, 2),
      }))
      .filter((s) => s.score < 60)
      .sort((a, b) => a.score - b.score);
  }, [classAnalytics.atRiskStudents, filteredResults]);

  return (
    <div className="space-y-7 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* 1. EDITORIAL TEACHER HEADER */}
      <TeacherDashboardHeader
        teacherName={teacherName}
        designation={designation}
        schoolName={schoolName}
        avatarUrl={avatarUrl}
        classesTaught={classesTaught}
        selectedClass={selectedClass}
        onSelectClass={(c) => setSelectedClass(c)}
        subjectsTaught={subjectsTaught}
        selectedSubject={selectedSubject}
        onSelectSubject={(s) => setSelectedSubject(s)}
        onRefresh={() => {
          loadRemoteData();
          setDataVersion((v) => v + 1);
        }}
      />

      {/* 2. EXECUTIVE STATS METRIC GRID */}
      <TeacherStatsGrid
        totalStudents={totalStudents}
        activeCourses={activeCoursesCount}
        quizzesCreated={totalQuizzesCount}
        averageScore={averageScore}
        totalSubmissions={totalSubmissionsCount}
        classLabel={`Class ${selectedClass}`}
        onViewStudents={() => navigate(`${ROUTES.TEACHER_STUDENTS}?classGrade=${selectedClass}`)}
        onViewCourses={() => navigate(ROUTES.TEACHER_CONTENT_UPLOAD)}
        onViewQuizzes={() => navigate(ROUTES.TEACHER_QUIZ_CREATE)}
        onViewAnalytics={() => navigate(`${ROUTES.TEACHER_ANALYTICS}?classGrade=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}`)}
      />

      {/* 3. CLASS PERFORMANCE & MASTERY HUB */}
      <TeacherClassPerformanceHub
        totalSubmissions={totalSubmissionsCount}
        averageScore={averageScore}
        tiers={performanceTiers}
        topPerformers={topPerformers}
        atRiskStudents={atRiskStudents}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
      />

      {/* 4. TWO-COLUMN WORKSPACE: SUBMISSIONS & DOUBTS INBOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <TeacherRecentSubmissions
            submissions={filteredResults}
            selectedClass={selectedClass}
            onSelectSubmission={(sub) => setActiveSubmission(sub)}
          />
        </div>

        <div className="lg:col-span-5">
          <TeacherDoubtsInbox
            initialDoubts={commentsInbox}
            onDoubtReplied={() => loadRemoteData()}
          />
        </div>
      </div>

      {/* 5. PUBLISHED CURRICULUM & LECTURES GRID */}
      <TeacherPublishedContentGrid
        content={publishedContent}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        onSelectVideo={(video) => setActiveVideo(video)}
      />

      {/* 6. TEACHER COMMAND ACTIONS */}
      <TeacherQuickActions />

      {/* 7. INTERACTIVE MODALS */}
      <TeacherSubmissionModal
        submission={activeSubmission}
        onClose={() => setActiveSubmission(null)}
      />

      <TeacherVideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onCommentReplied={() => loadRemoteData()}
      />
    </div>
  );
};

export default TeacherDashboard;
