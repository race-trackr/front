import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VerticalTabs from '@/components/VerticalTabs';
import NotificationsTab from '@/pages/Settings/NotificationsTab';
import DeveloperTab from '@/pages/Settings/DeveloperTab'; // Import the new DeveloperTab

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'notifications';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'notifications';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

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
      <VerticalTabs tabs={settingsTabs} value={activeTab} onValueChange={handleTabChange} />
    </div>
  );
};

export default Settings;
