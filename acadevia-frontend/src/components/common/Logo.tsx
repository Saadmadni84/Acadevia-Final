import React from 'react';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

interface LogoProps { size?: 'sm' | 'md' | 'lg'; className?: string; }
const sizeMap = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' };
const iconMap = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' };

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => (
  <div className={cn('flex items-center gap-2', className)}>
    <GraduationCap className={cn('text-primary', iconMap[size])} />
    <span className={cn('font-bold gradient-text', sizeMap[size])}>Acadevia</span>
  </div>
);

export { Logo };
