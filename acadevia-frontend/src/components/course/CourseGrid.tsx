import React from 'react';
import { CourseCard } from './CourseCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  subject: string;
  thumbnail?: string;
  instructor: string;
  duration: string;
  totalLessons: number;
  completedLessons?: number;
  rating: number;
  enrolledCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  className?: string;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, loading, className }) => {
  if (loading) return (
    <div className={cn('grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <Skeleton className="h-40 rounded-none" />
          <div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-full" /></div>
        </div>
      ))}
    </div>
  );

  if (courses.length === 0) return <EmptyState icon={<BookOpen />} title="No courses found" description="Try adjusting your filters or search terms." />;

  return (
    <div className={cn('grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {courses.map(c => <CourseCard key={c.id} {...c} />)}
    </div>
  );
};

export { CourseGrid };
