import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DownloadItem } from '@/components/downloads/DownloadItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Download, HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { formatFileSize } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

const mockDownloads = [
  { id: 'd1', title: 'Ch.5 - Quadratic Equations', type: 'video' as const, size: 52428800, downloadedSize: 52428800, status: 'completed' as const },
  { id: 'd2', title: 'Science Lab Experiment Video', type: 'video' as const, size: 104857600, downloadedSize: 73400320, status: 'downloading' as const },
  { id: 'd3', title: 'English Grammar Notes', type: 'document' as const, size: 2097152, downloadedSize: 2097152, status: 'completed' as const },
  { id: 'd4', title: 'History - Chapter 3 Video', type: 'video' as const, size: 78643200, downloadedSize: 0, status: 'pending' as const },
];

const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState(mockDownloads);
  const totalUsed = downloads.filter(d => d.status === 'completed').reduce((s, d) => s + d.size, 0);
  const totalAllowed = 1073741824;

  return (
    <div className="space-y-6 p-1">
      <PageHeader title="Downloads" subtitle="Manage your offline content" />
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center gap-1.5"><HardDrive className="h-4 w-4 text-primary" />Storage Used</span>
          <span className="text-xs text-gray-500">{formatFileSize(totalUsed)} / {formatFileSize(totalAllowed)}</span>
        </div>
        <Progress value={(totalUsed / totalAllowed) * 100} size="sm" />
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {downloads.length === 0 ? (
            <EmptyState icon={<Download />} title="No downloads" description="Download lessons to access them offline" />
          ) : downloads.map(d => (
            <DownloadItem key={d.id} {...d} onRemove={id => setDownloads(prev => prev.filter(x => x.id !== id))} onPlay={() => {}} onRetry={() => {}} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DownloadsPage;
