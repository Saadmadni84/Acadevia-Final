import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SettingsForm } from '@/components/profile/SettingsForm';

const SettingsPage: React.FC = () => (
  <div className="space-y-6 p-1 max-w-2xl">
    <PageHeader title="Settings" subtitle="Manage your preferences" />
    <SettingsForm />
  </div>
);

export default SettingsPage;
