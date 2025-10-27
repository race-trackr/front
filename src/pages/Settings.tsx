"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VerticalTabs from '@/components/VerticalTabs';
import NotificationsTab from '@/pages/Settings/NotificationsTab';
import DeveloperTab from '@/pages/Settings/DeveloperTab'; // Import the new DeveloperTab

const Settings: React.FC = () => {
  const { t } = useTranslation();

  const settingsTabs = [
    {
      value: 'notifications',
      label: t('notifications'),
      content: <NotificationsTab />,
    },
    {
      value: 'developer',
      label: t('developer'),
      content: <DeveloperTab />,
    },
    // Add more tabs here later
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('settings')}</h1>
      <VerticalTabs tabs={settingsTabs} defaultValue="notifications" />
    </div>
  );
};

export default Settings;