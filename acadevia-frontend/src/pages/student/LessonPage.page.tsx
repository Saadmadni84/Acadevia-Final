import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LessonViewer } from '@/components/lesson/LessonViewer';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const mockLesson = {
    id: lessonId || 'l1',
    type: 'video' as const,
    title: 'Introduction to Quadratic Equations',
    videoUrl: '',
    popupQuestions: [
      { timestamp: 30, question: 'What is the standard form of a quadratic equation?', options: ['ax² + bx + c = 0', 'ax + b = 0', 'ax³ + bx² = 0', 'a/x + b = 0'], correctIndex: 0 },
      { timestamp: 120, question: 'How many solutions can a quadratic equation have?', options: ['Only 1', 'Exactly 2', 'At most 2', 'Infinite'], correctIndex: 2 },
    ],
  };

  return (
    <div className="p-1">
      <LessonViewer
        lesson={mockLesson}
        courseTitle="Mathematics - Quadratic Equations"
        progress={40}
        onBack={() => navigate(`/courses/${courseId}`)}
        onNext={() => {}}
        onPrev={() => {}}
        onComplete={() => {}}
        hasNext={true}
        hasPrev={false}
      />
    </div>
  );
};

export default LessonPage;
