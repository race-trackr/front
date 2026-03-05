import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

const NotificationsTab: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUserInStore = useAuthStore((state) => state.setUser);

  const currentPreferences = user?.preferences || {};

  const [emailNotifications, setEmailNotifications] = useState(currentPreferences.emailNotifications ?? true);
  const [marketingEmails, setMarketingEmails] = useState(currentPreferences.marketingEmails ?? false);
  const [securityEmails, setSecurityEmails] = useState(currentPreferences.securityEmails ?? true);
  const [pushNotifications, setPushNotifications] = useState(currentPreferences.pushNotifications ?? false);

  // Check if any values have changed
  const hasChanged =
    emailNotifications !== (currentPreferences.emailNotifications ?? true) ||
    marketingEmails !== (currentPreferences.marketingEmails ?? false) ||
    securityEmails !== (currentPreferences.securityEmails ?? true) ||
    pushNotifications !== (currentPreferences.pushNotifications ?? false);

  const updateNotificationsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        preferences: {
          emailNotifications,
          marketingEmails,
          securityEmails,
          pushNotifications,
        },
      };
      const response = await apiClient.put(`/users/me`, payload);
      return response.data.user;
    },
    onSuccess: (updatedUser) => {
      setUserInStore(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(t('notifications_saved_successfully'));
    },
    onError: () => {
      toast.error(t('an_unexpected_error_occurred'));
    },
  });

  const handleSave = () => {
    updateNotificationsMutation.mutate();
  };

  return (
    <Card className="bg-transparent shadow-none border-none">
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
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
            <span>{t('marketing_emails')}</span>
            <span className="font-normal leading-snug text-muted-foreground">
              {t('receive_marketing_emails')}
            </span>
          </Label>
          <Switch
            id="marketing-emails"
            checked={marketingEmails}
            onCheckedChange={setMarketingEmails}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="security-emails" className="flex flex-col space-y-1">
            <span>{t('security_emails')}</span>
            <span className="font-normal leading-snug text-muted-foreground">
              {t('receive_security_emails')}
            </span>
          </Label>
          <Switch
            id="security-emails"
            checked={securityEmails}
            onCheckedChange={setSecurityEmails}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
            <span>{t('push_notifications')}</span>
            <span className="font-normal leading-snug text-muted-foreground">
              {t('receive_push_updates')}
            </span>
          </Label>
          <Switch
            id="push-notifications"
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanged || updateNotificationsMutation.isPending}
            className="btn-primary-gradient"
          >
            {updateNotificationsMutation.isPending ? t('saving') : t('save_changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
