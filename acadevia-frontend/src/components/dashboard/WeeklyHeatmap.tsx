import React from 'react';
import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

interface WeeklyHeatmapProps {
  data: { day: string; minutes: number }[];
  className?: string;
}

const getColor = (min: number) => {
  if (min === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (min < 15) return 'bg-primary/20';
  if (min < 30) return 'bg-primary/40';
  if (min < 60) return 'bg-primary/60';
  return 'bg-primary';
};

const WeeklyHeatmap: React.FC<WeeklyHeatmapProps> = ({ data, className }) => {
  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

  return (
    <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">This Week</h3>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
        </span>
      </div>

      {/* Bar chart view */}
      <div className="flex items-end gap-2 h-24 mb-2">
        {data.slice(0, 7).map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn('w-full rounded-t-lg transition-all', getColor(d.minutes))}
              style={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 4)}%` }}
              title={`${d.minutes} min`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {data.slice(0, 7).map((d) => (
          <div key={d.day} className="flex-1 text-center">
            <span className="text-[10px] font-medium text-gray-400">{d.day.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { WeeklyHeatmap };
