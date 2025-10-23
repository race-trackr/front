import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Car, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Dummy data for demonstration
  const trackdays = [{}, {}, {}]; // Replace with actual data from API
  const vehicles = [{}, {}];     // Replace with actual data from API
  const drivers = [{}, {}, {}, {}]; // Replace with actual data from API

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: My Trackdays */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_trackdays')}</CardTitle>
            <div className="rounded-full p-2 bg-blue-100">
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackdays.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_trackdays')}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: My Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_vehicles')}</CardTitle>
            <div className="rounded-full p-2 bg-green-100">
              <Car className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_vehicles')}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: My Drivers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_drivers')}</CardTitle>
            <div className="rounded-full p-2 bg-purple-100">
              <Users className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_drivers')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trackdays Section */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle>{t('recent_trackdays')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent trackdays list */}
            <p className="text-muted-foreground">{t('no_recent_trackdays')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('upcoming_events')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for upcoming events */}
            <p className="text-muted-foreground">{t('no_upcoming_events')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;