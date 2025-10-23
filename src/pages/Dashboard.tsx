"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar, Car, Wrench, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTrackdays } from '@/lib/api/trackdays';
import { getVehicles } from '@/lib/api/vehicles';
import { getMaintenances } from '@/lib/api/maintenances';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const { data: trackdaysData } = useQuery({
    queryKey: ['trackdays'],
    queryFn: getTrackdays,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const { data: maintenancesData } = useQuery({
    queryKey: ['maintenances'],
    queryFn: getMaintenances,
  });

  const totalTrackdays = trackdaysData?.length || 0;
  const totalVehicles = vehiclesData?.length || 0;
  const totalMaintenances = maintenancesData?.length || 0;
  const totalDrivers = 1; // Placeholder for now

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-background rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_trackdays')}</CardTitle>
            <Calendar className="h-6 w-6 text-primary" /> {/* Icône plus grande et colorée */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrackdays}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_trackdays')}
            </p>
            <Button asChild variant="link" className="p-0 h-auto mt-2">
              <Link to="/trackdays">{t('view_edit_details')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-background rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_vehicles')}</CardTitle>
            <Car className="h-6 w-6 text-primary" /> {/* Icône plus grande et colorée */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_vehicles')}
            </p>
            <Button asChild variant="link" className="p-0 h-auto mt-2">
              <Link to="/vehicles">{t('view_edit_details')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-background rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_maintenances')}</CardTitle>
            <Wrench className="h-6 w-6 text-primary" /> {/* Icône plus grande et colorée */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaintenances}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_maintenances')}
            </p>
            <Button asChild variant="link" className="p-0 h-auto mt-2">
              <Link to="/maintenances">{t('view_edit_details')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-background rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_drivers')}</CardTitle>
            <Users className="h-6 w-6 text-primary" /> {/* Icône plus grande et colorée */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_drivers')}
            </p>
            <Button asChild variant="link" className="p-0 h-auto mt-2">
              <Link to="/drivers">{t('view_edit_details')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trackdays Section */}
      <Card className="mb-6 bg-gradient-to-br from-secondary/10 to-background rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('recent_trackdays')}</CardTitle>
          <Button asChild size="sm">
            <Link to="/trackdays/create">{t('add_trackday')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {trackdaysData && trackdaysData.length > 0 ? (
            <ul>
              {trackdaysData.slice(0, 3).map((trackday) => (
                <li key={trackday.id} className="mb-2">
                  <Link to={`/trackdays/${trackday.id}`} className="text-blue-600 hover:underline">
                    {trackday.date} - {trackday.trackId}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t('no_recent_trackdays')}</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events Section (Placeholder) */}
      <Card className="bg-gradient-to-br from-secondary/10 to-background rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>{t('upcoming_events')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('no_upcoming_events')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;