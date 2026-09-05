import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Eye, MessageSquare, Plus, ExternalLink, Play } from 'lucide-react';
import { ROUTES } from '@/config/routes.config';
import type { ContentItemRecord } from '@/services/content.service';

interface TeacherPublishedContentGridProps {
  content: ContentItemRecord[];
  selectedClass: number;
  selectedSubject: string;
  onSelectVideo?: (item: ContentItemRecord) => void;
}

export const TeacherPublishedContentGrid: React.FC<TeacherPublishedContentGridProps> = ({
  content,
  selectedClass,
  selectedSubject,
  onSelectVideo,
}) => {
  const navigate = useNavigate();

  // Filter content by selectedClass and selectedSubject if applicable
  const filtered = content.filter((item) => {
    const matchClass = !selectedClass || Number(item.classNumber) === Number(selectedClass);
    const matchSubject =
      selectedSubject === 'All' ||
      item.subjectName.toLowerCase() === selectedSubject.toLowerCase();
    return matchClass && matchSubject;
  });

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1A1222] border border-[#E8E4DA] dark:border-[#2D1B36] p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4DA]/80 dark:border-[#2D1B36]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5B2C6F]/10 dark:bg-[#C084FC]/15 text-[#5B2C6F] dark:text-[#C084FC] flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Published Curriculum & Lectures
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active instructional videos and course materials delivered to students
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.TEACHER_CONTENT_UPLOAD)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5B2C6F] hover:bg-[#4A2359] text-white text-xs font-semibold shadow-xs transition self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Lecture
        </button>
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectVideo) onSelectVideo(item);
              }}
              className="group relative rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-[#5B2C6F]/40 dark:hover:border-[#C084FC]/40 hover:shadow-xs p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                {/* Thumbnail Preview Banner */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center group-hover:shadow-md transition">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                        {item.subjectName}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                    Class {item.classNumber}
                  </span>

                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white backdrop-blur-xs">
                    Video
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#5B2C6F] dark:group-hover:text-[#C084FC] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {item.chapterName} &bull; {item.subjectName}
                  </p>
                </div>
              </div>

              {/* Footer row */}
              <div className="pt-3 mt-3 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                  {item.totalComments || 0} doubts
                </span>

                <span className="inline-flex items-center gap-1 font-semibold text-[#5B2C6F] dark:text-[#C084FC] group-hover:underline text-[11px]">
                  View Lecture
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-[#5B2C6F] dark:text-[#C084FC] flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            No published lectures found for Class {selectedClass} ({selectedSubject})
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Upload video lessons or study notes to deliver curriculum content directly to your students.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.TEACHER_CONTENT_UPLOAD)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B2C6F] hover:bg-[#4A2359] text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload First Lesson
          </button>
        </div>
      )}
    </div>
  );
};
