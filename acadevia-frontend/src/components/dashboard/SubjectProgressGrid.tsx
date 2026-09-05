import React from 'react';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';
import type { SubjectData } from './SubjectDetailModal';

interface SubjectProgressGridProps {
  onSelectSubject: (subject: SubjectData) => void;
}

interface SubjectCardConfig {
  id: string;
  name: string;
  icon: string;
  classGrade: number;
  completedChapters: number;
  totalChapters: number;
  progressPercent: number;
  nextChapter: string;
  iconBg: string;
  accentColor: string;
  barColor: string;
  description: string;
  chapters: SubjectData['chapters'];
}

export const defaultSubjectsData: SubjectCardConfig[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    classGrade: 10,
    completedChapters: 8,
    totalChapters: 12,
    progressPercent: 67,
    nextChapter: 'Quadratic Equations & Roots',
    iconBg: 'bg-purple-100 dark:bg-purple-950/60 text-primary dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40',
    accentColor: 'text-primary dark:text-purple-300',
    barColor: 'bg-primary',
    description: 'Master quadratic formulas, trigonometry proofs, coordinate geometry, and statistics.',
    chapters: [
      { id: 'm1', number: 1, title: 'Real Numbers', duration: '45m', status: 'completed', score: '92%' },
      { id: 'm2', number: 2, title: 'Polynomials', duration: '50m', status: 'completed', score: '88%' },
      { id: 'm3', number: 3, title: 'Pair of Linear Equations', duration: '60m', status: 'completed', score: '85%' },
      { id: 'm4', number: 4, title: 'Quadratic Equations & Vertex', duration: '55m', status: 'in_progress', lessonId: 'less_math_10_quad' },
      { id: 'm5', number: 5, title: 'Arithmetic Progressions', duration: '40m', status: 'completed', score: '90%' },
      { id: 'm6', number: 6, title: 'Triangles & Similarity', duration: '65m', status: 'completed', score: '80%' },
      { id: 'm7', number: 7, title: 'Coordinate Geometry', duration: '50m', status: 'completed', score: '84%' },
      { id: 'm8', number: 8, title: 'Introduction to Trigonometry', duration: '60m', status: 'completed', score: '78%' },
      { id: 'm9', number: 9, title: 'Applications of Trigonometry', duration: '45m', status: 'locked' },
      { id: 'm10', number: 10, title: 'Circles & Tangents', duration: '50m', status: 'locked' },
      { id: 'm11', number: 11, title: 'Areas Related to Circles', duration: '40m', status: 'locked' },
      { id: 'm12', number: 12, title: 'Surface Areas & Volumes', duration: '60m', status: 'locked' },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    classGrade: 10,
    completedChapters: 4,
    totalChapters: 10,
    progressPercent: 40,
    nextChapter: 'Life Processes & Optics',
    iconBg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40',
    accentColor: 'text-teal-600 dark:text-teal-300',
    barColor: 'bg-teal-600',
    description: 'Explore chemical reactions, light reflection and refraction, human biology, and electricity.',
    chapters: [
      { id: 's1', number: 1, title: 'Chemical Reactions & Equations', duration: '50m', status: 'completed', score: '94%' },
      { id: 's2', number: 2, title: 'Acids, Bases and Salts', duration: '55m', status: 'completed', score: '86%' },
      { id: 's3', number: 3, title: 'Metals and Non-metals', duration: '45m', status: 'completed', score: '90%' },
      { id: 's4', number: 4, title: 'Carbon and its Compounds', duration: '60m', status: 'completed', score: '82%' },
      { id: 's5', number: 5, title: 'Life Processes & Respiration', duration: '65m', status: 'in_progress', lessonId: 'less_sci_10_light' },
      { id: 's6', number: 6, title: 'Control and Coordination', duration: '45m', status: 'locked' },
      { id: 's7', number: 7, title: 'How do Organisms Reproduce?', duration: '50m', status: 'locked' },
      { id: 's8', number: 8, title: 'Heredity and Evolution', duration: '40m', status: 'locked' },
      { id: 's9', number: 9, title: 'Light: Reflection and Refraction', duration: '60m', status: 'locked' },
      { id: 's10', number: 10, title: 'The Human Eye & Colorful World', duration: '45m', status: 'locked' },
    ],
  },
  {
    id: 'english',
    name: 'English Literature',
    icon: '📖',
    classGrade: 10,
    completedChapters: 5,
    totalChapters: 8,
    progressPercent: 62,
    nextChapter: 'Glimpses of India',
    iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40',
    accentColor: 'text-rose-600 dark:text-rose-300',
    barColor: 'bg-rose-500',
    description: 'Read prose, poetry, and linguistic comprehension with vocabulary builder modules.',
    chapters: [
      { id: 'e1', number: 1, title: 'A Letter to God', duration: '35m', status: 'completed', score: '95%' },
      { id: 'e2', number: 2, title: 'Nelson Mandela: Long Walk to Freedom', duration: '40m', status: 'completed', score: '91%' },
      { id: 'e3', number: 3, title: 'Two Stories about Flying', duration: '35m', status: 'completed', score: '88%' },
      { id: 'e4', number: 4, title: 'From the Diary of Anne Frank', duration: '45m', status: 'completed', score: '90%' },
      { id: 'e5', number: 5, title: 'Glimpses of India', duration: '40m', status: 'in_progress' },
      { id: 'e6', number: 6, title: 'Mijbil the Otter', duration: '35m', status: 'locked' },
      { id: 'e7', number: 7, title: 'Madam Rides the Bus', duration: '40m', status: 'locked' },
      { id: 'e8', number: 8, title: 'The Sermon at Benares', duration: '45m', status: 'locked' },
    ],
  },
  {
    id: 'social',
    name: 'Social Science',
    icon: '🌍',
    classGrade: 10,
    completedChapters: 3,
    totalChapters: 9,
    progressPercent: 33,
    nextChapter: 'Resources & Development',
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40',
    accentColor: 'text-amber-600 dark:text-amber-300',
    barColor: 'bg-amber-500',
    description: 'Understand Indian modern history, geographical resources, democratic politics, and economy.',
    chapters: [
      { id: 'ss1', number: 1, title: 'The Rise of Nationalism in Europe', duration: '50m', status: 'completed', score: '85%' },
      { id: 'ss2', number: 2, title: 'Nationalism in India', duration: '55m', status: 'completed', score: '89%' },
      { id: 'ss3', number: 3, title: 'The Making of a Global World', duration: '45m', status: 'completed', score: '82%' },
      { id: 'ss4', number: 4, title: 'Resources and Development', duration: '40m', status: 'in_progress' },
      { id: 'ss5', number: 5, title: 'Forest and Wildlife Resources', duration: '35m', status: 'locked' },
      { id: 'ss6', number: 6, title: 'Water Resources & Dams', duration: '40m', status: 'locked' },
      { id: 'ss7', number: 7, title: 'Agriculture & Crops of India', duration: '45m', status: 'locked' },
      { id: 'ss8', number: 8, title: 'Power Sharing in Democracies', duration: '35m', status: 'locked' },
      { id: 'ss9', number: 9, title: 'Federalism & Local Government', duration: '40m', status: 'locked' },
    ],
  },
];

