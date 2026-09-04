import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ClassAnalytics } from '@/components/teacher/ClassAnalytics';

const ClassAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={t('teacher.classAnalytics.title', 'Class Analytics')}
        subtitle={t('teacher.classAnalytics.subtitle', 'Monitor student performance, engagement, and areas that need attention')}
      />
      <ClassAnalytics />
    </div>
  );
};

export default ClassAnalyticsPage;
