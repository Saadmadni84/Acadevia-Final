import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Star, BookOpen, Play, Award, ChevronDown, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

interface Module {
  id: string;
  title: string;
  lessons: { id: string; title: string; duration: string; type: 'video' | 'quiz' | 'game'; completed: boolean; locked: boolean }[];
}

interface CourseDetailProps {
  id: string;
  title: string;
  subject: string;
  description: string;
  instructor: { name: string; avatar?: string };
  duration: string;
  totalLessons: number;
  rating: number;
  enrolledCount: number;
  modules: Module[];
  progress?: number;
  enrolled?: boolean;
  onEnroll?: () => void;
  onStartLesson?: (moduleId: string, lessonId: string) => void;
}

const ModuleAccordion: React.FC<{ module: Module; index: number; onStart?: (mId: string, lId: string) => void }> = ({ module, index, onStart }) => {
  const [open, setOpen] = useState(index === 0);
  const done = module.lessons.filter(l => l.completed).length;
  const typeIcon = { video: Play, quiz: BookOpen, game: Award };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-primary bg-primary/10 w-7 h-7 rounded-lg flex items-center justify-center">{index + 1}</span>
          <div>
            <p className="font-medium text-sm">{module.title}</p>
            <p className="text-xs text-gray-500">{module.lessons.length} lessons · {done}/{module.lessons.length} done</p>
          </div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {module.lessons.map(l => {
            const Icon = typeIcon[l.type];
            return (
              <button key={l.id} onClick={() => !l.locked && onStart?.(module.id, l.id)} className={cn('w-full flex items-center gap-3 p-3 px-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors', l.locked && 'opacity-50 cursor-not-allowed')}>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', l.completed ? 'bg-secondary/10' : 'bg-gray-100 dark:bg-gray-800')}>
                  {l.completed ? <CheckCircle className="h-4 w-4 text-secondary" /> : l.locked ? <Lock className="h-3.5 w-3.5 text-gray-400" /> : <Icon className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="flex-1"><p className="text-sm">{l.title}</p></div>
                <span className="text-xs text-gray-400">{l.duration}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CourseDetail: React.FC<CourseDetailProps> = ({
  title, subject, description, duration, totalLessons,
  rating, enrolledCount, modules, progress, enrolled, onEnroll, onStartLesson,
}) => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-6 lg:p-8 text-white">
      <div className="relative z-10">
        <Badge variant="warning" className="mb-3">{subject}</Badge>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-white/70 text-sm mb-4 max-w-2xl">{description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 mb-4">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{enrolledCount} enrolled</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{rating.toFixed(1)}</span>
        </div>
        {progress != null && <Progress value={progress} size="sm" className="max-w-md mb-2 [&>div>div]:bg-white [&>div]:bg-white/20" />}
        {!enrolled && <Button onClick={onEnroll} className="bg-white text-primary hover:bg-gray-100 mt-2" size="lg">Enroll Now - Free</Button>}
      </div>
    </motion.div>

    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Course Content</h2>
      {modules.map((m, i) => <ModuleAccordion key={m.id} module={m} index={i} onStart={onStartLesson} />)}
    </div>
  </div>
);

export { CourseDetail };
