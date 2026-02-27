import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend?: number;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, suffix, trend, className }) => {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card p-5 flex items-start gap-4', className)}
    >
      <div className="p-3 rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{animatedValue}{suffix}</p>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}% vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { StatsCard };
