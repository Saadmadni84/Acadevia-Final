import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { SystemHealth } from '@/components/admin/SystemHealth';

const SystemHealthPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.systemHealth.title')} />
      <SystemHealth />
    </div>
  );
};

export default SystemHealthPage;
