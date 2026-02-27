import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

interface CourseCardProps {
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
  className?: string;
}

const difficultyColor = { beginner: 'success', intermediate: 'warning', advanced: 'accent' } as const;

const CourseCard: React.FC<CourseCardProps> = ({
  id, title, subject, thumbnail, instructor, duration, totalLessons,
  completedLessons, rating, enrolledCount, difficulty, tags, className,
}) => {
  const progress = completedLessons != null ? Math.round((completedLessons / totalLessons) * 100) : null;

  return (
    <motion.div whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} className={cn('glass-card overflow-hidden group', className)}>
      <Link to={`/courses/${id}`}>
        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
          {thumbnail ? <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :
            <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>}
          <Badge variant={difficultyColor[difficulty]} className="absolute top-3 left-3 capitalize">{difficulty}</Badge>
        </div>
        <div className="p-4">
          <p className="text-xs font-medium text-primary mb-1">{subject}</p>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs text-gray-500 mb-3">by {instructor}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{totalLessons} lessons</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{enrolledCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-warning fill-warning" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
            {tags && tags.length > 0 && (
              <div className="flex gap-1">{tags.slice(0, 2).map(t => <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>)}</div>
            )}
          </div>
          {progress != null && (
            <div className="mt-3">
              <Progress value={progress} size="sm" />
              <p className="text-[10px] text-gray-400 mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export { CourseCard };