export const SubjectProgressGrid: React.FC<SubjectProgressGridProps> = ({
  onSelectSubject,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-[-0.02em]">
            Your Subjects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Syllabus progress & interactive chapter breakdown
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelectSubject(defaultSubjectsData[0])}
          className="text-xs font-semibold text-primary dark:text-purple-300 cursor-pointer hover:underline"
        >
          Click card to view syllabus →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {defaultSubjectsData.map((sub) => {
          // Generate an array of segments for the chapter tracker
          const segments = Array.from({ length: sub.totalChapters }, (_, i) => i < sub.completedChapters);

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubject(sub)}
              className="surface-card surface-card-hover p-5 flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="space-y-3.5">
                {/* Header: Icon Squircle & Percentage Pill */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-2xs ${sub.iconBg}`}>
                    {sub.icon}
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums">
                    {sub.progressPercent}%
                  </span>
                </div>

                {/* Subject Title & Stats */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-purple-300 transition-colors uppercase tracking-wider">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {sub.completedChapters} of {sub.totalChapters} chapters done
                  </p>
                </div>

                {/* Linear-Style Segmented Chapter Progress Bar */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-1 w-full">
                    {segments.map((isFilled, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          isFilled
                            ? sub.barColor
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                        title={`Chapter ${idx + 1}: ${isFilled ? 'Completed' : 'Remaining'}`}
                      />
                    ))}
                  </div>

                  {/* Next Chapter Indicator */}
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Next:</span>
                    <span className="truncate text-primary dark:text-purple-300 font-semibold">{sub.nextChapter}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Link Action */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-purple-300 transition-colors">
                <span>View {sub.totalChapters} Chapters</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SubjectProgressGrid;
