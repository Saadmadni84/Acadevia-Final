import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  online?: boolean;
  levelRing?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 sm:h-28 sm:w-28 text-2xl font-bold',
};

const Avatar: React.FC<AvatarProps> = ({ src, name, alt, fallback, size = 'md', online, levelRing, className }) => {
  const [hasError, setHasError] = useState(false);
  const displayName = name || alt || fallback || '';

  const validSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return undefined;
    const trimmed = src.trim();
    if (!trimmed || trimmed === 'NULL' || trimmed === 'null' || trimmed === 'undefined') return undefined;
    return trimmed;
  }, [src]);

  useEffect(() => {
    setHasError(false);
  }, [validSrc]);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center overflow-hidden bg-primary/10 select-none',
        sizeMap[size],
        levelRing && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark'
      )}>
        {validSrc && !hasError ? (
          <img
            src={validSrc}
            alt={displayName}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="font-bold text-primary dark:text-[#D4A843]">
            {getInitials(displayName) || 'S'}
          </span>
        )}
      </div>
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white dark:border-card-dark',
          online ? 'bg-green-500' : 'bg-gray-400'
        )} />
      )}
    </div>
  );
};

export { Avatar };
