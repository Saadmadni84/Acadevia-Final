import React, { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Clock,
  CheckCircle2,
  X,
  GripHorizontal,
} from 'lucide-react';

const popupQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  options: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  correctAnswer: z.number().min(0).max(3),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

type PopupQuestionForm = z.infer<typeof popupQuestionSchema>;

interface PopupQuestion extends PopupQuestionForm {
  id: string;
  timestamp: number;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const difficultyBadge: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const PopupQuestionEditor: React.FC = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [questions, setQuestions] = useState<PopupQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingAt, setAddingAt] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPopup, setShowPopup] = useState<PopupQuestion | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PopupQuestionForm>({
    resolver: zodResolver(popupQuestionSchema),
    defaultValues: {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
    },
  });

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (previewMode) {
      const q = questions.find(
        (q) => Math.abs(q.timestamp - time) < 0.5 && showPopup?.id !== q.id
      );
      if (q) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowPopup(q);
      }
    }
  }, [questions, previewMode, showPopup]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const timestamp = ratio * duration;

    if (previewMode) {
      videoRef.current.currentTime = timestamp;
      return;
    }

    setAddingAt(timestamp);
    reset({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
    });
  };

  const onSubmitQuestion = (data: PopupQuestionForm) => {
    if (editingId) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingId ? { ...q, ...data } : q))
      );
      setEditingId(null);
    } else if (addingAt !== null) {
      setQuestions((prev) =>
        [
          ...prev,
          { ...data, id: crypto.randomUUID(), timestamp: addingAt },
        ].sort((a, b) => a.timestamp - b.timestamp)
      );
      setAddingAt(null);
    }
    reset();
  };

  const editQuestion = (q: PopupQuestion) => {
    setEditingId(q.id);
    setAddingAt(q.timestamp);
    reset({
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
    });
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setAddingAt(null);
      reset();
    }
  };

  const handleMarkerDrag = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    setDraggingId(id);

    const timeline = e.currentTarget.parentElement!;
    const onMove = (ev: MouseEvent) => {
      const rect = timeline.getBoundingClientRect();
      const x = Math.max(0, Math.min(ev.clientX - rect.left, rect.width));
      const ts = (x / rect.width) * duration;
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, timestamp: ts } : q)).sort((a, b) => a.timestamp - b.timestamp)
      );
    };
    const onUp = () => {
      setDraggingId(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('teacher.popup.title', 'Popup Question Editor')}
        </h2>
        <button
          type="button"
          onClick={() => {
            setPreviewMode(!previewMode);
            setShowPopup(null);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            previewMode
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Eye className="h-4 w-4" />
          {previewMode
            ? t('teacher.popup.exitPreview', 'Exit Preview')
            : t('teacher.popup.preview', 'Preview Experience')}
        </button>
      </div>

      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration || 300);
          }}
          src=""
        >
          <track kind="captions" />
        </video>

        {/* No video fallback */}
        {duration === 0 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 cursor-pointer"
            onClick={() => setDuration(300)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setDuration(300); }}
          >
            <Play className="h-16 w-16 text-gray-500 mb-2" />
            <p className="text-gray-400 text-sm">{t('teacher.popup.loadVideo', 'Click to simulate a 5-min video')}</p>
          </div>
        )}

        {/* Play/Pause overlay */}
        {duration > 0 && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-white text-sm backdrop-blur-sm transition-colors hover:bg-black/80"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {formatTime(currentTime)} / {formatTime(duration)}
          </button>
        )}

        {/* Popup Question Overlay */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            >
              <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{showPopup.text}</p>
                <div className="space-y-2">
                  {showPopup.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setShowPopup(null)}
                      className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                        idx === showPopup.correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      <span className="font-medium">{optionLabels[idx]}.</span> {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      {duration > 0 && (
        <div className="space-y-2">
          <div
            className="relative h-10 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-crosshair overflow-visible"
            onClick={handleTimelineClick}
            role="slider"
            aria-label={t('teacher.popup.timeline', 'Video timeline')}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
          >
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-lg bg-indigo-200 dark:bg-indigo-900/40"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />

            {/* Question markers */}
            {questions.map((q) => (
              <div
                key={q.id}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing ${
                  draggingId === q.id ? 'scale-125' : ''
                }`}
                style={{ left: `${(q.timestamp / duration) * 100}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMarkerDrag(q.id, e);
                }}
                title={`${formatTime(q.timestamp)} - ${q.text}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center text-[10px] font-bold text-white ${
                    q.difficulty === 'easy' ? 'bg-green-500' : q.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <GripHorizontal className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}

            {/* Adding marker */}
            {addingAt !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                style={{ left: `${(addingAt / duration) * 100}%` }}
              >
                <div className="h-8 w-8 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-800 flex items-center justify-center animate-pulse">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>00:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Question Form */}
      <AnimatePresence>
        {(addingAt !== null || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId
                  ? t('teacher.popup.editQuestion', 'Edit Question')
                  : t('teacher.popup.addQuestion', 'Add Question')}{' '}
                <span className="text-sm font-normal text-gray-500">
                  @ {formatTime(addingAt ?? 0)}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAddingAt(null);
                  setEditingId(null);
                  reset();
                }}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={t('common.close', 'Close')}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-4">
              <div>
                <label htmlFor="popupText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('teacher.popup.questionText', 'Question')}
                </label>
                <textarea
                  id="popupText"
                  rows={2}
                  {...register('text')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                />
                {errors.text && <p className="mt-1 text-sm text-red-500">{errors.text.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {optionLabels.map((label, idx) => (
                  <Controller
                    key={idx}
                    control={control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <div className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                        field.value === idx
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <button
                          type="button"
                          onClick={() => field.onChange(idx)}
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                            field.value === idx
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                          aria-label={`Mark option ${label} as correct`}
                        >
                          {field.value === idx ? <CheckCircle2 className="h-4 w-4" /> : label}
                        </button>
                        <input
                          {...register(`options.${idx as 0 | 1 | 2 | 3}`)}
                          placeholder={`Option ${label}`}
                          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                        />
                      </div>
                    )}
                  />
                ))}
              </div>

              <div>
                <label htmlFor="popupDiff" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('teacher.popup.difficulty', 'Difficulty')}
                </label>
                <select
                  id="popupDiff"
                  {...register('difficulty')}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddingAt(null);
                    setEditingId(null);
                    reset();
                  }}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  {editingId ? t('common.update', 'Update') : t('common.add', 'Add')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('teacher.popup.allQuestions', 'All Popup Questions')} ({questions.length})
          </h3>
          <div className="space-y-3">
            {questions.map((q) => (
              <motion.div
                key={q.id}
                layout
                className="flex items-center gap-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4"
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-mono font-medium text-gray-600 dark:text-gray-300">
                    {formatTime(q.timestamp)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{q.text}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyBadge[q.difficulty]}`}>
                  {q.difficulty}
                </span>
                {!previewMode && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => editQuestion(q)}
                      className="rounded p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      aria-label={t('common.edit', 'Edit')}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="rounded p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={t('common.delete', 'Delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PopupQuestionEditor;
