import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface CourseFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  className?: string;
}

const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

const CourseFilters: React.FC<CourseFiltersProps> = ({ onSearch, onFilter, className }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const handleSearch = (val: string) => { setQuery(val); onSearch(val); };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input placeholder="Search courses..." leftIcon={<Search className="h-4 w-4" />} value={query} onChange={e => handleSearch(e.target.value)} className="flex-1" />
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} leftIcon={<SlidersHorizontal className="h-4 w-4" />}>Filters</Button>
      </div>
      {showFilters && (
        <div className="glass-card p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Subject</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <Badge key={s} variant={selectedSubject === s ? 'default' : 'outline'} className="cursor-pointer" onClick={() => { setSelectedSubject(selectedSubject === s ? '' : s); onFilter({ subject: selectedSubject === s ? '' : s, difficulty: selectedDifficulty }); }}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {difficulties.map(d => (
                <Badge key={d} variant={selectedDifficulty === d ? 'default' : 'outline'} className="cursor-pointer capitalize" onClick={() => { setSelectedDifficulty(selectedDifficulty === d ? '' : d); onFilter({ subject: selectedSubject, difficulty: selectedDifficulty === d ? '' : d }); }}>
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CourseFilters };
