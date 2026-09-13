import React from 'react';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

interface LogoProps { size?: 'sm' | 'md' | 'lg'; className?: string; }
const sizeMap = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' };
const iconMap = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' };

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => (
  <div className={cn('flex items-center gap-2 group', className)}>
    <div className="relative flex items-center justify-center">
      <GraduationCap className={cn('text-primary dark:text-white transition-colors', iconMap[size])} />
      <span className="hidden dark:block absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
    </div>
    <span className={cn('font-bold text-[#0F172A] dark:text-[#F5F5F5] tracking-tight transition-colors', sizeMap[size])}>
      Acadevia
    </span>
  </div>
);

export { Logo };
