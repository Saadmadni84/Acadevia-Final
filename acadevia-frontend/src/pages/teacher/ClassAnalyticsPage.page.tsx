import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ClassAnalytics } from '@/components/teacher/ClassAnalytics';

const ClassAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('teacher.classAnalytics.title')} />
      <ClassAnalytics />
    </div>
  );
};

export default ClassAnalyticsPage;
