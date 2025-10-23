"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Wrench } from 'lucide-react';
import { getTrackdays } from '@/lib/api/trackdays';
import { getVehicles } => '@/lib/api/vehicles';
import { getMaintenances } from '@/lib/api/maintenances';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const { data: trackdaysData, isLoading: isLoadingTrackdays } = useQuery({
    queryKey: ['trackdays'],
    queryFn: getTrackdays,
  });

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const { data: maintenancesData, isLoading: isLoadingMaintenances } = useQuery({
    queryKey: ['maintenances'],
    queryFn: getMaintenances,
  });

  const totalTrackdays = trackdaysData?.length || 0;
  const totalVehicles = vehiclesData?.length || 0;
  const totalMaintenances = maintenancesData?.length || 0;

  const recentTrackdays = trackdaysData
    ? [...trackdaysData]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    : [];

  const upcomingEvents = trackdaysData
    ? trackdaysData
        .filter(td => new Date(td.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_trackdays')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrackdays}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_trackdays')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_vehicles')}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_vehicles')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('my_maintenances')}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaintenances}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_maintenances')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Trackdays Card - Moved to the top */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('recent_trackdays')}</CardTitle>
            <CardDescription>{t('no_recent_trackdays')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTrackdays ? (
              <div>Loading recent trackdays...</div>
            ) : recentTrackdays.length === 0 ? (
              <p>{t('no_recent_trackdays')}</p>
            ) : (
              <ul className="space-y-2">
                {recentTrackdays.map((trackday) => (
                  <li key={trackday.id} className="flex justify-between items-center">
                    <span>{format(new Date(trackday.date), 'PPP')} - {trackday.track_id}</span>
                    <Link to={`/trackdays/${trackday.id}`}>
                      <Button variant="outline" size="sm">{t('view_edit_details')}</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-right">
              <Link to="/trackdays/new">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                  {t('add_trackday')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Card - Moved below Recent Trackdays */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('upcoming_events')}</CardTitle>
            <CardDescription>{t('no_upcoming_events')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTrackdays ? (
              <div>Loading upcoming events...</div>
            ) : upcomingEvents.length === 0 ? (
              <p>{t('no_upcoming_events')}</p>
            ) : (
              <ul className="space-y-2">
                {upcomingEvents.map((trackday) => (
                  <li key={trackday.id} className="flex justify-between items-center">
                    <span>{format(new Date(trackday.date), 'PPP')} - {trackday.track_id}</span>
                    <Link to={`/trackdays/${trackday.id}`}>
                      <Button variant="outline" size="sm">{t('view_edit_details')}</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;