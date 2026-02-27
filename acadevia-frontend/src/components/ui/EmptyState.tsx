import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
    {icon && <div className="mb-4 text-gray-400 dark:text-gray-600">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
    {action && <Button variant="primary" className="mt-4" onClick={action.onClick}>{action.label}</Button>}
  </div>
);

export { EmptyState };
