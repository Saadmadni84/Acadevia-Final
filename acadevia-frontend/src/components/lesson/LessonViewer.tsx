import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';


interface LessonContent {
  id: string;
  type: 'video' | 'text' | 'quiz';
  title: string;
  videoUrl?: string;
  textContent?: string;
  popupQuestions?: any[];
  initialTime?: number;
}

interface LessonViewerProps {
  lesson: LessonContent;
  courseTitle: string;
  progress: number;
  initialTime?: number;
  onProgressUpdate?: (currentTime: number, duration: number, progressPct: number) => void;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onComplete: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  courseTitle,
  progress,
  initialTime = 0,
  onProgressUpdate,
  onBack,
  onNext,
  onPrev,
  onComplete,
  hasNext,
  hasPrev,
}) => {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
  };

  const startPosition = initialTime || lesson.initialTime || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" /> {courseTitle}
        </button>
        <Progress value={progress} size="sm" className="w-32" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold mb-4">{lesson.title}</h1>

        {lesson.type === 'video' && lesson.videoUrl && (
          <VideoPlayer
            src={lesson.videoUrl}
            title={lesson.title}
            popupQuestions={lesson.popupQuestions}
            initialTime={startPosition}
            onProgressUpdate={onProgressUpdate}
            onComplete={handleComplete}
          />
        )}

        {lesson.type === 'text' && lesson.textContent && (
          <div className="glass-card p-6 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lesson.textContent }} />
        )}
      </motion.div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={!hasPrev} leftIcon={<ChevronLeft className="h-4 w-4" />}>Previous</Button>
        <div className="flex gap-2">
          {!completed && <Button variant="gradient" onClick={handleComplete} leftIcon={<CheckCircle className="h-4 w-4" />}>Mark Complete</Button>}
          {completed && hasNext && <Button variant="gradient" onClick={onNext} rightIcon={<ChevronRight className="h-4 w-4" />}>Next Lesson</Button>}
        </div>
      </div>
    </div>
  );
};

export { LessonViewer };
