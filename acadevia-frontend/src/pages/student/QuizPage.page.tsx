import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService, type QuizRecord, type QuizResultRecord } from '@/services/data.service';
import { ROUTES } from '@/config/routes.config';
import {
  Brain,
  Clock,
  ArrowRight,
  CheckCircle2,
  Trophy,
  UserCheck,
  HelpCircle,
  Play,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId: paramQuizId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQuizId = searchParams.get('id');

  const user = useAuthStore((s) => s.user);
  const studentId = user?.id || '9';

  // Get student from data layer for guaranteed classGrade and teacher relationship
  const dbUser = dataService.getUserById(studentId);
  const studentClass =
    user?.classGrade ||
    dbUser?.classGrade ||
    (user?.className ? parseInt(user.className.replace(/\D/g, '')) : 10) ||
    10;

  // Retrieve assigned teacher
  const teacher = dataService.getStudentTeacher(studentId);

  // Retrieve available quizzes for student's class (Classes 1-12)
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [results, setResults] = useState<QuizResultRecord[]>([]);

  const loadData = () => {
    const studentQuizzes = dataService.getQuizzesForStudent(studentId);
    setQuizzes(studentQuizzes);
    const studentResults = dataService.getStudentQuizResults(studentId);
    setResults(studentResults);
  };

  useEffect(() => {
    loadData();
  }, [studentId, studentClass]);

  // Determine target active quiz from route parameter or query
  const effectiveQuizId = paramQuizId || queryQuizId;
  const [activeQuiz, setActiveQuiz] = useState<QuizRecord | null>(null);
  const [submissionResult, setSubmissionResult] = useState<QuizResultRecord | null>(null);

  useEffect(() => {
    if (effectiveQuizId) {
      const found =
        dataService.getQuizById(effectiveQuizId) ||
        quizzes.find((q) => String(q.id).toLowerCase() === String(effectiveQuizId).toLowerCase());
      if (found) {
        setActiveQuiz(found);
      }
    }
  }, [effectiveQuizId, quizzes]);

  // Subject filter for quiz listing
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  const subjects = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => {
      if (q.subject) set.add(q.subject);
    });
    return ['ALL', ...Array.from(set)];
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    if (selectedSubject === 'ALL') return quizzes;
    return quizzes.filter(
      (q) => q.subject.toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [quizzes, selectedSubject]);

  const handleStartQuiz = (quiz: QuizRecord) => {
    setSubmissionResult(null);
    setActiveQuiz(quiz);
    setSearchParams({ id: quiz.id });
  };

  const handleBackToList = () => {
    setActiveQuiz(null);
    setSubmissionResult(null);
    setSearchParams({});
    loadData();
  };

  const handleQuizComplete = (playerResult: {
    score: number;
    totalPoints: number;
    answers: number[];
    timeTaken: number;
  }) => {
    if (!activeQuiz) return;

    // Persist result into data service
    const savedResult = dataService.submitQuizResult({
      quizId: activeQuiz.id,
      studentId,
      answers: playerResult.answers,
      timeTakenSeconds: playerResult.timeTaken,
    });

    setSubmissionResult(savedResult);
    loadData();
  };

  // Find latest result for a quiz if student previously completed it
  const getLatestResult = (quizId: string) => {
    return results.find((r) => String(r.quizId) === String(quizId));
  };

  return (
    <div className="p-1 sm:p-4 max-w-6xl mx-auto py-4 space-y-6">
      {/* 1. If result just submitted, show completion card */}
      {submissionResult ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-primary/20 bg-white dark:bg-card-dark p-8 text-center space-y-6 shadow-xl max-w-2xl mx-auto"
        >
          <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="h-10 w-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
              Quiz Completed & Recorded
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              Great Job, {user?.fullName || 'Student'}!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your results for <strong className="text-gray-900 dark:text-white font-semibold">"{submissionResult.quizTitle}"</strong> have been saved. Your teacher{' '}
              <strong className="text-primary font-semibold">
                {teacher?.fullName || 'Dr. Priya Sharma'}
              </strong>{' '}
              can now view your performance!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500">Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissionResult.score}/{submissionResult.totalPoints}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500">Percentage</p>
              <p className="text-2xl font-bold text-emerald-600">
                {submissionResult.percentage}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500">XP Earned</p>
              <p className="text-2xl font-bold text-primary dark:text-[#D4A843]">
                +{submissionResult.xpEarned} XP
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              variant="gradient"
              onClick={() => navigate(ROUTES.PROFILE)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View Updated Profile
            </Button>
            <Button variant="outline" onClick={handleBackToList}>
              Back to All Quizzes
            </Button>
          </div>
        </motion.div>
      ) : activeQuiz ? (
        /* 2. Active Quiz Player View */
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToList}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Quizzes List</span>
            </button>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              Class {activeQuiz.classGrade} &bull; {activeQuiz.subject}
            </span>
          </div>

          {/* Quiz Header Info */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-[#5B2C6F]/5 to-secondary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                <span>Assigned by {activeQuiz.teacherName}</span>
                <span>&bull;</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{Math.round(activeQuiz.timeLimit / 60)} mins</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeQuiz.title}
              </h1>
              {activeQuiz.description && (
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  {activeQuiz.description}
                </p>
              )}
            </div>
          </div>

          {/* Interactive Player */}
          <QuizPlayer
            title={activeQuiz.title}
            questions={activeQuiz.questions}
            timeLimit={activeQuiz.timeLimit || 300}
            onComplete={handleQuizComplete}
          />
        </div>
      ) : (
        /* 3. Quiz Listing & Discovery View */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-[#5B2C6F]/10 to-secondary/10 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
                  Class {studentClass}
                </span>
                {teacher && (
                  <span className="text-xs font-semibold text-primary dark:text-[#D4A843] flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">
                    <UserCheck className="h-3.5 w-3.5" />
                    Teacher: {teacher.fullName} ({teacher.subject || 'Mathematics'})
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                Assigned Quizzes & Assessments
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Quizzes published by your teachers for Class {studentClass}. Complete assessments to earn XP and level up!
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-white dark:bg-card-dark p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shrink-0 shadow-xs">
              <div className="text-center px-2">
                <p className="text-xs text-gray-400">Available</p>
                <p className="text-xl font-extrabold text-primary">{quizzes.length}</p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center px-2">
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-xl font-extrabold text-emerald-600">{results.length}</p>
              </div>
            </div>
          </div>

          {/* Subject Filter Tabs */}
          {subjects.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubject === sub
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:text-gray-900 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {sub === 'ALL' ? 'All Subjects' : sub}
                </button>
              ))}
            </div>
          )}

          {/* Quizzes Grid */}
          {filteredQuizzes.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQuizzes.map((quiz) => {
                const prevResult = getLatestResult(quiz.id);
                const isCompleted = !!prevResult;

                return (
                  <motion.div
                    key={quiz.id}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Badge strip */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-[#D4A843]">
                          {quiz.subject}
                        </span>
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            {prevResult.percentage}% Score
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Quiz Title */}
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {quiz.description || `Assessment for Class ${quiz.classGrade} ${quiz.subject}`}
                      </p>

                      {/* Meta Info */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-primary" />
                          {quiz.questions.length} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-secondary" />
                          {Math.round((quiz.timeLimit || 300) / 60)} min
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-primary" />
                        <span>By {quiz.teacherName}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant={isCompleted ? 'outline' : 'gradient'}
                        size="sm"
                        className="w-full font-bold"
                        onClick={() => handleStartQuiz(quiz)}
                        leftIcon={isCompleted ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      >
                        {isCompleted ? 'Retake Quiz' : 'Start Assessment'}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 bg-white dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <Brain className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No Quizzes Available Yet
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No quizzes have been published for Class {studentClass} yet. When your teacher publishes a quiz, it will automatically appear here!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { QuizPage };
export default QuizPage;
