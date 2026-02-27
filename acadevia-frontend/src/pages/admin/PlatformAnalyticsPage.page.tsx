import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { PlatformAnalytics } from '@/components/admin/PlatformAnalytics';

const PlatformAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.platformAnalytics.title')} />
      <PlatformAnalytics />
    </div>
  );
};

export default PlatformAnalyticsPage;
