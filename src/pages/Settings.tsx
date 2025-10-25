import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('settings')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('general_settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('settings_page_description')}</p>
          {/* Add settings forms/components here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;