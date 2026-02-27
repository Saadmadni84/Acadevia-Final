import React from 'react';
import { ContentUpload } from '@/components/teacher/ContentUpload';

const ContentUploadPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Content</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload video lessons for your students</p>
      </div>
      <ContentUpload />
    </div>
  );
};

export default ContentUploadPage;
