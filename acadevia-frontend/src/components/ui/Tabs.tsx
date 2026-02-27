import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab { id: string; label: string; count?: number; }

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (id: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  const [active, setActive] = useState(activeTab || tabs[0]?.id);

  const handleClick = (id: string) => {
    setActive(id);
    onChange(id);
  };

  return (
    <div className={cn('flex gap-1 border-b border-gray-200 dark:border-gray-700', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors',
            active === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{tab.count}</span>
          )}
          {active === tab.id && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
};

export { Tabs };
