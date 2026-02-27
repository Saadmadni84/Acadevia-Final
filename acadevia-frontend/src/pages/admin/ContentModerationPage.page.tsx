import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ContentModeration } from '@/components/admin/ContentModeration';

const ContentModerationPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.contentModeration.title')} />
      <ContentModeration />
    </div>
  );
};

export default ContentModerationPage;
