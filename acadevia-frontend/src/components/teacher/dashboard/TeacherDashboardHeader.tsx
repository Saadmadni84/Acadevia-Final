import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PlusCircle, Sparkles, School, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { executeClass10Simulation } from '@/services/class10Simulation.service';

interface TeacherDashboardHeaderProps {
  teacherName: string;
  designation?: string;
  schoolName?: string;
  avatarUrl?: string;
  classesTaught: number[];
  selectedClass: number;
  onSelectClass: (c: number) => void;
  subjectsTaught: string[];
  selectedSubject: string;
  onSelectSubject: (s: string) => void;
  onRefresh?: () => void;
}

export const TeacherDashboardHeader: React.FC<TeacherDashboardHeaderProps> = ({
  teacherName,
  designation = 'Faculty',
  schoolName = 'Acadevia Partner School',
  avatarUrl,
  classesTaught,
  selectedClass,
  onSelectClass,
  subjectsTaught,
  selectedSubject,
  onSelectSubject,
  onRefresh,
}) => {
  const navigate = useNavigate();

  const handleRunSimulation = () => {
    executeClass10Simulation();
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="relative rounded-3xl bg-[#F8F5EF] dark:bg-[#150D1C] border border-[#E8E4DA] dark:border-[#2D1B36] p-6 sm:p-8 shadow-xs overflow-hidden transition-colors duration-300">
      {/* Subtle brand glow background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#5B2C6F]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Teacher Profile & Info */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={teacherName}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white dark:border-purple-900/60 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#5B2C6F] to-[#8E44AD] text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md">
                {teacherName.charAt(0)}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900"
              title="Active Now"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome, {teacherName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5B2C6F]/10 text-[#5B2C6F] dark:bg-[#C084FC]/15 dark:text-[#E9D5FF] border border-[#5B2C6F]/20 dark:border-[#C084FC]/30">
                Teacher Hub
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {designation}
              </span>
              <span className="hidden sm:inline opacity-40">&bull;</span>
              <span className="inline-flex items-center gap-1">
                <School className="w-3.5 h-3.5 opacity-70" />
                {schoolName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Command Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start lg:self-center">
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunSimulation}
              className="border-dashed border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-xs shadow-none"
              title="Populate dynamic Class 10 assessment data"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Simulate Live Data
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.TEACHER_QUIZ_CREATE)}
            className="border-gray-300 dark:border-gray-700 hover:border-[#5B2C6F] text-gray-700 dark:text-gray-200 text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5 text-[#5B2C6F] dark:text-[#C084FC]" />
            New Quiz
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate(ROUTES.TEACHER_CONTENT_UPLOAD)}
            className="bg-[#5B2C6F] hover:bg-[#4A2359] text-white shadow-sm text-xs sm:text-sm"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Upload Lecture
          </Button>
        </div>
      </div>

      {/* Class & Subject Filter Ribbon */}
      <div className="mt-6 pt-5 border-t border-[#E8E4DA]/80 dark:border-[#2D1B36] flex flex-wrap items-center justify-between gap-4">
        {/* Class switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" /> Class:
          </span>
          {classesTaught.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onSelectClass(c)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                selectedClass === c
                  ? 'bg-[#5B2C6F] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#5B2C6F]/40'
              }`}
            >
              Class {c}
            </button>
          ))}
        </div>

        {/* Subject switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
            <BookOpen className="w-3.5 h-3.5" /> Subject:
          </span>
          {['All', ...subjectsTaught].map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => onSelectSubject(sub)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                selectedSubject === sub
                  ? 'bg-[#5B2C6F] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#5B2C6F]/40'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
