import React from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn, formatFileSize } from '@/lib/utils';

interface DownloadItemProps {
  id: string;
  title: string;
  type: 'video' | 'document' | 'course';
  size: number;
  downloadedSize: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onPlay?: (id: string) => void;
}

const statusConfig = {
  pending: { icon: Download, color: 'text-gray-400', label: 'Pending' },
  downloading: { icon: Loader2, color: 'text-primary animate-spin', label: 'Downloading' },
  completed: { icon: CheckCircle, color: 'text-secondary', label: 'Ready' },
  error: { icon: AlertCircle, color: 'text-accent', label: 'Error' },
};

const DownloadItem: React.FC<DownloadItemProps> = ({ id, title, type, size, downloadedSize, status, onRemove, onRetry, onPlay }) => {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  const pct = size > 0 ? Math.round((downloadedSize / size) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', status === 'completed' ? 'bg-secondary/10' : 'bg-gray-100 dark:bg-gray-800')}>
          <Icon className={cn('h-5 w-5', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="capitalize">{type}</span>
            <span>·</span>
            <span>{formatFileSize(downloadedSize)} / {formatFileSize(size)}</span>
            <span>·</span>
            <span className={cn(cfg.color)}>{cfg.label}</span>
          </div>
          {status === 'downloading' && <Progress value={pct} size="sm" className="mt-1.5" />}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {status === 'completed' && onPlay && <Button variant="ghost" size="sm" onClick={() => onPlay(id)}><Play className="h-4 w-4" /></Button>}
          {status === 'error' && onRetry && <Button variant="ghost" size="sm" onClick={() => onRetry(id)}><Download className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="sm" onClick={() => onRemove(id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-accent" /></Button>
        </div>
      </div>
    </motion.div>
  );
};

export { DownloadItem };
