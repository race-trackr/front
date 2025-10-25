"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
        <CardDescription>{t('manage_notification_preferences')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>{t('email_notifications')}</span>
            <span className="font-normal leading-snug text-muted-foreground">
              {t('receive_email_updates')}
            </span>
          </Label>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
            <span>{t('push_notifications')}</span>
            <span className="font-normal leading-snug text-muted-foreground">
              {t('receive_push_updates')}
            </span>
          </Label>
          <Switch id="push-notifications" />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;