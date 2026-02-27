import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseDetail } from '@/components/course/CourseDetail';

const mockModules = [
  { id: 'm1', title: 'Introduction', lessons: [
    { id: 'l1', title: 'Welcome & Overview', duration: '5m', type: 'video' as const, completed: true, locked: false },
    { id: 'l2', title: 'Course Structure', duration: '8m', type: 'video' as const, completed: true, locked: false },
  ]},
  { id: 'm2', title: 'Core Concepts', lessons: [
    { id: 'l3', title: 'Fundamentals', duration: '15m', type: 'video' as const, completed: false, locked: false },
    { id: 'l4', title: 'Practice Quiz', duration: '10m', type: 'quiz' as const, completed: false, locked: false },
    { id: 'l5', title: 'Advanced Topics', duration: '20m', type: 'video' as const, completed: false, locked: true },
  ]},
  { id: 'm3', title: 'Final Assessment', lessons: [
    { id: 'l6', title: 'Review Game', duration: '15m', type: 'game' as const, completed: false, locked: true },
    { id: 'l7', title: 'Final Quiz', duration: '30m', type: 'quiz' as const, completed: false, locked: true },
  ]},
];

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-1">
      <CourseDetail
        id={courseId || '1'}
        title="Mathematics - Quadratic Equations"
        subject="Mathematics"
        description="Master quadratic equations with interactive lessons, practice problems, and gaming activities. Perfect for Class 10 CBSE students."
        instructor={{ name: 'Dr. Ramesh Kumar' }}
        duration="4h 30m"
        totalLessons={7}
        rating={4.8}
        enrolledCount={2340}
        modules={mockModules}
        progress={28}
        enrolled={true}
        onStartLesson={(_mId, lId) => navigate(`/courses/${courseId}/lessons/${lId}`)}
      />
    </div>
  );
};

export default CourseDetailPage;
