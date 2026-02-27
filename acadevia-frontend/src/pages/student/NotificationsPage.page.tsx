import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { NotificationPrefs } from '@/components/notifications/NotificationPrefs';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('notifications.title')} />
      <NotificationPanel />
      <NotificationPrefs />
    </div>
  );
};

export default NotificationsPage;
