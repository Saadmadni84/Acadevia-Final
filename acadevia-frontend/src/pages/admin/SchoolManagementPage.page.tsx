import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { SchoolManagement } from '@/components/admin/SchoolManagement';

const SchoolManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.schoolManagement.title')} />
      <SchoolManagement />
    </div>
  );
};

export default SchoolManagementPage;
