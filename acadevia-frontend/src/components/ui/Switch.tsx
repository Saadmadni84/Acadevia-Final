import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, className }) => (
  <label className={cn('inline-flex items-center cursor-pointer gap-3', className)}>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
      )}
    >
      <span className={cn(
        'block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-5.5 ml-0.5 mt-0.5' : 'translate-x-0.5 mt-0.5'
      )} />
    </button>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

export { Switch };
