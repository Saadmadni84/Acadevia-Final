import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import type { CourseReview } from '@/types/course.types';

interface CourseReviewCardProps {
  review: CourseReview;
  onHelpful?: (reviewId: string, helpful: boolean) => void;
  className?: string;
}

const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 5 }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
    {Array.from({ length: max }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3.5 w-3.5',
          i < rating ? 'text-warning fill-warning' : 'text-gray-300 dark:text-gray-600',
        )}
        aria-hidden
      />
    ))}
  </div>
);

const CourseReviewCard: React.FC<CourseReviewCardProps> = ({
  review,
  onHelpful,
  className,
}) => {
  const { t } = useTranslation();
  const [vote, setVote] = useState<'helpful' | 'not' | null>(null);

  const handleVote = (helpful: boolean) => {
    const next = helpful ? 'helpful' : 'not';
    if (vote === next) return;
    setVote(next as 'helpful' | 'not');
    onHelpful?.(review.id, helpful);
  };

  const dateStr = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        // Glassmorphism card
        'rounded-2xl p-5 backdrop-blur-lg bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 shadow-sm',
        className,
      )}
      aria-label={`${t('review.by')} ${review.userName}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={review.avatarUrl}
          alt={review.userName}
          fallback={review.userName.charAt(0)}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{review.userName}</p>
          <p className="text-xs text-gray-400">{dateStr}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Body */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="mr-auto">{t('review.helpful')}</span>
        <button
          onClick={() => handleVote(true)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
            vote === 'helpful'
              ? 'text-primary bg-primary/10'
              : 'hover:text-primary hover:bg-primary/5',
          )}
          aria-pressed={vote === 'helpful'}
          aria-label={t('review.markHelpful')}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          {t('review.yes')}
        </button>
        <button
          onClick={() => handleVote(false)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
            vote === 'not'
              ? 'text-red-500 bg-red-500/10'
              : 'hover:text-red-500 hover:bg-red-500/5',
          )}
          aria-pressed={vote === 'not'}
          aria-label={t('review.markNotHelpful')}
        >
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
          {t('review.no')}
        </button>
      </div>
    </motion.article>
  );
};

export { CourseReviewCard };
