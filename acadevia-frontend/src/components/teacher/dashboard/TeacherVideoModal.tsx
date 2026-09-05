import React, { useState } from 'react';
import { X, Video, Send, MessageSquare, ExternalLink } from 'lucide-react';
import { contentService, type ContentItemRecord } from '@/services/content.service';

interface TeacherVideoModalProps {
  video: ContentItemRecord | null;
  onClose: () => void;
  onCommentReplied?: () => void;
}

export const TeacherVideoModal: React.FC<TeacherVideoModalProps> = ({
  video,
  onClose,
  onCommentReplied,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);

  React.useEffect(() => {
    if (video) {
      contentService.getTeacherCommentsInbox().then((comments) => {
        const matching = comments.filter((c) => String(c.videoId) === String(video.id));
        setLocalComments(matching);
      }).catch(() => {});
    }
  }, [video]);

  if (!video) return null;

  const handleSendComment = async () => {
    if (!replyText.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      // If there's a comment, reply, or add a discussion note
      setLocalComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          studentName: 'Teacher (You)',
          commentText: replyText.trim(),
          createdAt: new Date().toISOString(),
          isResolved: true,
        },
      ]);
      setReplyText('');
      if (onCommentReplied) onCommentReplied();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1A1222] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5B2C6F]/10 dark:bg-[#C084FC]/15 text-[#5B2C6F] dark:text-[#C084FC] flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {video.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Class {video.classNumber} &bull; {video.subjectName} &bull; {video.chapterName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {video.fileUrl ? (
            <video
              src={video.fileUrl}
              controls
              autoPlay={false}
              poster={video.thumbnailUrl}
              className="w-full h-full object-contain"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Video className="w-12 h-12 opacity-50 mb-2" />
              <p className="text-xs">Video stream ready for delivery</p>
            </div>
          )}
        </div>

        {/* Discussion / Doubts Section */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              <MessageSquare className="w-3.5 h-3.5" />
              Student Doubts ({localComments.length})
            </div>
            <span className="text-[11px] text-gray-400">Class Discussion Feed</span>
          </div>

          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
            {localComments.length > 0 ? (
              localComments.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {c.studentName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {c.isResolved ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {c.commentText}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-2 text-center">
                No active student doubts on this lecture yet.
              </p>
            )}
          </div>

          {/* Quick Discussion Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Post a teacher note or clarification for students..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:border-[#5B2C6F]"
            />
            <button
              type="button"
              disabled={isSubmitting || !replyText.trim()}
              onClick={handleSendComment}
              className="px-3 py-2 rounded-xl bg-[#5B2C6F] hover:bg-[#4A2359] text-white text-xs font-bold disabled:opacity-50 transition flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Post
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
