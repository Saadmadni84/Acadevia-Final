import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { StudentProgress } from '@/components/teacher/StudentProgress';

const StudentProgressPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('teacher.studentProgress.title')} />
      <StudentProgress />
    </div>
  );
};

export default StudentProgressPage;
