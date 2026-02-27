import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Send,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text is required'),
  options: z.tuple([
    z.string().min(1, 'Option A is required'),
    z.string().min(1, 'Option B is required'),
    z.string().min(1, 'Option C is required'),
    z.string().min(1, 'Option D is required'),
  ]),
  correctAnswer: z.number().min(0).max(3),
  hint: z.string().optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  timeLimit: z.number().min(1).max(180),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type QuizForm = z.infer<typeof quizSchema>;

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const QuizCreator: React.FC = () => {
  const { t } = useTranslation();
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      timeLimit: 30,
      difficulty: 'medium',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });
  const questions = watch('questions');

  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      hint: '',
      explanation: '',
      difficulty: 'medium',
    });
  };

  const handleDelete = (index: number) => {
    if (deleteConfirm === fields[index].id) {
      remove(index);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(fields[index].id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleReorder = (newOrder: typeof fields) => {
    const reordered = newOrder.map((item) =>
      questions.find((q) => q.id === item.id)!
    );
    setValue('questions', reordered);
  };

  const onSaveDraft = (data: QuizForm) => {
    console.log('Draft saved:', data);
  };

  const onPublish = (data: QuizForm) => {
    console.log('Published:', data);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('teacher.quiz.title', 'Quiz Creator')}
        </h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {questions.length} {t('teacher.quiz.questions', 'Questions')}
          </span>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label={previewMode ? t('teacher.quiz.editMode', 'Edit mode') : t('teacher.quiz.previewMode', 'Preview mode')}
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? t('teacher.quiz.edit', 'Edit') : t('teacher.quiz.preview', 'Preview')}
          </button>
        </div>
      </div>

      {/* Quiz Meta */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('teacher.quiz.quizTitle', 'Quiz Title')}
            </label>
            <input
              id="quizTitle"
              {...register('title')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              readOnly={previewMode}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="quizDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('teacher.quiz.description', 'Description')}
            </label>
            <textarea
              id="quizDesc"
              rows={2}
              {...register('description')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              readOnly={previewMode}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('teacher.quiz.timeLimit', 'Time Limit (minutes)')}
            </label>
            <input
              id="timeLimit"
              type="number"
              min={1}
              max={180}
              {...register('timeLimit', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              readOnly={previewMode}
            />
          </div>

          <div>
            <label htmlFor="quizDifficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('teacher.quiz.difficulty', 'Overall Difficulty')}
            </label>
            <select
              id="quizDifficulty"
              {...register('difficulty')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={previewMode}
            >
              <option value="easy">{t('common.easy', 'Easy')}</option>
              <option value="medium">{t('common.medium', 'Medium')}</option>
              <option value="hard">{t('common.hard', 'Hard')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions */}
      <Reorder.Group axis="y" values={fields} onReorder={handleReorder} className="space-y-4">
        <AnimatePresence>
          {fields.map((field, index) => (
            <Reorder.Item
              key={field.id}
              value={field}
              className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  {!previewMode && (
                    <button type="button" className="mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Drag to reorder">
                      <GripVertical className="h-5 w-5" />
                    </button>
                  )}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        {index + 1}
                      </span>
                      <Controller
                        control={control}
                        name={`questions.${index}.difficulty`}
                        render={({ field: diffField }) => (
                          <select
                            {...diffField}
                            disabled={previewMode}
                            className={`rounded-full px-3 py-1 text-xs font-medium border-0 outline-none ${difficultyColors[diffField.value]}`}
                            aria-label={t('teacher.quiz.questionDifficulty', 'Question difficulty')}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        )}
                      />
                      {!previewMode && (
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className={`ml-auto rounded-lg p-2 text-sm transition-colors ${
                            deleteConfirm === field.id
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          aria-label={
                            deleteConfirm === field.id
                              ? t('teacher.quiz.confirmDelete', 'Click again to confirm')
                              : t('teacher.quiz.deleteQuestion', 'Delete question')
                          }
                        >
                          {deleteConfirm === field.id ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`q-${field.id}`} className="sr-only">
                        Question {index + 1}
                      </label>
                      <textarea
                        id={`q-${field.id}`}
                        {...register(`questions.${index}.text`)}
                        placeholder={t('teacher.quiz.questionPlaceholder', 'Enter your question...')}
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                        readOnly={previewMode}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {optionLabels.map((label, optIdx) => (
                        <Controller
                          key={optIdx}
                          control={control}
                          name={`questions.${index}.correctAnswer`}
                          render={({ field: correctField }) => (
                            <div
                              className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                                correctField.value === optIdx
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                  : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => !previewMode && correctField.onChange(optIdx)}
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                  correctField.value === optIdx
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                                aria-label={`Mark option ${label} as correct`}
                              >
                                {correctField.value === optIdx ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  label
                                )}
                              </button>
                              <input
                                {...register(`questions.${index}.options.${optIdx as 0 | 1 | 2 | 3}`)}
                                placeholder={`Option ${label}`}
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                                readOnly={previewMode}
                              />
                            </div>
                          )}
                        />
                      ))}
                    </div>

                    {!previewMode && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`hint-${field.id}`} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <HelpCircle className="h-3.5 w-3.5" />
                            {t('teacher.quiz.hint', 'Hint (optional)')}
                          </label>
                          <input
                            id={`hint-${field.id}`}
                            {...register(`questions.${index}.hint`)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                        <div>
                          <label htmlFor={`expl-${field.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('teacher.quiz.explanation', 'Explanation (optional)')}
                          </label>
                          <input
                            id={`expl-${field.id}`}
                            {...register(`questions.${index}.explanation`)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add Question */}
      {!previewMode && (
        <motion.button
          type="button"
          onClick={addQuestion}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {t('teacher.quiz.addQuestion', 'Add Question')}
        </motion.button>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit(onSaveDraft)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          {t('teacher.quiz.saveDraft', 'Save Draft')}
        </button>
        <button
          type="button"
          onClick={handleSubmit(onPublish)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Send className="h-4 w-4" />
          {t('teacher.quiz.publish', 'Publish')}
        </button>
      </div>
    </motion.div>
  );
};

export default QuizCreator;
