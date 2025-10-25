import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserProfileForm from '@/components/UserProfileForm'; // Import the UserProfileForm component

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('my_account')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('profile_information')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.fullName || t("user")} />
              <AvatarFallback className="text-3xl">{user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{user?.fullName || t("guest")}</p>
              <p className="text-muted-foreground">{user?.email || "guest@example.com"}</p>
              <p className="text-sm text-muted-foreground capitalize">{t('role')}: {user?.role || t('not_specified')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserProfileForm /> {/* Render the UserProfileForm component here */}
    </div>
  );
};

export default Profile;