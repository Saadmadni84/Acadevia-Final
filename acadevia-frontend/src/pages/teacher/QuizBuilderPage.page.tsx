import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { QuizCreator } from '@/components/teacher/QuizCreator';
import { useAuthStore } from '@/stores/useAuthStore';
import { dataService, type QuizRecord } from '@/services/data.service';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Brain,
  Trash2,
  Clock,
  HelpCircle,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  PlusCircle,
  FolderKanban,
} from 'lucide-react';

const QuizBuilderPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const teacherId = user?.id || '10';

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [quizToDelete, setQuizToDelete] = useState<QuizRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadQuizzes = () => {
    try {
      const all = dataService.getAllQuizzes ? dataService.getAllQuizzes() : (dataService.getQuizzes ? dataService.getQuizzes() : []);
      if (!Array.isArray(all)) {
        setQuizzes([]);
        return;
      }
      // Filter quizzes created by this teacher, or all if admin
      const teacherQuizzes = all.filter((q) => {
        if (!q) return false;
        if (user?.role === 'ADMIN') return true;
        return (
          String(q.teacherId || '') === String(teacherId || '') ||
          (user?.fullName && q.teacherName && q.teacherName.toLowerCase() === user.fullName.toLowerCase())
        );
      });
      setQuizzes(teacherQuizzes);
    } catch (err) {
      console.warn('[QuizBuilderPage] loadQuizzes failed gracefully:', err);
      setQuizzes([]);
    }
  };

  useEffect(() => {
    loadQuizzes();
    // Subscribe to state updates
    try {
      const unsubscribe = dataService.subscribe?.(() => {
        loadQuizzes();
      });
      return unsubscribe;
    } catch {
      return undefined;
    }
  }, [teacherId, user?.role, user?.fullName]);

  // Compute attempt count for a quiz
  const getAttemptCount = (quiz: QuizRecord): number => {
    try {
      if (!quiz) return 0;
      const results = dataService.getTeacherQuizResults ? dataService.getTeacherQuizResults(teacherId) : [];
      if (!Array.isArray(results)) return 0;
      const qId = String(quiz.id || '').toLowerCase();
      const numId = (quiz as any)?.numericId ? String((quiz as any).numericId).toLowerCase() : '';
      return results.filter((r) => {
        if (!r) return false;
        const rId = String(r.quizId || '').toLowerCase();
        const rNum = (r as any)?.numericQuizId ? String((r as any).numericQuizId).toLowerCase() : '';
        return (qId && rId === qId) || (numId && rNum === numId) || (numId && rId === numId);
      }).length;
    } catch {
      return 0;
    }
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const targetId = (quizToDelete as any).numericId || quizToDelete.id;
      const res = await dataService.deleteQuiz(targetId);

      setFeedback({
        type: 'success',
        message: res.message || `Quiz "${quizToDelete.title}" was successfully ${res.mode === 'ARCHIVED' ? 'archived' : 'deleted'}.`,
      });
      setQuizToDelete(null);
      loadQuizzes();
    } catch (err: any) {
      console.error('Quiz deletion failed:', err);
      setFeedback({
        type: 'error',
        message: err?.response?.data?.error || err?.message || 'Failed to delete quiz. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title={t('teacher.quizBuilder.title', 'Quiz Management & Creator')} />

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-white dark:bg-card-dark text-primary shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Create Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manage');
              loadQuizzes();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-white dark:bg-card-dark text-primary shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            Manage My Quizzes ({quizzes.length})
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'create' ? (
        <QuizCreator />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              My Created Assessments ({quizzes.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('create')}
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              Create Another Quiz
            </Button>
          </div>

          {quizzes.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => {
                const attempts = getAttemptCount(quiz);

                return (
                  <div
                    key={quiz.id}
                    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-[#D4A843]">
                            Class {quiz.classGrade} &bull; {quiz.subject}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
                            +{quiz.xpReward || 50} XP
                          </span>
                        </div>
                        {attempts > 0 ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <Users className="h-3 w-3" />
                            {attempts} attempt{attempts !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            No attempts
                          </span>
                        )}
                      </div>

                      {/* Chapter info if present */}
                      {quiz.chapter && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-[#D4A843]">
                          <BookOpen className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{quiz.chapter}</span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {quiz.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {quiz.description || `Assessment for Class ${quiz.classGrade} ${quiz.subject}`}
                      </p>

                      {/* Meta stats */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-primary" />
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-secondary" />
                          {Math.round((quiz.timeLimit || 300) / 60)} min
                        </span>
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        ID: {quiz.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuizToDelete(quiz)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800/60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Quiz
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 bg-white dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <Brain className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No Quizzes Created Yet
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                You haven't created any assessments yet. Click "Create Quiz" above to publish your first interactive quiz for students!
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('create')}
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Create Your First Quiz
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!quizToDelete}
        onClose={() => !isDeleting && setQuizToDelete(null)}
        title="Delete this quiz?"
      >
        {quizToDelete && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {quizToDelete.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Class {quizToDelete.classGrade}</span> &bull;{' '}
                <span>{quizToDelete.subject}</span>
                {quizToDelete.chapter && (
                  <>
                    &bull; <span>{quizToDelete.chapter}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Notice on Quiz Availability:</span>
              </div>
              <p>
                Deleting this quiz will immediately remove it from active student and teacher lists.
              </p>
              {getAttemptCount(quizToDelete) > 0 ? (
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  This quiz already has {getAttemptCount(quizToDelete)} student submission(s). To protect student academic history, the quiz will be safely archived without deleting student attempts or student XP.
                </p>
              ) : (
                <p>
                  This quiz has 0 student attempts and will be cleanly and permanently removed.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setQuizToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuizBuilderPage;
