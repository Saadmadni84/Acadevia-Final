import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VedicKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  allowSlash?: boolean;
  className?: string;
}

export const VedicKeypad: React.FC<VedicKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  allowSlash = false,
  className,
}) => {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length < 12) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:gap-2.5 max-w-xs mx-auto w-full select-none', className)}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
        <button
          key={digit}
          type="button"
          disabled={disabled}
          onClick={() => handleDigit(digit)}
          className="h-12 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-200/80 dark:border-slate-700 text-lg sm:text-xl font-black text-gray-800 dark:text-gray-100 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {digit}
        </button>
      ))}

      {allowSlash ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('/')}
          className="h-12 sm:h-14 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 text-lg sm:text-xl font-black text-amber-800 dark:text-amber-300 shadow-xs hover:border-amber-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          /
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled || !value}
          onClick={handleClear}
          className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 text-xs font-black uppercase text-slate-600 dark:text-slate-400 shadow-xs hover:border-slate-400 active:scale-95 transition cursor-pointer disabled:opacity-40"
        >
          Clear
        </button>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => handleDigit('0')}
        className="h-12 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-200/80 dark:border-slate-700 text-lg sm:text-xl font-black text-gray-800 dark:text-gray-100 shadow-xs hover:border-amber-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
      >
        0
      </button>

      <button
        type="button"
        disabled={disabled || !value}
        onClick={handleBackspace}
        className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs hover:border-slate-400 active:scale-95 transition cursor-pointer disabled:opacity-40"
        aria-label="Backspace"
      >
        <Delete className="h-5 w-5" />
      </button>

      <button
        type="button"
        disabled={disabled || !value}
        onClick={onSubmit}
        className="col-span-3 h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Submit Answer</span>
        <CornerDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
};
