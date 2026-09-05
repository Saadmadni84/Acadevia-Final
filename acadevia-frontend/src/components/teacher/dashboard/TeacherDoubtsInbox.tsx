import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, User, Sparkles } from 'lucide-react';
import { contentService } from '@/services/content.service';

interface DoubtComment {
  id: number;
  videoId?: string;
  videoTitle?: string;
  studentName: string;
  commentText: string;
  createdAt: string;
  isResolved?: boolean;
  replies?: Array<{
    id: number;
    replyText: string;
    repliedBy: string;
    createdAt: string;
  }>;
}

interface TeacherDoubtsInboxProps {
  initialDoubts?: DoubtComment[];
  onDoubtReplied?: () => void;
}

export const TeacherDoubtsInbox: React.FC<TeacherDoubtsInboxProps> = ({
  initialDoubts = [],
  onDoubtReplied,
}) => {
  const [doubts, setDoubts] = useState<DoubtComment[]>(initialDoubts);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialDoubts updates
  React.useEffect(() => {
    setDoubts(initialDoubts);
  }, [initialDoubts]);

  const handleSendReply = async (commentId: number) => {
    if (!replyText.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await contentService.replyToComment(commentId, replyText.trim());

      setDoubts((prev) =>
        prev.map((d) =>
          d.id === commentId
            ? {
                ...d,
                isResolved: true,
                replies: [
                  ...(d.replies || []),
                  {
                    id: Date.now(),
                    replyText: replyText.trim(),
                    repliedBy: 'Teacher',
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : d
        )
      );

      setReplyText('');
      setActiveReplyId(null);
      if (onDoubtReplied) onDoubtReplied();
    } catch (err) {
      console.error('Failed to reply to comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async (commentId: number) => {
    try {
      await contentService.markCommentResolved(commentId);
      setDoubts((prev) =>
        prev.map((d) => (d.id === commentId ? { ...d, isResolved: true } : d))
      );
      if (onDoubtReplied) onDoubtReplied();
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  };

  const pendingCount = doubts.filter((d) => !d.isResolved && (!d.replies || d.replies.length === 0)).length;

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1A1222] border border-[#E8E4DA] dark:border-[#2D1B36] p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8E4DA]/80 dark:border-[#2D1B36]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5B2C6F]/10 dark:bg-[#C084FC]/15 text-[#5B2C6F] dark:text-[#C084FC] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Student Doubts & Q&A
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5B2C6F]/10 text-[#5B2C6F] dark:bg-[#C084FC]/15 dark:text-[#E9D5FF]">
            {pendingCount} Pending
          </span>
        </div>

        {/* Doubts Stream */}
        <div className="space-y-3">
          {doubts.length > 0 ? (
            doubts.slice(0, 4).map((doubt) => {
              const hasReplies = doubt.replies && doubt.replies.length > 0;
              const isReplying = activeReplyId === doubt.id;

              return (
                <div
                  key={doubt.id}
                  className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2.5 transition-all"
                >
                  {/* Student Question Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {doubt.studentName}
                        </p>
                        {doubt.videoTitle && (
                          <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                            Re: {doubt.videoTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {hasReplies ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCheck className="w-3 h-3" /> Answered
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        Needs Answer
                      </span>
                    )}
                  </div>

                  {/* Doubt Text */}
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#150D1C] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    &ldquo;{doubt.commentText}&rdquo;
                  </p>

                  {/* Teacher Replies Preview */}
                  {hasReplies && (
                    <div className="pl-3 border-l-2 border-[#5B2C6F]/30 space-y-1 pt-1">
                      {doubt.replies?.map((r) => (
                        <div key={r.id} className="text-[11px] text-gray-600 dark:text-gray-400">
                          <strong className="text-[#5B2C6F] dark:text-[#C084FC] font-semibold">
                            You:
                          </strong>{' '}
                          {r.replyText}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Trigger or Box */}
                  {!hasReplies && (
                    <div className="pt-1">
                      {isReplying ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            placeholder="Write your explanation..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply(doubt.id)}
                            className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-[#150D1C] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:border-[#5B2C6F]"
                          />
                          <button
                            type="button"
                            disabled={isSubmitting || !replyText.trim()}
                            onClick={() => handleSendReply(doubt.id)}
                            className="p-1.5 rounded-xl bg-[#5B2C6F] text-white hover:bg-[#4A2359] disabled:opacity-50 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyId(doubt.id);
                              setReplyText('');
                            }}
                            className="text-[11px] font-semibold text-[#5B2C6F] dark:text-[#C084FC] hover:underline"
                          >
                            Reply to student &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkResolved(doubt.id)}
                            className="text-[11px] font-medium text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                          >
                            Mark as resolved
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center space-y-2">
              <Sparkles className="w-7 h-7 text-[#5B2C6F]/40 dark:text-[#C084FC]/40 mx-auto" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                No unanswered student doubts.
              </p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                Questions posted on your video lectures will appear here for instant resolution.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
