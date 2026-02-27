import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        accent: 'bg-accent/10 text-accent',
        warning: 'bg-warning/10 text-warning-dark',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        outline: 'border border-gray-300 dark:border-gray-600',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ className, variant, pulse, children, ...props }) => (
  <span className={cn(badgeVariants({ variant }), pulse && 'animate-pulse', className)} {...props}>
    {children}
  </span>
);

export { Badge, badgeVariants };
