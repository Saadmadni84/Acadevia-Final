import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { UserManagement } from '@/components/admin/UserManagement';

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.userManagement.title')} />
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
